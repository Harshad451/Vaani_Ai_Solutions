/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { Ticket, Message, DatasetItem, Employee, Order } from './src/types';
import { androidSourceFiles } from './src/androidSource';

import { SecuredEmployee, Settings } from './server/types';
import {
  firestore,
  firestoreAuthErrorDetected,
  handleFirestoreErrorAndCheckFallback,
  tickets,
  mockOrders,
  detectAndAssignOrder,
  datasets,
  employees,
  saveEmployees,
  loadEmployees,
  globalSettings,
  companySettings,
  loadCompanySettings,
  saveCompanySettings,
  getSubscriptionDaysLeft,
  getSettingsForCompany,
  saveCompanySettingsToFirestore,
  loadCompanySettingsFromFirestore,
  saveTicketsToLocalBackup,
  saveTicketToFirestore,
  saveMessageToFirestore,
  loadSettingsFromFirestore,
  loadTicketsFromFirestore
} from './server/db';
import {
  secureHash,
  verifyPassword,
  isPasswordStrong,
  activeSessions,
  SESSION_LIFESPAN_MS,
  pending2FASessions,
  passwordResetTokens,
  loginAttempts,
  authRateLimiter,
  requireAuth,
  getEmployeeFromRequest
} from './server/auth';
import {
  getGeminiClient,
  getClaudeClient,
  formatErrorOutput,
  retryWithBackoff,
  getSystemPromptRule,
  runLocalClassifier,
  generateCopilotSuggestion
} from './server/ai';

const app = express();
app.use(express.json());

const PORT = 3000;

















// Periodic ticket inactivity auto-closure checker (1 minute inactivity timeout)
setInterval(async () => {
  const now = Date.now();
  for (const ticket of tickets) {
    if (ticket.status !== 'RESOLVED' && ticket.messages.length > 0) {
      const lastMsg = ticket.messages[ticket.messages.length - 1];
      if (lastMsg && (lastMsg.sender === 'AI' || lastMsg.sender === 'AGENT')) {
        const elapsed = now - new Date(lastMsg.createdAt).getTime();
        // 1 minute (60,000 milliseconds) inactivity threshold
        if (elapsed >= 60000) {
          ticket.status = 'RESOLVED';
          ticket.updatedAt = new Date().toISOString();
          
          // Log the closure reason as Customer Inactivity using a SYSTEM message
          const sysMsg: Message = {
            id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
            sender: 'SYSTEM',
            content: "Conversation automatically closed. Reason: Customer Inactivity",
            createdAt: new Date().toISOString()
          };
          ticket.messages.push(sysMsg);
          
          await saveTicketToFirestore(ticket);
          console.log(`[Customer Inactivity Auto-Closure] Automatically closed ticket ${ticket.id} after 1 minute of customer silence.`);
        }
      }
    }
  }
}, 5000); // Check every 5 seconds for highly responsive timing



// Intent solver mapping for local keyword analysis fallback (Consolidated Multilingual Engine)
const runLocalClassifier_deprecated = (query: string): any => {
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
    vernacular_reply = "నమస్కారం! మీ సమస్యను పరిష్కరించడానికి సహాయక ప్రతినిధి త్వరలోనే అనుసంధానించబడతారు.";
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
      vernacular_reply = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡਾ ਆਰਡਰ ਰਸਤੇ ਵਿੱਚ ਹੈ ਅਤੇ ਅਗਲੇ 24-48 ਘੰटਿਆਂ ਵਿੱਚ ਪ੍ਰਾਪਤ ਹੋ ਜਾਵੇਗਾ।";
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
      vernacular_reply = "આપ ડિલિવરી મળ્યાના ૭ દિવસમાં ઓર્ડર ઇતિહાસમાં જઈને 'રિટર્न/એક્સચેન્જ' રિકવેસ્ટ કરી શકો છો.";
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
      vernacular_reply = "অনুগ্রহ করে নতুন কুপন 'WELCOME10' ব্যবহার করুন যা আপনাকে অতিরিক্ত ১০% ছাড় দেবে।";
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
      vernacular_reply = "অনুগ্রহ করে এক মুহূর্ত অপেক্ষা করুন। আমরা আপনার সেশনটি সিনিয়র ম্যানেজারকে স্থনান্তর করছি।";
    } else {
      vernacular_reply = "Understood. I have flagged your frustration and am routing your ticket directly to an on-duty senior support supervisor right away.";
    }
  }

  return {
    detected_language,
    intent,
    confidence: 0.95,
    should_escalate,
    sentiment,
    vernacular_reply
  };
};

