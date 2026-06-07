/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ticket } from '../types';

export const getSuggestedReplies = (ticket: Ticket): { text: string; label: string; action: 'insert' | 'resolve' }[] => {
  const intent = ticket.lastIntent || 'PRODUCT_INQUIRY';
  const language = ticket.detectedLanguage || 'English';
  
  const suggestions: { text: string; label: string; action: 'insert' | 'resolve' }[] = [];

  // If a context-aware smart dynamic AI suggestion exists on the ticket, priority-prepend it!
  if (ticket.copilotSuggestion) {
    suggestions.push({
      text: ticket.copilotSuggestion,
      label: "Smart AI Copilot (Context-Aware Reply)",
      action: 'insert'
    });
  }

  // 1. Language matched general query response (Heavily trained and refined responses)
  let supportText = "";
  
  const isHindiOrHinglish = language.includes('Hindi') || language.includes('Hinglish');
  const isTamilOrTanglish = language.includes('Tamil') || language.includes('Tanglish') || language.includes('Tamglish') || language.includes('Tinglish');
  const isTelugu = language.includes('Telugu') || language.includes('Telglish');
  const isKannada = language.includes('Kannada') || language.includes('Kanglish');
  const isMarathi = language.includes('Marathi');
  const isBengali = language.includes('Bengali');
  const isGujarati = language.includes('Gujarati');
  const isPunjabi = language.includes('Punjabi');

  if (intent === 'ORDER_TRACKING') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! हमने चेक किया है: आपका ऑर्डर 'DTD12498' दिल्ली हब से डिस्पैच हो चुका है। यह कल शाम ६ बजे से पहले डिलीवर हो जाएगा। कृपया धैर्य रखें!";
    } else if (isTamilOrTanglish) {
      supportText = "வணக்கம்! உங்கள் ஆர்டர் DTD12498 நேற்று அனுப்பப்பட்டுவிட்டது. இது நாளை நாளை மாலை 6 மணிக்குள் உங்கள் முகவரியை வந்தடையும். நன்றி!";
    } else if (isTelugu) {
      supportText = "నమస్కారం! మీ ఆర్డర్ DTD12498 విజయవంతంగా డిస్పాచ్ చేయబడింది. రేపు సాయంత్రం 6 గంటల లోపు ఇది మీకు ఖచ్చితంగా డెలివరీ అవుతుంది.";
    } else if (isKannada) {
      supportText = "ನಮಸ್ತೆ! ನಿಮ್ಮ ಆರ್ಡರ್ DTD12498 ಅನ್ನು ರವಾನಿಸಲಾಗಿದೆ. ಇದು ನಾಳೆ ಸಂಜೆ 6 ಗಂಟೆಯೊಳಗೆ ನಿಮ್ಮನ್ನು ತಲುಪಲಿದೆ. ದಯವಿಟ್ಟು ಸಹಕರಿಸಿ.";
    } else if (isMarathi) {
      supportText = "नमस्कार! आपला ऑर्डर DTD12498 पाठवण्यात आला आहे. तो उद्या संध्याकाळी ६ वाजेपर्यंत तुमच्यापर्यंत पोहोचेल. धन्यवाद!";
    } else if (isBengali) {
      supportText = "নমস্কার! আপনার অর্ডার DTD12498 ডিসপ্যাচ করা হয়েছে এবং এটি আগামীকাল বিকেল ৬টার মধ্যে ডেলিভারি হয়ে যাবে। ধন্যবাদ!";
    } else if (isGujarati) {
      supportText = "નમસ્તે! ક્ષમા કરશો, આપનો ઓર્ડર DTD12498 રવાના થઈ ગયો છે. આવતીકાલે સાંજ સુધીમાં આપને ચોક્કસ મળી જશે.";
    } else if (isPunjabi) {
      supportText = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡਾ ਆਰਡਰ DTD12498 ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ ਅਤੇ ਇਹ ਕੱਲ੍ਹ ਸ਼ਾਮ 6 ਵਜੇ ਤੱਕ ਡਿਲੀਵਰ ਹੋ ਜਾਵੇਗਾ।";
    } else {
      supportText = "Hello! Quick status update regarding your shipment: our logistics team confirms package DTD12498 is dispatched and in transit via the Delhi hub. It is scheduled for delivery tomorrow before 6 PM. Thank you!";
    }
  } else if (intent === 'REFUND_STATUS') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! कृपया निश्चिंत रहें। आपके ऑर्डर का INR 1,499 का रिफंड प्रक्रिया में है (UPI Ref ID: TXN89324X)। यह ३ से ५ व्यावसायिक दिनों में आपके खाते में जुड़ जाएगा। धन्यवाद।";
    } else if (isTamilOrTanglish) {
      supportText = "வணக்கம்! உங்கள் கவலை புரிகிறது. உங்கள் ரூ. 1,499 ரீஃபண்ட் (UPI Ref ID: TXN89324X) துவங்கப்பட்டுவிட்டது. அடுத்த 3-5 வேலை நாட்களில் உங்கள் வங்கிக் கணக்கில் வந்துவிடும்.";
    } else if (isTelugu) {
      supportText = "నమస్కారం! మీ రీఫండ్ మొత్తం రూ. 1,499 (UPI Ref ID: TXN89324X) ప్రాసెస్ చేయబడుతోంది. మరో 3-5 పని దినాల్లో ఇది మీ అకౌంట్‌లో జమ చేయబడుతుంది.";
    } else if (isKannada) {
      supportText = "ನಮಸ್ತೆ! ಚಿಂತಿಸಬೇಡಿ, ನಿಮ್ಮ ರೂ. 1,499 ರಿಫಂಡ್ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ (UPI Ref ID: TXN89324X). ಮುಂದಿನ 3-5 ಕೆಲಸದ ದಿನಗಳ ಒಳಗೆ ನಿಮ್ಮ ಖಾತೆಗೆ ಜಮೆಯಾಗಲಿದೆ.";
    } else if (isMarathi) {
      supportText = "नमस्कार! आपले ₹१,४९९ चे रिफंड मंजूर झाले असून त्याचे काम सुरू आहे. येत्या ३ ते ५ कामकाजाच्या दिवसांत पैसे तुमच्या खात्यात जमा होतील.";
    } else if (isBengali) {
      supportText = "নমস্কার! আপনার ১৪৯৯ টাকার রিফান্ড প্রক্রিয়াটি শুরু হয়েছে (UPI Ref TXN89324X)। আগামী ৩-৫ কার্যদিবসের মধ্যে আপনার অ্যাকাউন্টে টাকা ব্যাঙ্ক ট্রান্সফার হয়ে যাবে।";
    } else if (isGujarati) {
      supportText = "નમસ્તે! આપના રૂ. ૧,૪૯૯ રિફંડની પ્રક્રિયા શરૂ થઈ ગઈ છે (UPI Ref: TXN89324X), જે આપતા ૩ થી ૫ કામકાજના દિવસોમાં આપના ખાતામાં જમા થશે.";
    } else if (isPunjabi) {
      supportText = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡਾ 1,499 ਰੁਪਏ ਦਾ ਰਿਫੰਡ (UPI Ref: TXN89324X) ਪ੍ਰੋਸੈਸ ਹੋ ਰਹੀ ਹੈ। ਅਗਲੇ 3-5 ਦਿਨਾਂ ਵਿੱਚ ਤੁਹਾਡੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਆ ਜਾਵੇਗਾ।";
    } else {
      supportText = "Hello! We apologize for the delay. Your refund of INR 1,499 has been authorized and initiated to your source payment account (UPI Ref: TXN89324X). It should reflect in your statement within 3-5 business days.";
    }
  } else if (intent === 'RETURN_REQUEST') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! रिप्लेसमेंट/रिटर्न अरेंज कर दिया गया है। आप ऐप के पर 'My Orders' सेक्शन में जाकर 'Return/Exchange' दर्ज कर सकते हैं। सोमवार सुबह हमारा एजेंट डिलीवरी पिकअप के लिए आएगा।";
    } else if (isTamilOrTanglish) {
      supportText = "வணக்கம்! ரிட்டர்ன் பாலிசிப்படி உங்கள் மாற்று ஆடைக்கு ஏற்பாடு செய்யப்பட்டுள்ளது. 'My Orders' பக்கத்தில் பதிவு செய்யவும். திங்கள் காலை எங்கள் முகவர் வந்து பெற்றுக்கொள்வார்.";
    } else if (isTelugu) {
      supportText = "నమస్కారం! ఎక్స్చేంజ్/రిటర్న్ ఆమోదించబడింది. మీరు 'My Orders' విభాగంలో రిటర్న్ రిక్వెస్ట్ పెట్టవచ్చు. సోమవారం ఉదయం కురియర్ బాయ్ మీ ప్యాకెట్ పికప్ చేయడానికి వస్తాడు.";
    } else if (isKannada) {
      supportText = "ನಮಸ್ತೆ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆಪ್‌ನಲ್ಲಿನ 'My Orders' ವಿಭಾಗಕ್ಕೆ ಹೋಗಿ ರಿಟರ್ன் ರಿಕ್ವೆಸ್ಟ್ ಸಲ್ಲಿಸಿ. ಸೋಮವಾರ ಬೆಳಗ್ಗೆ ನಮ್ಮ ಡೆಲಿವರಿ ಏಜೆಂಟ್ ಬಂದು ಪಾರ್ಸೆಲ್ ಪಡೆಯಲಿದ್ದಾರೆ.";
    } else if (isMarathi) {
      supportText = "नमस्कार! एक्सचेंज/रिटर्न मंजूर केले गेले आहे. 'My Orders' मध्ये जाऊन आपली मागणी नोंदवा. सोमवार सकाळी आमचा प्रतिनिधी पिकअपसाठी तुमच्या घरी येईल.";
    } else if (isBengali) {
      supportText = "নমস্কার! এক্সচেঞ্জ/রিটার্ন অনুরোধটি নেওয়া হয়েছে। অনুগ্রহ করে 'My Orders' সেকশনে গিয়ে আবেদন করুন। সোমবার সকালে কুরিয়ার বয় পণ্যটি সংগ্রহ করতে আসবে।";
    } else if (isGujarati) {
      supportText = "નમસ્ते! કુર્તીનું સાઈઝ એક્સચેન્જ સ્વીકારવામાં આવ્યું છે. 'My Orders' પર રિકવેસ્ટ મોકલો, સોમવારે સવારે અમારી ટીમ પિકઅપ માટે આવશે.";
    } else if (isPunjabi) {
      supportText = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਐਕਸਚੇਂਜ/ਰਿਟਰਨ ਦੀ ਬੇਨਤੀ ਮਨਜ਼ੂਰ ਹੋ ਗਈ ਹੈ। ਸੋਮਵਾਰ ਸਵੇਰੇ ਸਾਡਾ ਏਜੰਟ ਤੁਹਾਡੇ ਪਤੇ ਤੋਂ ਪ੍ਰੋਡਕਟ ਪਿਕਅਪ ਕਰ ਲਵੇਗਾ।";
    } else {
      supportText = "Hello! We've scheduled a pickup for this return. Please initiate the request from the 'My Orders' screen, select 'Return/Exchange' along with your size/item correction preference. A courier will collect it Monday morning.";
    }
  } else if (intent === 'COUPON_ISSUES') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! यदि पुराना कूप कोड नहीं चल रहा, तो कृपया 'WELCOME10' कूपन कोड दर्ज करें, यह आपको तत्काल आपके कार्ट मूल्य पर १०% की अतिरिक्त छूट प्रदान करेगा।";
    } else if (isTamilOrTanglish) {
      supportText = "வணக்கம்! கூப்பன் கோட் வேலை செய்யவில்லை என்றால், கட்டணப் பக்கத்தில் 'WELCOME10' ஐப் பயன்படுத்தவும். உங்களுக்கு நேரடி 10% தள்ளுபடி கிடைக்கும்.";
    } else if (isTelugu) {
      supportText = "నమస్కారం! పాత కూపన్ పని చేయకపోతే, దయచేసి 'WELCOME10' కోడ్ ఉపయోగించండి. ఇది మీకు తక్షణమే 10% అదనపు డిస్కౌంట్ అందిస్తుంది.";
    } else if (isKannada) {
      supportText = "ನಮಸ್ತೆ! ಕೂಪನ್ ದೋಷವಿದ್ದರೆ ಚೆಕ್ಔಟ್ ಸಮಯದಲ್ಲಿ 'WELCOME10' ಕೋಡ್ ಬಳಸಿ. ಇದು ನಿಮಗೆ தಕ್ಷಣವೇ 10% ರಿಯಾಯಿತಿ ಒದಗಿಸುತ್ತದೆ.";
    } else if (isMarathi) {
      supportText = "नमस्कार! जुना कूपन कोड चालत नसेल तर कृपया 'WELCOME10' वापरा. यामुळे तुम्हाला तत्काळ १०% अतिरिक्त सूट मिळेल.";
    } else if (isBengali) {
      supportText = "নমস্কার! যদি আপনার কুপন কোডটি কাজ না করে, তবে অনুগ্রহ করে 'WELCOME10' ব্যবহার করুন। এতে আপনার কার্ট ভ্যালুর ওপর সরাসরি ১০% ডিসকাউন্ট পাবেন।";
    } else if (isGujarati) {
      supportText = "નમસ્તે! જો આપનો કૂપન કોડ અમાન્ય છે, તો કૃપા કરીને 'WELCOME10' કોડનો ઉપયોગ કરો. તેનાથી આપને સપાટ ૧૦% ડિસ્કાઉન્ટ મળશે.";
    } else if (isPunjabi) {
      supportText = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਜੇਕਰ ਕੋਡ ਕੰਮ ਨਹੀਂ ਕਰ ਰਿਹਾ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ 'WELCOME10' ਦੀ ਵਰਤੋਂ ਕਰੋ, ਜਿਸ ਨਾਲ ਤੁਹਾਨੂੰ 10% ਦੀ ਛੋਟ ਮਿਲੇਗੀ।";
    } else {
      supportText = "Hello! It appears the code was invalid. To fix this, please try using coupon code 'WELCOME10' at checkpoint for an instant flat 10% cash discount on your total cart checkout value.";
    }
  } else if (intent === 'HUMAN_ESCALATION') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! हमारे वरिष्ठ सहायता विशेषज्ञ चर्चा में शामिल हो सकते हैं, लेकिन तब तक क्या मैं आपके ऑर्डर नंबर या समस्या का विवरण जानकर सीधे समाधान करने में आपकी कोई और मदद कर सकता हूँ?";
    } else if (isTamilOrTanglish) {
      supportText = "வணக்கம், நான் உங்களை சீனியர் மேலாளருடன் இணைக்கிறேன். அதற்குள் உங்கள் ஆர்டர் விவரங்களை என்னிடம் பகிர்ந்தால் நானே உதவ முடியும்.";
    } else if (isTelugu) {
      supportText = "నమస్కారం! నేను మీ కాల్ ని సీనియర్ మేనేజర్ కి బదిలీ చేస్తున్నాను, అంతలోపు మీ సమస్య మరియు ఆర్డర్ నెంబర్ చెప్తే నేను సహాయం చేయడానికి ప్రయత్నిస్తాను.";
    } else if (isKannada) {
      supportText = "ನಮಸ್ತೆ! ನಾನು ಹಿರಿಯ ಮ್ಯಾನೇಜರ್‌ಗೆ ಈ ಕರೆ ವರ್ಗಾಯಿಸುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಅಲ್ಲಿಯವರೆಗೆ ನಿಮ್ಮ ಸಮಸ್ಯೆಯು ಹಾಗೂ ಆರ್ಡರ್ ಸಂಖ್ಯೆಯನ್ನು ಶೇರ್ ಮಾಡಿ.";
    } else if (isMarathi) {
      supportText = "नमस्कार! मी आपले तिकीट वरिष्ठ व्यवस्थापकांकडे पाठवत आहे, तोपर्यंत जर तुम्ही मला आपला क्रमांक व समस्या सांगितली तर मी स्वतः मदत करण्याचा प्रयत्न करेन.";
    } else if (isBengali) {
      supportText = "নমস্কার! আমি কোনো সিনিয়র ম্যানেজারের সাথে আপনাকে কানেক্ট করছি, ততক্ষণ অনুগ্রহ করে समस्याটির বিবরণ ও অর্ডার নম্বর দিন যাতে সাহায্য করতে পারি।";
    } else if (isGujarati) {
      supportText = "નમસ્તે! હું આપની ટિકિટ સીનિઅર મેનેજરને મોકલી રહ્યો છું, તે પહેલાં જો આપ આપની મુશ્કેલી અને ઓર્ડર નંબર આપો તો ઝડપથી મદદ થઈ શકે.";
    } else if (isPunjabi) {
      supportText = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਕੇਸ ਸੀਨੀਅਰ ਮੈਨੇਜਰ ਨੂੰ ਰੈਫਰ ਕਰ ਰਹੀ ਹਾਂ, ਪਰ ਉਦੋਂ ਤੱਕ ਕੀ ਤੁਸੀਂ ਮੈਨੂੰ ਆਪਣਾ ਆਰਡਰ ਨੰਬਰ ਦੱਸ ਸਕਦੇ ਹੋ?";
    } else {
      supportText = "Hello! A senior support associate can be looped in, but in the meantime, please let me know your order number or query details so I can attempt to solve this directly for you right away!";
    }
  } else {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! वाणीAI कस्टमर केयर टीम में आपका स्वागत है। हम आपके विवरण की जाँच कर रहे हैं और तत्काल समाधान के साथ प्रस्तुत होंगे।";
    } else if (isTamilOrTanglish) {
      supportText = "வணக்கம்! வாணிAI வாடிக்கையாளர் சேவைக்கு உங்களை வரவேற்கிறோம். உங்களது கோரிக்கையை நாங்கள் ஆராய்ந்து வருகிறோம்.";
    } else if (isTelugu) {
      supportText = "నమస్కారం! వాణిAI కస్టమర్ కేర్ కి స్వాగతం. మీ అభ్యర్థనను మా బృందం తనిఖీ చేస్తోంది, త్వరలోనే పరిష్కరిస్తాము.";
    } else if (isKannada) {
      supportText = "ನಮಸ್ತೆ! ವಾಣಿAI ಗ್ರಾಹಕ ಸೇವೆಗೆ ಸುಸ್ವಾಗತ. ನಾವು ನಿಮ್ಮ ಕೋರಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದು, ಶೀಘ್ರವೇ ಪರಿಹಾರ ಒದಗಿಸಲಿದ್ದೇವೆ.";
    } else if (isMarathi) {
      supportText = "नमस्कार! वाणीAI ग्राहक सेवेत आपले स्वागत आहे. आम्ही तुमच्या समस्येचे पुनरावलोकन करत आहोत. लवकरच उपाय देऊ.";
    } else if (isBengali) {
      supportText = "নমস্কার! বাণীAI কাস্টমার কেয়ারে আপনাকে স্বাগত। हम आपके विशदটি দেখছি এবং খুব তাড়াতাড়ি সমাধান করব।";
    } else if (isGujarati) {
      supportText = "નમસ્તે! વાણીAI સપોર્ટ ડેસ્ક પર આપનું સ્વાગત છે. અમે આપની સમીક્ષા કરી રહ્યા છીએ, ઝડપથી જવાબ આપીશું.";
    } else if (isPunjabi) {
      supportText = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਵਾਣੀAI ਸਪੋਰਟ ਡੈਸਕ 'ਤੇ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੀ ਬੇਨਤੀ ਦੀ ਜਾਂਚ ਕਰ ਰਹੇ ਹਾਂ ਅਤੇ ਜਲਦੀ ਹੱਲ ਕਰਾਂਗੇ।";
    } else {
      supportText = "Hello! Thank you for contacting VaaniAI. Our support desk is reviewing your ticket details now and will provide a personalized resolution instantly.";
    }
  }

  suggestions.push({
    text: supportText,
    label: `Draft CoPilot Support Response (${language.split(' ')[0]} Match)`,
    action: 'insert'
  });

  // 2. Resolve & Close message
  let resolveText = "";
  if (isHindiOrHinglish) {
    resolveText = "धन्यवाद! आपकी समस्या का पूरी तरह से निवारण हो चुका है। अब हम इस सहायता टिकट को हल चिह्नित कर रहे हैं। शुभ दिन!";
  } else if (isTamilOrTanglish) {
    resolveText = "நன்றி! உங்கள் பிரச்சனை வெற்றிகரமாக தீர்க்கப்பட்டுவிட்டது. இந்த திக்கெட்டை நாங்கள் இத்துடன் முடித்துக்கொள்கிறோம். நல்ல நாள் அமையட்டும்!";
  } else if (isTelugu) {
    resolveText = "ధన్యవాదాలు! మీ సమస్య పూర్తిగా పరిష్కరించబడింది. ఈ సహాయ టిక్కెట్‌ను మేము క్లోజ్ చేస్తున్నాము. మీకు మంచి రోజు అవ్వాలి!";
  } else if (isKannada) {
    resolveText = "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಹರಿಸಲಾಗಿದ್ದು, ನಾವು ಈ ಟಿಕೆಟ್‌ ಅನ್ನು ಮುಚ್ಚುತ್ತಿದ್ದೇವೆ. ಒಳ್ಳೆಯ ದಿನವಾಗಲಿ!";
  } else if (isMarathi) {
    resolveText = "धन्यवाद! आपल्या समस्येचे यशस्वीरीत्या निवारण करण्यात आले आहे. आम्ही हे तिकीट बंद करत आहोत. आपला दिवस शुभ जावो!";
  } else if (isBengali) {
    resolveText = "ধন্যবাদ! আপনার সমস্যাটি সফলভাবে সমাধান করা হয়েছে। আমরা এই টিকিটটি বন্ধ করছি। আপনার দিনটি শুভ হোক!";
  } else if (isGujarati) {
    resolveText = "આભાર! આપની સમસ્યાનું સંપૂર્ણ નિરાકરણ થઈ ચૂક્યું છે. હવે અમે આ સપોર્ટ ટિકિટ બંધ કરી રહ્યા છીએ. આપનો દિવસ શુભ રહે!";
  } else if (isPunjabi) {
    resolveText = "ਤੁਹਾਡੀ ਸਮੱਸਿਆ ਹੱਲ ਹੋ ਗਈ ਹੈ। ਅਸੀਂ ਹੁਣ ਇਸ ਟਿਕਟ ਨੂੰ ਬੰਦ ਕਰ ਰਹੇ ਹਾਂ। ਧੰਨਵਾਦ!";
  } else {
    resolveText = "Understood! The issue is fully resolved and we are marking this support ticket as closed. Thank you for choosing VaaniAI support!";
  }

  suggestions.push({
    text: resolveText,
    label: "Verify & Resolve Ticket",
    action: 'resolve'
  });

  return suggestions;
};

