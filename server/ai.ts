import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { Ticket, Message } from '../src/types';
import { getSettingsForCompany } from './db';

// Lazy initialize SDKs
export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

export const getClaudeClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey || apiKey === 'your-key-here' || apiKey.startsWith('MY_')) {
    return null;
  }
  return new Anthropic({ apiKey });
};

// Helper to format or sanitize verbose or stringified JSON errors from the SDK
export const formatErrorOutput = (error: any): string => {
  const msg = error?.message || String(error);
  try {
    if (msg && typeof msg === 'string' && msg.trim().startsWith('{')) {
      const parsed = JSON.parse(msg.trim());
      if (parsed?.error?.message) {
        return `[Code ${parsed.error.code || 429}] ${parsed.error.message}`;
      }
    }
  } catch (err) {
    // Fall back to original message
  }
  return msg;
};

// Retry utility with exponential backoff for resilience against rate limits and capacity spikes
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.status || error.statusCode || error.code || 500;
    const errStr = (
      String(error.message || '') + ' ' + 
      String(error.status || '') + ' ' + 
      JSON.stringify(error)
    ).toLowerCase();

    // Check if it is a permanent quota limit / free tier resource exhaustion
    const isPermanentQuotaExceeded =
      status === 429 && (
        errStr.includes('quota') ||
        errStr.includes('exhausted') ||
        errStr.includes('limit') ||
        errStr.includes('plan') ||
        errStr.includes('billing') ||
        errStr.includes('resource_exhausted')
      );

    if (isPermanentQuotaExceeded) {
      console.warn("API Quota limit hit (RESOURCE_EXHAUSTED). Skipping retries to trigger fast local classifier fallback immediately.");
      throw error;
    }

    if (retries <= 0) {
      throw error;
    }

    const isTransient =
      status === 429 ||
      status === 503 ||
      status === 504 ||
      errStr.includes('high demand') ||
      errStr.includes('unavailable') ||
      errStr.includes('overloaded');

    if (isTransient) {
      console.warn(`Transient API error (${status}). Retrying in ${delay}ms... (Remaining retries: ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Dynamic Claude / Gemini analysis prompting structure supporting training policies
export const getSystemPromptRule = (ticket?: Ticket): string => {
  const isEscalated = ticket && ticket.status === 'ESCALATED';
  const settings = getSettingsForCompany(ticket?.companyName);

  let persona = isEscalated
    ? `You are an expert human customer support agent drafting a direct reply for ${settings.companyName || 'our business'}, which operates in the '${settings.businessIndustry || 'Retail'}' industry.`
    : `You are the primary intelligence router and vernacular response engine for ${settings.companyName || 'our business'}, which operates in the '${settings.businessIndustry || 'Retail'}' industry.`;

  // Determine current active message content to check for bilingual keywords
  const latestMsg = ticket?.messages && ticket.messages.length > 0 
    ? ticket.messages[ticket.messages.length - 1].content 
    : "";

  const normMsg = latestMsg.toLowerCase();
  // We check if the customer message is strongly Hinglish (transliterated Hindi/English mixed)
  const hasHinglishKeywords = normMsg.includes("mera ") || normMsg.includes(" kab ") || normMsg.includes("nahi ") || 
                              normMsg.includes(" hai") || normMsg.includes("aayega") || normMsg.includes("bhai ") || 
                              normMsg.includes("karo") || normMsg.includes("mila ") || normMsg.includes("hoga ") || 
                              normMsg.includes("kya ") || normMsg.includes("de do") || normMsg.includes(" kab") ||
                              normMsg.includes(" swagat") || normMsg.includes(" swasth") || normMsg.includes("namaste") ||
                              normMsg.includes(" swarg") || normMsg.includes(" swaraj") || normMsg.includes(" swad");

  // Default target response language based on customer's manually chosen preference
  let targetLang = "English";
  if (ticket && ticket.languagePreference) {
    targetLang = ticket.languagePreference;
  }

  // FORCE English if they selected English and their latest message is in English or is a neutral phrase/Order ID code
  if (targetLang === 'English') {
    if (hasHinglishKeywords) {
      // If they explicitly interjected Hinglish words despite selecting English, adapt to Hinglish to match dialect
      targetLang = 'Hinglish';
    } else {
      targetLang = 'English';
    }
  } else if (targetLang === 'Hinglish') {
    // If they selected Hinglish, but their latest message is entirely in pure English, we can respect their flow or keep Hinglish
    if (!hasHinglishKeywords && /^[a-zA-Z\s.,!?'-]+$/.test(latestMsg.trim()) && latestMsg.trim().split(/\s+/).length > 2) {
      targetLang = 'English';
    }
  }

  let taskDescription = isEscalated
    ? `Because this ticket has been ESCALATED to human support, your task is to draft a helpful copilot suggestion as a human operator who is personally assisting this customer. The response "vernacular_reply" in your JSON output MUST be generated from the direct perspective of a human support representative (e.g., using first-person, highly personal, warm, and empathetic language such as 'I' or 'We', reassuring the customer that a human agent has personally taken over to resolve their issues, rather than sounding like an automated chatbot/AI loop). Preserving the script and dialect used (strictly **${targetLang}**) as based on the customer's input context.`
    : `Your task is to analyze the customer's query within the context of any previous conversation history and generate an exceptionally accurate, empathetic, and context-specific response. Crucially, your entire response (including "vernacular_reply") MUST be written strictly in **${targetLang}** (For 'Hinglish': use Latin-script colloquial Hindi-English mixed e.g. 'Aapka order dispatch ho chuka hai'; For 'Hindi': use native Devnagari Hindi text e.g. 'आपका ऑर्डर भेज दिया गया है'; For 'English': use standard fluent English).`;

  let prompt = `${persona}
Brand Knowledge / Business Context:
${settings.brandKnowledge || 'We provide general support with helpful customer care operators.'}

${taskDescription}

CRITICAL LANGUAGE & LINGUISTIC SELECTION RULE (ANTI-HINGLISH HYBRID CORRUPTIONS):
- The target language for your reply: **${targetLang}**
- You are **STRICTLY FORBIDDEN** from replying in Hinglish if the target language is **English** or **Hindi**. 
- Never intermix Hindi transliterated phrases (like "Swagat hai", "Aapka order", "swagat", "Swasth/Namaste") when the target language is **English**. If the target language is English, write 100% grammatically correct, highly fluent, standard English with NO transliterated Hindi words or phrases under any circumstance.
- You must **ONLY** reply in Hinglish if the target language is determined as **Hinglish** (such as when the customer specifically speaks in Hinglish in their latest message or has selected Hinglish as their preference).`;

  prompt += `\n\nAnalyze the conversation context and latest message, and output standard, valid JSON according to this exact schema:
{
  "detected_language": "Detected language (Must be exactly 'English', 'Hindi (Native)', or 'Hinglish (Hindi-English)')",
  "intent": "Categorized intent. Must be exactly one of: ORDER_TRACKING, RETURN_REQUEST, REFUND_STATUS, PRODUCT_INQUIRY, COUPON_ISSUES, DELIVERY_COMPLAINT, HUMAN_ESCALATION",
  "confidence": float between 0.0 and 1.0,
  "should_escalate": boolean (true ONLY for very urgent cases, legal threats, extreme abuse, or explicit requests for live support managers. For normal questions, AI should attempt to solve customer issues directly with at least 90% confidence. Set should_escalate to true ONLY when confidence is under 0.90 or it is a truly urgent escalation),
  "sentiment": "Positive" | "Neutral" | "Negative" | "Angry",
  "close_ticket": boolean (MUST always be set to false. We do not support automatic immediate ticket closure as we must ask if they need further assistance and let our 3-minute inactivity loop close it automatically if the customer doesn't respond),
  "vernacular_reply": "A concise, highly empathetic, grammatically correct support solution answering the specific questions asked by the customer last, written 100% in the target language (${targetLang}) script."
}
IMPORTANT: Output only the raw valid JSON payload without backticks or markdown formatting.

CONVERSATION NATURAL END / RESOLUTION CLOSURE RULES:
If you determine that the customer's issue has been fully addressed, resolved, or satisfied, or if the customer expresses gratitude (e.g. says "thank you", "thanks", "dhanyawad", "shukriya", etc.):
- Always keep the ticket open. You MUST set "close_ticket" to false in your output JSON.
- The "vernacular_reply" MUST politely summarize/close the current query and ask specifically: "Do you need any other assistance? Feel free to ask." translated accurately in the customer's target language (${targetLang}).
   - If the target language is **English**: Must end exactly with "Do you need any other assistance? Feel free to ask."
   - If the target language is **Hindi (Native)**: Must end exactly with "क्या आपको किसी अन्य सहायता की आवश्यकता है? बेझिझक पूछें।"
   - If the target language is **Hinglish**: Must end exactly with "Kya aapko koi aur assistance chahiye? Feel free to ask."
- Let the customer have the option to ask further questions if they wish. Do NOT say a final goodbye or say "ticket closed". Our system will automatically resolve and close the ticket after 3 minutes of customer silence.
- Maintain a polite, natural, and friendly tone at all times.`;

  if (isEscalated) {
    prompt += `\n\nCRITICAL IDENTITY DIRECTIVE:\nAs a human agent personally assisting this customer, make sure that "vernacular_reply" does NOT use standard chatbot sign-offs like "I am an automated assistant". Write in a natural, colloquial, human voice to guide the agent in resolving the escalated ticket.`;
  }

  if (settings.aiPolicyInstructions && settings.aiPolicyInstructions.trim()) {
    prompt += `\n\nCRITICAL MANDATE - CUSTOM TRAINING POLICIES & ENTERPRISE CONTEXT:\nYou must strictly follow these trained operator rules when drafting custom vernacular responses for the customer:\n${settings.aiPolicyInstructions.trim()}`;
  }

  return prompt;
};

// Intent solver mapping for local keyword analysis fallback (Consolidated Multilingual Engine)
export const runLocalClassifier = (query: string): any => {
  const norm = query.toLowerCase();
  let intent = "PRODUCT_INQUIRY";
  let detected_language = "English";
  let sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Angry' = "Neutral";
  let should_escalate = false;
  let vernacular_reply = "Hello! We are looking into this details for you. An executive will join real-time shortly.";

  // Language & Transliterated dialect detection
  if (norm.includes("mera") || norm.includes("kab") || norm.includes("nahi") || norm.includes("hai") || norm.includes("aayega") || norm.includes("bhai") || norm.includes("karo") || norm.includes("mila") || norm.includes("hoga") || norm.includes("kya") || norm.includes("taal") || norm.includes("h ") || norm.includes("de do")) {
    detected_language = "Hinglish (Hindi-English)";
  } else if (norm.includes("ennoda") || norm.includes("iruku") || norm.includes("mudiyuma") || norm.includes("pathala") || norm.includes("romba") || norm.includes("yenna") || norm.includes("solunga") || norm.includes("vanga")) {
    detected_language = "Tanglish (Tamil-English)";
  } else if (norm.includes("nanna") || norm.includes("yenu") || norm.includes("agide") || norm.includes("madi") || norm.includes("kelage")) {
    detected_language = "Kanglish (Kannada-English)";
  } else if (/[\u0900-\u097F]/.test(query)) {
    if (norm.includes("माझे") || norm.includes("कधी") || norm.includes("पैसे") || norm.includes("कापड") || (norm.includes("आहे") && !norm.includes("नमस्ते") && !norm.includes("मेरा"))) {
      detected_language = "Marathi (Native)";
    } else {
      detected_language = "Hindi (Native)";
    }
  } else if (/[\u0B80-\u0BFF]/.test(query)) {
    detected_language = "Tamil (Native)";
  } else if (/[\u0C00-\u0C7F]/.test(query)) {
    detected_language = "Telugu (Native)";
  } else if (/[\u0C80-\u0CFF]/.test(query)) {
    detected_language = "Kannada (Native)";
  } else if (/[\u0D00-\u0D7F]/.test(query)) {
    detected_language = "Malayalam (Native)";
  } else if (/[\u0980-\u09FF]/.test(query)) {
    detected_language = "Bengali (Native)";
  } else if (/[\u0A80-\u0AFF]/.test(query)) {
    detected_language = "Gujarati (Native)";
  } else if (/[\u0A00-\u0A7F]/.test(query)) {
    detected_language = "Punjabi (Native)";
  }

  // Set default greeting reply by language
  if (detected_language.startsWith("Hinglish") || detected_language.startsWith("Hindi")) {
    vernacular_reply = "नमस्ते! हम आपकी सहायता करने की पूरी कोशिश कर रहे हैं। शीघ्र ही हमारी टीम आपसे जुड़ेगी।";
  } else if (detected_language.startsWith("Marathi")) {
    vernacular_reply = "नमस्कार! आम्ही तुमची मदत करण्यासाठी सर्वतोपरी प्रयत्न करत आहोत. आमची टीम लवकरच तुमच्याशी जोडली जाईल.";
  } else if (detected_language.startsWith("Tamil") || detected_language.startsWith("Tanglish")) {
    vernacular_reply = "வணக்கம்! உங்கள் வினவலுக்கு உதவ எங்கள் குழு விரைவில் உங்களுடன் இணையும்.";
  } else if (detected_language.startsWith("Telugu")) {
    vernacular_reply = "నమస్కారం! మీ ఆర్డర్ ప్రస్తుతం రవాణాలో ఉంది, రాబోయే 24-48 గంటల్లో డెలివరీ చేయబడుతుంది.";
  } else if (detected_language.startsWith("Bengali")) {
    vernacular_reply = "নমস্কার! আপনার অনুসন্ধানের বিষয়ে সাহায্য করার জন্য আমাদের একজন সহযোগী শীঘ্রই আপনার সাথে যোগাযোগ করবেন।";
  } else if (detected_language.startsWith("Gujarati")) {
    vernacular_reply = "નમસ્તે! આપને મદદ કરવા માટે અમારી ટીમ ટૂંક સમયમાં આપની સાથે સંપર્ક કરશે.";
  } else if (detected_language.startsWith("Kannada") || detected_language.startsWith("Kanglish")) {
    vernacular_reply = "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಸಹಾಯಕ್ಕಾಗಿ ನಮ್ಮ ಪ್ರತಿನಿಧಿ ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸಲಿದ್ದಾರೆ.";
  } else if (detected_language.startsWith("Malayalam")) {
    vernacular_reply = "നമസ്കാരം! നിങ്ങളെ സഹായിക്കുന്നതിനായി ഞങ്ങളുടെ പ്രതിനിധി ഉടൻ ബന്ധപ്പെടും.";
  } else if (detected_language.startsWith("Punjabi")) {
    vernacular_reply = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਅਸੀਂ ਤੁਹਾਡੀ ਸਹਾਇਤਾ ਲਈ ਜਲਦੀ ਹੀ ਸੰਪਰਕ ਕਰਾਂਗੇ।";
  }

  // Sentiment analysis based on aggressive keywords
  if (norm.includes("fuck") || norm.includes("scam") || norm.includes("cheat") || norm.includes("chor") || norm.includes("worst") || norm.includes("bhak") || norm.includes("gussa") || norm.includes("bakwas") || norm.includes("irritat")) {
    sentiment = "Angry";
    should_escalate = true;
  } else if (norm.includes("bad") || norm.includes("delay") || norm.includes("kharab") || norm.includes("wrong") || norm.includes("galat") || norm.includes("mistake") || norm.includes("ganda")) {
    sentiment = "Negative";
  } else if (norm.includes("thank") || norm.includes("dhanyawad") || norm.includes("nice") || norm.includes("good") || norm.includes("badiya") || norm.includes("super")) {
    sentiment = "Positive";
  }

  // Intent classification
  if (norm.includes("track") || norm.includes("deliv") || norm.includes("kab") || norm.includes("mil") || norm.includes("delay") || norm.includes("aayega") || norm.includes("status") || norm.includes("ruka") || norm.includes("pahu") || norm.includes("kaha") || norm.includes("vara")) {
    intent = "ORDER_TRACKING";
    if (detected_language.startsWith("Hinglish")) {
      vernacular_reply = "Aapki tracking ID 'DTD12498' Delhi Hub mein hai aur kal shaam tak deliver ho jayega. Please wait karein!";
    } else if (detected_language.startsWith("Tanglish")) {
      vernacular_reply = "Ungal order ready-aah iruku. Naalaikulai delivery panyduvom. Kadhirukavum.";
    } else if (detected_language.startsWith("Hindi")) {
      vernacular_reply = "नमस्ते! आपका ऑर्डर मार्ग में है और अगले २४ से ४८ घंटों में वितरित कर दिया जाएगा।";
    } else if (detected_language.startsWith("Tamil")) {
      vernacular_reply = "வணக்கம்! உங்கள் ஆர்டர் தற்போது போக்குவரத்தில் உள்ளது, மேலும் 24-48 மணிநேரத்திற்குள் டெலிவரி செய்யப்படும்.";
    } else if (detected_language.startsWith("Telugu")) {
      vernacular_reply = "నమస్కారం! మీ ఆర్డర్ ప్రస్తుతం రవాణాలో ఉంది, రాబోయే 24-48 గంటల్లో డెలివరీ చేయబడుతుంది.";
    } else if (detected_language.startsWith("Kannada")) {
      vernacular_reply = "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಆರ್ಡರ್ ಸಾಗಣೆಯಲ್ಲಿದೆ ಮತ್ತು ಮುಂದಿನ 24-48 ಗಂಟೆಗಳಲ್ಲಿ ತಲುಪಿಸಲಾಗುವುದು.";
    } else if (detected_language.startsWith("Kanglish")) {
      vernacular_reply = "Nanna tracking update: nimma order dispatch agide, 1-2 days nalli reach agutthe.";
    } else if (detected_language.startsWith("Marathi")) {
      vernacular_reply = "नमस्कार! आपला ऑर्डर सध्या ट्रान्झिटमध्ये आहे आणि येत्या २४ ते ४८ तासांत तो आपल्या घरी पोहोचेल.";
    } else if (detected_language.startsWith("Bengali")) {
      vernacular_reply = "নমস্কার! আপনার অর্ডারটি বর্তমানে ট্রানজিটে রয়েছে এবং আগামী ২৪-৪৮ ঘণ্টার মধ্যে আপনার কাছে পৌঁছে যাবে।";
    } else if (detected_language.startsWith("Gujarati")) {
      vernacular_reply = "નમસ્તે! આપનો ઓર્ડર હાલમાં પરિવહનમાં છે અને આગામી ૨૪ થી ૪૮ કલાકમાં આપને મળી જશે.";
    } else if (detected_language.startsWith("Punjabi")) {
      vernacular_reply = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡਾ ਆਰਡਰ ਰਸਤੇ ਵਿੱਚ ਹੈ ਅਤੇ ਅਗਲੇ 24-48 ਘੰਟਿਆਂ ਵਿੱਚ ਪ੍ਰਾਪਤ ਹੋ ਜਾਵੇਗਾ।";
    } else {
      vernacular_reply = "Your order is currently in transit and will be delivered within the next 24-48 hours.";
    }
  } else if (norm.includes("refund") || norm.includes("paisa") || norm.includes("money") || norm.includes("money back") || norm.includes("वापस") || norm.includes("रिफंड") || norm.includes("refun") || norm.includes("gate") || norm.includes("kate") || norm.includes("tirumb")) {
    intent = "REFUND_STATUS";
    sentiment = sentiment === "Angry" ? "Angry" : "Negative";
    should_escalate = true;
    if (detected_language.startsWith("Hinglish")) {
      vernacular_reply = "Maine check kiya ki refund initiation active hai. Yeh 3-5 business days mein aapke source GPay bank account mein reflect karega.";
    } else if (detected_language.startsWith("Tanglish")) {
      vernacular_reply = "Refund process thuvangapattathu. Idhu 3-5 naatkalil ungal bank accountil varum.";
    } else if (detected_language.startsWith("Hindi")) {
      vernacular_reply = "रिफंड प्रक्रिया शुरू कर दी गई है। यह ३ से ५ व्यावसायिक दिनों में आपके बैंक खाते में जमा हो जाएगा।";
    } else if (detected_language.startsWith("Tamil")) {
      vernacular_reply = "பணத்தைத் திரும்பப்பெறும் செயல்முறை தொடங்கப்பட்டுள்ளது, ಇದು 3-5 வேலை நாட்களில் உங்கள் கணக்கில் varum.";
    } else if (detected_language.startsWith("Telugu")) {
      vernacular_reply = "రీఫండ్ ప్రక్రియ ప్రారంభించబడింది, ఇది 3-5 పని దినాలలో మీ బ్యాంక్ ఖాతాలో జమ చేయబడుతుంది.";
    } else if (detected_language.startsWith("Kannada")) {
      vernacular_reply = "ರೀಫಂಡ್ ಪ್ರಕ್ರಿಯೆ ಪ್ರಾರಂಭವಾಗಿದೆ, ಇದು 3-5 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗಲಿದೆ.";
    } else if (detected_language.startsWith("Marathi")) {
      vernacular_reply = "रिफंड प्रक्रिया सुरू झाली आहे, ३-५ कामकाजाच्या दिवसांत पैसे आपल्या बँक खात्यात जमा होतील.";
    } else if (detected_language.startsWith("Bengali")) {
      vernacular_reply = "রিফান্ড প্রক্রিয়া শুরু হয়েছে, এটি ৩-৫ কার্যদিবসের মধ্যে আপনার ব্যাঙ্ক অ্যাকাউন্টে জমা হয়ে যাবে।";
    } else if (detected_language.startsWith("Gujarati")) {
      vernacular_reply = "રિફંડ પ્રક્રિયા શરૂ થઈ ગઈ છે, આગામી ૩ થી ૫ કામકાજના દિવસોમાં આપના ખાતામાં જમા થઈ જશે.";
    } else if (detected_language.startsWith("Malayalam")) {
      vernacular_reply = "റീഫണ്ട് നടപടിക്രമങ്ങൾ ആരംഭിച്ചു കഴിഞ്ഞു, 3-5 പ്രവൃത്തി ദിവസങ്ങൾക്കുള്ളിൽ അക്കൗണ്ടിൽ പണം ലഭിക്കും.";
    } else if (detected_language.startsWith("Punjabi")) {
      vernacular_reply = "ਰਿਫੰਡ ਪ੍ਰਕਿਰਿਆ ਸ਼ੁਰੂ ਹੋ ਚੁੱਕੀ ਹੈ, ਇਹ 3-5 ਦਿਨਾਂ ਵਿੱਚ ਤੁਹਾਡੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਭੇਜ ਦਿੱਤੀ ਜਾਵੇਗੀ।";
    } else {
      vernacular_reply = "The refund process has been initiated and will be credited to your account within 3-5 business days.";
    }
  } else if (norm.includes("return") || norm.includes("exchange") || norm.includes("change") || norm.includes("replace") || norm.includes("size") || norm.includes("बदल") || norm.includes("bada") || norm.includes("chhota") || norm.includes("matrum")) {
    intent = "RETURN_REQUEST";
    if (detected_language.startsWith("Hindi") || detected_language.startsWith("Hinglish")) {
      vernacular_reply = "आप डिलीवरी की तारीख से 7 दिनों के भीतर ऑर्डर इतिहास सेक्शन में 'Return/Exchange' दर्ज कर सकते हैं।";
    } else if (detected_language.startsWith("Tamil") || detected_language.startsWith("Tanglish")) {
      vernacular_reply = "பிரசவத்திலிருந்து 7 நாட்களுக்குள் உங்கள் ஆர்டர் வரலாற்று பிரிவில் 'மாற்று/திரும்ப' என பதிவு செய்யலாம்.";
    } else if (detected_language.startsWith("Marathi")) {
      vernacular_reply = "आपण डिलिव्हरी मिळाल्यापासून ७ दिवसांच्या आत ऑर्डर इतिहास विभागात 'Return/Exchange' नोंदवू शकता.";
    } else if (detected_language.startsWith("Telugu")) {
      vernacular_reply = "డెలివరీ జరిగిన 7 రోజులలోపు మీరు 'Return/Exchange' ను ఎంచుకుని మార్చుకోవచ్చు.";
    } else if (detected_language.startsWith("Kannada") || detected_language.startsWith("Kanglish")) {
      vernacular_reply = "ಡೆಲಿವರಿ ಆದ 7 ದಿನಗಳ ಒಳಗೆ ನೀವು ಆರ್ಡರ್ ಹಿಸ್ಟರಿಯಲ್ಲಿ 'ತಿರುಗಿಸು / ಬದಲಾಯಿಸು' ದಾಖಲಿಸಬಹುದು.";
    } else if (detected_language.startsWith("Gujarati")) {
      vernacular_reply = "આપ ડિલિવરી મળ્યાના ૭ દિવસમાં ઓર્ડર ઇતિહાસમાં જઈने 'રિટર્ન/એક્સચેન્જ' રિકવેસ્ટ કરી શકો છો.";
    } else if (detected_language.startsWith("Bengali")) {
      vernacular_reply = "ডেলিভারি পাওয়ার ৭ দিনের মধ্যে আপনি অর্ডার হিস্ট্রি থেকে রিটার্ন বা এক্সচেঞ্জ রিকোয়েস্ট করতে পারেন।";
    } else {
      vernacular_reply = "You can initiate a return or exchange request directly via the 'My Orders' section of the application within 7 days of delivery.";
    }
  } else if (norm.includes("coupon") || norm.includes("discount") || norm.includes("code") || norm.includes("off") || norm.includes("कूपन") || norm.includes("offer") || norm.includes("sasta") || norm.includes("tallubadi")) {
    intent = "COUPON_ISSUES";
    if (detected_language.startsWith("Hindi") || detected_language.startsWith("Hinglish")) {
      vernacular_reply = "नया कूपन कोड 'WELCOME10' लागू करें, जो आपको नए ऑर्डर पर 10% की अतिरिक्त छूट देगा।";
    } else if (detected_language.startsWith("Tamil") || detected_language.startsWith("Tanglish")) {
      vernacular_reply = "சிறப்பு குறியீடு 'WELCOME10' ஐப் பயன்படுத்தி 10% தள்ளுபடி பெறலாம்.";
    } else if (detected_language.startsWith("Marathi")) {
      vernacular_reply = "कृपया नवीन ऑफर कोड 'WELCOME10' वापरा, तुम्हाला अतिरिक्त १०% सवलत मिळेल.";
    } else if (detected_language.startsWith("Telugu")) {
      vernacular_reply = "కొత్త కూపన్ కోడ్ 'WELCOME10' ఉపయోగించి మీ ఆర్డర్‌పై 10% అదనపు డిస్కౌంట్ పొందండి.";
    } else if (detected_language.startsWith("Kannada") || detected_language.startsWith("Kanglish")) {
      vernacular_reply = "ಹೊಸ ಆಫರ್ 'WELCOME10' ಕೋಡ್ ಬಳಸಿ ಮತ್ತು ನಿಮ್ಮ ಆರ್ಡರ್ ಮೇಲೆ ಹತ್ತು ಶೇಕಡಾ ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ.";
    } else if (detected_language.startsWith("Gujarati")) {
      vernacular_reply = "નવો ડિસ્કાઉન્ટ કૂપન કોડ 'WELCOME10' વાપરીને ૧૦% ની વિશેષ છૂટ મેળવો.";
    } else if (detected_language.startsWith("Bengali")) {
      vernacular_reply = "अनुग्रह करके नए कूपन 'WELCOME10' का उपयोग करें जो आपको उत्कृष्ट डिस्काउंट दे पायेगा!";
    } else {
      vernacular_reply = "Please try employing coupon code 'WELCOME10' to receive an instant 10% discount on your cart.";
    }
  } else if (norm.includes("call") || norm.includes("manager") || norm.includes("speak") || norm.includes("human") || norm.includes("agent") || norm.includes("operator") || norm.includes("pesavum") || norm.includes("kaal")) {
    intent = "HUMAN_ESCALATION";
    sentiment = sentiment === "Angry" ? "Angry" : "Negative";
    should_escalate = true;
    if (detected_language.startsWith("Hindi") || detected_language.startsWith("Hinglish")) {
      vernacular_reply = "मैं समझ सकता हूँ। मैं आपको तुरंत हमारे लाइव सपोर्ट एजेंट से जोड़ रहा हूँ। कृपया एक मिनट प्रतीक्षा करें।";
    } else if (detected_language.startsWith("Tamil") || detected_language.startsWith("Tanglish")) {
      vernacular_reply = "நாங்கள் உடனே உங்கள் அமர்வை நேரடி உதவி மேலாளருக்குப் பகிர்கிறோம். தயவுசெய்து ஒரு நிமிடம் காத்திருங்கள்.";
    } else if (detected_language.startsWith("Marathi")) {
      vernacular_reply = "आम्ही तुमची गैरसोय समजू शकतो. तुमचे चॅट त्वरित आमच्या वरिष्ठ व्यवस्थापकाकडे जोडत आहोत. कृपया थांबा.";
    } else if (detected_language.startsWith("Telugu")) {
      vernacular_reply = "మేము మీ సమస్య తీవ్రతను గ్రహించాము. వెంటనే మీ చ్యాట్‌ను సీనియర్ మేనేజర్‌కు బదిలీ చేస్తున్నాము.";
    } else if (detected_language.startsWith("Kannada") || detected_language.startsWith("Kanglish")) {
      vernacular_reply = "ನಿಮ್ಮ ತೊಂದರೆಗೆ ವಿಷಾದಿಸುತ್ತೇವೆ. ನಿಮ್ಮ चॉट ಅನ್ನು ಕೂಡಲೇ ಹಿರಿಯ ಮ್ಯಾನೇಜರ್‌ಗೆ ವರ್ಗಾಯಿಸುತ್ತಿದ್ದೇವೆ.";
    } else if (detected_language.startsWith("Bengali")) {
      vernacular_reply = "अनुग्रह करके एक क्षण प्रतीक्षा करें। कॉपायलट आपको लाइव सपोर्ट ऑपरेटर से तुरंत सम्बद्ध कर रहा है।";
    } else {
      vernacular_reply = "Understood. I have flagged your frustration and am routing your ticket directly to an on-duty senior support supervisor right away.";
    }
  }

  const isSatisfied = norm.includes("thank") || norm.includes("dhanyawad") || norm.includes("shukriya") || norm.includes("badiya") || norm.includes("done") || norm.includes("ok thanks") || norm.includes("bye") || norm.includes("alvida");
  const close_ticket = false; // We do not auto-close immediately

  if (isSatisfied) {
    if (detected_language.startsWith("Hindi")) {
      vernacular_reply = "आपकी सहायता करके बहुत खुशी हुई! क्या आपको किसी अन्य सहायता की आवश्यकता है? बेझिझक पूछें।";
    } else if (detected_language.startsWith("Hinglish")) {
      vernacular_reply = "Aapki help karke khushi hui! Kya aapko koi aur assistance chahiye? Feel free to ask.";
    } else {
      vernacular_reply = "I'm happy to help you! Do you need any other assistance? Feel free to ask.";
    }
  }

  return {
    detected_language,
    intent,
    confidence: 0.95,
    should_escalate,
    sentiment,
    vernacular_reply,
    close_ticket
  };
};

// Generates an incredibly accurate, context-aware, vernacular response suggestion for the support copilot
export async function generateCopilotSuggestion(ticket: Ticket, overrideMessage?: string): Promise<any> {
  const activePrompt = getSystemPromptRule(ticket);
  const messageToAnalyze = overrideMessage || (ticket.messages.slice().reverse().find(m => m.sender === 'CUSTOMER')?.content || "");
  if (!messageToAnalyze) {
    return null;
  }

  // Construct context of recent chat exchange up to last 10 messages for full continuity
  const recentMessages = ticket.messages.slice(-10);
  const chatContextText = recentMessages
    .filter(m => m.sender === 'CUSTOMER' || m.sender === 'AI' || m.sender === 'AGENT')
    .map(m => `${m.sender}: ${m.content}`)
    .join('\n');

  let analysisResult;

  // Append linked order parameters context dynamically if registered to guide high-fidelity responses
  let orderInfoPrompt = "";
  if (ticket.orderNameMismatch) {
    orderInfoPrompt = `\n\n[LINKED ORDER PRIVACY / NAME MISMATCH STATE]:\n- The Customer entered a valid Order ID "${ticket.orderId || ''}", but this order belongs to a different customer ("${ticket.orderDetail?.customerName || ''}") and is NOT linked with this customer\'s name ("${ticket.customerName || ''}").\n\nCRITICAL DATA PRIVACY DIRECTIVE: You are STRICTLY FORBIDDEN from revealing ANY details about this order (including what product was purchased, logistics delivery status, carrier, amount, etc.) to this customer. You MUST politely and directly inform the customer that "This Order ID is not linked with your name" and ask them to check their invoice and enter the correct Order ID. Match their target language preference and brand tone.`;
  } else if (ticket.orderDetail && !ticket.orderIdInvalid) {
    let rawMetaText = "";
    if (ticket.orderDetail.rawRecord && typeof ticket.orderDetail.rawRecord === 'object') {
      try {
        const entries = Object.entries(ticket.orderDetail.rawRecord)
          .map(([k, v]) => `- ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join('\n');
        if (entries) {
          rawMetaText = `\n\n[ALL LIVE DATABASE COLUMNS & CUSTOM FIELDS]:\n${entries}`;
        }
      } catch (err) {
        console.warn("Failed to serialize rawRecord:", err);
      }
    }

    orderInfoPrompt = `\n\n[LINKED ORDER TRANSACTION LOGS]:\n- Order Reference ID: ${ticket.orderDetail.id}\n- Customer Name: ${ticket.orderDetail.customerName}\n- Product Purchased: ${ticket.orderDetail.itemName}\n- Logistics status: ${ticket.orderDetail.status}\n- Payment Mode Used: ${ticket.orderDetail.paymentMode}\n- Order amount: ₹${ticket.orderDetail.cost}\n- Shipping carrier: ${ticket.orderDetail.carrier || "N/A"}\n- Expected delivery: ${ticket.orderDetail.estimatedDelivery || "N/A"}${rawMetaText}\n\nIMPORTANT: Leverage these exact purchase facts to address the user query explicitly and highly accurately in your reply string!`;
  } else if (ticket.orderIdInvalid) {
    orderInfoPrompt = `\n\n[LINKED ORDER ERROR STATE]:\n- The Customer has entered or referred to an Order ID (or number) "${ticket.orderId || ''}", but this order ID does NOT exist in our databases or live integration connections, and is completely invalid!\n\nIMPORTANT: You MUST explicitly and politely inform the customer that the order number or ID they provided is invalid or does not exist in our system, and that they should double check/verify their invoice and try again. Maintain the requested support brand tone and translation/localization rules strictly.`;
  }

  const claudeClient = getClaudeClient();
  const geminiClient = getGeminiClient();

  if (claudeClient) {
    try {
      const response = await retryWithBackoff(() =>
        claudeClient.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          temperature: 0.1,
          system: activePrompt,
          messages: [{ role: 'user', content: `Analyze the latest customer message in the context of this conversation history.

Conversation History:
${chatContextText}

Latest Customer Message: "${messageToAnalyze}" ${orderInfoPrompt}` }]
        })
      );

      const responseText = (response.content[0] as any).text;
      const cleanJSON = responseText.substring(
        responseText.indexOf('{'),
        responseText.lastIndexOf('}') + 1
      );
      analysisResult = JSON.parse(cleanJSON);
      console.log("Claude successfully parsed outcome for copilot suggestion:", analysisResult);
    } catch (e: any) {
      console.error("Claude API failed for copilot after retries:", e.message || e);
    }
  }

  if (!analysisResult && geminiClient) {
    try {
      const chatPrompt = `${activePrompt}

Analyze the latest customer message in the context of this conversation history:

Conversation History:
${chatContextText}

Latest Customer Message: "${messageToAnalyze}" ${orderInfoPrompt}

Output the precise JSON analysis with your vernacular reply.`;
      const response = await retryWithBackoff(() =>
        geminiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: chatPrompt,
        })
      );

      const responseText = response.text || '';
      const cleanJSON = responseText.substring(
        responseText.indexOf('{'),
        responseText.lastIndexOf('}') + 1
      );
      analysisResult = JSON.parse(cleanJSON);
      console.log("Gemini 3.1 Flash Lite successfully generated copilot outcome:", analysisResult);
    } catch (e: any) {
      const formattedErr = formatErrorOutput(e);
      console.warn(`Gemini 3.1 Flash Lite failed for copilot (${formattedErr}), trying fallback model gemini-3.5-flash...`);
      try {
        const chatPrompt = `${activePrompt}

Analyze the latest customer message in the context of this conversation history:

Conversation History:
${chatContextText}

Latest Customer Message: "${messageToAnalyze}" ${orderInfoPrompt}

Output the precise JSON analysis with your vernacular reply.`;
        const response35 = await retryWithBackoff(() =>
          geminiClient.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: chatPrompt,
          })
        );

        const responseText = response35.text || '';
        const cleanJSON = responseText.substring(
          responseText.indexOf('{'),
          responseText.lastIndexOf('}') + 1
        );
        analysisResult = JSON.parse(cleanJSON);
        console.log("Gemini 3.5 Flash successfully generated copilot outcome:", analysisResult);
      } catch (flashErr: any) {
        const formattedFlashErr = formatErrorOutput(flashErr);
        console.error(`Gemini 3.5 Flash also failed for copilot (${formattedFlashErr})`);
      }
    }
  }

  if (!analysisResult) {
    analysisResult = runLocalClassifier(messageToAnalyze);
    if (ticket.orderDetail) {
      const lang = analysisResult.detected_language || "Hinglish";
      const isHing = lang.toLowerCase().includes("hing");
      const isHind = lang.toLowerCase().includes("hind") && !isHing;

      if (ticket.orderDetail.status.includes("Transit")) {
        analysisResult.vernacular_reply = isHind 
          ? `नमस्ते! रिकॉर्ड के अनुसार आपका ऑर्डर ${ticket.orderDetail.id} (${ticket.orderDetail.itemName}) ${ticket.orderDetail.estimatedDelivery} को डिलिवर हो जाएगा। भुगतान माध्यम: ${ticket.orderDetail.paymentMode} था।`
          : isHing
            ? `Hi! Records ke mutabik apka order ${ticket.orderDetail.id} (${ticket.orderDetail.itemName}) ${ticket.orderDetail.estimatedDelivery} ko deliver ho jayega. Payment mode: ${ticket.orderDetail.paymentMode} tha.`
            : `Hello! According to our records, your order ${ticket.orderDetail.id} (${ticket.orderDetail.itemName}) will be delivered on ${ticket.orderDetail.estimatedDelivery}. Payment Mode: ${ticket.orderDetail.paymentMode}.`;
      } else {
        analysisResult.vernacular_reply = isHind 
          ? `नमस्ते! रिकॉर्ड के अनुसार आपका ऑर्डर ${ticket.orderDetail.id} (${ticket.orderDetail.itemName}) ${ticket.orderDetail.estimatedDelivery} को डिलीवर हो चुका है। भुगतान माध्यम: ${ticket.orderDetail.paymentMode} था।`
          : isHing
            ? `Hi! Records ke mutabik apka order ${ticket.orderDetail.id} (${ticket.orderDetail.itemName}) ${ticket.orderDetail.estimatedDelivery} ko deliver ho chuka hai. Payment mode: ${ticket.orderDetail.paymentMode} tha.`
            : `Hello! According to our records, your order ${ticket.orderDetail.id} (${ticket.orderDetail.itemName}) has already been delivered on ${ticket.orderDetail.estimatedDelivery}. Payment Mode: ${ticket.orderDetail.paymentMode}.`;
      }
    }
    console.log("Completed copilot analysis via local heuristic engine:", analysisResult);
  }

  if (analysisResult) {
    ticket.detectedLanguage = analysisResult.detected_language || ticket.detectedLanguage || "Hinglish";
    ticket.lastIntent = analysisResult.intent || ticket.lastIntent || "PRODUCT_INQUIRY";
    if (analysisResult.sentiment && ['Positive', 'Neutral', 'Negative', 'Angry'].includes(analysisResult.sentiment)) {
      ticket.sentiment = analysisResult.sentiment;
    }
    ticket.copilotSuggestion = analysisResult.vernacular_reply;

    if (analysisResult.should_escalate || analysisResult.intent === 'HUMAN_ESCALATION') {
      ticket.humanRequested = true;
    }
  }

  return analysisResult;
}