const _unused_old_runLocalClassifier_deprecated = (query: string): any => {
  const norm = query.toLowerCase();
  let intent = "PRODUCT_INQUIRY";
  let detected_language = "English";
  let sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Angry' = "Neutral";
  let should_escalate = false;
  let vernacular_reply = "नमस्ते! हम आपकी सहायता करने की पूरी कोशिश कर रहे हैं। शीघ्र ही हमारी टीम आपसे जुड़ेगी।";

  // Language detection
  if (norm.includes("mera") || norm.includes("kab") || norm.includes("nahi") || norm.includes("hai") || norm.includes("aayega") || norm.includes("bhai")) {
    detected_language = "Hinglish (Hindi-English)";
  } else if (norm.includes("ennoda") || norm.includes("iruku") || norm.includes("mudiyuma") || norm.includes("pathala") || norm.includes("romba")) {
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
  if (detected_language.startsWith("Marathi")) {
    vernacular_reply = "नमस्कार! आम्ही तुमची मदत करण्यासाठी सर्वतोपरी प्रयत्न करत आहोत. आमची टीम लवकरच तुमच्याशी जोडली जाईल.";
  } else if (detected_language.startsWith("Telugu")) {
    vernacular_reply = "నమస్కారం! మీ సమస్యను పరిష్కరించడానికి సహాయక ప్రతినిధి త్వరలోనే అనుసంధానించబడతారు.";
  } else if (detected_language.startsWith("Bengali")) {
    vernacular_reply = "নমস্কার! আপনার অনুসন্ধানের বিষয়ে সাহায্য করার জন্য আমাদের একজন সহযোগী শীঘ্রই আপনার সাথে যোগাযোগ করবেন।";
  } else if (detected_language.startsWith("Gujarati")) {
    vernacular_reply = "નમસ્તે! આપને મદદ કરવા માટે અમારી ટીમ ટૂંક સમયમાં આપની સાથે સંપર્ક કરશે.";
  } else if (detected_language.startsWith("Kannada")) {
    vernacular_reply = "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಸಹಾಯಕ್ಕಾಗಿ ನಮ್ಮ ಪ್ರತಿನಿಧಿ ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸಲಿದ್ದಾರೆ.";
  } else if (detected_language.startsWith("Malayalam")) {
    vernacular_reply = "നമസ്കാരം! നിങ്ങളെ സഹായിക്കുന്നതിനായി ഞങ്ങളുടെ പ്രതിനിധി ഉടൻ ബന്ധപ്പെടും.";
  } else if (detected_language.startsWith("Punjabi")) {
    vernacular_reply = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਅਸੀਂ ਤੁਹਾਡੀ ਸਹਾਇਤਾ ਲਈ ਜਲਦੀ ਹੀ ਸੰਪਰਕ ਕਰਾਂਗੇ।";
  }

  // Intent classification
  if (norm.includes("track") || norm.includes("deliv") || norm.includes("kab") || norm.includes("mil") || norm.includes("delay") || norm.includes("aayega") || norm.includes("status")) {
    intent = "ORDER_TRACKING";
    if (detected_language.startsWith("Hinglish")) {
      vernacular_reply = "आपकी ट्रैकिंग आईडी 'DTD12498' दिल्ली हब में है और कल शाम तक डिलीवर हो जाएगी। निश्चिंत रहें!";
    } else if (detected_language.startsWith("Tanglish")) {
      vernacular_reply = "உங்கள் ஆர்டர் தற்போது விநியோகத்திற்கு தயாராக உள்ளது. நாளைக்குள் உங்களிடம் ஒப்படைக்கப்படும்.";
    } else if (detected_language.startsWith("Hindi")) {
      vernacular_reply = "नमस्ते! आपका ऑर्डर मार्ग में है और अगले २४ से ४८ घंटों में वितरित कर दिया जाएगा।";
    } else if (detected_language.startsWith("Tamil")) {
      vernacular_reply = "வணக்கம்! உங்கள் ஆர்டர் தற்போது போக்குவரத்தில் உள்ளது, மேலும் 24-48 மணிநேரத்திற்குள் டெലിவரி செய்யப்படும்.";
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
  } else if (norm.includes("refund") || norm.includes("paisa") || norm.includes("money") || norm.includes("money back") || norm.includes("రీఫండ్") || norm.includes("ರಿಫಂಡ್") || norm.includes("रिफंड") || norm.includes("ରିଫଣ୍ଡ")) {
    intent = "REFUND_STATUS";
    sentiment = "Negative";
    should_escalate = false;
    if (detected_language.startsWith("Hinglish")) {
      vernacular_reply = "Refunder process start ho gaya hai. Yeh 3-5 business days me aapke bank account me aa jayega.";
    } else if (detected_language.startsWith("Tanglish")) {
      vernacular_reply = "Refund process thuvangapattathu. Idhu 3-5 naatkalil ungal bank accountil varum.";
    } else if (detected_language.startsWith("Hindi")) {
      vernacular_reply = "रिफंड प्रक्रिया शुरू कर दी गई है। यह ३ से ५ व्यावसायिक दिनों में आपके बैंक खाते में जमा हो जाएगा।";
    } else if (detected_language.startsWith("Tamil")) {
      vernacular_reply = "பணத்தைத் திரும்பப்பெறும் செயல்முறை தொடங்கப்பட்டுள்ளது, இது 3-5 வேலை நாட்களில் உங்கள் கணக்கில் வரவு வைக்கப்படும்.";
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
  } else if (norm.includes("return") || norm.includes("exchange") || norm.includes("change") || norm.includes("replace") || norm.includes("size") || norm.includes("बदल") || norm.includes("ಬದಲ")) {
    intent = "RETURN_REQUEST";
    if (detected_language.startsWith("Hindi") || detected_language.startsWith("Hinglish")) {
      vernacular_reply = "आप डिलीवरी की तारीख से 7 दिनों के भीतर ऑर्डर इतिहास सेक्शन में 'Return/Exchange' दर्ज कर सकते हैं।";
    } else if (detected_language.startsWith("Tamil") || detected_language.startsWith("Tanglish")) {
      vernacular_reply = "பிரசவத்திலிருந்து 7 நாட்களுக்குள் உங்கள் ஆர்டர் வரலாற்று பிரிவில் 'மாற்று/திரும்பு' என பதிவு செய்யலாம்.";
    } else if (detected_language.startsWith("Marathi")) {
      vernacular_reply = "आपण डिलिव्हरी मिळाल्यापासून ७ दिवसांच्या आत ऑर्डर इतिहास विभागात 'Return/Exchange' नोंदवू शकता.";
    } else if (detected_language.startsWith("Telugu")) {
      vernacular_reply = "డెలివరీ జరిగిన 7 రోజులలోపు మీరు 'Return/Exchange' ను ఎంచుకుని మార్చుకోవచ్చు.";
    } else if (detected_language.startsWith("Kannada")) {
      vernacular_reply = "ಡೆಲಿವರಿ ಆದ 7 ದಿನಗಳ ಒಳಗೆ ನೀವು ಆರ್ಡರ್ ಹಿಸ್ಟರಿಯಲ್ಲಿ 'ತಿರುಗಿಸು / ಬದಲಾಯಿಸು' ದಾಖಲಿಸಬಹುದು.";
    } else if (detected_language.startsWith("Gujarati")) {
      vernacular_reply = "આપ ડિલિવરી મળ્યાના ૭ દિવસમાં ઓર્ડર ઇતિહાસમાં જઈને 'રિટર્ન/એક્સચેન્જ' રિકવેસ્ટ કરી શકો છો.";
    } else if (detected_language.startsWith("Bengali")) {
      vernacular_reply = "ডেলিভারি পাওয়ার ৭ দিনের মধ্যে আপনি অর্ডার হিস্ট্রি থেকে রিটার্ন বা এক্সচেঞ্জ রিকোয়েস্ট করতে পারেন।";
    } else {
      vernacular_reply = "You can initiate a return or exchange request directly via the 'My Orders' section of the application within 7 days of delivery.";
    }
  } else if (norm.includes("coupon") || norm.includes("discount") || norm.includes("code") || norm.includes("off") || norm.includes("कूपन") || norm.includes("ಕೂಪನ್") || norm.includes("ఆఫర్") || norm.includes("सवलत") || norm.includes("ছাড়")) {
    intent = "COUPON_ISSUES";
    if (detected_language.startsWith("Hindi") || detected_language.startsWith("Hinglish")) {
      vernacular_reply = "नया कूपन कोड 'WELCOME10' लागू करें, जो आपको नए ऑर्डर पर 10% की अतिरिक्त छूट देगा।";
    } else if (detected_language.startsWith("Tamil") || detected_language.startsWith("Tanglish")) {
      vernacular_reply = "சிறப்பு குறியீடு 'WELCOME10' ஐப் பயன்படுத்தி 10% தள்ளுபடி பெறலாம்.";
    } else if (detected_language.startsWith("Marathi")) {
      vernacular_reply = "कृपया नवीन ऑफर कोड 'WELCOME10' वापरा, तुम्हाला अतिरिक्त १०% सवलत मिळेल.";
    } else if (detected_language.startsWith("Telugu")) {
      vernacular_reply = "కొత్త కూపన్ కోడ్ 'WELCOME10' ఉపయోగించి మీ ఆర్డర్‌పై 10% అదనపు డిస్కౌంట్ పొందండి.";
    } else if (detected_language.startsWith("Kannada")) {
      vernacular_reply = "ಹೊಸ ಆಫರ್ 'WELCOME10' ಕೋಡ್ ಬಳಸಿ ಮತ್ತು ನಿಮ್ಮ ಆರ್ಡರ್ ಮೇಲೆ ಹತ್ತು ಶೇಕಡಾ ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ.";
    } else if (detected_language.startsWith("Gujarati")) {
      vernacular_reply = "નવો ડિસ્કાઉન્ટ કૂપન કોડ 'WELCOME10' વાપરીને ૧૦% ની વિશેષ છૂટ મેળવો.";
    } else if (detected_language.startsWith("Bengali")) {
      vernacular_reply = "অনুগ্রহ করে নতুন কুপন 'WELCOME10' ব্যবহার করুন যা আপনাকে অতিরিক্ত ১০% ছাড় দেবে।";
    } else {
      vernacular_reply = "Discount applied failed? Please use 'WELCOME10' to claim a 10% flat discount on your new cart order!";
    }
  } else if (norm.includes("call") || norm.includes("manager") || norm.includes("speak") || norm.includes("human") || norm.includes("fuck") || norm.includes("faltu") || norm.includes("მოსام") || norm.includes("ಸಿಕ್ಕಾಪಟ್ಟೆ") || norm.includes("खराब")) {
    intent = "HUMAN_ESCALATION";
    sentiment = "Angry";
    should_escalate = true;
    if (detected_language.startsWith("Hindi") || detected_language.startsWith("Hinglish")) {
      vernacular_reply = "मैं समझ सकता हूँ। मैं आपको तुरंत हमारे लाइव चैट मैनेजर से जोड़ रहा हूँ। कृपया प्रतीक्षा करें।";
    } else if (detected_language.startsWith("Tamil") || detected_language.startsWith("Tanglish")) {
      vernacular_reply = "நாங்கள் உடனே உங்கள் அமர்வை நேரடி உதவி மேலாளருக்குப் பகிர்கிறோம். தயவுசெய்து ஒரு நிமிடம் காத்திருங்கள்.";
    } else if (detected_language.startsWith("Marathi")) {
      vernacular_reply = "आम्ही तुमची गैरसोय समजू शकतो. तुमचे चॅट त्वरित आमच्या वरिष्ठ व्यवस्थापकाकडे जोडत आहोत. कृपया थांबा.";
    } else if (detected_language.startsWith("Telugu")) {
      vernacular_reply = "మేము మీ సమస్య తీవ్రతను గ్రహించాము. వెంటనే మీ చ్యాట్‌ను సీనియర్ మేనేజర్‌కు బదిలీ చేస్తున్నాము.";
    } else if (detected_language.startsWith("Kannada")) {
      vernacular_reply = "ನಿಮ್ಮ ತೊಂದರೆಗೆ ವಿಷಾದಿಸುತ್ತೇವೆ. ನಿಮ್ಮ ಚಾಟ್ ಅನ್ನು ಕೂಡಲೇ ಹಿರಿಯ ಮ್ಯಾನೇಜರ್‌ಗೆ ವರ್ಗಾಯಿಸುತ್ತಿದ್ದೇವೆ.";
    } else if (detected_language.startsWith("Bengali")) {
      vernacular_reply = "অনুগ্রহ করে এক মুহূর্ত অপেক্ষা করুন। আমরা আপনার সেশনটি সিনিয়র ম্যানেজারকে স্থনান্তর করছি।";
    } else {
      vernacular_reply = "Understood. I have flagged your frustration and am routing your ticket directly to an on-duty senior support supervisor right away.";
    }
  }

  const isSatisfied = norm.includes("thank") || norm.includes("dhanyawad") || norm.includes("shukriya") || norm.includes("badiya") || norm.includes("done") || norm.includes("ok thanks") || norm.includes("bye") || norm.includes("alvida");
  const close_ticket = isSatisfied;

  if (close_ticket) {
    if (detected_language.startsWith("Hindi") || detected_language.startsWith("Hinglish")) {
      vernacular_reply = "Aapki madad karke khushi hui! Sabhi queries resolve ho chuki hain. Have a great day! Alvida!";
    } else {
      vernacular_reply = "I am happy to help you today! Your issue is fully resolved. Have a great day! Goodbye!";
    }
  }

  return {
    detected_language,
    intent,
    confidence: 0.92,
    should_escalate,
    sentiment,
    vernacular_reply,
    close_ticket
  };
};

// Generates an incredibly accurate, context-aware, vernacular response suggestion for the support copilot
async function generateCopilotSuggestion_deprecated(ticket: Ticket, overrideMessage?: string): Promise<any> {
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
  if (ticket.orderDetail) {
    orderInfoPrompt = `\n\n[LINKED ORDER TRANSACTION LOGS]:\n- Order Reference ID: ${ticket.orderDetail.id}\n- Customer Name: ${ticket.orderDetail.customerName}\n- Product Purchased: ${ticket.orderDetail.itemName}\n- Logistics status: ${ticket.orderDetail.status}\n- Payment Mode Used: ${ticket.orderDetail.paymentMode}\n- Order amount: ₹${ticket.orderDetail.cost}\n- Shipping carrier: ${ticket.orderDetail.carrier || "N/A"}\n- Expected delivery: ${ticket.orderDetail.estimatedDelivery || "N/A"}\n\nIMPORTANT: Leverage these exact purchase facts to address the user query explicitly and highly accurately in your reply string!`;
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
          ? `नमस्ते! आपका ऑर्डर ${ticket.orderDetail.id} अभी रास्ते में है। हमारे पार्टनर ${ticket.orderDetail.carrier} के अनुसार यह ${ticket.orderDetail.estimatedDelivery} तक डिलीवर हो जाएगा।`
          : isHing
            ? `Hi! Apka order ${ticket.orderDetail.id} abhi transit me hai. Hmare partner ${ticket.orderDetail.carrier} ke mutabik ye apko ${ticket.orderDetail.estimatedDelivery} tak mil jayega.`
            : `Hello! Your order ${ticket.orderDetail.id} is in transit. According to our partner ${ticket.orderDetail.carrier}, it is estimated to arrive by ${ticket.orderDetail.estimatedDelivery}.`;
      } else if (ticket.orderDetail.status.includes("Delivered")) {
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

/* ================== API ENDPOINTS ================== */

// Employee Login endpoint with brute-force protection, hash comparison, and 2FA initiation
app.post('/api/auth/login', authRateLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const employee = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
  if (!employee || !verifyPassword(password, employee.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email address or passcode' });
  }

  // Generate a random 6-digit numeric 2FA code
  const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
  const tempSessionId = crypto.randomBytes(32).toString('hex');

  // Store in pending states (expires in 5 minutes)
  pending2FASessions.set(tempSessionId, {
    employeeId: employee.id,
    code: twoFactorCode,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  const compSettings = getSettingsForCompany(employee.companyName);
  const deliveryEmail = compSettings.supportEmail || "support@noshberry.com";
  console.log(`\n=======================================================\n[2FA SECURITY] Verification code dispatched to support email (${deliveryEmail}): ${twoFactorCode}\n=======================================================\n`);

  // Return that 2FA is required, along with details to continue the flow
  res.json({ 
    success: true, 
    twoFactorRequired: true, 
    tempSessionId,
    deliveryEmail,
    debugCode: twoFactorCode // Returned for sandbox preview ease
  });
});

// Employee 2FA Code Verification and session promotion endpoint
app.post('/api/auth/verify-2fa', authRateLimiter, (req, res) => {
  const { tempSessionId, code } = req.body;
  if (!tempSessionId || !code) {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  const pending = pending2FASessions.get(tempSessionId);
  if (!pending) {
    return res.status(401).json({ error: '2FA session has expired or is invalid. Please log in again.' });
  }

  if (Date.now() > pending.expiresAt) {
    pending2FASessions.delete(tempSessionId);
    return res.status(401).json({ error: 'Your 2FA verification code has expired (5-minute limit). Please log in again.' });
  }

  if (pending.code !== code.trim()) {
    return res.status(401).json({ error: 'Incorrect 2FA verification code. Please try again.' });
  }

  // Code validated successfully! Promote to full active session
  pending2FASessions.delete(tempSessionId);

  const employee = employees.find(e => e.id === pending.employeeId);
  if (!employee) {
    return res.status(401).json({ error: 'Employee account not found.' });
  }

  // Generate the actual secure session token
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    employeeId: employee.id,
    expiresAt: Date.now() + SESSION_LIFESPAN_MS
  });

  // Success: Return profile without hash along with active session token
  const { passwordHash, ...profile } = employee;
  res.json({ success: true, employee: profile, token });
});

// Employee Registration endpoint with strength reinforcement, hashing, and token setup
app.post('/api/auth/register', authRateLimiter, (req, res) => {
  const { email, name, role, password } = req.body;
  if (!email || !name || !role || !password) {
    return res.status(400).json({ error: 'Please provide email, name, role, and password' });
  }

  const normalizedEmail = email.toLowerCase();
  const exists = employees.some(e => e.email.toLowerCase() === normalizedEmail);
  if (exists) {
    return res.status(400).json({ error: 'An employee account with this email already exists' });
  }

  // Password Complexity requirement validation (8+ characters, uppercase, lowercase, numeric, special char)
  if (!isPasswordStrong(password)) {
    return res.status(400).json({ 
      error: 'Password does not meet complexity requirements. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, $, %, !, *, ?).' 
    });
  }

  const securedPasswordHash = secureHash(password);

  const creatorEmployee = getEmployeeFromRequest(req);
  if (creatorEmployee) {
    if (creatorEmployee.role !== 'Business Owner') {
      return res.status(403).json({ error: 'Only a Business Owner can recruit and onboard new agent seats.' });
    }
    if (!creatorEmployee.companyName) {
      return res.status(400).json({ error: 'Please set up your Company Name first under Settings before onboarding a new agent seat.' });
    }
  }

  const companyName = creatorEmployee?.companyName || req.body.companyName;

  const newEmployee: SecuredEmployee = {
    id: "emp_" + Math.floor(Math.random() * 90000 + 10000),
    email: normalizedEmail,
    name,
    role,
    passwordHash: securedPasswordHash,
    createdAt: new Date().toISOString(),
    companyName: companyName || undefined
  };

  employees.push(newEmployee);
  saveEmployees();
  
  // Persist agent profile into Cloud Firestore
  if (!firestoreAuthErrorDetected) {
    const runWrite = async () => {
      await firestore.collection('agents').doc(newEmployee.id).set(newEmployee);
    };
    runWrite().catch(async err => {
      try {
        await handleFirestoreErrorAndCheckFallback(err, runWrite);
      } catch (e) {
        console.warn(`Firestore write employee: Employee successfully created locally, but remote Cloud Sync was skipped (${e?.message || String(e)})`);
      }
    });
  }

  // Generate a cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    employeeId: newEmployee.id,
    expiresAt: Date.now() + SESSION_LIFESPAN_MS
  });

  const { passwordHash: _, ...profile } = newEmployee;
  res.json({ success: true, employee: profile, passwordHash: newEmployee.passwordHash, token });
});

// Client-side local storage backup synchronization endpoint (prevents sandbox container data loss)
app.post('/api/auth/sync-agents', (req, res) => {
  const { agents } = req.body;
  if (!Array.isArray(agents)) {
    return res.status(400).json({ error: 'Agents array is required' });
  }

  let restoredAny = false;
  const restoredList: SecuredEmployee[] = [];

  for (const agent of agents) {
    if (!agent.email || !agent.id || !agent.passwordHash) continue;
    const normalizedEmail = agent.email.toLowerCase();
    const exists = employees.some(e => e.email.toLowerCase() === normalizedEmail);
    if (!exists) {
      const restoredAgent: SecuredEmployee = {
        id: agent.id,
        email: normalizedEmail,
        name: agent.name || "Restored Agent",
        role: agent.role || "Operator",
        passwordHash: agent.passwordHash,
        createdAt: agent.createdAt || new Date().toISOString(),
        companyName: agent.companyName
      };
      employees.push(restoredAgent);
      restoredList.push(restoredAgent);
      restoredAny = true;
    }
  }

  if (restoredAny) {
    saveEmployees();
    console.log(`[SYNC] Restored ${restoredList.length} custom agents from client-side backup!`);
    
    // Sync to Firestore if available
    if (!firestoreAuthErrorDetected) {
      const runWrite = async () => {
        for (const agent of restoredList) {
          await firestore.collection('agents').doc(agent.id).set(agent);
        }
      };
      runWrite().catch(async err => {
        try {
          await handleFirestoreErrorAndCheckFallback(err, runWrite);
        } catch (e) {
          console.warn(`[SYNC] Firestore restore failed: ${e?.message || String(e)}`);
        }
      });
    }
  }

  res.json({ success: true, count: restoredList.length });
});

// Forgot Password Endpoint
app.post('/api/auth/forgot-password', authRateLimiter, (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please provide your registered email address' });
  }

  const normalizedEmail = email.toLowerCase();
  const employee = employees.find(e => e.email.toLowerCase() === normalizedEmail);
  if (!employee) {
    return res.status(404).json({ error: 'No employee account is associated with this email address' });
  }

  // Generate secure token (64-character hex)
  const token = crypto.randomBytes(32).toString('hex');

  // Store in cache with 15-minute lifespan
  passwordResetTokens.set(token, {
    employeeId: employee.id,
    token,
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  // Construct secure verification reset link using request metadata
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const resetLink = `${protocol}://${host}/?resetToken=${token}`;

  // Log simulated dispatch in server console
  console.log(`\n=======================================================`);
  console.log(`[PASSWORD RESET SECURITY] Dispatching link to Operator: ${employee.email}`);
  console.log(`Reset Token: ${token}`);
  console.log(`Reset Link: ${resetLink}`);
  console.log(`=======================================================\n`);

  res.json({
    success: true,
    message: 'A secure token-based password reset link has been successfully dispatched to your email address.',
    simulatedEmail: {
      to: employee.email,
      resetLink,
      token
    }
  });
});

// Reset Password Endpoint
app.post('/api/auth/reset-password', authRateLimiter, (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password parameters are required' });
  }

  const resetRecord = passwordResetTokens.get(token);
  if (!resetRecord) {
    return res.status(400).json({ error: 'The password reset token is invalid or has expired. Please request a new link.' });
  }

  if (Date.now() > resetRecord.expiresAt) {
    passwordResetTokens.delete(token);
    return res.status(400).json({ error: 'Your password reset token has expired (15-minute security limit). Please request a new link.' });
  }

  const employee = employees.find(e => e.id === resetRecord.employeeId);
  if (!employee) {
    return res.status(404).json({ error: 'Employee account not found.' });
  }

  // Validate password strength using existing helper
  if (!isPasswordStrong(newPassword)) {
    return res.status(400).json({
      error: 'Password does not meet complexity requirements. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, $, %, !, *, ?).'
    });
  }

  // Update password hashes securely
  const securedPasswordHash = secureHash(newPassword);
  employee.passwordHash = securedPasswordHash;

  // Persist update in memory-mapped local store
  saveEmployees();

  // If Cloud Firestore is initialized, sync updated employee security credential
  if (!firestoreAuthErrorDetected) {
    const runWrite = async () => {
      await firestore.collection('agents').doc(employee.id).update({
        passwordHash: securedPasswordHash
      });
    };
    runWrite().catch(async err => {
      try {
        await handleFirestoreErrorAndCheckFallback(err, runWrite);
      } catch (e) {
        console.warn(`Firestore update password: Password updated locally, but remote Cloud sync was bypassed (${e?.message || String(e)})`);
      }
    });
  }

  // Revoke token
  passwordResetTokens.delete(token);

  res.json({
    success: true,
    message: 'Your password has been successfully updated. You can now return to the login screen and sign in.'
  });
});

// Authenticated Profile State Verification endpoint for client-side load states
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  const employee = employees.find(e => e.id === session.employeeId);
  if (!employee) {
    return res.status(401).json({ error: 'Employee not found' });
  }
  const { passwordHash, ...profile } = employee;
  res.json({ success: true, employee: profile });
});

// GET All Registered Employees (excluding passcode parameters)
app.get('/api/employees', requireAuth, (req: any, res: any) => {
  const caller = req.employee;
  if (!caller) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  // Filter employees: only show self OR other employees with the same company name.
  // This ensures strict tenant separation.
  const safeProfiles = employees
    .filter(e => {
      // Always show dynamic self regardless of companyName match
      if (e.id === caller.id) return true;
      // If companyName correlates, show them
      if (caller.companyName && e.companyName === caller.companyName) return true;
      return false;
    })
    .map(({ passwordHash, ...profile }) => profile);

  res.json({ success: true, employees: safeProfiles });
});

// DELETE Employee (Fire) - Only accessible by Business Owner
app.delete('/api/employees/:id', requireAuth, async (req: any, res: any) => {
  const caller = req.employee;
  if (!caller || caller.role !== 'Business Owner') {
    return res.status(403).json({ error: 'Only a Business Owner can fire employees.' });
  }

  const targetId = req.params.id;
  const targetEmployee = employees.find(e => e.id === targetId);

  if (!targetEmployee) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  if (targetEmployee.companyName !== caller.companyName) {
    return res.status(403).json({ error: 'You can only fire employees belonging to your business.' });
  }

  if (targetEmployee.id === caller.id) {
    return res.status(400).json({ error: 'You cannot fire yourself!' });
  }

  // Remove from memory and users.json
  const finalEmps = employees.filter(e => e.id !== targetId);
  employees.length = 0;
  employees.push(...finalEmps);
  saveEmployees();

  // Remove from Firestore if connected
  if (!firestoreAuthErrorDetected) {
    try {
      await firestore.collection('agents').doc(targetId).delete();
    } catch (err) {
      console.warn(`Firestore employee delete failed for ${targetId}:`, err);
    }
  }

  res.json({ success: true, message: `Successfully terminated and removed employee ${targetEmployee.name}.` });
});

// PUT Employee (Edit Role or Name) - Only accessible by Business Owner
app.put('/api/employees/:id', requireAuth, async (req: any, res: any) => {
  const caller = req.employee;
  if (!caller || caller.role !== 'Business Owner') {
    return res.status(403).json({ error: 'Only a Business Owner can manage employee profiles.' });
  }

  const targetId = req.params.id;
  const idx = employees.findIndex(e => e.id === targetId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  const targetEmployee = employees[idx];
  if (targetEmployee.companyName !== caller.companyName) {
    return res.status(403).json({ error: 'You can only manage employees belonging to your business.' });
  }

  // Support updating name or role
  const { name, role } = req.body;
  if (name) targetEmployee.name = name;
  if (role) targetEmployee.role = role;

  employees[idx] = targetEmployee;
  saveEmployees();

  // Sync to Firestore if available
  if (!firestoreAuthErrorDetected) {
    try {
      await firestore.collection('agents').doc(targetId).set(targetEmployee);
    } catch (err) {
      console.warn(`Firestore employee sync failed for ${targetId}:`, err);
    }
  }

  const { passwordHash: _, ...profile } = targetEmployee;
  res.json({ success: true, employee: profile });
});

// GET Business Settings
app.get('/api/settings', (req, res) => {
  const emp = getEmployeeFromRequest(req);
  if (emp && emp.companyName) {
    return res.json(getSettingsForCompany(emp.companyName));
  }
  res.json(globalSettings);
});

// POST Purchase Subscription
app.post('/api/subscription/purchase', requireAuth, async (req, res) => {
  const { tier, plan, cardHolder, cardNumber } = req.body;
  if (!tier || !plan) {
    return res.status(400).json({ error: "Missing subscription tier or plan configuration." });
  }

  const emp = getEmployeeFromRequest(req);
  const companyName = emp?.companyName || globalSettings.companyName;
  const docId = companyName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const existingSettings = getSettingsForCompany(companyName);

  // Expiry calculation
  const daysLeft = plan === 'yearly' ? 365 : 30;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysLeft);

  const updatedSettings: Settings = {
    ...existingSettings,
    isSubscribed: true,
    subscriptionTier: tier,
    subscriptionPlan: plan,
    subscriptionExpiresAt: expiryDate.toISOString(),
    subscriptionDaysLeft: daysLeft,
    subscriptionStartedAt: new Date().toISOString()
  };

  companySettings[companyName] = updatedSettings;
  saveCompanySettings();

  if (companyName === globalSettings.companyName) {
    Object.assign(globalSettings, updatedSettings);
  }

  // Backup file write
  try {
    const localSettingsPath = path.join(process.cwd(), 'local-settings.json');
    fs.writeFileSync(localSettingsPath, JSON.stringify(globalSettings, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to backup local settings in purchase:", e);
  }

  // Write to Firestore if connected
  if (!firestoreAuthErrorDetected) {
    const runWrite = async () => {
      await firestore.collection('company_settings').doc(docId).set(updatedSettings);
    };
    try {
      await runWrite();
    } catch (err: any) {
      try {
        await handleFirestoreErrorAndCheckFallback(err, runWrite);
      } catch (e) {
        console.warn("Using local settings fallback because Firestore write failed:", e);
      }
    }
  }

  res.json({ success: true, settings: updatedSettings });
});

// POST AI Dashboard Executive Briefing
app.post('/api/dashboard/briefing', requireAuth, async (req, res) => {
  try {
    const geminiClient = getGeminiClient();
    if (!geminiClient) {
      return res.json({
        bulletin: "### 📢 Executive Operations Briefing\n\n*Note: Gemini API Key is not configured.* Currently managing **" + tickets.length + "** tickets. Sentiment distribution trends look stable with " + tickets.filter(t => t.sentiment === 'Positive').length + " positive ratings and " + tickets.filter(t => t.sentiment === 'Angry').length + " angry responses.\n\nTo unlock deep, AI-analyzed insights, linguist metrics, bottleneck detection, and immediate workspace operations briefings, please connect a Gemini API Key under our **Business Settings** panel."
      });
    }

    // Format a brief metadata text of all tickets
    const ticketSummary = tickets.map(t => ({
      id: t.id,
      customer: t.customerName,
      status: t.status,
      channel: t.channel || 'WEB',
      sentiment: t.sentiment,
      language: t.detectedLanguage || 'English',
      lastMessage: t.messages.length > 0 ? t.messages[t.messages.length - 1].content : 'No message yet'
    })).slice(0, 15); // limit size

    const briefingPrompt = `You are the lead Operations Intelligence specialist for VaaniAI, the world's most advanced vernacular multi-lingual customer support console. 
Analyze the current live customer support status telemetry and craft an exceptional, high-level executive dashboard briefing.

Support Tickets Telemetry:
${JSON.stringify(ticketSummary, null, 2)}

Provide your analysis in clean Markdown. Include these distinct sections:
1. 📈 **Linguistic Support Sentiment Highlights**: Summarize language trends (Hinglish/Hindi/English) and overall sentiment. Identify any specific customer satisfaction bottlenecks.
2. 🚨 **High-Priority Remediation Actions**: Specify exactly which tickets or customers need immediate operational focus (and why, based on their status/sentiment, like Escalated or Angry).
3. ⚙️ **Smart Operational Recommendation**: Provide 1-2 actionable procedural recommendations to improve SLA compliance rates and service velocity.

Make the response premium, concise, scannable, and styled for visual majesty. Do not use generic filler words. Write in the voice of a deep analytical SaaS operations advisor. Keep it under 250 words, clean and bulleted.`;

    const response = await geminiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: briefingPrompt,
    });

    res.json({
      bulletin: response.text || "Failed to generate briefing."
    });
  } catch (error: any) {
    const msg = error?.message || String(error);
    res.status(500).json({ error: msg });
  }
});

// POST Business Settings
app.post('/api/settings', requireAuth, async (req, res) => {
  const { 
    companyName, 
    supportEmail, 
    slaMinutes, 
    botEnabled, 
    defaultGreeting, 
    aiPolicyInstructions,
    isTrained,
    brandKnowledge,
    businessIndustry,
    supportTone
  } = req.body;

  if (!companyName || !supportEmail || !slaMinutes || defaultGreeting === undefined) {
    return res.status(400).json({ error: "Missing required settings fields" });
  }

  // Save/Assoc logged-in employee of custom organization context
  const anyReq = req as any;
  if (anyReq.employee) {
    anyReq.employee.companyName = companyName;
    saveEmployees();
  }

  const existingSettings = getSettingsForCompany(companyName);

  const settings: Settings = {
    companyName,
    supportEmail,
    slaMinutes: parseInt(slaMinutes) || 10,
    botEnabled: !!botEnabled,
    defaultGreeting,
    aiPolicyInstructions: aiPolicyInstructions !== undefined ? String(aiPolicyInstructions) : "",
    isTrained: isTrained !== undefined ? !!isTrained : true,
    brandKnowledge: brandKnowledge !== undefined ? String(brandKnowledge) : "",
    businessIndustry: businessIndustry !== undefined ? String(businessIndustry) : "",
    supportTone: supportTone !== undefined ? String(supportTone) : "",
    
    // Preserve individual grounding knowledge base string fields from grounding form
    kbBusiness: req.body.kbBusiness !== undefined ? String(req.body.kbBusiness) : existingSettings.kbBusiness,
    kbReturns: req.body.kbReturns !== undefined ? String(req.body.kbReturns) : existingSettings.kbReturns,
    kbShipping: req.body.kbShipping !== undefined ? String(req.body.kbShipping) : existingSettings.kbShipping,
    kbEscalation: req.body.kbEscalation !== undefined ? String(req.body.kbEscalation) : existingSettings.kbEscalation,

    // Preserve subscription settings securely - once active, they cannot be accidentally deactivated or reset by client-side settings edits or training
    isSubscribed: existingSettings.isSubscribed || !!req.body.isSubscribed,
    subscriptionPlan: existingSettings.subscriptionPlan || req.body.subscriptionPlan || 'monthly',
    subscriptionTier: existingSettings.subscriptionTier || req.body.subscriptionTier || 'PRO',
    subscriptionExpiresAt: existingSettings.subscriptionExpiresAt || req.body.subscriptionExpiresAt || '',
    subscriptionDaysLeft: (existingSettings.subscriptionDaysLeft && existingSettings.subscriptionDaysLeft > 0) ? existingSettings.subscriptionDaysLeft : (req.body.subscriptionDaysLeft || 0),
    subscriptionStartedAt: existingSettings.subscriptionStartedAt || req.body.subscriptionStartedAt || '',
  };

  companySettings[companyName] = settings;
  saveCompanySettings();

  // Legacy fallback setting support
  Object.assign(globalSettings, settings);

  // Write local settings backup to file
  try {
    const localSettingsPath = path.join(process.cwd(), 'local-settings.json');
    fs.writeFileSync(localSettingsPath, JSON.stringify(globalSettings, null, 2), 'utf-8');
    console.log("Global settings written to local backup successfully.");
  } catch (e) {
    console.error("Failed to write local settings backup:", e);
  }

  const docId = companyName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const runWrite = async () => {
    await firestore.collection('company_settings').doc(docId).set(settings);
    // Also update agent profile in Firestore
    if (anyReq.employee) {
      await firestore.collection('agents').doc(anyReq.employee.id).set(anyReq.employee);
    }
  };

  try {
    await runWrite();
    res.json({ success: true, settings });
  } catch (err: any) {
    try {
      await handleFirestoreErrorAndCheckFallback(err, runWrite);
      res.json({ success: true, settings });
    } catch (e) {
      console.warn("Failed to persist global settings inside Firestore (falling back to local storage):", e);
      // Gracefully fallback to local storage
      res.json({ 
        success: true, 
        settings,
        warning: "Settings persisted to local backup, but failed to sync to Cloud Firestore."
      });
    }
  }
});

// Get active tickets list
app.get('/api/tickets', (req, res) => {
  const emp = getEmployeeFromRequest(req);
  if (emp && emp.companyName) {
    const filtered = tickets.filter(t => t.companyName === emp.companyName);
    return res.json(filtered);
  }
  res.json(tickets);
});

// Helper to manage automated conversational language preferences on first contact
function handleLanguageWorkflow(ticket: Ticket, message: string): { actionReply: string; setAwaiting: boolean; matchedLang?: string } | null {
  const customerMessages = ticket.messages.filter(m => m.sender === 'CUSTOMER');
  const isFirstMessage = customerMessages.length <= 1;

  if (isFirstMessage && !ticket.languagePreference) {
    const norm = message.trim().toLowerCase();
    let detectedPreemption: string | null = null;
    if (norm === 'english' || norm === 'hindi' || norm === 'hinglish') {
      detectedPreemption = norm.charAt(0).toUpperCase() + norm.slice(1);
    }

    if (detectedPreemption) {
      ticket.languagePreference = detectedPreemption;
      ticket.detectedLanguage = detectedPreemption;
      ticket.awaitingLanguageSelection = false;
      let ack = "";
      if (detectedPreemption === 'English') {
        ack = "Excellent! You've chosen English as your preferred language. How can I help you today with your apparel orders or delivery status?";
      } else if (detectedPreemption === 'Hindi') {
        ack = "बहुत बढ़िया! आपने हिंदी चुनी है। आज मैं आपके वस्त्रों के ऑर्डर या डिलीवरी के बारे में किस प्रकार सहायता कर सकता हूँ?";
      } else {
        ack = "Perfect! Aapne Hinglish chuni hai. Aaj hum aapke order ya delivery status ke bāre mein kaise help kar sakte hain? Bataiye!";
      }
      return { actionReply: ack, setAwaiting: false, matchedLang: detectedPreemption };
    }

    const greeting = `Thank you for contacting us! 🌟
In which language are you comfortable speaking today? Please choose from below / अपनी पसंदीदा भाषा चुनें:

1. English
2. Hindi (हिंदी)
3. Hinglish (Transliterated Hindi)

Reply with 'English', 'Hindi', or 'Hinglish' to set your choice.`;

    return { actionReply: greeting, setAwaiting: true };
  }

  if (ticket.awaitingLanguageSelection) {
    const norm = message.trim().toLowerCase();
    let selectedLang: string | null = null;

    if (norm.includes('hinglish') || norm === '3' || norm.includes('hing') || norm.includes('mix')) {
      selectedLang = 'Hinglish';
    } else if (norm.includes('english') || norm === '1' || norm.includes('inglish') || norm.includes('eng')) {
      selectedLang = 'English';
    } else if (norm.includes('hindi') || norm === '2' || norm.includes('हिंदी') || norm.includes('hin')) {
      selectedLang = 'Hindi';
    }

    if (selectedLang) {
      ticket.languagePreference = selectedLang;
      ticket.detectedLanguage = selectedLang;
      ticket.awaitingLanguageSelection = false;

      let ack = "";
      if (selectedLang === 'English') {
        ack = "Excellent! You've chosen English as your preferred language. How can I help you today with your apparel orders or delivery status?";
      } else if (selectedLang === 'Hindi') {
        ack = "बहुत बढ़िया! आपने हिंदी चुनी है। आज मैं आपके वस्त्रों के ऑर्डर या डिलीवरी के बारे में किस प्रकार सहायता कर सकता हूँ?";
      } else {
        ack = "Perfect! Aapne Hinglish chuni hai. Aaj hum aapke order ya delivery status ke bāre mein kaise help kar sakte hain? Bataiye!";
      }
      return { actionReply: ack, setAwaiting: false, matchedLang: selectedLang };
    } else {
      // Graceful fallback to proceed with custom analysis if they typed a question directly under menu
      ticket.awaitingLanguageSelection = false;
      ticket.languagePreference = 'Hinglish'; // default/fallback
      return null;
    }
  }

  return null;
}

// Create/simulate client ticket post
app.post('/api/tickets', async (req, res) => {
  const { customerName, phoneNumber, message, channel } = req.body;
  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'PhoneNumber and message content are required' });
  }

  const emp = getEmployeeFromRequest(req);
  const companyName = emp?.companyName || globalSettings.companyName;
  const compSettings = getSettingsForCompany(companyName);

  // Find active ticket if any
  let ticket = tickets.find(t => t.phoneNumber === phoneNumber && t.status !== 'RESOLVED');
  const isNewTicket = !ticket;

  if (isNewTicket) {
    ticket = {
      id: "ticket_" + Math.floor(Math.random() * 90000 + 10000),
      customerName: customerName || "Customer Help",
      phoneNumber,
      status: "AI_PENDING",
      sentiment: "Neutral",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaExpiresAt: new Date(Date.now() + (compSettings.slaMinutes || 10) * 60000).toISOString(), // SLA expiration via Settings
      messages: [],
      channel: channel || 'WEB',
      companyName: companyName
    };
    tickets.push(ticket);
  } else if (channel) {
    ticket.channel = channel; // update channel if specified
  }

  // Save incoming customer message
  const custMsg: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: "CUSTOMER",
    content: message,
    createdAt: new Date().toISOString()
  };
  ticket.messages.push(custMsg);
  ticket.updatedAt = new Date().toISOString();
  detectAndAssignOrder(ticket);

  // If the ticket is already actively escalated to human desk, do NOT send any auto-response of SYSTEM/AI.
  if (ticket.status === 'ESCALATED') {
    await generateCopilotSuggestion(ticket, message);
    await saveTicketToFirestore(ticket);
    return res.json(ticket);
  }

  // Intercept for language workflow checks (English, Hindi, Hinglish preference)
  const workflowResult = handleLanguageWorkflow(ticket, message);
  if (workflowResult) {
    // Generate copilot suggestion for backend context
    await generateCopilotSuggestion(ticket, message);

    if (globalSettings.botEnabled) {
      const aiMsg: Message = {
        id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
        sender: 'AI',
        content: workflowResult.actionReply,
        createdAt: new Date().toISOString(),
        intent: "LANGUAGE_PREFERENCE",
        confidence: 0.99,
        sentiment: ticket.sentiment,
        detectedLanguage: ticket.detectedLanguage
      };
      ticket.messages.push(aiMsg);
    }

    await saveTicketToFirestore(ticket);
    return res.json(ticket);
  }

  // Run dynamic LLM message analysis pipeline to generate highly accurate Copilot suggestion
  const analysisResult = await generateCopilotSuggestion(ticket, message);

  // If automated AI bot responses are disabled, provide copilot suggestion but do not auto-reply
  if (!globalSettings.botEnabled) {
    await saveTicketToFirestore(ticket);
    return res.json(ticket);
  }

  // Generate support staff reply or trigger automated system response (under AI_PENDING)
  let actionReply = (analysisResult && analysisResult.vernacular_reply) || "Thank you. We are analyzing your request.";

  const aiMsg: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: 'AI',
    content: actionReply,
    createdAt: new Date().toISOString(),
    intent: ticket.lastIntent,
    confidence: (analysisResult && analysisResult.confidence) || 0.90,
    sentiment: ticket.sentiment,
    detectedLanguage: ticket.detectedLanguage
  };

  ticket.messages.push(aiMsg);

  if (analysisResult && analysisResult.close_ticket === true) {
    ticket.status = 'RESOLVED';
    console.log(`[Auto-Resolved ticket ${ticket.id} on End-of-Conversation resolution flag]`);
  }

  await saveTicketToFirestore(ticket);
  res.json(ticket);
});