export const systemPromptRule = `
You are the primary intelligence router and vernacular response engine for VaaniAI, an e-commerce platform.
Your task is to analyze the customer's query within the context of any previous conversation history and generate an exceptionally accurate, empathetic, and context-specific response in the same script and dialect as the user's input (e.g., transliterated Hinglish/Latin Hindi, native Hindi script, or standard English).

Analyze the conversation context and latest message, and output standard, valid JSON according to this exact schema:
{
  "detected_language": "Detected language (Must be 'Hinglish (Hindi-English)' or 'Hindi (Native)' or 'English')",
  "intent": "Categorized intent. Must be exactly one of: ORDER_TRACKING, RETURN_REQUEST, REFUND_STATUS, PRODUCT_INQUIRY, COUPON_ISSUES, DELIVERY_COMPLAINT, HUMAN_ESCALATION",
  "confidence": float between 0.0 and 1.0,
  "should_escalate": boolean (true ONLY for very urgent cases, legal threats, extreme abuse, or explicit requests for live support managers. For normal questions, AI should attempt to solve customer issues directly with at least 90% confidence. Set should_escalate to true ONLY when confidence is under 0.90 or it is a truly urgent escalation),
  "sentiment": "Positive" | "Neutral" | "Negative" | "Angry",
  "vernacular_reply": "A concise, highly empathetic, grammatically correct support solution answering the specific questions asked by the customer last, preserving the language script used."
}
IMPORTANT: Output only the raw valid JSON payload without backticks or markdown formatting.
`;