// Manual Agent reply overriding the thread or Customer update
app.post('/api/tickets/:id/message', async (req, res) => {
  const { id } = req.params;
  const { sender, content } = req.body; // sender: AGENT or CUSTOMER

  // Require authentication token for manual agent replies
  if (sender === 'AGENT') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
      if (session) activeSessions.delete(token);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    session.expiresAt = Date.now() + SESSION_LIFESPAN_MS;
  }

  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket context not found' });
  }

  if (ticket.status === 'RESOLVED') {
    return res.status(400).json({ error: 'This ticket is resolved and closed. No further replies are allowed.' });
  }

  const newMsg: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: sender || 'AGENT',
    content,
    createdAt: new Date().toISOString()
  };

  ticket.messages.push(newMsg);
  ticket.updatedAt = new Date().toISOString();
  detectAndAssignOrder(ticket);

  if (sender === 'AGENT') {
    ticket.status = 'ESCALATED'; // Human operator actively overrides active AI state
    ticket.humanRequested = false;
    ticket.copilotSuggestion = ""; // Clear suggestion once agent has replied
  } else if (sender === 'CUSTOMER') {
    // Treat as subsequent reply, run the LLM-powered suggestion analysis pipeline and save new suggestion
    await generateCopilotSuggestion(ticket, content);
  }

  await saveTicketToFirestore(ticket);
  res.json(ticket);
});

// Real-time Copilot Suggestion generator endpoint using live conversation context
app.post('/api/tickets/:id/copilot-suggest', requireAuth, async (req, res) => {
  const { id } = req.params;
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket profile not found' });
  }

  const analysis = await generateCopilotSuggestion(ticket);
  await saveTicketToFirestore(ticket);
  res.json({ success: true, copilotSuggestion: ticket.copilotSuggestion || "", analysis });
});

// GET Method: Verify WhatsApp Webhook Challenge from Meta/Facebook Developers Console
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Default sandbox verify token is "VERNACULAR_COPILOT_SECURE_TOKEN_2026"
  if (mode === 'subscribe' && token === 'VERNACULAR_COPILOT_SECURE_TOKEN_2026') {
    console.log("WhatsApp Webhook successfully validated by Meta server!");
    return res.status(200).send(challenge);
  } else {
    return res.status(403).json({ error: "Verification token mismatch" });
  }
});

// POST Method: Receive live messages from the WhatsApp Cloud API 
app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    console.log("Received incoming webhook payload from Meta WhatsApp API:", JSON.stringify(body, null, 2));

    if (!body || body.object !== 'whatsapp_business_account') {
      return res.status(400).json({ error: "Invalid Object Type" });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const incomingMsg = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!incomingMsg) {
      return res.json({ status: "ignored_no_messages" });
    }

    const phoneNumber = "+" + incomingMsg.from; // e.g. "+919988776655"
    const customerName = contact?.profile?.name || "WhatsApp User";
    let messageContent = "";

    if (incomingMsg.type === 'text') {
      messageContent = incomingMsg.text?.body || "";
    } else {
      messageContent = `[Sent a WhatsApp ${incomingMsg.type} media attachment]`;
    }

    if (!messageContent.trim()) {
      return res.json({ status: "ignored_empty" });
    }

    const companyName = body.companyName || globalSettings.companyName;
    const compSettings = getSettingsForCompany(companyName);

    // Process using same central simulator pipeline with channel: 'WHATSAPP'
    let ticket = tickets.find(t => t.phoneNumber === phoneNumber && t.status !== 'RESOLVED');
    const isNewTicket = !ticket;

    if (isNewTicket) {
      ticket = {
        id: "ticket_" + Math.floor(Math.random() * 90000 + 10000),
        customerName,
        phoneNumber,
        status: "AI_PENDING",
        sentiment: "Neutral",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaExpiresAt: new Date(Date.now() + (compSettings.slaMinutes || 10) * 60000).toISOString(),
        messages: [],
        channel: 'WHATSAPP',
        companyName
      };
      tickets.push(ticket);
    } else {
      ticket.channel = 'WHATSAPP';
    }

    const custMsg: Message = {
      id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
      sender: "CUSTOMER",
      content: messageContent,
      createdAt: new Date().toISOString()
    };
    ticket.messages.push(custMsg);
    ticket.updatedAt = new Date().toISOString();
    detectAndAssignOrder(ticket);

    // If ticket is already escalated, generate copilot suggestion but do not auto-respond
    if (ticket.status === 'ESCALATED') {
      await generateCopilotSuggestion(ticket, messageContent);
      await saveTicketToFirestore(ticket);
      return res.json({ success: true, ticketId: ticket.id, aiReplied: false });
    }

    // Intercept language configuration workflow
    const workflowResult = handleLanguageWorkflow(ticket, messageContent);
    let aiReplied = false;

    if (workflowResult) {
      await generateCopilotSuggestion(ticket, messageContent);

      if (globalSettings.botEnabled) {
        const aiMsg: Message = {
          id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
          sender: 'AI',
          content: workflowResult.actionReply,
          createdAt: new Date().toISOString(),
          intent: "LANGUAGE_PREFERENCE",
          confidence: 0.99,
          sentiment: ticket.sentiment,
          detectedLanguage: ticket.detectedLanguage
        };
        ticket.messages.push(aiMsg);
        aiReplied = true;
        console.log(`[Auto-Replied Language Workflow simulated WhatsApp API to ${phoneNumber}]:`, workflowResult.actionReply);
      }

      await saveTicketToFirestore(ticket);
      return res.json({ success: true, ticketId: ticket.id, aiReplied });
    }

    // Standard automated vernacular AI bot responses
    const analysis = await generateCopilotSuggestion(ticket, messageContent);

    if (globalSettings.botEnabled) {
      let actionReply = (analysis && analysis.vernacular_reply) || "Thank you. Checking details.";
      const aiMsg: Message = {
        id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
        sender: 'AI',
        content: actionReply,
        createdAt: new Date().toISOString(),
        intent: ticket.lastIntent,
        confidence: (analysis && analysis.confidence) || 0.92,
        sentiment: ticket.sentiment,
        detectedLanguage: ticket.detectedLanguage
      };
      ticket.messages.push(aiMsg);
      aiReplied = true;
      console.log(`[Auto-Replied via simulated WhatsApp API outbound node to ${phoneNumber}]:`, actionReply);
      if (analysis && analysis.close_ticket === true) {
        ticket.status = 'RESOLVED';
        console.log(`[Auto-Resolved ticket ${ticket.id} on End-of-Conversation resolution flag via webhook]`);
      }
    }

    await saveTicketToFirestore(ticket);

    return res.json({
      success: true,
      ticketId: ticket.id,
      aiReplied
    });
  } catch (err: any) {
    console.error("WhatsApp webhook parsing error:", err);
    return res.status(500).json({ error: err.message || "Webhook processing crash" });
  }
});

// Simulate WhatsApp webhook payload hitting server (from the developer sandbox interface)
app.post('/api/whatsapp/simulate', async (req, res) => {
  const { customerName, phoneNumber, message } = req.body;
  if (!phoneNumber || !message) {
    return res.status(400).json({ error: "Missing phoneNumber or message" });
  }

  const emp = getEmployeeFromRequest(req);
  const companyName = emp?.companyName || globalSettings.companyName;

  // Clear format of non-digit symbols for WhatsApp standard phone id
  const rawNumber = phoneNumber.replace(/\+/g, '').replace(/[^0-9]/g, '');

  const payload = {
    object: "whatsapp_business_account",
    companyName, // Injected company name context
    entry: [
      {
        id: "wh_entry_101",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15550212345",
                phone_number_id: "109812739102830"
              },
              contacts: [
                {
                  profile: { name: customerName || "WhatsApp Guest" },
                  wa_id: rawNumber
                }
              ],
              messages: [
                {
                  from: rawNumber,
                  id: "wamid.HBgLMTkxOTk4ODc3NjY1NfQSA1NDAxNDg0NUQzMUJBMUQ0OUMyM0FB",
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: message },
                  type: "text"
                }
              ]
            }
          }
        ]
      }
    ]
  };

  // Dispatch to post webhook internally to simulate real webhook lifecycle
  const response = await fetch(`http://localhost:3000/api/webhook/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    const data = await response.json();
    return res.json({ success: true, ...data });
  } else {
    return res.status(500).json({ error: "Simulation dispatch failed inside web server" });
  }
});

// Manual escalation transfer response endpoints
app.post('/api/tickets/:id/accept-escalation', requireAuth, async (req, res) => {
  const { id } = req.params;
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket profile not found' });
  }

  ticket.status = 'ESCALATED';
  ticket.humanRequested = false;
  ticket.escalationDismissed = false;
  ticket.updatedAt = new Date().toISOString();

  const sysMsg: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: 'SYSTEM',
    content: "Live human operator accepted the transfer request. Conversation is now actively routed to human support.",
    createdAt: new Date().toISOString()
  };
  ticket.messages.push(sysMsg);

  await saveTicketToFirestore(ticket);
  res.json(ticket);
});

app.post('/api/tickets/:id/decline-escalation', requireAuth, async (req, res) => {
  const { id } = req.params;
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket profile not found' });
  }

  ticket.humanRequested = false;
  ticket.escalationDismissed = true;
  ticket.updatedAt = new Date().toISOString();

  const sysMsg: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: 'SYSTEM',
    content: "Live human operator declined the transfer request. Retaining automated AI assistant agent resolution flow.",
    createdAt: new Date().toISOString()
  };
  ticket.messages.push(sysMsg);

  await saveTicketToFirestore(ticket);
  res.json(ticket);
});

// App update ticket customer email
app.post('/api/tickets/:id/email', async (req, res) => {
  const { id } = req.params;
  const { customerEmail } = req.body;
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket profile not found' });
  }
  ticket.customerEmail = customerEmail;
  await saveTicketToFirestore(ticket);
  res.json({ success: true, ticket });
});

// Mark Ticket as Resolved and close context
app.post('/api/tickets/:id/resolve', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { customerEmail } = req.body || {};
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket profile not found' });
  }

  ticket.status = 'RESOLVED';
  ticket.updatedAt = new Date().toISOString();

  // Calculate customized branding and order details to include in email receipt
  const companyName = getSettingsForCompany(ticket.companyName).companyName || "VaaniAI Solutions";
  const emailAddr = customerEmail || ticket.customerEmail || (ticket.customerName.toLowerCase().replace(/\s+/g, '') + "@gmail.com");
  ticket.customerEmail = emailAddr;

  const order = ticket.orderDetail || {
    id: ticket.orderId || "ORD-" + Math.floor(Math.random() * 90000 + 10000),
    customerName: ticket.customerName,
    itemName: "Vernacular Omni-Channel Integration Suite",
    status: "DELIVERED",
    paymentMode: "Razorpay / UPI Payments",
    cost: 14999,
    carrier: "Delhivery Premium",
    estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  };

  // Keep saved linked order consistent
  if (!ticket.orderDetail) {
    ticket.orderDetail = order;
    ticket.orderId = order.id;
  }

  const resolvedDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const resolvedTimeStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const subject = `[Resolved Ticket #${ticket.id}] Order Summary & Delivery Status update from ${companyName}`;
  const from = `CX Executive Desk <resolutions@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'vaani'}.ai>`;
  const to = `${ticket.customerName} <${emailAddr}>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Resolution Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      background-color: #f3f4f6;
      width: 100%;
      padding: 30px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .header {
      background: linear-gradient(135deg, #ea580c 0%, #d97706 100%);
      padding: 28px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 11px;
      opacity: 0.9;
      font-family: monospace;
      letter-spacing: 0.1em;
    }
    .content {
      padding: 28px 24px;
      color: #374151;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin-top: 0;
    }
    .lead-text {
      font-size: 13px;
      line-height: 1.6;
      margin-top: 8px;
      color: #4b5563;
    }
    .meta-box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      margin: 20px 0;
    }
    .meta-title {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #9ca3af;
      margin-bottom: 10px;
      border-b: 1px solid #f3f4f6;
      padding-bottom: 4px;
    }
    .meta-table {
      width: 100%;
    }
    .meta-label {
      color: #6b7280;
      font-size: 10px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2px;
    }
    .meta-value {
      font-weight: 600;
      color: #1f2937;
      font-size: 12px;
    }
    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    .order-table th {
      text-align: left;
      padding: 8px 10px;
      background-color: #f3f4f6;
      color: #4b5563;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.05em;
    }
    .order-table td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
    }
    .order-item-title {
      font-weight: 600;
      font-size: 12px;
    }
    .order-item-subtitle {
      font-size: 10px;
      color: #6b7280;
    }
    .price {
      font-family: monospace;
      font-weight: 700;
      color: #d97706;
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
    }
    .info-notification {
      margin-top: 20px;
      padding: 12px;
      background-color: #f0fdf4;
      border-left: 4px solid #16a34a;
      border-radius: 4px;
      font-size: 11px;
      color: #14532d;
      line-height: 1.5;
    }
    .footer {
      background-color: #111827;
      color: #9ca3af;
      padding: 28px 24px;
      text-align: center;
      font-size: 10px;
    }
    .footer p {
      margin: 6px 0;
      line-height: 1.5;
    }
    .divider {
      height: 1px;
      background-color: #1f2937;
      margin: 12px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${companyName}</h1>
        <p>RESOLUTION CONFIRMATION RECEIPT</p>
      </div>
      <div class="content">
        <div class="greeting">Dear ${ticket.customerName},</div>
        <p class="lead-text">
          We are pleased to notify you that support inquiry <strong>#${ticket.id}</strong> is officially marked as <strong>Resolved and Closed</strong> by our operator specialists.
        </p>
        <p class="lead-text">
          Our verified database matching order logs has been successfully synchronized at our warehouse logistics server. Your shipment and routing metrics are summarized below:
        </p>

        <div class="meta-box">
          <div class="meta-title">Ticket & Session Metadata</div>
          <table class="meta-table" style="border-spacing: 0 10px;">
            <tr>
              <td style="width: 50%; padding: 0;">
                <span class="meta-label">Ticket Reference</span>
                <span class="meta-value">#${ticket.id}</span>
              </td>
              <td style="width: 50%; padding: 0;">
                <span class="meta-label">Resolution Time</span>
                <span class="meta-value">${resolvedDateStr} at ${resolvedTimeStr}</span>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 0;">
                <span class="meta-label">Assigned Operator</span>
                <span class="meta-value">${ticket.assignedToName || 'VaaniAI Autonomous Representative'}</span>
              </td>
              <td style="width: 50%; padding: 0;">
                <span class="meta-label">Contact Number</span>
                <span class="meta-value">${ticket.phoneNumber}</span>
              </td>
            </tr>
          </table>
        </div>

        <table class="order-table">
          <thead>
            <tr>
              <th>Order Details</th>
              <th style="text-align: center;">Delivery Status</th>
              <th style="text-align: right;">Cost Summary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="order-item-title">${order.itemName}</div>
                <div class="order-item-subtitle font-mono">Invoice Reference ID: <strong>${order.id}</strong></div>
                <div class="order-item-subtitle" style="font-size: 9px; color: #9ca3af; margin-top: 2px;">Logistic Partner: ${order.carrier || "Delhivery Logistics"}</div>
              </td>
              <td style="text-align: center; vertical-align: middle;">
                <span class="badge badge-success">${order.status}</span>
              </td>
              <td class="price" style="vertical-align: middle;">
                ₹${order.cost.toLocaleString('en-IN')}.00
              </td>
            </tr>
          </tbody>
        </table>

        <div class="info-notification">
          <strong>✓ Order Safe Shipping Protection Enabled:</strong> Your shipping parcel complies with our standard zero-contact sanitization guidelines. Est. Delivery Arrival is plotted on <strong>${order.estimatedDelivery || "N/A"}</strong>. You will receive further carrier coordinates directly via SMS.
        </div>
      </div>

      <div class="footer">
        <p>This is a formal resolution summary dispatch from <strong>${companyName} Service Desk</strong>.</p>
        <p>Need immediate adjustments? Connect directly over our verified Hinglish WhatsApp chat line.</p>
        <div class="divider"></div>
        <p style="font-size: 9px; opacity: 0.7;">&copy; 2026 ${companyName}. Operating with automated GDPR-grade workspace PII mask protection filters.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Attach preview to the ticket state so the workplace console can present it!
  ticket.resolvedEmailPreview = {
    subject,
    from,
    to,
    html,
    sentAt: new Date().toISOString()
  };

  // Attempt real email sending using nodemailer
  let emailSentStatusMsg = "";
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromAddress = process.env.SMTP_FROM || `resolutions@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'vaani'}.ai`;

  if (host && user && pass) {
    try {
      console.log(`[SMTP] Attempting real mail dispatch to ${emailAddr} via host ${host}:${port}...`);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass }
      });

      const info = await transporter.sendMail({
        from: `"${companyName} CX Desk" <${fromAddress}>`,
        to: emailAddr,
        subject,
        html
      });

      console.log("[SMTP] Email successfully sent:", info.messageId);
      emailSentStatusMsg = `📧 Real email successfully dispatched to ${emailAddr}! Message Transaction ID: ${info.messageId}`;
    } catch (smtpErr: any) {
      console.error("[SMTP] Failed to send real email via configured SMTP:", smtpErr);
      emailSentStatusMsg = `⚠️ Connected to SMTP host ${host} but dispatch failed: ${smtpErr.message || String(smtpErr)}. (Falling back to simulated sandbox archive)`;
    }
  } else {
    // Zero-config: No SMTP provided. Let's send using a free Ethereal test inbox so they get a real visual inspection link!
    try {
      console.log("[SMTP] No custom SMTP credentials found. Creating dynamic developer test mail line...");
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass  // generated ethereal password
        }
      });

      const info = await transporter.sendMail({
        from: `"${companyName} CX Desk" <${fromAddress}>`,
        to: emailAddr,
        subject,
        html
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("[SMTP] Simulated Ethereal email sent. Preview URL:", previewUrl);
      emailSentStatusMsg = `📧 Simulated dynamic email dispatched. Preview actual formatted email markup here: ${previewUrl}`;
    } catch (etherealErr: any) {
      console.error("[SMTP] Ethereal fallback dispatch failed:", etherealErr);
      emailSentStatusMsg = `📧 Simulated professional email containing purchase invoice #${order.id} archived. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS variables to enable real email dispatch.`;
    }
  }

  // Log a clean system notification regarding receipt dispatch to the conversation flow
  const automaticSystemLog: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: 'SYSTEM',
    content: emailSentStatusMsg,
    createdAt: new Date().toISOString()
  };
  ticket.messages.push(automaticSystemLog);

  await saveTicketToFirestore(ticket);
  res.json({ success: true, ticket });
});

// Submit customer experience rating for a resolved ticket
app.post('/api/tickets/:id/rate', async (req, res) => {
  const { id } = req.params;
  const { rating, ratingFeedback } = req.body;

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number from 1 to 5' });
  }

  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket profile not found' });
  }

  if (ticket.status !== 'RESOLVED') {
    return res.status(400).json({ error: 'Ratings can only be submitted for RESOLVED tickets' });
  }

  ticket.rating = rating;
  ticket.ratingFeedback = ratingFeedback || '';
  ticket.updatedAt = new Date().toISOString();

  // Add clean system message documenting the customer feedback directly in the ticket log
  const sysMsg: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: 'SYSTEM',
    content: `Customer submitted feedback survey: Rating of ${rating} star(s).${ratingFeedback ? ` Feedback: "${ratingFeedback}"` : ''}`,
    createdAt: new Date().toISOString()
  };
  ticket.messages.push(sysMsg);

  await saveTicketToFirestore(ticket);
  res.json({ success: true, ticket });
});

// Claim a ticket by employee
app.post('/api/tickets/:id/claim', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { employeeId, employeeName } = req.body;

  if (!employeeId || !employeeName) {
    return res.status(400).json({ error: 'Employee ID and Name are required to claim a ticket' });
  }

  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket profile not found' });
  }

  ticket.assignedToId = employeeId;
  ticket.assignedToName = employeeName;
  ticket.updatedAt = new Date().toISOString();

  // Route automatically to Escalated when claimed to ensure action is in progress
  if (ticket.status === 'AI_PENDING') {
    ticket.status = 'ESCALATED';
  }

  const sysMsg: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: 'SYSTEM',
    content: `Ticket was claimed by agent ${employeeName} (${employeeId}). Operator is now addressing.`,
    createdAt: new Date().toISOString()
  };
  ticket.messages.push(sysMsg);

  await saveTicketToFirestore(ticket);
  res.json({ success: true, ticket });
});

// Release a claimed ticket
app.post('/api/tickets/:id/release', requireAuth, async (req, res) => {
  const { id } = req.params;
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket profile not found' });
  }

  const exAssignee = ticket.assignedToName;
  ticket.assignedToId = undefined;
  ticket.assignedToName = undefined;
  ticket.updatedAt = new Date().toISOString();

  const sysMsg: Message = {
    id: "msg_" + Math.floor(Math.random() * 90000 + 10000),
    sender: 'SYSTEM',
    content: `Ticket was released by ${exAssignee || 'Support Operator'} and returned to the master pool queue.`,
    createdAt: new Date().toISOString()
  };
  ticket.messages.push(sysMsg);

  await saveTicketToFirestore(ticket);
  res.json({ success: true, ticket });
});

// Retrieve pre-trained intent dataset
app.get('/api/dataset', (req, res) => {
  res.json(datasets);
});

// Append a new query to the dataset
app.post('/api/dataset', requireAuth, (req, res) => {
  const { query, language, intent, sentiment, shouldEscalate, expectedReply, scriptType } = req.body;
  
  if (!query || !intent || !language) {
    return res.status(400).json({ error: "Missing required query fields for data labeling" });
  }

  const newDS: DatasetItem = {
    id: "ds_" + (datasets.length + 101),
    query,
    language,
    intent,
    sentiment: sentiment || "Neutral",
    shouldEscalate: !!shouldEscalate,
    expectedReply: expectedReply || "धन्यवाद!",
    scriptType: scriptType || "Native"
  };

  datasets.push(newDS);
  res.json({ success: true, item: newDS });
});

// Retrieve source code of Jetpack Compose Android Client
app.get('/api/android-source', (req, res) => {
  res.json(androidSourceFiles);
});

/* ================== VITE MIDDLEWARE SETUP ================== */

async function startServer() {
  // Initialize and synchronize databases on server boot
  try {
    loadEmployees();
    loadCompanySettings();
    await loadSettingsFromFirestore();
    await loadCompanySettingsFromFirestore();
    await loadTicketsFromFirestore();
    console.log("Database and memory stores initialized successfully on startup.");
  } catch (err) {
    console.warn("Non-fatal issue initializing database stores on boot:", err);
  }

  if (process.env.NODE_ENV !== 'production') {
    // Development using Vite hot-reloading
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully");
  } else {
    // Production serving pre-built static package
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving statically from /dist in production mode");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
