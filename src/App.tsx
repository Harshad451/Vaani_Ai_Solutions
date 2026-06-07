/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Database, 
  Smartphone, 
  BookOpen, 
  Terminal, 
  Send, 
  CheckCircle2, 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  Languages, 
  Search, 
  Check, 
  Copy, 
  RefreshCw, 
  User, 
  Clock, 
  Activity, 
  ArrowRight,
  Plus, 
  TrendingUp, 
  ChevronRight, 
  Sliders, 
  Code,
  Mail,
  Lock,
  LogOut,
  Star,
  Package,
  CreditCard,
  Truck,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
  Users,
  ThumbsUp,
  Zap,
  Award,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Message, DatasetItem, AndroidFile, SenderType, Employee } from './types';
import { vernacularDataset } from './dataset';
import { androidSourceFiles } from './androidSource';

import { uiTranslations } from './utils/translations';
import { getSuggestedReplies as getSuggestedRepliesNew, systemPromptRule } from './utils/suggestions';
import { checkPasswordStrength } from './utils/password';
import { SLATimer } from './components/SLATimer';
import { PasswordStrengthIndicator } from './components/PasswordStrengthIndicator';

import { FeedbackTab } from './components/FeedbackTab';
import { HealthTab } from './components/HealthTab';
import { SubscriptionTab } from './components/SubscriptionTab';
import { SettingsTab } from './components/SettingsTab';
import { PlaygroundTab } from './components/PlaygroundTab';
import { GroundingTab } from './components/GroundingTab';
import { AndroidTab } from './components/AndroidTab';
import { DatasetTab } from './components/DatasetTab';
import { DashboardTab } from './components/DashboardTab';
import { InboxTab } from './components/InboxTab';

const getSuggestedReplies = (ticket: Ticket): { text: string; label: string; action: 'insert' | 'resolve' }[] => {
  return getSuggestedRepliesNew(ticket);
  /*
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
      supportText = "வணக்கம்! உங்கள் ஆர்டர் DTD12498 நேற்று அனுப்பப்பட்டுவிட்டது. இது நாளை மாலை 6 மணிக்குள் உங்கள் முகவரியை வந்தடையும். நன்றி!";
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
      supportText = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡਾ 1,499 ਰੁਪਏ ਦਾ ਰਿਫੰਡ (UPI Ref: TXN89324X) ਪ੍ਰੋਸੈਸ ਹੋ ਰਿਹਾ ਹੈ। ਅਗਲੇ 3-5 ਦਿਨਾਂ ਵਿੱਚ ਤੁਹਾਡੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਆ ਜਾਵੇਗਾ।";
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
      supportText = "ನಮಸ್ತೆ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆಪ್‌ನಲ್ಲಿನ 'My Orders' ವಿಭಾಗಕ್ಕೆ ಹೋಗಿ ರಿಟರ್ನ್ ರಿಕ್ವೆಸ್ಟ್ ಸಲ್ಲಿಸಿ. ಸೋಮವಾರ ಬೆಳಗ್ಗೆ ನಮ್ಮ ಡೆಲಿವರಿ ಏಜೆಂಟ್ ಬಂದು ಪಾರ್ಸೆಲ್ ಪಡೆಯಲಿದ್ದಾರೆ.";
    } else if (isMarathi) {
      supportText = "नमस्कार! एक्सचेंज/रिटर्न मंजूर केले गेले आहे. 'My Orders' मध्ये जाऊन आपली मागणी नोंदवा. सोमवार सकाळी आमचा प्रतिनिधी पिकअपसाठी तुमच्या घरी येईल.";
    } else if (isBengali) {
      supportText = "নমস্কার! এক্সচেঞ্জ/রিটার্ন অনুরোধটি নেওয়া হয়েছে। অনুগ্রহ করে 'My Orders' সেকশনে গিয়ে আবেদন করুন। সোমবার সকালে কুরিয়ার বয় পণ্যটি সংগ্রহ করতে আসবে।";
    } else if (isGujarati) {
      supportText = "નમસ્તે! કુર્તીનું સાઈઝ એક્સચેન્જ સ્વીકારવામાં આવ્યું છે. 'My Orders' પર રિકવેસ્ટ મોકલો, સોમવારે સવારે અમારી ટીમ પિકઅપ માટે આવશે.";
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
      supportText = "ನಮಸ್ತೆ! ಕೂಪನ್ ದೋಷವಿದ್ದರೆ ಚೆಕ್ಔಟ್ ಸಮಯದಲ್ಲಿ 'WELCOME10' ಕೋಡ್ ಬಳಸಿ. ಇದು ನಿಮಗೆ ತಕ್ಷಣವೇ 10% ರಿಯಾಯಿತಿ ಒದಗಿಸುತ್ತದೆ.";
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
      supportText = "నమస్కారం! నేను మీ కాల్ ని సీనియర్ మేనేజర్ కి బదిలీ చేస్తున్నాను, అంతలోపు మీ సమస్య మరియు ఆర్德ర్ నెంబర్ చెప్తే నేను సహాయం చేయడానికి ప్రయత్నిస్తాను.";
    } else if (isKannada) {
      supportText = "ನಮಸ್ತೆ! ನಾನು ಹಿರಿಯ ಮ್ಯಾನೇಜರ್‌ಗೆ ಈ ಕರೆ ವರ್ಗಾಯಿಸುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಅಲ್ಲಿಯವರೆಗೆ ನಿಮ್ಮ ಸಮಸ್ಯೆಯು ಹಾಗೂ ಆರ್ಡರ್ ಸಂಖ್ಯೆಯನ್ನು ಶೇರ್ ಮಾಡಿ.";
    } else if (isMarathi) {
      supportText = "नमस्कार! मी आपले तिकीट वरिष्ठ व्यवस्थापकांकडे पाठवत आहे, तोपर्यंत जर तुम्ही मला आपला क्रमांक व समस्या सांगितली तर मी स्वतः मदत करण्याचा प्रयत्न करेन.";
    } else if (isBengali) {
      supportText = "নমস্কার! আমি কোনো সিনিয়র ম্যানেজারের সাথে আপনাকে কানেক্ট করছি, ততক্ষণ অনুগ্রহ করে সমস্যাটির বিবরণ ও অর্ডার নম্বর দিন যাতে সাহায্য করতে পারি।";
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
      supportText = "নমস্কার! বাণীAI কাস্টমার কেয়ারে আপনাকে স্বাগত। আমরা আপনার বিশদটি দেখছি এবং খুব তাড়াতাড়ি সমাধান করব।";
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
    resolveText = "ধন্যবাদ! আপনার समस्याটি সফলভাবে সমাধান করা হয়েছে। আমরা এই টিকিটটি বন্ধ করছি। আপনার দিনটি শুভ হোক!";
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
  */
};





const SubscriptionGate = ({ 
  children, 
  activeTab, 
  settings, 
  setActiveTab,
  uiLang
}: { 
  children: React.ReactNode, 
  activeTab: string, 
  settings: any, 
  setActiveTab: (tab: string) => void,
  uiLang: 'en' | 'hi'
}) => {
  if (activeTab === 'subscription') {
    return <>{children}</>;
  }

  const isSubscribed = !!settings?.isSubscribed;
  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-[#07080c] p-8 text-center relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.05)_0%,transparent_65%)] pointer-events-none" />
      <div className="max-w-md w-full bg-[#0f111a]/95 border border-white/[0.04] p-8 relative z-10 shadow-2xl rounded-2xl space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-2 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-sans text-gray-100 tracking-tight">
            {uiLang === 'en' ? 'Active Subscription Required' : 'सक्रिय सब्सक्रिप्शन आवश्यक है'}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed font-sans">
            {uiLang === 'en' 
              ? `All workbench operations for ${settings?.companyName || "VaaniAI"} are currently locked. Place your plan in our billing center to activate the full workspace capability.`
              : `आपके कंपनी ${settings?.companyName || "VaaniAI"} के लिए सभी सुविधाएँ अभी लॉक हैं। पूरा उपयोग शुरू करने के लिए बिलिंग हब में जाकर सब्सक्रिप्शन लें।`}
          </p>
        </div>
        
        <div className="p-4 bg-[#141622]/80 rounded-xl border border-white/[0.02] text-left space-y-3 font-sans">
          <div className="flex items-center gap-2.5 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>{uiLang === 'en' ? 'Live vernacular translation & sentiment engine' : 'सक्रिय अनुवाद और भावना विश्लेषण टूल'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-400 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>{uiLang === 'en' ? 'SLA monitors and automatic escalation procedures' : 'SLA मॉनिटर और ऑटोमेटिक एस्केलेशन प्रक्रियाएं'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-400 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>{uiLang === 'en' ? 'Android dynamic UI Copilot embedding' : 'एंड्रॉइड डायनेमिक UI कोपायलट एकीकरण'}</span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('subscription')}
          className="w-full h-11 flex items-center justify-center gap-2 px-5 bg-gradient-to-r from-orange-500 to-amber-550 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-lg shadow-orange-500/10 cursor-pointer select-none"
        >
          <span>{uiLang === 'en' ? 'Go to Subscription & Billing' : 'सब्सक्रिप्शन और बिलिंग पर जाएं'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [uiLang, setUiLang] = useState<'en' | 'hi'>('en');
  const [showOwnerPassword, setShowOwnerPassword] = useState<boolean>(false);

  const [employee, setEmployee] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem('vaani_logged_employee');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('vaani_logged_token');
  });

  // Intercept the default fetch API inside App to enforce secure token-handling & session checks
  const fetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
    const token = localStorage.getItem('vaani_logged_token');
    
    // Inject headers safely
    const headers = {
      ...((options.headers as Record<string, string>) || {})
    };
    
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await window.fetch(url, {
      ...options,
      headers
    });
    
    if (res.status === 401) {
      // Session expired/invalid -> wipe secure credentials and hard boot the desktop interface
      localStorage.removeItem('vaani_logged_employee');
      localStorage.removeItem('vaani_logged_token');
      setEmployee(null);
      setAuthToken(null);
    }
    
    return res;
  };

  // Helper to save a registered agent locally to prevent sandbox container data loss
  const saveAgentToLocalBackup = (emp: any, hash: string) => {
    try {
      const stored = localStorage.getItem('vaani_custom_agents');
      const agents = stored ? JSON.parse(stored) : [];
      
      const exists = agents.some((a: any) => a.email.toLowerCase() === emp.email.toLowerCase());
      if (!exists) {
        agents.push({
          id: emp.id,
          email: emp.email,
          name: emp.name,
          role: emp.role,
          passwordHash: hash,
          createdAt: emp.createdAt,
          companyName: emp.companyName
        });
        localStorage.setItem('vaani_custom_agents', JSON.stringify(agents));
      }
    } catch (e) {
      console.warn("localStorage sync agent backup failed:", e);
    }
  };

  // Synchronize client-side backed up custom agents with the server database to persist logins across resets
  useEffect(() => {
    const syncBackupAgents = async () => {
      try {
        const stored = localStorage.getItem('vaani_custom_agents');
        if (stored) {
          const agents = JSON.parse(stored);
          if (Array.isArray(agents) && agents.length > 0) {
            await window.fetch('/api/auth/sync-agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ agents })
            });
            console.log(`[SYNC] Sent ${agents.length} custom backed up agents to server.`);
          }
        }
      } catch (err) {
        console.warn("Custom agents database backup sync failed:", err);
      }
    };
    syncBackupAgents();
  }, []);

  // Session Security: Perform verification handshake on load to ensure stored tokens are actual on backend
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('vaani_logged_token');
      const savedEmployee = localStorage.getItem('vaani_logged_employee');
      if (savedToken && savedEmployee) {
        try {
          const res = await window.fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          if (!res.ok) {
            // Token is old or missing from server registry, wipe and trigger login layout
            localStorage.removeItem('vaani_logged_employee');
            localStorage.removeItem('vaani_logged_token');
            setEmployee(null);
            setAuthToken(null);
          } else {
            const data = await res.json();
            if (data.success && data.employee) {
              setEmployee(data.employee);
            }
          }
        } catch (err) {
          // If network is offline, let the cached credentials load without forcing logout
          console.warn("Auth handshake skipped - network offline.");
        }
      }
    };
    verifySession();
  }, []);

  // Secure timeout: Log idling employees out automatically after 15 minutes of inactivity
  useEffect(() => {
    if (!employee) return;
    
    const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    let idleTimer: any;
    
    const handleLogoutTrigger = () => {
      localStorage.removeItem('vaani_logged_employee');
      localStorage.removeItem('vaani_logged_token');
      setEmployee(null);
      setAuthToken(null);
      alert("Session security alert: You have been logged out automatically due to 15 minutes of inactivity for workstation protection.");
    };
    
    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleLogoutTrigger, INACTIVITY_TIMEOUT_MS);
    };
    
    // Listen for client activities
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(eventName => {
      window.addEventListener(eventName, resetTimer);
    });
    
    resetTimer();
    
    return () => {
      clearTimeout(idleTimer);
      events.forEach(eventName => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [employee]);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState('Vernacular Specialist');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempSessionId, setTempSessionId] = useState<string | null>(null);
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Subscription & Billing Custom Local SaaS States
  const [subscriptionTier, setSubscriptionTier] = useState<'PRO' | 'ENTERPRISE'>(() => {
    try {
      return (localStorage.getItem('vaani_saas_tier') as 'PRO' | 'ENTERPRISE') || 'PRO';
    } catch {
      return 'PRO';
    }
  });
  const [checkoutPlan, setCheckoutPlan] = useState<'PRO' | 'ENTERPRISE' | 'CUSTOM' | null>(null);
  const [payingCardNumber, setPayingCardNumber] = useState('');
  const [payingCardExpiry, setPayingCardExpiry] = useState('');
  const [payingCardCvc, setPayingCardCvc] = useState('');
  const [payingCardHolder, setPayingCardHolder] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Completed Feedback Tab Filtering States
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<'ALL' | 5 | 4 | 3>('ALL');
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await window.fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.twoFactorRequired) {
          setTwoFactorRequired(true);
          setTempSessionId(data.tempSessionId);
          setDeliveryEmail(data.deliveryEmail);
          setSimulatedCode(data.debugCode);
        } else if (data.success) {
          setEmployee(data.employee);
          setAuthToken(data.token);
          localStorage.setItem('vaani_logged_employee', JSON.stringify(data.employee));
          localStorage.setItem('vaani_logged_token', data.token);
        }
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthError('Connection server error. Undergoing system updates.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSessionId || !verificationCode) return;
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await window.fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempSessionId, code: verificationCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployee(data.employee);
        setAuthToken(data.token);
        localStorage.setItem('vaani_logged_employee', JSON.stringify(data.employee));
        localStorage.setItem('vaani_logged_token', data.token);
        
        // Reset 2FA parameters
        setTwoFactorRequired(false);
        setTempSessionId(null);
        setVerificationCode('');
        setSimulatedCode(null);
      } else {
        setAuthError(data.error || 'Incorrect code or code has expired. Please try again.');
      }
    } catch (err) {
      setAuthError('Network communication error finalizing 2FA handshake.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await window.fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          name: registerName,
          role: registerRole,
          password: registerPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployee(data.employee);
        setAuthToken(data.token);
        localStorage.setItem('vaani_logged_employee', JSON.stringify(data.employee));
        localStorage.setItem('vaani_logged_token', data.token);
        if (data.passwordHash) {
          saveAgentToLocalBackup(data.employee, data.passwordHash);
        }
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Connection server error. Undergoing system updates.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await window.fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.twoFactorRequired) {
          setTwoFactorRequired(true);
          setTempSessionId(data.tempSessionId);
          setDeliveryEmail(data.deliveryEmail);
          setSimulatedCode(data.debugCode);
        } else if (data.success) {
          setEmployee(data.employee);
          setAuthToken(data.token);
          localStorage.setItem('vaani_logged_employee', JSON.stringify(data.employee));
          localStorage.setItem('vaani_logged_token', data.token);
        }
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthError('Connection error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBusinessOwnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const regRes = await window.fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerEmail,
          name: ownerName,
          role: 'Business Owner',
          password: ownerPassword
        })
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        setAuthError(regData.error || 'Business registration failed');
        setAuthLoading(false);
        return;
      }

      // Save credentials immediately to make sure they are accessible by subsequent authFetch calls
      localStorage.setItem('vaani_logged_employee', JSON.stringify(regData.employee));
      localStorage.setItem('vaani_logged_token', regData.token);
      setEmployee(regData.employee);
      setAuthToken(regData.token);
      if (regData.passwordHash) {
        saveAgentToLocalBackup(regData.employee, regData.passwordHash);
      }

      const settingsRes = await window.fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regData.token}`
        },
        body: JSON.stringify({
          companyName: ownerBusinessName,
          supportEmail: ownerEmail,
          slaMinutes: 15,
          botEnabled: true,
          defaultGreeting: `Namaste! Welcome to ${ownerBusinessName} customer support desktop. How can we help you solve your order today?`,
          isTrained: false,
          businessIndustry: 'General Retail & Delivery',
          supportTone: 'Local & Empathetic'
        })
      });
      const settingsData = await settingsRes.json();
      
      if (settingsRes.ok) {
        const compiledSettings = settingsData.settings || settingsData;
        setSettings(compiledSettings);
      } else {
        setAuthError('Setting up business parameters failed.');
      }
    } catch (err) {
      setAuthError('Connection error during business registration setup.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBusinessOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await window.fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail, password: ownerPassword })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.twoFactorRequired) {
          setTwoFactorRequired(true);
          setTempSessionId(data.tempSessionId);
          setDeliveryEmail(data.deliveryEmail);
          setSimulatedCode(data.debugCode);
        } else if (data.success) {
          setEmployee(data.employee);
          setAuthToken(data.token);
          localStorage.setItem('vaani_logged_employee', JSON.stringify(data.employee));
          localStorage.setItem('vaani_logged_token', data.token);
        }
      } else {
        setAuthError(data.error || 'Authentication as owner failed');
      }
    } catch (err) {
      setAuthError('Connection server error. Undergoing system updates.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setForgotSuccess(null);
    setForgotSimulatedEmail(null);
    setAuthLoading(true);
    try {
      const res = await window.fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotSuccess(data.message);
        setForgotSimulatedEmail(data.simulatedEmail);
      } else {
        setAuthError(data.error || 'Request failed. Double check your email address.');
      }
    } catch (err) {
      setAuthError('Connection error attempting password reset handshake.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSuccess(null);
    setAuthLoading(true);
    try {
      const res = await window.fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetTokenVal, newPassword: resetNewPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess(data.message);
        setResetTokenVal('');
        setResetNewPassword('');
        setForgotEmail('');
        setTimeout(() => {
          setAuthPortalTab('selection');
          setResetSuccess(null);
          setForgotSuccess(null);
          setForgotSimulatedEmail(null);
        }, 5000);
      } else {
        setAuthError(data.error || 'Reset failed. Token might be invalid or expired.');
      }
    } catch (err) {
      setAuthError('Connection error committing password reset.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterEmployeeInOnboarding = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setObRegEmpSuccessMsg('');
    setObRegEmpErrorMsg('');
    if (!obRegEmpName || !obRegEmpEmail || !obRegEmpPassword) {
      setObRegEmpErrorMsg('Please fill in name, email, and passcode fields.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: obRegEmpName,
          email: obRegEmpEmail,
          role: obRegEmpRole,
          password: obRegEmpPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setObRegEmpSuccessMsg(`Added seat for ${obRegEmpName} successfully!`);
        if (data.employee && data.passwordHash) {
          saveAgentToLocalBackup(data.employee, data.passwordHash);
        }
        setObRegEmpName('');
        setObRegEmpEmail('');
        setObRegEmpPassword('');
        fetchRegisteredEmployees();
      } else {
        setObRegEmpErrorMsg(data.error || 'Failed to add operator seat.');
      }
    } catch (err) {
      setObRegEmpErrorMsg('Server sync error during seat provisioning.');
    }
  };

  const handleLogout = () => {
    setEmployee(null);
    setAuthToken(null);
    localStorage.removeItem('vaani_logged_employee');
    localStorage.removeItem('vaani_logged_token');
    setLoginPassword('');
    setRegisterPassword('');
  };

  const t = (key: string) => {
    return uiTranslations[uiLang]?.[key] || uiTranslations['en']?.[key] || key;
  };

  // Connection error tracker
  const [connectionError, setConnectionError] = useState<boolean>(false);

  // Operational state managers (starts clean)
  const [tickets, setTickets] = useState<Ticket[]>(() => []);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(() => {
    return localStorage.getItem('vaani_selected_ticket_id') || null;
  });
  const [agentReplyText, setAgentReplyText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inbox' | 'dataset' | 'android' | 'playground' | 'grounding' | 'settings' | 'subscription' | 'health' | 'feedback'>(() => {
    try {
      const savedEmployee = localStorage.getItem('vaani_logged_employee');
      if (savedEmployee) {
        const parsed = JSON.parse(savedEmployee);
        return parsed.role === 'Business Owner' ? 'dashboard' : 'inbox';
      }
    } catch {}
    return 'dashboard';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AI_PENDING' | 'ESCALATED' | 'RESOLVED'>('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'MINE' | 'UNASSIGNED'>('ALL');
  const [slaFilter, setSlaFilter] = useState<'ALL' | 'BREACHED' | 'WARNING'>('ALL');
  const [sortingOrder, setSortingOrder] = useState<'DATE_DESC' | 'DATE_ASC' | 'SLA_URGENT'>('DATE_DESC');
  
  // Custom simulator states
  const [simChannel, setSimChannel] = useState<'WEB' | 'WHATSAPP'>('WEB');
  const [simMessage, setSimMessage] = useState<string>('');
  const [simName, setSimName] = useState<string>(() => {
    return localStorage.getItem('vaani_sim_name') || 'Mohit Verma';
  });
  const [simPhone, setSimPhone] = useState<string>(() => {
    return localStorage.getItem('vaani_sim_phone') || '+919988776655';
  });
  const [isSimulatingMessage, setIsSimulatingMessage] = useState<boolean>(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);

  // Star rating survey states on customer simulator side
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState<string>('');
  const [ratingSubmitting, setRatingSubmitting] = useState<boolean>(false);

  // Resolution Email Preview States
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState<boolean>(false);
  const [emailPreviewContent, setEmailPreviewContent] = useState<{ subject: string; from: string; to: string; html: string; sentAt: string } | null>(null);
  const [editCustEmail, setEditCustEmail] = useState<string>('');
  const lastSelectedTicketIdRef = useRef<string | null>(null);

  // AI Operations Dashboard Specific States
  const [aiBriefing, setAiBriefing] = useState<string>('');
  const [briefingLoading, setBriefingLoading] = useState<boolean>(false);

  // --- 5-STEP WELCOME & ONBOARDING WIZARD STATE SYSTEM ---
  const [obStep, setObStep] = useState<number>(1);
  const [obCountry, setObCountry] = useState<string>("India");
  const [obLanguages, setObLanguages] = useState<string[]>(["Hinglish", "Hindi", "English"]);
  const [obChannel, setObChannel] = useState<string>("WhatsApp");
  const [obTone, setObTone] = useState<string>("Local & Empathetic");
  const [obPreviewQuery, setObPreviewQuery] = useState<string>("bhai, order ka kya status hai? delay kyu ho raha hai?");
  const [obGenLoading, setObGenLoading] = useState<boolean>(false);
  const [obPreviewReply, setObPreviewReply] = useState<string>("Aapka order DTD12498 Delhi Hub se nikal chuka hai aur kal shaam tak aapko delivered ho jayega. Deri ke liye khed hai!");
  const [obRetention, setObRetention] = useState<string>("90 Days");
  const [obMaskNames, setObMaskNames] = useState<boolean>(true);
  const [obMaskPhones, setObMaskPhones] = useState<boolean>(true);
  const [obMaskTxn, setObMaskTxn] = useState<boolean>(true);
  const [obSafetyMode, setObSafetyMode] = useState<string>("Balanced");
  const [obFaqs, setObFaqs] = useState<{q: string, a: string}[]>([
    { q: "What is your refund policy?", a: "Refund is processed in 3-5 days once return transit is confirmed." },
    { q: "What is delivery timeline?", a: "Standard delivery takes 3-5 days across all national states." }
  ]);
  const [obUrls, setObUrls] = useState<string[]>([]);
  const [obSampleChats, setObSampleChats] = useState<string[]>([]);
  const [obUrlInput, setObUrlInput] = useState<string>("");
  const [obIndexingProgress, setObIndexingProgress] = useState<number>(0);
  const [obIsIndexing, setObIsIndexing] = useState<boolean>(false);
  const [obReadyPercentage, setObReadyPercentage] = useState<number>(65);
  const [obSimMessages, setObSimMessages] = useState<{sender: string, content: string, time: string, isAi?: boolean}[]>([
    { sender: "Customer", content: "Aapka system kya hai? Delivery time kitna hai national shipments ka?", time: "11:40 AM" }
  ]);
  const [obSimInput, setObSimInput] = useState<string>("");
  const [obSimLoading, setObSimLoading] = useState<boolean>(false);
  const [obValidationErrors, setObValidationErrors] = useState<Record<string, string>>({});

  // --- SEGREGATED PORTALS & ONBOARDING EMPLOYEE REGISTRATION STATES ---
  const [authPortalTab, setAuthPortalTab] = useState<'selection' | 'business_login' | 'business_register' | 'employee_login' | 'forgot_password' | 'reset_password'>('selection');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotSimulatedEmail, setForgotSimulatedEmail] = useState<{ to: string; resetLink: string; token: string } | null>(null);
  const [resetTokenVal, setResetTokenVal] = useState<string>('');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const [ownerBusinessName, setOwnerBusinessName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [ownerPassword, setOwnerPassword] = useState<string>('');
  
  // Onboarding step 5 employee inputs
  const [obRegEmpName, setObRegEmpName] = useState<string>('');
  const [obRegEmpEmail, setObRegEmpEmail] = useState<string>('');
  const [obRegEmpRole, setObRegEmpRole] = useState<string>('Vernacular Specialist');
  const [obRegEmpPassword, setObRegEmpPassword] = useState<string>('');
  const [obRegEmpSuccessMsg, setObRegEmpSuccessMsg] = useState<string>('');
  const [obRegEmpErrorMsg, setObRegEmpErrorMsg] = useState<string>('');
  const [allRegisteredEmployees, setAllRegisteredEmployees] = useState<{id: string, name: string, email: string, role: string}[]>([]);

  const fetchRegisteredEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setAllRegisteredEmployees(data.employees || []);
      }
    } catch (err) {
      console.error("Error fetching registered employees:", err);
    }
  };

  useEffect(() => {
    if (obStep === 5) {
      fetchRegisteredEmployees();
    }
  }, [obStep]);


  // Reset ratings when loaded ticket shifts
  useEffect(() => {
    setSelectedRating(0);
    setHoveredRating(0);
    setRatingFeedback('');
  }, [selectedTicketId]);

  // --- COMMAND BAR PALETTE STATE ENGINE ---
  const [isCommandBarOpen, setIsCommandBarOpen] = useState<boolean>(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState<string>('');
  const [commandSelectedIndex, setCommandSelectedIndex] = useState<number>(0);
  const [openTicketsInNewTab, setOpenTicketsInNewTab] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vaani_command_open_new_tab') === 'true';
    } catch {
      return false;
    }
  });
  const [commandScoreMap, setCommandScoreMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('vaani_command_scores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load ticket from url query parameters if specified (?ticket=ticket_id)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tickParam = params.get('ticket');
    if (tickParam) {
      setSelectedTicketId(tickParam);
      localStorage.setItem('vaani_selected_ticket_id', tickParam);
      setActiveTab('inbox');
    }
    
    const resetTokenParam = params.get('resetToken');
    if (resetTokenParam) {
      setResetTokenVal(resetTokenParam);
      setAuthPortalTab('reset_password');
      setAuthError(null);
    }
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K and Esc listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(prev => !prev);
        setCommandSearchQuery('');
        setCommandSelectedIndex(0);
      }
      if (e.key === 'Escape' && isCommandBarOpen) {
        e.preventDefault();
        setIsCommandBarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandBarOpen]);

  const [isRegeneratingSuggestion, setIsRegeneratingSuggestion] = useState<boolean>(false);

  // Active message count used as stable primitive tracking key for the side effect dependency array
  const activeTicketMsgCount = tickets.find(t => t.id === selectedTicketId)?.messages?.length || 0;

  // Automatically trigger copilot suggestion generation if it is empty and last message is from CUSTOMER
  useEffect(() => {
    if (!selectedTicketId) return;
    const activeTicket = tickets.find(t => t.id === selectedTicketId);
    if (!activeTicket) return;

    const lastMsg = activeTicket.messages[activeTicket.messages.length - 1];
    const isLastMsgFromCustomer = lastMsg && lastMsg.sender === 'CUSTOMER';

    if (isLastMsgFromCustomer && !activeTicket.copilotSuggestion && !isRegeneratingSuggestion) {
      setIsRegeneratingSuggestion(true);
      fetch(`/api/tickets/${selectedTicketId}/copilot-suggest`, {
        method: 'POST'
      })
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data && data.success && data.copilotSuggestion) {
          setTickets(prev => {
            const updated = prev.map(t => t.id === selectedTicketId ? { ...t, copilotSuggestion: data.copilotSuggestion } : t);
            return updated;
          });
        }
      })
      .catch(err => console.error("Error generating initial Copilot suggestion:", err))
      .finally(() => {
        setIsRegeneratingSuggestion(false);
      });
    }
  }, [selectedTicketId, activeTicketMsgCount]);

  const handleRegenerateCopilot = async () => {
    if (!selectedTicketId) return;
    setIsRegeneratingSuggestion(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/copilot-suggest`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.copilotSuggestion) {
          setTickets(prev => {
            const updated = prev.map(t => t.id === selectedTicketId ? { ...t, copilotSuggestion: data.copilotSuggestion } : t);
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("Failed to regenerate Copilot suggestion:", err);
    } finally {
      setIsRegeneratingSuggestion(false);
    }
  };

  const [isOrderPanelExpanded, setIsOrderPanelExpanded] = useState<boolean>(true);
  const [manualOrderIdInput, setManualOrderIdInput] = useState<string>('');

  const handleLinkOrder = async (ticketId: string, orderId: string) => {
    if (!orderId.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'CUSTOMER', content: `Internal Linked Order Request: ${orderId}` })
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        setManualOrderIdInput('');
      }
    } catch (err) {
      console.error("Error linking order:", err);
    }
  };

  // Pre-trained dataset states (preloaded clientfallback seed)
  const [datasets, setDatasets] = useState<DatasetItem[]>(() => vernacularDataset);
  const [searchDatasetTerm, setSearchDatasetTerm] = useState<string>('');
  const [newDSQuery, setNewDSQuery] = useState<string>('');
  const [newDSLanguage, setNewDSLanguage] = useState<string>('Hinglish');
  const [newDSIntent, setNewDSIntent] = useState<string>('ORDER_TRACKING');
  const [newDSSentiment, setNewDSSentiment] = useState<string>('Neutral');
  const [newDSEscalate, setNewDSEscalate] = useState<boolean>(false);
  const [newDSReply, setNewDSReply] = useState<string>('');
  const [newDSScript, setNewDSScript] = useState<'Native' | 'Latin/Transliterated' | 'Code-Mixed'>('Latin/Transliterated');
  const [isAddingDatasetItem, setIsAddingDatasetItem] = useState<boolean>(false);

  // Android Explorer states (preloaded clientfallback seed)
  const [androidFiles, setAndroidFiles] = useState<AndroidFile[]>(() => androidSourceFiles);
  const [selectedAndroidFilePath, setSelectedAndroidFilePath] = useState<string>(() => androidSourceFiles[0]?.path || '');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Playground tester states
  const [playgroundQuery, setPlaygroundQuery] = useState<string>('Bhai, coupon code kaam nahi kar raha. Pls ek naya dedo discount ke liye!');
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState<boolean>(false);
  const [systemKeyStatus, setSystemKeyStatus] = useState<{ gemini: boolean; anthropic: boolean }>({ gemini: false, anthropic: false });

  const [settings, setSettings] = useState<{
    companyName: string;
    supportEmail: string;
    slaMinutes: number;
    botEnabled: boolean;
    defaultGreeting: string;
    aiPolicyInstructions?: string;
    isTrained?: boolean;
    brandKnowledge?: string;
    businessIndustry?: string;
    supportTone?: string;
    kbBusiness?: string;
    kbReturns?: string;
    kbShipping?: string;
    kbEscalation?: string;
  }>({
    companyName: "NoshBerry Corp",
    supportEmail: "support@noshberry.com",
    slaMinutes: 10,
    botEnabled: true,
    defaultGreeting: "Welcome to our Support Assist! How can we help you today with your order?",
    aiPolicyInstructions: "",
    isTrained: false,
    brandKnowledge: "",
    businessIndustry: "",
    supportTone: "",
    kbBusiness: "",
    kbReturns: "",
    kbShipping: "",
    kbEscalation: ""
  });

  const [settingsSaving, setSettingsSaving] = useState<boolean>(false);
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const [showSimulator, setShowSimulator] = useState<boolean>(() => {
    const saved = localStorage.getItem('vaani_show_simulator');
    return saved !== null ? saved === 'true' : true;
  });

  const [showSidebarStats, setShowSidebarStats] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('vaani_show_simulator', String(showSimulator));
  }, [showSimulator]);

  useEffect(() => {
    if (settings && (settings as any).isSubscribed && (settings as any).subscriptionTier) {
      setSubscriptionTier((settings as any).subscriptionTier);
    }
  }, [settings]);

  // Role-based navigation safety logic to protect SaaS Owner vs Support Employee boundaries
  useEffect(() => {
    if (!employee) return;
    const isOwner = employee.role === 'Business Owner';
    if (isOwner) {
      const ownerTabs = ['dashboard', 'grounding', 'android', 'dataset', 'settings', 'subscription'];
      if (!ownerTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else {
      const employeeTabs = ['inbox', 'health', 'feedback', 'playground'];
      if (!employeeTabs.includes(activeTab)) {
        setActiveTab('inbox');
      }
    }
  }, [employee, activeTab]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.warn("Failed to retrieve settings:", err);
    }
  };

  // Auto scroll triggers for message feeds
  const chatEndRef = useRef<HTMLDivElement>(null);
  const simEndRef = useRef<HTMLDivElement>(null);

  // Load operation data from backend REST endpoints
  const fetchTickets = async (selectFirst = false) => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data: Ticket[] = await res.ok ? await res.json() : [];
        setTickets(data);
        setConnectionError(false);
        if (selectFirst && data.length > 0) {
          const firstActive = data.find(t => t.status !== 'RESOLVED');
          if (firstActive) {
            setSelectedTicketId(firstActive.id);
          } else {
            setSelectedTicketId(data[0].id);
          }
        }
      } else {
        setConnectionError(true);
      }
    } catch (err) {
      setConnectionError(true);
      console.warn("Retrying operational ticket sync: Active backend offline fallback models currently online.");
    }
  };

  const fetchDataset = async () => {
    try {
      const res = await fetch('/api/dataset');
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
        setConnectionError(false);
      } else {
        setConnectionError(true);
      }
    } catch (err) {
      setConnectionError(true);
    }
  };

  const fetchAndroidSource = async () => {
    try {
      const res = await fetch('/api/android-source');
      if (res.ok) {
        const data: AndroidFile[] = await res.json();
        setAndroidFiles(data);
        setConnectionError(false);
        if (data.length > 0 && !selectedAndroidFilePath) {
          setSelectedAndroidFilePath(data[0].path);
        }
      } else {
        setConnectionError(true);
      }
    } catch (err) {
      setConnectionError(true);
    }
  };

  // Load AI Operations Intelligent Briefing using Gemini 3.5 Flash
  const loadAiBriefing = async () => {
    setBriefingLoading(true);
    try {
      const response = await fetch('/api/dashboard/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickets })
      });
      const data = await response.json();
      if (data.bulletin) {
        setAiBriefing(data.bulletin);
      } else {
        setAiBriefing("Could not generate operational bulletin at this moment.");
      }
    } catch (e) {
      setAiBriefing("Could not connect to operations telemetry processor.");
    } finally {
      setBriefingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadAiBriefing();
    }
  }, [activeTab]);

  // Start periodic background refetches to emulate live WebSockets
  useEffect(() => {
    fetchTickets(true);
    fetchDataset();
    fetchAndroidSource();
    fetchSettings();

    const interval = setInterval(() => {
      fetchTickets();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handle active selected ticket details
  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  // Check if AI requested document or invoice
  const aiAskedForDocuments = React.useMemo(() => {
    if (!activeTicket || !activeTicket.messages) return false;
    const aiMessages = activeTicket.messages.filter(m => m.sender === 'AI');
    if (aiMessages.length === 0) return false;
    const lastAiMsg = aiMessages[aiMessages.length - 1].content.toLowerCase();
    const keywords = [
      'invoice', 'photo', 'document', 'receipt', 'bill', 'proof', 'copy', 'pic', 'screenshot', 'attachment', 'upload', 'image', 'media',
      'इन्वॉइस', 'बिल', 'रसीद', 'फोटो', 'प्रूफ', 'स्क्रीनशॉट', 'दस्तावेज़', 'अपलोड', 'कॉपी', 'पिक्चर'
    ];
    return keywords.some(k => lastAiMsg.includes(k));
  }, [activeTicket]);

  // Document attachment simulated dispatch
  const handleSendAttachmentSimulator = async (fileName: string) => {
    setIsSimulatingMessage(true);
    const attachmentMsg = `[Attached file: ${fileName}] Here is the requested document/image.`;
    try {
      const endpoint = simChannel === 'WHATSAPP' ? '/api/whatsapp/simulate' : '/api/tickets';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: simName,
          phoneNumber: simPhone,
          message: attachmentMsg,
          channel: simChannel
        })
      });

      if (res.ok) {
        if (simChannel === 'WHATSAPP') {
          await fetchTickets();
        } else {
          const updatedTicket: Ticket = await res.json();
          setTickets(prev => {
            if (prev.some(t => t.id === updatedTicket.id)) {
              return prev.map(t => t.id === updatedTicket.id ? updatedTicket : t);
            } else {
              return [updatedTicket, ...prev];
            }
          });
          setSelectedTicketId(updatedTicket.id);
        }
      }
    } catch (err) {
      console.error("Failed to send simulator attachment:", err);
    } finally {
      setIsSimulatingMessage(false);
      setShowAttachmentMenu(false);
    }
  };

  // Sync simulator name and phone with the active ticket to avoid incorrect state switching
  useEffect(() => {
    if (activeTicket) {
      setSimName(activeTicket.customerName);
      setSimPhone(activeTicket.phoneNumber);
      if (activeTicket.channel) {
        setSimChannel(activeTicket.channel === 'WHATSAPP' ? 'WHATSAPP' : 'WEB');
      }
      if (lastSelectedTicketIdRef.current !== selectedTicketId) {
        setEditCustEmail(activeTicket.customerEmail || (activeTicket.customerName.toLowerCase().replace(/\s+/g, '') + "@gmail.com"));
        lastSelectedTicketIdRef.current = selectedTicketId;
      }
    }
  }, [selectedTicketId, activeTicket]);

  // Persist selected ticket ID, simulator name and simulated phone to local storage
  useEffect(() => {
    if (selectedTicketId) {
      localStorage.setItem('vaani_selected_ticket_id', selectedTicketId);
    } else {
      localStorage.removeItem('vaani_selected_ticket_id');
    }
  }, [selectedTicketId]);

  useEffect(() => {
    if (simName) {
      localStorage.setItem('vaani_sim_name', simName);
    }
  }, [simName]);

  useEffect(() => {
    if (simPhone) {
      localStorage.setItem('vaani_sim_phone', simPhone);
    }
  }, [simPhone]);

  // POST action for Human Support agent message
  const handleSendAgentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentReplyText.trim() || !selectedTicketId) return;

    const payloadText = agentReplyText;
    setAgentReplyText('');

    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'AGENT', content: payloadText })
      });

      if (res.ok) {
        const updatedTicket: Ticket = await res.json();
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      }
    } catch (err) {
      console.error("Failed dispatching operator reply:", err);
    }
  };

  // MARK ticket as resolved
  const handleResolveTicket = async (id: string, customerEmail?: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customerEmail })
      });
      if (res.ok) {
        await fetchTickets();
      }
    } catch (err) {
      console.error("Failed marking ticket resolved:", err);
    }
  };

  // Manage manual Human Support Escalation Request state controls
  const handleAcceptEscalation = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/accept-escalation`, {
        method: 'POST'
      });
      if (res.ok) {
        const updatedTicket: Ticket = await res.json();
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      }
    } catch (err) {
      console.error("Failed accepting live support escalation transfer:", err);
    }
  };

  const handleDeclineEscalation = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/decline-escalation`, {
        method: 'POST'
      });
      if (res.ok) {
        const updatedTicket: Ticket = await res.json();
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      }
    } catch (err) {
      console.error("Failed declining live support escalation request:", err);
    }
  };

  const handleClaimTicket = async (ticketId: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employee.id, employeeName: employee.name })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.ticket) {
          setTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t));
        }
      }
    } catch (err) {
      console.error("Failed to claim ticket:", err);
    }
  };

  const handleReleaseTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/release`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.ticket) {
          setTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t));
        }
      }
    } catch (err) {
      console.error("Failed to release ticket:", err);
    }
  };

  // Save survey feedback rating to resolved ticket
  const handleRateTicket = async (ticketId: string, rating: number, feedback: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, ratingFeedback: feedback })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.ticket) {
          setTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t));
        }
      }
    } catch (err) {
      console.error("Failed to submit rating feedback:", err);
    }
  };

  // Smartphone Simulator dispatch - simulates incoming customer query
  const handleSendSimulationMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;

    const queryText = simMessage;
    setSimMessage('');
    setIsSimulatingMessage(true);

    try {
      const endpoint = simChannel === 'WHATSAPP' ? '/api/whatsapp/simulate' : '/api/tickets';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: simName,
          phoneNumber: simPhone,
          message: queryText,
          channel: simChannel
        })
      });

      if (res.ok) {
        if (simChannel === 'WHATSAPP') {
          // Relies on webhook simulator internally. Force update the local tickets list
          await fetchTickets();
          const simRes = await res.json();
          if (simRes.ticketId) {
            setSelectedTicketId(simRes.ticketId);
          }
        } else {
          const updatedTicket: Ticket = await res.json();
          // Insert/refresh list
          setTickets(prev => {
            if (prev.some(t => t.id === updatedTicket.id)) {
              return prev.map(t => t.id === updatedTicket.id ? updatedTicket : t);
            } else {
              return [updatedTicket, ...prev];
            }
          });
          setSelectedTicketId(updatedTicket.id);
        }
      }
    } catch (err) {
      console.error("Simulator request failed:", err);
    } finally {
      setIsSimulatingMessage(false);
    }
  };
  
  // Send simulated language preference selection option
  const sendClickLanguage = async (lang: string) => {
    setIsSimulatingMessage(true);
    try {
      const endpoint = simChannel === 'WHATSAPP' ? '/api/whatsapp/simulate' : '/api/tickets';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: simName,
          phoneNumber: simPhone,
          message: lang,
          channel: simChannel
        })
      });

      if (res.ok) {
        if (simChannel === 'WHATSAPP') {
          await fetchTickets();
        } else {
          const updatedTicket: Ticket = await res.json();
          setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        }
      }
    } catch (err) {
      console.error("Language select simulation failed:", err);
    } finally {
      setIsSimulatingMessage(false);
    }
  };

  // Register and pre-train a new labeled query
  const handleAddDatasetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDSQuery.trim() || !newDSReply.trim()) return;

    setIsAddingDatasetItem(true);
    try {
      const res = await fetch('/api/dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: newDSQuery,
          language: newDSLanguage,
          intent: newDSIntent,
          sentiment: newDSSentiment,
          shouldEscalate: newDSEscalate,
          expectedReply: newDSReply,
          scriptType: newDSScript
        })
      });

      if (res.ok) {
        setNewDSQuery('');
        setNewDSReply('');
        await fetchDataset();
      }
    } catch (err) {
      console.error("Error committing training item to dataset:", err);
    } finally {
      setIsAddingDatasetItem(false);
    }
  };

  // Trigger rapid Playground test to inspect raw AI categorizations
  const handlePlaygroundTest = async () => {
    if (!playgroundQuery.trim()) return;
    setPlaygroundLoading(true);

    try {
      // Direct integration with tickets simulate block to check outcomes safely 
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: "Playground Tester",
          phoneNumber: "+910000000000",
          message: playgroundQuery
        })
      });

      if (res.ok) {
        const ticket: Ticket = await res.json();
        // Extricate analysis outcomes from the last AI/SYSTEM message metadata or response
        const lastMsg = ticket.messages[ticket.messages.length - 1];
        setPlaygroundResult({
          text: lastMsg.content,
          language: ticket.detectedLanguage,
          intent: ticket.lastIntent,
          sentiment: ticket.sentiment,
          status: ticket.status,
          rawMessageMeta: lastMsg
        });
      }
    } catch (err) {
      console.error("Playground sandbox test failed:", err);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Utilities to copy content to clipboard
  const handleCopyCode = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Filter queues
  const filteredTickets = tickets.filter(t => {
    const term = searchTerm.toLowerCase();
    const matchSearch = t.customerName.toLowerCase().includes(term) || 
                        t.phoneNumber.includes(term) || 
                        t.messages.some(m => m.content.toLowerCase().includes(term));
    
    if (!matchSearch) return false;

    // SLA filter
    if (slaFilter === 'BREACHED') {
      const isBreached = t.status !== 'RESOLVED' && t.slaExpiresAt && new Date(t.slaExpiresAt).getTime() <= Date.now();
      if (!isBreached) return false;
    } else if (slaFilter === 'WARNING') {
      const timeLeft = t.slaExpiresAt ? new Date(t.slaExpiresAt).getTime() - Date.now() : -1;
      const isWarning = t.status !== 'RESOLVED' && timeLeft > 0 && timeLeft <= 300000;
      if (!isWarning) return false;
    }

    // Assignment filter
    if (assignmentFilter === 'MINE' && employee) {
      if (t.assignedToId !== employee.id) return false;
    } else if (assignmentFilter === 'UNASSIGNED') {
      if (t.assignedToId) return false;
    }

    if (statusFilter === 'ALL') {
      return t.status !== 'RESOLVED';
    }
    return t.status === statusFilter;
  }).sort((a, b) => {
    if (sortingOrder === 'DATE_ASC') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortingOrder === 'SLA_URGENT') {
      const aHasSla = a.status !== 'RESOLVED' && a.slaExpiresAt;
      const bHasSla = b.status !== 'RESOLVED' && b.slaExpiresAt;
      if (aHasSla && !bHasSla) return -1;
      if (!aHasSla && bHasSla) return 1;
      if (aHasSla && bHasSla) {
        return new Date(a.slaExpiresAt!).getTime() - new Date(b.slaExpiresAt!).getTime();
      }
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeAndroidFile = androidFiles.find(f => f.path === selectedAndroidFilePath);

  // --- COMMAND PALETTE SCORING AND AUTO-SEARCH COMPILER ---
  interface CommandItem {
    id: string;
    category: string;
    title: string;
    subtitle?: string;
    badge?: string;
    badgeStyle?: string;
    icon?: React.ReactNode;
    action: () => void;
    ticketId?: string;
    status?: string;
    customerName?: string;
    messagesCount?: number;
    highlightedSnippet?: string;
    disabled?: boolean;
    tooltip?: string;
  }

  const registerCommandClick = (itemId: string) => {
    setCommandScoreMap(prev => {
      const next = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      localStorage.setItem('vaani_command_scores', JSON.stringify(next));
      return next;
    });
  };

  const getFilteredAndScoredResults = (): CommandItem[] => {
    const query = commandSearchQuery.trim().toLowerCase();
    
    // Core base set of workspace targets
    const navCommands: CommandItem[] = [
      {
        id: "nav_inbox",
        category: "Navigation",
        title: "Go to Support Inbox",
        subtitle: "Review incoming customer chats and active AI/Human handovers",
        icon: <MessageSquare size={13} />,
        action: () => {
          setActiveTab('inbox');
          setIsCommandBarOpen(false);
        }
      },
      {
        id: "nav_dataset",
        category: "Navigation",
        title: "Go to Pre-Trained Vernacular Dataset",
        subtitle: "Explore customer statements, intents, sentiments, and offline replies",
        icon: <Database size={13} />,
        action: () => {
          setActiveTab('dataset');
          setIsCommandBarOpen(false);
        }
      },
      {
        id: "nav_grounding",
        category: "Navigation",
        title: "Go to Grounding Knowledge Hub",
        subtitle: "Build guidelines, contextual enterprise answers, and live documentation",
        icon: <BookOpen size={13} />,
        action: () => {
          setActiveTab('grounding');
          setIsCommandBarOpen(false);
        }
      },
      {
        id: "nav_playground",
        category: "Navigation",
        title: "Go to Interactive API Playground",
        subtitle: "Test raw prompts, model parameters, and check connection statuses",
        icon: <Terminal size={13} />,
        action: () => {
          setActiveTab('playground');
          setIsCommandBarOpen(false);
        }
      },
      {
        id: "nav_android",
        category: "Navigation",
        title: "Go to Android SDK Native Assets",
        subtitle: "Manage localized XML dictionaries and device metadata",
        icon: <Code size={13} />,
        action: () => {
          setActiveTab('android');
          setIsCommandBarOpen(false);
        }
      },
      
      // Configuration pages items
      {
        id: "set_profile",
        category: "Settings",
        title: "Company Profile Settings",
        subtitle: "Edit company branding name, business industry, and support contact emails",
        icon: <Activity size={13} />,
        action: () => {
          setActiveTab('settings');
          setIsCommandBarOpen(false);
          setTimeout(() => {
            const el = document.getElementById('settings_company_profile');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      },
      {
        id: "set_dispatcher",
        category: "Settings",
        title: "AI / Prompt Auto-Dispatcher settings",
        subtitle: "Configure automatic bot replies, developer guidelines, and tone",
        icon: <Bot size={13} />,
        action: () => {
          setActiveTab('settings');
          setIsCommandBarOpen(false);
          setTimeout(() => {
            const el = document.getElementById('settings_ai_dispatcher');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      },
      {
        id: "set_sla",
        category: "Settings",
        title: "SLA Threshold Rules & Limits",
        subtitle: "Define expiration timeouts for operator alerts on active queues",
        icon: <Clock size={13} />,
        action: () => {
          setActiveTab('settings');
          setIsCommandBarOpen(false);
          setTimeout(() => {
            const el = document.getElementById('settings_sla_rules');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      },
      
      // Role-specific action matrices
      {
        id: "set_roles",
        category: "Settings",
        title: "User Account & Role Matrix",
        subtitle: "Manage permissions, operator assignments, and secure credentials",
        icon: <Lock size={13} />,
        disabled: !(employee?.role?.toLowerCase().includes('admin') || employee?.role?.toLowerCase().includes('lead')),
        tooltip: "Access Restricted - Requires Administrator or Lead role privileges",
        action: () => {
          setActiveTab('settings');
          setIsCommandBarOpen(false);
        }
      },
      {
        id: "set_audit",
        category: "Settings",
        title: "Compliance & Security Audit Logs",
        subtitle: "Monitor raw access logs, IP hashes, and secure credentials",
        icon: <Lock size={13} />,
        disabled: !(employee?.role?.toLowerCase().includes('admin') || employee?.role?.toLowerCase().includes('lead')),
        tooltip: "Access Restricted - Requires Administrator or Lead role privileges",
        action: () => {
          setActiveTab('settings');
          setIsCommandBarOpen(false);
        }
      }
    ];

    // Build active dynamic ticket channels
    const ticketCommands: CommandItem[] = tickets.map(t => {
      const displayId = t.id.replace('ticket_', '');
      return {
        id: `ticket_cmd_${t.id}`,
        category: "Tickets",
        title: `#${displayId} - ${t.customerName}`,
        subtitle: `Phone: ${t.phoneNumber} | Channel: ${t.channel === 'WHATSAPP' ? 'WhatsApp API/Cloud' : 'In-App Web Widget'}`,
        badge: t.status === 'RESOLVED' ? 'Solved' : t.status === 'ESCALATED' ? 'Live Manual' : 'AI Processing',
        badgeStyle: t.status === 'RESOLVED' 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : t.status === 'ESCALATED' 
            ? 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse font-bold' 
            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        icon: <MessageSquare size={13} />,
        action: () => {
          if (openTicketsInNewTab) {
            window.open(`${window.location.origin}?ticket=${t.id}`, '_blank');
          } else {
            setSelectedTicketId(t.id);
            localStorage.setItem('vaani_selected_ticket_id', t.id);
            setActiveTab('inbox');
          }
          setIsCommandBarOpen(false);
        },
        ticketId: t.id,
        status: t.status,
        customerName: t.customerName
      };
    });

    // Submessage / conversation matches
    const conversationCommands: CommandItem[] = [];
    if (query.length > 1) {
      tickets.forEach(ticket => {
        ticket.messages.forEach((msg, idx) => {
          const text = msg.content || "";
          const matchIndex = text.toLowerCase().indexOf(query);
          if (matchIndex !== -1) {
            const start = Math.max(0, matchIndex - 35);
            const end = Math.min(text.length, matchIndex + query.length + 35);
            let snippet = text.slice(start, end);
            if (start > 0) snippet = "..." + snippet;
            if (end < text.length) snippet = snippet + "...";

            conversationCommands.push({
              id: `msg_cmd_${ticket.id}_${msg.id || idx}`,
              category: "Conversations",
              title: `Match in Ticket #${ticket.id.replace('ticket_', '')}`,
              subtitle: `Snippet: "${snippet}"`,
              highlightedSnippet: snippet,
              badge: msg.sender,
              badgeStyle: msg.sender === 'CUSTOMER' 
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' 
                : msg.sender === 'AI' 
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' 
                  : 'bg-indigo-500/15 text-indigo-450 border border-indigo-500/20',
              icon: <MessageSquare size={13} />,
              action: () => {
                if (openTicketsInNewTab) {
                  window.open(`${window.location.origin}?ticket=${ticket.id}`, '_blank');
                } else {
                  setSelectedTicketId(ticket.id);
                  localStorage.setItem('vaani_selected_ticket_id', ticket.id);
                  setActiveTab('inbox');
                }
                setIsCommandBarOpen(false);
              }
            });
          }
        });
      });
    }

    const allChoices = [...navCommands, ...ticketCommands, ...conversationCommands];

    if (!query) {
      // Return top commands sorted by past usage metrics
      return allChoices
        .sort((a, b) => (commandScoreMap[b.id] || 0) - (commandScoreMap[a.id] || 0))
        .slice(0, 15);
    }

    // Dynamic NLP intent priority boost logic
    const isTicketSearch = query.includes("ticket") || query.includes("#") || query.startsWith("open") || /^\d+$/.test(query);
    const isSettingsSearch = query.includes("setting") || query.includes("config") || query.includes("prompt") || query.includes("tone") || query.includes("rule") || query.includes("sla");
    const isChatSearch = query.includes("message") || query.includes("search") || query.includes("chat") || query.includes("whatsapp") || query.length > 3;

    const scored = allChoices.map(item => {
      let score = 0;
      const title = item.title.toLowerCase();
      const subtitle = (item.subtitle || "").toLowerCase();
      const snoop = (item.highlightedSnippet || "").toLowerCase();

      if (title.includes(query)) {
        score += 150;
        if (title.startsWith(query)) score += 60;
      }
      if (subtitle.includes(query)) {
        score += 65;
      }
      if (snoop.includes(query)) {
        score += 40;
      }

      // Exact numerical identifier match score boost
      if (item.category === 'Tickets' && item.ticketId) {
        const numericPart = item.ticketId.replace('ticket_', '').toLowerCase();
        if (query.includes(numericPart) || numericPart.includes(query)) {
          score += 400; // instant highest matching!
        }
      }

      // Category level boosts
      if (isTicketSearch && item.category === 'Tickets') score += 120;
      if (isSettingsSearch && item.category === 'Settings') score += 120;
      if (isChatSearch && item.category === 'Conversations') score += 100;

      // Learn patterns score frequency boost
      const clickCount = commandScoreMap[item.id] || 0;
      score += clickCount * 25;

      return { item, score };
    });

    return scored
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);
  };

  // Quick stats calculations
  const totalIncoming = tickets.length;
  const activeEscalatedCount = tickets.filter(t => t.status === 'ESCALATED').length;
  const activeAICount = tickets.filter(t => t.status === 'AI_PENDING').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  const myClaimedCount = tickets.filter(t => t.assignedToId === employee?.id && t.status !== 'RESOLVED').length;
  const breachedSlaCount = tickets.filter(t => t.status !== 'RESOLVED' && t.slaExpiresAt && new Date(t.slaExpiresAt).getTime() <= Date.now()).length;
  const warningSlaCount = tickets.filter(t => {
    const time = t.slaExpiresAt ? new Date(t.slaExpiresAt).getTime() - Date.now() : -1;
    return t.status !== 'RESOLVED' && time > 0 && time <= 300000;
  }).length;

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#07080c] text-[#f2ede4] font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
        {/* Glow decorative orbs under the hood */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl text-orange-500" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl text-amber-500" />
        
        <div className="w-full max-w-4xl z-10">
          {/* Logo / Header Branding */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.04] rounded-full text-[11px] font-mono tracking-wider text-amber-300 mb-3 uppercase">
              <Sparkles size={11} className="text-amber-400" /> Vernacular Workbench
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              VaaniAI Solutions
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-2.5">
              Automated Vernacular Intelligence & Omni-Channel Support Operator Desk
            </p>
          </div>

          {authError && (
            <div className="max-w-md mx-auto mb-6 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0 animate-bounce" />
              <span>{authError}</span>
            </div>
          )}

          {authPortalTab === 'selection' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              
              {/* PORTAL A: BUSINESS OWNER ARCHITECT */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                whileHover={{ y: -5, borderColor: "rgba(249, 115, 22, 0.35)", boxShadow: "0 20px 40px -10px rgba(249, 115, 22, 0.1)" }}
                className="bg-[#0c0d12]/90 border border-white/[0.04] p-6.5 rounded-2xl flex flex-col justify-between hover:border-orange-500/25 transition-all duration-300 backdrop-blur-xl"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 font-bold font-mono text-sm shadow-inner group-hover:scale-105 transition-transform">
                    HQ
                  </div>
                  <h3 className="text-base font-bold text-gray-200 font-mono tracking-wide">Enterprise Owner Console</h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
                    For business administrators, founders and managers. Build conversational models, setup PII masking compliance rules, train grounding datasets, and review real-time operator seat metrics.
                  </p>
                </div>
                
                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => { setAuthPortalTab('business_register'); setAuthError(null); }}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-mono font-bold uppercase rounded-xl transition duration-155 flex items-center justify-center gap-2 shadow-lg cursor-pointer select-none"
                  >
                    <span>Register New Business</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthPortalTab('business_login'); setAuthError(null); }}
                    className="w-full py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] text-gray-300 hover:text-white text-xs font-mono rounded-xl transition cursor-pointer select-none"
                  >
                    SaaS Owner Sign In
                  </button>
                </div>
              </motion.div>

              {/* PORTAL B: WORKBENCH OPERATOR SPECIALIST */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.1 }}
                whileHover={{ y: -5, borderColor: "rgba(245, 158, 11, 0.35)", boxShadow: "0 20px 40px -10px rgba(245, 158, 11, 0.1)" }}
                className="bg-[#0c0d12]/90 border border-white/[0.04] p-6.5 rounded-2xl flex flex-col justify-between hover:border-amber-500/25 transition-all duration-300 backdrop-blur-xl"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 font-bold font-mono text-sm shadow-inner group-hover:scale-105 transition-transform">
                    OP
                  </div>
                  <h3 className="text-base font-bold text-gray-200 font-mono tracking-wide">Specialist Operator Entrance</h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
                    For client experience representatives, translation specialists, and operators. View live claimed ticket queues, edit WhatsApp messaging simulator sandboxes, and process manual language overrides.
                  </p>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => { setAuthPortalTab('employee_login'); setAuthError(null); }}
                    className="w-full py-3 bg-white/[0.02] hover:bg-amber-500/10 border border-white/[0.05] hover:border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold uppercase rounded-xl transition duration-155 flex items-center justify-center gap-2 cursor-pointer select-none h-12.5"
                  >
                    <span>Employee Workbench Access</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>

            </div>
          ) : (
            <div className="max-w-md mx-auto bg-[#0c0d12]/90 border border-white/[0.04] shadow-2xl rounded-2xl p-6.5 backdrop-blur-xl">
              
              {twoFactorRequired ? (
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorRequired(false);
                    setTempSessionId(null);
                    setVerificationCode('');
                    setAuthError(null);
                    setSimulatedCode(null);
                  }}
                  className="text-[10px] font-mono text-gray-500 hover:text-gray-300 mb-4 transition flex items-center gap-1 cursor-pointer"
                >
                  ← Cancel 2FA Security Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAuthPortalTab('selection'); setAuthError(null); }}
                  className="text-[10px] font-mono text-gray-500 hover:text-gray-300 mb-4 transition flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Portal Selection
                </button>
              )}

              {twoFactorRequired ? (
                <form onSubmit={handleVerify2FA} className="space-y-4">
                  <div className="border-b border-white/[0.03] pb-3 mb-1">
                    <h2 className="text-sm font-bold text-teal-400 font-mono tracking-wide uppercase flex items-center gap-2">
                      <ShieldCheck size={16} className="text-teal-400 font-mono" />
                      Two-Factor Protection Handshake
                    </h2>
                    <p className="text-[10px] text-gray-400 font-mono mt-1 leading-relaxed">
                      For workstation validation, we have dispatched a 6-digit session key to the registered support email address:
                    </p>
                    <div className="mt-2.5 px-3 py-1.8 bg-teal-500/5 rounded-xl border border-teal-500/15 font-mono text-xs text-teal-300 break-all text-center">
                      {deliveryEmail}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">6-Digit Verification Code</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-teal-500">
                        <KeyRound size={14} />
                      </span>
                      <input
                        required
                        maxLength={6}
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 123456"
                        className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-lg text-center tracking-[0.25em] text-teal-300 placeholder:text-gray-700 placeholder:tracking-normal focus:outline-none focus:border-teal-500/50 transition font-mono font-bold"
                      />
                    </div>
                  </div>

                  {simulatedCode && (
                    <div className="p-3.5 bg-teal-500/5 border border-teal-500/10 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[9px] text-teal-400 uppercase tracking-wider font-bold">
                        <span>🛠️ System Delivery Simulator</span>
                        <span className="text-[8px] bg-teal-500/10 text-teal-300 px-1.5 py-0.2 rounded font-bold">Inbox Dispatch</span>
                      </div>
                      <p className="text-[9.5px] text-gray-500 font-mono leading-relaxed">
                        To simplify authorization previews, copy the dispatched session passcode below:
                      </p>
                      <div className="flex items-center justify-between bg-black/40 border border-white/[0.04] p-2 rounded-lg font-mono text-xs text-teal-200">
                        <span>Passcode:</span>
                        <span className="text-xs font-bold tracking-wider select-all cursor-pointer bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded">{simulatedCode}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-95 text-white text-xs font-mono font-bold uppercase rounded-xl transition duration-155 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 select-none cursor-pointer"
                  >
                    {authLoading ? (
                      <RefreshCw size={14} className="animate-spin text-white" />
                    ) : (
                      <>
                        <span>Verify Security & Sign In</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <>
                  {/* BUSINESS REGISTER FORM */}
                  {authPortalTab === 'business_register' && (
                <form onSubmit={handleBusinessOwnerRegister} className="space-y-4">
                  <div className="border-b border-white/[0.03] pb-3 mb-1">
                    <h2 className="text-sm font-bold text-gray-200 font-mono tracking-wide uppercase">Register New Business</h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">SaaS setup will initialize model onboarding directly.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Company / Business Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <Sparkles size={14} className="text-gray-600" />
                      </span>
                      <input
                        required
                        type="text"
                        value={ownerBusinessName}
                        onChange={(e) => setOwnerBusinessName(e.target.value)}
                        placeholder="e.g. Acme Retailers"
                        className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Founder / Owner Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                          <User size={14} className="text-gray-600" />
                        </span>
                        <input
                          required
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder="e.g. Harshad Phadtare"
                          className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Founder Workspace Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <Mail size={14} className="text-gray-650" />
                      </span>
                      <input
                        required
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="owner@brand.com"
                        className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Choose Admin Passcode</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <Lock size={14} className="text-gray-655" />
                      </span>
                      <input
                        required
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition font-mono"
                      />
                    </div>
                    <PasswordStrengthIndicator password={ownerPassword} />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-mono font-bold uppercase rounded-xl transition duration-155 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 select-none cursor-pointer"
                  >
                    {authLoading ? (
                      <RefreshCw size={14} className="animate-spin text-white" />
                    ) : (
                      <>
                        <span>Initialize Business & Onboarding</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-[10px] text-gray-500 font-sans">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthPortalTab('business_login'); setAuthError(null); }}
                        className="text-orange-400 hover:underline font-mono text-[10.5px]"
                      >
                        Owner Sign In
                      </button>
                    </span>
                  </div>
                </form>
              )}

              {/* BUSINESS LOGIN FORM */}
              {authPortalTab === 'business_login' && (
                <form onSubmit={handleBusinessOwnerLogin} className="space-y-4">
                  <div className="border-b border-white/[0.03] pb-3 mb-1">
                    <h2 className="text-sm font-bold text-gray-200 font-mono tracking-wide uppercase">Business Owner Sign In</h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">Access administrative dials, brand rules and settings.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Founder Workspace Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <Mail size={14} className="text-gray-655" />
                      </span>
                      <input
                        required
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="e.g. owner@brand.com"
                        className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Admin Passcode</label>
                      <button
                        type="button"
                        onClick={() => { setAuthPortalTab('forgot_password'); setAuthError(null); setForgotSuccess(null); }}
                        className="text-[9.5px] text-orange-450 hover:underline font-mono cursor-pointer"
                      >
                        Forgot Passcode?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <Lock size={14} className="text-gray-655" />
                      </span>
                      <input
                        required
                        type={showOwnerPassword ? "text" : "password"}
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-10 py-2.8 text-sm text-gray-300 placeholder:text-gray-650 focus:outline-none focus:border-orange-500/50 transition font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 transition focus:outline-none cursor-pointer"
                        title={showOwnerPassword ? "Hide passcode" : "Show passcode"}
                      >
                        {showOwnerPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-mono font-bold uppercase rounded-xl transition duration-155 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 select-none cursor-pointer"
                  >
                    {authLoading ? (
                      <RefreshCw size={14} className="animate-spin text-white" />
                    ) : (
                      <>
                        <span>Open Operations Centre</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-[10px] text-gray-500 font-sans font-medium">
                      Setup a new brand?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthPortalTab('business_register'); setAuthError(null); }}
                        className="text-orange-400 hover:underline font-mono text-[10.5px]"
                      >
                        Register New Business
                      </button>
                    </span>
                  </div>
                </form>
              )}

              {/* EMPLOYEE SPECIALIST LOGIN FORM */}
              {authPortalTab === 'employee_login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="border-b border-white/[0.03] pb-3 mb-1">
                    <h2 className="text-sm font-bold text-amber-400 font-mono tracking-wide uppercase">Employee Workbench Entrance</h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">Please sign in with your employer-assigned specialist login.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Work Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500 font-mono">
                        <Mail size={14} />
                      </span>
                      <input
                        required
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="specialist@brand.com"
                        className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Specialist Passcode</label>
                      <button
                        type="button"
                        onClick={() => { setAuthPortalTab('forgot_password'); setAuthError(null); setForgotSuccess(null); }}
                        className="text-[9.5px] text-amber-550 hover:underline font-mono cursor-pointer"
                      >
                        Forgot Passcode?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <Lock size={14} />
                      </span>
                      <input
                        required
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white text-xs font-mono font-bold uppercase rounded-xl transition duration-155 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 select-none cursor-pointer"
                  >
                    {authLoading ? (
                      <RefreshCw size={14} className="animate-spin text-white" />
                    ) : (
                      <>
                        <span>Enter specialist Workbench</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-lg mt-2 text-[9px] text-gray-500 font-mono text-center">
                    ℹ️ Operator seats are designated and managed entirely by the business founder. Add operators at the final onboarding step or setting pages.
                  </div>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {authPortalTab === 'forgot_password' && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="border-b border-white/[0.03] pb-3 mb-1">
                    <h2 className="text-sm font-bold text-orange-400 font-mono tracking-wide uppercase flex items-center gap-2">
                      <KeyRound size={16} />
                      Forgot Access Passcode?
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">Define your registered email to request deep-linked token recovery resources.</p>
                  </div>

                  {forgotSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-400 font-mono text-[10.5px]">
                      {forgotSuccess}
                    </div>
                  )}

                  {forgotSimulatedEmail && (
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-mono text-[9px] text-amber-400 uppercase tracking-wider font-bold">
                        <span>🛠️ Ethereal Sandbox Dispatch</span>
                        <span className="text-[8px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded font-bold">SMTP Simulator</span>
                      </div>
                      <p className="text-[9.5px] text-gray-400 font-mono leading-relaxed">
                        To simplify sandbox preview, toggle the verification deep-link or use the token code on the reset workbench tab:
                      </p>
                      <div className="bg-black/40 border border-white/[0.04] p-3 rounded-xl font-mono text-[10px] text-amber-300 space-y-2">
                        <div>
                          <span className="text-gray-500 block uppercase text-[8px] tracking-wider mb-0.5">Security Link:</span>
                          <a 
                            href={forgotSimulatedEmail.resetLink}
                            onClick={(e) => {
                              e.preventDefault();
                              setResetTokenVal(forgotSimulatedEmail.token);
                              setAuthPortalTab('reset_password');
                              setAuthError(null);
                            }}
                            className="underline text-amber-400 hover:text-amber-200 cursor-pointer break-all block"
                          >
                            {forgotSimulatedEmail.resetLink}
                          </a>
                        </div>
                        <div className="border-t border-white/[0.04] pt-2 flex items-center justify-between">
                          <span>Token Parameter:</span>
                          <span className="bg-amber-500/15 text-amber-350 px-2 py-0.5 rounded text-[10.5px] font-bold select-all cursor-pointer">
                            {forgotSimulatedEmail.token}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!forgotSuccess && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Registered Support / Personal Email</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500 font-mono">
                          <Mail size={14} />
                        </span>
                        <input
                          required
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="specialist@brand.com"
                          className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setAuthPortalTab('selection'); setAuthError(null); setForgotSuccess(null); setForgotSimulatedEmail(null); }}
                      className="flex-1 py-2.8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] text-gray-400 hover:text-gray-200 text-xs font-mono rounded-xl transition cursor-pointer select-none"
                    >
                      Cancel
                    </button>
                    {!forgotSuccess && (
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-mono font-bold uppercase rounded-xl transition duration-155 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 select-none cursor-pointer"
                      >
                        {authLoading ? (
                          <RefreshCw size={14} className="animate-spin text-white" />
                        ) : (
                          <>
                            <span>Request Link</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* RESET PASSWORD FORM */}
              {authPortalTab === 'reset_password' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="border-b border-white/[0.03] pb-3 mb-1">
                    <h2 className="text-sm font-bold text-amber-400 font-mono tracking-wide uppercase flex items-center gap-2">
                      <KeyRound size={16} />
                      Define New Passcode
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">Please specify your dispatched secure verification token and choose a complex passcode.</p>
                  </div>

                  {resetSuccess ? (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-450 font-mono text-[11px] leading-relaxed">
                      🎉 {resetSuccess}
                      <span className="block mt-2 text-[10px] text-gray-450">Redirecting you to security selection portals...</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Secure Recovery Token</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                            <ShieldCheck size={14} />
                          </span>
                          <input
                            required
                            type="text"
                            value={resetTokenVal}
                            onChange={(e) => setResetTokenVal(e.target.value)}
                            placeholder="64-character verification hash"
                            className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-xs text-amber-300 font-mono placeholder:text-gray-700 focus:outline-none focus:border-amber-500/50 transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Complex New Workbench Passcode</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                            <Lock size={14} />
                          </span>
                          <input
                            required
                            type="password"
                            value={resetNewPassword}
                            onChange={(e) => setResetNewPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.8 text-sm text-gray-300 placeholder:text-gray-650 focus:outline-none focus:border-amber-500/50 transition font-mono"
                          />
                        </div>
                        <PasswordStrengthIndicator password={resetNewPassword} />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setAuthPortalTab('selection'); setAuthError(null); setResetSuccess(null); }}
                          className="flex-1 py-2.8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] text-gray-450 hover:text-gray-300 text-xs font-mono rounded-xl transition cursor-pointer select-none"
                        >
                          Selection Portal
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white text-xs font-mono font-bold uppercase rounded-xl transition duration-155 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 select-none cursor-pointer"
                        >
                          {authLoading ? (
                            <RefreshCw size={14} className="animate-spin text-white" />
                          ) : (
                            <>
                              <span>Define Passcode</span>
                              <ArrowRight size={13} />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* Dev Demo Mode Rapid Login Account Grid */}
              <div className="border-t border-white/[0.03] pt-4 mt-4">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2 text-center text-[9px]">
                  🛠️ WORKBENCH SEEDED CO-PILOTS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('harshad@vaani.ai', 'password123')}
                    className="p-3 bg-[#12141c] hover:bg-[#161922] active:bg-orange-500/5 rounded-xl border border-white/[0.03] hover:border-orange-500/20 text-left transition group cursor-pointer select-none"
                  >
                    <div className="text-[11px] font-bold text-orange-400 font-mono transition group-hover:text-orange-300">Harshad (Lead)</div>
                    <div className="text-[9.5px] text-gray-450 mt-0.5 font-sans">Senior Operations</div>
                    <div className="text-[8px] font-mono text-gray-500 mt-1 truncate">harshad@vaani.ai</div>
                    <div className="text-[8.5px] font-mono text-gray-600 mt-0.5 uppercase">Instant Auth</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ashish@vaani.ai', 'vaani2026')}
                    className="p-3 bg-[#12141c] hover:bg-[#161922] active:bg-orange-500/5 rounded-xl border border-white/[0.03] hover:border-orange-500/20 text-left transition group cursor-pointer select-none"
                  >
                    <div className="text-[11px] font-bold text-orange-400 font-mono transition group-hover:text-orange-300">Ashish Sharma</div>
                    <div className="text-[9.5px] text-gray-450 mt-0.5 font-sans">Specialist seat</div>
                    <div className="text-[8px] font-mono text-gray-500 mt-1 truncate">ashish@vaani.ai</div>
                    <div className="text-[8.5px] font-mono text-gray-600 mt-0.5 uppercase">Instant Auth</div>
                  </button>
                </div>
              </div>
                </>
              )}

            </div>
          )}
        </div>
      </div>
    );
  }

  // Fresh Business Onboarding Intercept
  if (settings && !settings.isTrained && employee?.role === 'Business Owner') {
    const getDynamicPreviewReply = (queryText: string, tone: string, languages: string[]) => {
      const q = queryText.toLowerCase();
      const isHinglish = languages.includes("Hinglish");
      const isHindi = languages.includes("Hindi");
      
      if (isHinglish) {
        if (tone === "Local & Empathetic" || tone === "Friendly") {
          return "Bhai, fikar mat kijiye! Aapka packet DTD12498 route par hai aur kal shaam tak aapko delivered ho jayega. Delay ke liye dil se sorry! 🙏";
        } else if (tone === "Professional") {
          return "Namaste, hamen khed hai ki aapke order me delay hua. Humari logs team iski jaanch kar rahi hai aur yah kal shaam tak deliver ho jayega. Dhanyawad!";
        } else {
          return "Hey! Chinta mat karo, aapka order transit mein hai and kal shaam tak deliver ho jayega. Let me know if you need anything else! :)";
        }
      } else if (isHindi) {
        if (tone === "Local & Empathetic" || tone === "Friendly") {
          return "नमस्ते! बिल्कुल भी चिंता न करें। आपका ऑर्डर 'DTD12498' दिल्ली हब से निकल चुका है और कल शाम ६ बजे तक आपके पते पर पहुँच जाएगा। हुई देरी के लिए खेद है। 🙏";
        } else if (tone === "Professional") {
          return "नमस्ते। हमें सूचित करते हुए अत्यंत खेद है कि आपके ऑर्डर में कुछ अपरिहार्य कारणों से विलंब हो गया है। आपका ऑर्डर कल शाम तक वितरित कर दिया जाएगा।";
        } else {
          return "हेलो! परेशान मत होइए, आपका ऑर्डर कल शाम तक आपके पास पहुँच जाएगा। अगर कोई और मदद चाहिए तो बताइएगा!";
        }
      } else {
        if (tone === "Local & Empathetic" || tone === "Friendly") {
          return "Hello! We sincerely apologize for the shipping delay. Please rest assured that your package DTD12498 is en route and will be delivered to you tomorrow evening. Thank you for your immense patience! 🙏";
        } else if (tone === "Professional") {
          return "Dear Valued Customer, we regret the delay in your shipment delivery. Our courier tracking systems confirm it is in transit and scheduled to reach your location tomorrow evening. Respectfully, support office.";
        } else {
          return "Hey there! So sorry about the wait. Your package is currently on its way and should be popping up at your door tomorrow evening. Let me know if you need anything else!";
        }
      }
    };

    const runObIndexing = () => {
      setObIsIndexing(true);
      setObIndexingProgress(5);
      
      const interval = setInterval(() => {
        setObIndexingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setObIsIndexing(false);
            setObReadyPercentage(98);
            return 100;
          }
          return prev + 15 > 100 ? 100 : prev + 15;
        });
      }, 400);
    };

    // Calculate dynamic knowledge score on step 4
    const knowledgeScore = Math.min(100, 40 + (obFaqs.length * 15) + (obUrls.length * 20) + (obSampleChats.length * 15));

    const handleObStepSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validation Check for Step 1
      if (obStep === 1) {
        const errors: Record<string, string> = {};
        if (!settings.companyName.trim()) {
          errors.companyName = "A valid business or brand name is required to initialize security schemas.";
        }
        if (obLanguages.length === 0) {
          errors.languages = "Please select at least one operating support language.";
        }
        if (Object.keys(errors).length > 0) {
          setObValidationErrors(errors);
          return;
        }
        setObValidationErrors({});
        setObStep(2);
        return;
      }

      if (obStep < 5) {
        setObStep(prev => prev + 1);
        return;
      }

      // Compile settings & save to database
      setSettingsSaving(true);
      
      const compiledKB = [
        `Business Identity & Industry: ${settings.businessIndustry || 'Other'} (${obCountry})`,
        `[Operating Support Languages]: ${obLanguages.join(", ")}`,
        `[Primary Support Channel]: ${obChannel}`,
        `[AI Tone Guidelines]: ${obTone}`,
        `[Data Security Rules]: Retention=${obRetention}, PII_Masking_Active=${obMaskNames && obMaskPhones && obMaskTxn}, Safety_Level=${obSafetyMode}`,
        `[In-App FAQ Knowledge Base]:\n${obFaqs.map((f, i) => `${i+1}. Q: ${f.q}\n   A: ${f.a}`).join("\n")}`,
        `[Tethered Ingested URLs]:\n${obUrls.join("\n")}`,
        `[Custom Policies]:\n${settings.aiPolicyInstructions || ''}`
      ].join('\n\n');

      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...settings,
            companyName: settings.companyName,
            businessIndustry: settings.businessIndustry,
            supportTone: obTone,
            defaultGreeting: `Namaste! Welcome to ${settings.companyName} customer support desktop. How can we help you solve your order or transaction issues today?`,
            brandKnowledge: compiledKB,
            aiPolicyInstructions: settings.aiPolicyInstructions || "1. Mask client numbers and transaction ID parameters.\n2. Respect multilingual code-mixed vernacular terms.",
            isTrained: true
          })
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to compile configurations: ", err);
      } finally {
        setSettingsSaving(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#07080c] text-[#f2ede4] font-sans flex flex-col justify-center items-center p-4 relative overflow-y-auto selection:bg-orange-500/30">
        {/* Modern ambient backdrop layout */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]" />
        <div className="absolute top-[10%] left-[10%] h-96 w-96 rounded-full bg-orange-500/[0.02] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[10%] h-96 w-96 rounded-full bg-amber-500/[0.02] blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl z-10 my-8">
          {/* Top Wizard Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-mono tracking-widest text-orange-400 uppercase mb-4 shadow-sm shadow-orange-500/5 font-semibold">
              <Sparkles size={11} className="text-orange-400 animate-pulse" /> COMPLIANCE & GROUNDING ENGINE
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
              Set Up Your Vernacular Agent
            </h1>
            <p className="text-xs text-gray-400 mt-2 font-mono max-w-lg mx-auto leading-relaxed">
              Activate real-time compliance policies, customize AI tone metrics, and simulate responses to complete onboarding in under 10 minutes.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-[#0b0c10]/80 border border-white/[0.04] p-3.5 rounded-2xl mb-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between px-2 text-[10px] font-mono font-bold tracking-wider">
              {[
                { s: 1, label: "IDENTITY" },
                { s: 2, label: "PERSONALITY" },
                { s: 3, label: "SECURITY" },
                { s: 4, label: "KNOWLEDGE" },
                { s: 5, label: "SIMULATOR" }
              ].map((stepObj) => (
                <button
                  key={stepObj.s}
                  type="button"
                  onClick={() => {
                    // Prevent skip to simulation unless step 1 valid
                    if (settings.companyName.trim() && stepObj.s < obStep) {
                      setObStep(stepObj.s);
                    }
                  }}
                  className={`flex flex-col items-center gap-2 transition duration-300 relative ${
                    obStep === stepObj.s 
                      ? "text-orange-400" 
                      : obStep > stepObj.s 
                        ? "text-emerald-400 hover:text-emerald-300" 
                        : "text-gray-600 pointer-events-none"
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-mono text-[10.5px] transition-all ${
                    obStep === stepObj.s 
                      ? "bg-orange-500/10 border-orange-500 text-orange-400 scale-110 shadow-md shadow-orange-500/10" 
                      : obStep > stepObj.s 
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold" 
                        : "bg-black/[0.15] border-white/[0.04] text-gray-600"
                  }`}>
                    {obStep > stepObj.s ? (
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    ) : (
                      stepObj.s
                    )}
                  </div>
                  <span className="hidden sm:inline text-[9px] uppercase tracking-widest">{stepObj.label}</span>
                </button>
              ))}
            </div>
            
            {/* Horizontal progress track line */}
            <div className="relative w-full h-1 bg-white/[0.02] rounded-full mt-3.5 px-3">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((obStep - 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Core Grounding Wizard Content Frame */}
          <div className="bg-[#0c0d12]/95 border border-white/[0.05] shadow-2xl rounded-2xl overflow-hidden">
            
            {/* Step Explanation Ribbon (Guides user through why) */}
            <div className="bg-white/[0.015] border-b border-white/[0.03] py-3.5 px-6 flex items-start gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 border border-orange-500/15 shrink-0 mt-0.5">
                {obStep === 1 && <Smartphone size={14} />}
                {obStep === 2 && <Languages size={14} />}
                {obStep === 3 && <Lock size={14} />}
                {obStep === 4 && <Database size={14} />}
                {obStep === 5 && <Bot size={14} />}
              </div>
              <div>
                <h4 className="text-[11.5px] font-mono tracking-wider font-bold uppercase text-gray-300">
                  {obStep === 1 && "Why Business Identity Matters"}
                  {obStep === 2 && "Defining Brand Persona Metrics"}
                  {obStep === 3 && "PII Protection & Security Shielding"}
                  {obStep === 4 && "Connecting Your Corporate Knowledge Base"}
                  {obStep === 5 && "WhatsApp-Style Conversational Sandbox"}
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  {obStep === 1 && "To design tone accents and ground AI rules properly, we categorize business models and match specific operating layouts by support channels."}
                  {obStep === 2 && "Customer experience hinges on the correct regional dialect translation style. Test language mixes instantly so AI matches customer script styles."}
                  {obStep === 3 && "SaaS products operate inside real client bounds. Toggles mask user identity items, keeping operations safe and GDPR/SLA compliant."}
                  {obStep === 4 && "Feed brand context documents. Real grounding prevents the AI from halluncinatiing pricing details or shipping dates."}
                  {obStep === 5 && "Interact with the trained agent model in real-time. Review identified intent classes, computed safety status, and performance."}
                </p>
              </div>
            </div>

            {/* Stepper Active Form */}
            <form onSubmit={handleObStepSubmit} className="p-6.5 space-y-5 text-left">
              
              {/* STEP 1: BUSINESS IDENTITY FRAME */}
              {obStep === 1 && (
                <div className="space-y-4">
                  {/* Business Name Input */}
                  <div className="space-y-1.5 focus-within:text-orange-400">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                      Business or Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.companyName}
                      onChange={(e) => {
                        setSettings(prev => ({ ...prev, companyName: e.target.value }));
                        if (e.target.value.trim() && obValidationErrors.companyName) {
                          setObValidationErrors(prev => {
                            const copy = { ...prev };
                            delete copy.companyName;
                            return copy;
                          });
                        }
                      }}
                      className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-gray-200 outline-none font-mono"
                      placeholder="e.g. TrendyThreads D2C"
                    />
                    {obValidationErrors.companyName && (
                      <p className="text-[10px] text-orange-400 font-mono flex items-center gap-1">
                        <AlertTriangle size={10} /> {obValidationErrors.companyName}
                      </p>
                    )}
                  </div>

                  {/* Operational Settings - Country and Industry Categorization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                        Target Country of Operations
                      </label>
                      <select
                        value={obCountry}
                        onChange={(e) => setObCountry(e.target.value)}
                        className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-[#f2ede4] outline-none font-mono cursor-pointer"
                      >
                        <option value="India">India (Hinglish/Hindi Core)</option>
                        <option value="Singapore">Singapore / SEA Region</option>
                        <option value="USA">United States (English Only)</option>
                        <option value="United Kingdom">United Kingdom (Generic English)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                        Business Industry Vertical
                      </label>
                      <select
                        value={settings.businessIndustry || 'General Retail & Delivery'}
                        onChange={(e) => setSettings(prev => ({ ...prev, businessIndustry: e.target.value }))}
                        className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-[#f2ede4] outline-none font-mono cursor-pointer"
                      >
                        <option value="General Retail & Delivery">D2C E-Commerce / Retail</option>
                        <option value="SAAS Platform & Tech Support">FinTech & Micro-Lending</option>
                        <option value="Consumer Electronics & Gadgets">Logistics & Fleet Management</option>
                        <option value="Apparel & Fashion Boutique">Product Platform & Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Support Channels Interactive Multi-Cards */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                      Primary Support Delivery Channel Accent
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "WhatsApp", title: "WhatsApp Business API", desc: "Short conversational texts, bulleted briefs, localized words", status: "Active Badge" },
                        { id: "Web Chat", title: "Web Client Chat Popup", desc: "Formatted text, embedded order details tracking panels", status: "Active Panel" },
                        { id: "App SDK", title: "Mobile In-App SDK Window", desc: "Fast single-screen query resolutions, layout parameters", status: "Active Locale" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setObChannel(item.id)}
                          className={`p-3 text-left border rounded-xl transition duration-300 relative overflow-hidden flex flex-col justify-between ${
                            obChannel === item.id 
                              ? "bg-orange-500/[0.03] border-orange-500/50 shadow-md shadow-orange-500/5" 
                              : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${obChannel === item.id ? 'bg-orange-500 animate-ping' : 'bg-gray-600'}`} />
                              <span className="text-[11px] font-bold font-mono text-gray-300">{item.title}</span>
                            </div>
                            <p className="text-[9.5px] text-gray-500 mt-1 leading-relaxed font-sans">{item.desc}</p>
                          </div>
                          
                          {obChannel === item.id && (
                            <div className="mt-2 text-right">
                              <span className="text-[8.5px] font-bold font-mono px-1.5 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded uppercase">Active</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Languages Selector */}
                  <div className="space-y-1.5 bg-black/20 p-3.5 rounded-xl border border-white/[0.03]">
                    <span className="block text-[10.5px] font-mono uppercase tracking-wider text-orange-400 font-bold mb-1">
                      Operating Support Languages (Local & Transliterated Mixes)
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {["Hinglish", "Hindi", "English"].map((lang) => {
                        const active = obLanguages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              if (active) {
                                setObLanguages(prev => prev.filter(l => l !== lang));
                              } else {
                                setObLanguages(prev => [...prev, lang]);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition ${
                              active 
                                ? "bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold" 
                                : "bg-white/[0.01] border-white/[0.04] text-gray-400 hover:text-gray-300 hover:border-white/[0.08]"
                            }`}
                          >
                            {lang === "Hinglish" && "Hinglish (Hindi-Latin Mix)"}
                            {lang === "Hindi" && "Hindi (Native Devanagari)"}
                            {lang === "English" && "English (Standard)"}
                          </button>
                        );
                      })}
                    </div>
                    {obValidationErrors.languages && (
                      <p className="text-[10px] text-orange-400 font-mono mt-1.5 flex items-center gap-1">
                        <AlertTriangle size={10} /> {obValidationErrors.languages}
                      </p>
                    )}
                    <span className="block text-[9.5px] font-sans text-gray-500 italic mt-2.5">
                      ⚡ *Highly Recommended: Hinglish* is default for Indian D2C customer operations to support mixed phrasing like: *"mera package kab tak aayega?"*
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: AI PERSONALITY & LANGUAGE SETUP FRAME */}
              {obStep === 2 && (
                <div className="space-y-4">
                  {/* Personality / Tone Select */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                      Select Primary AI Tone guidelines
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: "Local & Empathetic", title: "Local & Empathetic", badge: "Warm, Transliterated Accent", desc: "Uses vernacular words, polite emoji signs, and says 'bhai / yaara' gently under check." },
                        { id: "Professional", title: "Professional", badge: "Polite, Enterprise Voice", desc: "Structured formatting, absolute respect, zero slang, compliant with SLA guidelines." },
                        { id: "Friendly", title: "Friendly", badge: "Casual, Direct Tone", desc: "Active helper stance, friendly abbreviations, focuses on quick resolution answers." }
                      ].map((toneObj) => (
                        <button
                          key={toneObj.id}
                          type="button"
                          onClick={() => {
                            setObTone(toneObj.id);
                            // Preheat sample query preview instantly
                            const sampleReply = getDynamicPreviewReply(obPreviewQuery, toneObj.id, obLanguages);
                            setObPreviewReply(sampleReply);
                          }}
                          className={`p-3 text-left border rounded-xl transition duration-300 flex flex-col justify-between ${
                            obTone === toneObj.id 
                              ? "bg-orange-500/[0.03] border-orange-500/50 shadow-md shadow-orange-500/5" 
                              : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                          }`}
                        >
                          <div>
                            <span className="text-[11px] font-bold font-mono text-gray-300 block">{toneObj.title}</span>
                            <span className="text-[8.5px] font-mono font-semibold px-1 py-0.5 bg-white/[0.03] border border-white/[0.05] rounded text-orange-400 uppercase mt-1 inline-block">{toneObj.badge}</span>
                            <p className="text-[9.5px] text-gray-500 mt-2 font-sans leading-relaxed">{toneObj.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INTERACTIVE LIVE PREVIEW DRAWER */}
                  <div className="bg-[#101117] border border-white/[0.05] p-4.5 rounded-xl space-y-3 shadow-inner">
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                      <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Bot size={12} className="text-orange-400" /> LIVE AI RESPONSE PREVIEW PRESETS
                      </span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-semibold">Active Engine</span>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[9.5px] font-mono text-gray-500 uppercase font-bold">
                        Draft customer vernacular inquiry
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={obPreviewQuery}
                          onChange={(e) => setObPreviewQuery(e.target.value)}
                          className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none font-mono"
                          placeholder="e.g. bhai mera exchange kab pick hoga?"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setObGenLoading(true);
                            setTimeout(() => {
                              const rep = getDynamicPreviewReply(obPreviewQuery, obTone, obLanguages);
                              setObPreviewReply(rep);
                              setObGenLoading(false);
                            }, 500);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-[10.5px] font-mono px-3.5 py-2 rounded-lg font-bold shadow transition cursor-pointer active:scale-95 shrink-0"
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    {/* Pre-designed presets quick pills to populate client draft */}
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {[
                        "Mera refund kab tak transfer hoga bank me?",
                        "bhai, discount code nahi lag raha welcome",
                        "DTD12498 current tracking location kya hai?"
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setObPreviewQuery(preset);
                            setObGenLoading(true);
                            setTimeout(() => {
                              const r = getDynamicPreviewReply(preset, obTone, obLanguages);
                              setObPreviewReply(r);
                              setObGenLoading(false);
                            }, 450);
                          }}
                          className="text-[9px] font-mono bg-white/[0.02] border border-white/[0.04] px-2 py-1 rounded text-gray-400 hover:text-gray-300 hover:border-white/[0.08]"
                        >
                          "{preset.slice(0, 35)}..."
                        </button>
                      ))}
                    </div>

                    {/* Generative Output Pane */}
                    <div className="bg-[#0b0c10] border border-white/[0.04] rounded-xl p-3.5 space-y-2 relative min-h-[70px] flex flex-col justify-center">
                      {obGenLoading ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-mono py-2">
                          <RefreshCw size={12} className="animate-spin text-orange-400" />
                          <span>Generating model parameters response...</span>
                        </div>
                      ) : (
                        <div className="text-left">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[8.5px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Vernacular Output</span>
                            <span className="text-[9px] text-gray-500 font-mono">Channel formatting active: {obChannel}</span>
                          </div>
                          <p className="text-[11px] font-mono text-gray-300 italic">"{obPreviewReply}"</p>
                          
                          {/* Live Compliance Checks Panel */}
                          <div className="mt-2.5 pt-2 border-t border-white/[0.03] grid grid-cols-2 gap-2 text-[8.5px] font-mono">
                            <div className="text-gray-500">
                              Language Match: <span className="text-emerald-400 font-bold">100% (Colloquial)</span>
                            </div>
                            <div className="text-gray-500">
                              Tone Policy: <span className="text-orange-400 font-bold">{obTone} Accord</span>
                            </div>
                            <div className="text-gray-500">
                              AI Intent: <span className="text-amber-400 font-bold">DISPATCHED_INQUIRY</span>
                            </div>
                            <div className="text-gray-500">
                              PII Safety Shield: <span className="text-emerald-400 font-bold">ACTIVE (Local-runtime Masked)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SECURITY & TRUST CONFIGURATION (Privacy-First Setup) */}
              {obStep === 3 && (
                <div className="space-y-4">
                  {/* Database / Data Retention Options */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                      Customer Personal Data Retention Limit
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "30 Days", title: "30 Days", type: "Minimum Logs" },
                        { id: "90 Days", title: "90 Days", type: "Balanced Compliance" },
                        { id: "365 Days", title: "1 Year", type: "Extended Audit" },
                        { id: "Never (Transient)", title: "Transient Mode", type: "Ultra Secure State" }
                      ].map((ret) => (
                        <button
                          key={ret.id}
                          type="button"
                          onClick={() => setObRetention(ret.id)}
                          className={`p-3 text-left border rounded-xl transition duration-300 flex flex-col justify-between ${
                            obRetention === ret.id 
                              ? "bg-orange-500/[0.03] border-orange-500/50 shadow-md shadow-orange-500/5" 
                              : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                          }`}
                        >
                          <div>
                            <span className="text-[11px] font-bold font-mono text-gray-300 block">{ret.title}</span>
                            <span className="text-[8.5px] font-mono text-orange-400 font-semibold uppercase mt-0.5 block">{ret.type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Safety toggles - PII Masking */}
                  <div className="bg-[#101117] border border-white/[0.05] p-4 rounded-xl space-y-3.5 text-left">
                    <span className="block text-[10.5px] font-mono uppercase tracking-wider text-orange-400 font-bold border-b border-white/[0.03] pb-2">
                      Local-Runtime PII Masking Toggles (GDPR Compliance Active)
                    </span>
                    
                    <div className="space-y-2.5">
                      {/* Name Toggle */}
                      <div className="flex justify-between items-center bg-black/25 px-3.5 py-2.5 rounded-xl border border-white/[0.02]">
                        <div>
                          <span className="text-[11px] font-bold text-gray-300 font-mono block">Mask Customer Full Names</span>
                          <span className="text-[9.5px] text-gray-500 font-sans mt-0.5 block">Replaces operator names directly (e.g. Mohit Verma to M**** V****)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setObMaskNames(!obMaskNames)}
                          className={`px-3 py-1 font-mono text-[9px] uppercase font-bold rounded border transition-all ${
                            obMaskNames 
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                              : "bg-white/[0.02] border-white/[0.05] text-gray-500"
                          }`}
                        >
                          {obMaskNames ? "Shield On" : "Shield Off"}
                        </button>
                      </div>

                      {/* Phone Toggle */}
                      <div className="flex justify-between items-center bg-black/25 px-3.5 py-2.5 rounded-xl border border-white/[0.02]">
                        <div>
                          <span className="text-[11px] font-bold text-gray-300 font-mono block">Mask Customer Phone Numbers</span>
                          <span className="text-[9.5px] text-gray-500 font-sans mt-0.5 block">Masks contacts before foreign API calls (e.g. +91 9988776655 to +91 ******6655)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setObMaskPhones(!obMaskPhones)}
                          className={`px-3 py-1 font-mono text-[9px] uppercase font-bold rounded border transition-all ${
                            obMaskPhones 
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                              : "bg-white/[0.02] border-white/[0.05] text-gray-500"
                          }`}
                        >
                          {obMaskPhones ? "Shield On" : "Shield Off"}
                        </button>
                      </div>

                      {/* Transaction Toggle */}
                      <div className="flex justify-between items-center bg-black/25 px-3.5 py-2.5 rounded-xl border border-white/[0.02]">
                        <div>
                          <span className="text-[11px] font-bold text-gray-300 font-mono block">Mask transaction & billing records</span>
                          <span className="text-[9.5px] text-gray-500 font-sans mt-0.5 block">Hides critical digits from model templates (e.g. TXN89324X to TXN*****X)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setObMaskTxn(!obMaskTxn)}
                          className={`px-3 py-1 font-mono text-[9px] uppercase font-bold rounded border transition-all ${
                            obMaskTxn 
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                              : "bg-white/[0.02] border-white/[0.05] text-gray-500"
                          }`}
                        >
                          {obMaskTxn ? "Shield On" : "Shield Off"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Operational Integrity Safety Mode */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                      AI Response Safety & Automation Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: "Conservative", title: "Conservative Safety", badge: "Human SLA Review Required", desc: "AI only draft responses. Human operators must click accept or insert suggestion before any reply is routed." },
                        { id: "Balanced", title: "Balanced AI Mode", badge: "Semi-Autonomous Auto", desc: "Auto-replies pure enquiries (Courier tracking, stock timeline), escalates refund disputes instantly to human inbox." },
                        { id: "Fast Automation", title: "Instant Automation", badge: "Full Auto Pilot Uptime", desc: "Complete automated resolutions, checks active order status and triggers refunds instantly for user." }
                      ].map((saf) => (
                        <button
                          key={saf.id}
                          type="button"
                          onClick={() => setObSafetyMode(saf.id)}
                          className={`p-3 text-left border rounded-xl transition duration-300 flex flex-col justify-between ${
                            obSafetyMode === saf.id 
                              ? "bg-orange-500/[0.03] border-orange-500/50 shadow-md shadow-orange-500/5" 
                              : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                          }`}
                        >
                          <div>
                            <span className="text-[11px] font-bold font-mono text-gray-300 block">{saf.title}</span>
                            <span className="text-[8px] font-mono font-semibold px-1 py-0.5 bg-white/[0.03] border border-white/[0.05] rounded text-orange-400 uppercase mt-1 inline-block">{saf.badge}</span>
                            <p className="text-[9.5px] text-gray-500 mt-2 font-sans leading-relaxed">{saf.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: KNOWLEDGE SOURCE SETUP FRAME */}
              {obStep === 4 && (
                <div className="space-y-4">
                  {/* Knowledge score indicator */}
                  <div className="bg-[#101117] border border-white/[0.05] p-3.5 rounded-xl flex items-center justify-between text-left">
                    <div>
                      <span className="block text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest mb-1">
                        🚀 GROUNDING READINESS INDEX
                      </span>
                      <p className="text-[9.5px] text-gray-400 leading-relaxed font-sans">
                        Calculated by FAQ density, webpage url compliance index, and sample transactional transcripts provided.
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="h-14 w-14 rounded-full border-4 border-orange-500/20 border-t-orange-500 flex items-center justify-center text-xs font-mono font-bold text-orange-400 shadow shadow-orange-500/10 animate-pulse">
                        {obIsIndexing ? `${obIndexingProgress}%` : `${obReadyPercentage}%`}
                      </div>
                      <span className="text-[8px] font-mono text-gray-500 mt-1 uppercase">Readiness</span>
                    </div>
                  </div>

                  {/* FAQ Builder Section */}
                  <div className="space-y-2 text-left bg-black/25 p-3.5 rounded-xl border border-white/[0.02]">
                    <div className="flex justify-between items-center">
                      <span className="block text-[10.5px] font-mono uppercase tracking-wider text-gray-300 font-bold">
                        📋 Dynamic FAQ Guidelines
                      </span>
                      <span className="text-[9px] font-mono text-orange-400">({obFaqs.length} active documents)</span>
                    </div>

                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {obFaqs.map((faq, idx) => (
                        <div key={idx} className="bg-white/[0.01] border border-white/[0.03] p-2 rounded-lg relative group">
                          <button
                            type="button"
                            onClick={() => setObFaqs(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-2 right-2 text-gray-600 hover:text-orange-400 transition cursor-pointer text-[10px] font-mono"
                          >
                            Remove
                          </button>
                          <span className="text-[10px] text-orange-400 font-mono block">Q: {faq.q}</span>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">A: {faq.a}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add FAQ UI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <input
                        type="text"
                        id="faq_q_input"
                        placeholder="Type question (e.g. Do you ship national?)"
                        className="bg-[#12141c] border border-white/[0.05] rounded p-2 text-[10px] outline-none font-mono text-gray-300"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="faq_a_input"
                          placeholder="Type answers (e.g. Yes within 3 days)"
                          className="w-full bg-[#12141c] border border-white/[0.05] rounded p-2 text-[10px] outline-none font-mono text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const qEl = document.getElementById("faq_q_input") as HTMLInputElement;
                            const aEl = document.getElementById("faq_a_input") as HTMLInputElement;
                            if (qEl && aEl && qEl.value && aEl.value) {
                              setObFaqs(prev => [...prev, { q: qEl.value, a: aEl.value }]);
                              qEl.value = "";
                              aEl.value = "";
                            }
                          }}
                          className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3.5 rounded text-[10px] font-bold font-mono cursor-pointer transition active:scale-95 shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* URL Web scrapers and sample files */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div className="space-y-1.5">
                      <label className="block text-[10.5px] font-mono text-gray-300 uppercase font-bold">
                        📄 Website URL Grounding Target
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={obUrlInput}
                          onChange={(e) => setObUrlInput(e.target.value)}
                          className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-gray-200 outline-none font-mono"
                          placeholder="https://yourbrand.com/returns"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (obUrlInput.trim() && (obUrlInput.startsWith("http://") || obUrlInput.startsWith("https://"))) {
                              setObUrls(prev => [...prev, obUrlInput.trim()]);
                              setObUrlInput("");
                            }
                          }}
                          className="bg-white/[0.02] hover:bg-white/[0.04] p-2 text-xs border border-white/[0.05] text-gray-300 px-3 rounded-xl transition cursor-pointer active:scale-95 shrink-0 font-mono"
                        >
                          Link
                        </button>
                      </div>
                      
                      {obUrls.length > 0 && (
                        <div className="space-y-1 mt-1 font-mono text-[9px] max-h-[60px] overflow-y-auto">
                          {obUrls.map((ur, i) => (
                            <div key={i} className="flex justify-between items-center text-gray-400 bg-white/[0.01] px-2 py-0.5 rounded border border-white/[0.03]">
                              <span>{ur}</span>
                              <button type="button" onClick={() => setObUrls(p => p.filter(it => it !== ur))} className="text-[8px] text-orange-400 hover:underline">Delete</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-between">
                      <div>
                        <label className="block text-[10.5px] font-mono text-gray-300 uppercase font-bold">
                          📈 Sample Conversational Logs
                        </label>
                        <p className="text-[9.5px] text-gray-500 font-sans mt-0.5 leading-relaxed">
                          Provide transcripts or help spreadsheets to train. Supported parameters: CSV, TXT, JSON indices.
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setObSampleChats(prev => [...prev, "chat_sample_1.txt"]);
                          }}
                          className="w-full bg-[#12141c] hover:bg-[#161a25] border border-dashed border-white/[0.08] hover:border-orange-500/20 text-gray-400 p-2 text-center rounded-xl transition cursor-pointer text-[10px] font-mono"
                        >
                          📁 Link chat_logs.txt
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Grounding Engine Compiling Action */}
                  <div className="pt-2 border-t border-white/[0.03] text-center">
                    <button
                      type="button"
                      disabled={obIsIndexing}
                      onClick={runObIndexing}
                      className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-400 border border-orange-500/30 font-bold text-xs font-mono px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-2 mx-auto justify-center"
                    >
                      <RefreshCw size={13} className={`text-orange-400 ${obIsIndexing ? 'animate-spin' : ''}`} />
                      <span>{obIsIndexing ? 'Compiling Grounding Vectors...' : 'Index Grounding Sources Now'}</span>
                    </button>
                    {obIsIndexing && (
                      <div className="mt-2 text-[9px] text-gray-500 font-mono tracking-wider animate-pulse flex items-center justify-center gap-2">
                        {obIndexingProgress < 40 && "🔍 Parsing FAQs documents structure..."}
                        {obIndexingProgress >= 40 && obIndexingProgress < 75 && "🛠️ Masking PII data inputs..."}
                        {obIndexingProgress >= 75 && obIndexingProgress < 100 && "⚡ Launching grounding parameters sync..."}
                        {obIndexingProgress >= 100 && "✔ Vector sync completed successfully."}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: FIRST CONVERSATION SIMULATION & INTEGRATED WORKPLACE ID REGISTRATION */}
              {obStep === 5 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
                  
                  {/* Left Column: WhatsApp-Style Sandbox Chassis (7 cols) */}
                  <div className="lg:col-span-7 bg-[#12141c] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between text-left">
                    
                    {/* Simulator Header */}
                    <div className="bg-[#0b0c10] border-b border-white/[0.04] p-3.5 flex justify-between items-center px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center font-bold text-emerald-400 text-xs">
                          M
                        </div>
                        <div>
                          <h4 className="text-[11px] font-mono font-bold text-gray-300">Mohit Verma (Customer Sandbox)</h4>
                          <span className="text-[8.5px] font-mono text-emerald-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                            WhatsApp Live Webhook Online
                          </span>
                        </div>
                      </div>
                      
                      {/* SLA metrics indicator */}
                      <span className="text-[8.5px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 font-semibold uppercase animate-pulse">
                        <Clock size={10} /> SLA ACTIVE
                      </span>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="p-4 space-y-3.5 min-h-[220px] max-h-[250px] overflow-y-auto bg-black/15 font-mono">
                      {obSimMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col max-w-[85%] ${
                            msg.sender === "Customer" ? "mr-auto items-start" : "ml-auto items-end"
                          }`}
                        >
                          <span className="text-[8px] text-gray-500 mb-0.5 flex items-center gap-1">
                            {msg.sender} • {msg.time}
                          </span>
                          
                          <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                            msg.sender === "Customer" 
                              ? "bg-white/[0.04] border border-white/[0.03] text-gray-300 rounded-tl-none" 
                              : "bg-orange-500/15 border border-orange-500/20 text-orange-300 rounded-tr-none"
                          }`}>
                            <p>{msg.content}</p>

                            {/* Masking status visual verification */}
                            {msg.isAi && (
                              <div className="mt-2.5 pt-1.5 border-t border-orange-500/10 flex items-center justify-between text-[8px] text-orange-400/60 uppercase">
                                <span>Mask Block Mode: Active</span>
                                <span className="bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded font-semibold shrink-0">Safe</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {obSimLoading && (
                        <div className="mr-auto items-start max-w-[80%]">
                          <span className="text-[8px] text-gray-500 mb-0.5">AI Agent (Typing)</span>
                          <div className="bg-[#12141c]/50 p-2 px-3 border border-dashed border-white/[0.05] rounded-2xl rounded-tl-none text-xs text-gray-400 animate-pulse flex items-center gap-1.5">
                            <Bot size={11} className="text-orange-400 animate-bounce" />
                            <span>Checking brand policies...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick simulated client query tags to trigger quick flow */}
                    <div className="bg-black/10 border-t border-white/[0.03] p-2.5 flex flex-wrap gap-1.5 px-3">
                      <span className="text-[8px] text-gray-500 uppercase font-mono tracking-widest block w-full text-[8.5px] font-bold">Recommended Simulated Prompts:</span>
                      {[
                        "Order track kab hoga mera?",
                        "paisa refund karo transaction ID TXN89324X!",
                        "Hey coupon issue haiWELCOME10 check kijiye"
                      ].map((pillText) => (
                        <button
                          type="button"
                          disabled={obSimLoading}
                          onClick={() => {
                            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            setObSimMessages(prev => [...prev, { sender: "Customer", content: pillText, time: timeStr }]);
                            setObSimLoading(true);
                            
                            setTimeout(() => {
                              const dynamicReply = getDynamicPreviewReply(pillText, obTone, obLanguages);
                              setObSimMessages(prev => [...prev, { 
                                sender: "AI Assistant", 
                                content: dynamicReply, 
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                isAi: true
                              }]);
                              setObSimLoading(false);
                            }, 1000);
                          }}
                          className="bg-[#1b1c25] hover:bg-orange-500/15 text-gray-400 hover:text-orange-300 border border-white/[0.03] px-2 py-0.8 rounded text-[9px] font-mono cursor-pointer transition"
                        >
                          "{pillText.slice(0, 30)}..."
                        </button>
                      ))}
                    </div>

                    {/* Chat input form inside simulation */}
                    <div className="p-3 border-t border-white/[0.04] bg-[#0b0c10] flex gap-2">
                      <input
                        type="text"
                        value={obSimInput}
                        onChange={(e) => setObSimInput(e.target.value)}
                        placeholder="Type sandbox customer inquiry..."
                        className="w-full bg-[#12141c] border border-white/[0.04] rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (obSimInput.trim()) {
                            const userMsg = obSimInput.trim();
                            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            setObSimMessages(prev => [...prev, { sender: "Customer", content: userMsg, time: timeStr }]);
                            setObSimInput("");
                            setObSimLoading(true);
                            
                            setTimeout(() => {
                              const dynamicReply = getDynamicPreviewReply(userMsg, obTone, obLanguages);
                              setObSimMessages(prev => [...prev, { 
                                sender: "AI Assistant", 
                                content: dynamicReply, 
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                isAi: true
                              }]);
                              setObSimLoading(false);
                            }, 1000);
                          }
                        }}
                        className="p-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl cursor-pointer transition duration-300 active:scale-95 text-xs font-bold font-mono text-center shadow shrink-0"
                      >
                        Send
                      </button>
                    </div>

                  </div>

                  {/* Right Column: Workplace Employee Registration (Option) (5 cols) */}
                  <div className="lg:col-span-5 bg-[#0c0d12]/90 border border-white/[0.04] p-5.5 rounded-2xl shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="border-b border-white/[0.03] pb-2.5 mb-3.5">
                        <span className="block text-[10px] font-mono text-orange-400 font-bold uppercase tracking-widest bg-orange-500/10 px-2 py-0.8 rounded max-w-fit mb-1.5">OPERATOR ID ASSIGNMENT</span>
                        <h4 className="text-[12.5px] font-bold text-gray-200 font-mono tracking-wide">Onboard Workspace Specialists</h4>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">Define employee seats with unique logins & workspace passcodes.</p>
                      </div>

                      {obRegEmpSuccessMsg && (
                        <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                          ✓ {obRegEmpSuccessMsg}
                        </div>
                      )}

                      {obRegEmpErrorMsg && (
                        <div className="mb-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono">
                          ❌ {obRegEmpErrorMsg}
                        </div>
                      )}

                      <div className="space-y-3 font-mono">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 uppercase tracking-wider block">Specialist Full Name</label>
                          <input
                            type="text"
                            value={obRegEmpName}
                            onChange={(e) => setObRegEmpName(e.target.value)}
                            placeholder="e.g. Ashish Sharma"
                            className="w-full bg-[#12141c] border border-white/[0.05] rounded-lg px-3 py-1.8 text-[11px] text-gray-300 placeholder:text-gray-655 focus:outline-none focus:border-orange-500/40"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase tracking-wider block">Seat Role</label>
                            <select
                              value={obRegEmpRole}
                              onChange={(e) => setObRegEmpRole(e.target.value)}
                              className="w-full bg-[#12141c] border border-white/[0.05] rounded-lg px-2 py-1.8 text-[11px] text-gray-300 focus:outline-none focus:border-orange-500/40 font-semibold cursor-pointer"
                            >
                              <option value="Senior Operations Lead">Admin Lead</option>
                              <option value="Vernacular Specialist">Specialist</option>
                              <option value="Customer Experience Manager">CX Manager</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase tracking-wider block">Passcode</label>
                            <input
                              type="password"
                              value={obRegEmpPassword}
                              onChange={(e) => setObRegEmpPassword(e.target.value)}
                              placeholder="vaani2026"
                              className="w-full bg-[#12141c] border border-white/[0.05] rounded-lg px-3 py-1.8 text-[11px] text-gray-300 placeholder:text-gray-655 focus:outline-none"
                            />
                          </div>
                        </div>
                        <PasswordStrengthIndicator password={obRegEmpPassword} />

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 uppercase tracking-wider block">Assign Support Email</label>
                          <input
                            type="email"
                            value={obRegEmpEmail}
                            onChange={(e) => setObRegEmpEmail(e.target.value)}
                            placeholder="ashish@vaani.ai"
                            className="w-full bg-[#12141c] border border-white/[0.05] rounded-lg px-3 py-1.8 text-[11px] text-gray-300 placeholder:text-gray-655 focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRegisterEmployeeInOnboarding()}
                          className="w-full py-2 bg-white/[0.02] hover:bg-orange-500/10 border border-white/[0.04] hover:border-orange-500/30 text-orange-400 hover:text-orange-350 text-[10.5px] font-bold uppercase rounded-lg transition active:scale-98 cursor-pointer text-center"
                        >
                          + Provision Employee Seat
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-white/[0.03]">
                      <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider block mb-2">PROVISIONED TEAM MEMBERS:</span>
                      <div className="space-y-1.5 max-h-[105px] overflow-y-auto pr-1">
                        {allRegisteredEmployees.map((emp, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/[0.01] border border-white/[0.02] p-2 rounded-lg text-left">
                            <div className="font-mono">
                              <span className="text-[10px] text-gray-300 font-bold block">{emp.name}</span>
                              <span className="text-[8.5px] text-gray-500 block">{emp.email}</span>
                            </div>
                            <span className="text-[8px] font-mono bg-white/[0.03] border border-white/[0.04] px-1.5 py-0.5 rounded text-gray-400 uppercase tracking-wider">
                              {emp.role?.slice(0, 10)}...
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* Step navigations buttons */}
              <div className="pt-4 flex justify-between items-center border-t border-white/[0.04]">
                {obStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setObStep(prev => prev - 1)}
                    className="text-gray-400 hover:text-gray-300 font-mono text-[10.5px] cursor-pointer flex items-center gap-1 px-3 py-2 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] rounded-lg"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {obStep < 5 ? (
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs font-mono px-5 py-2.5 rounded-xl transition duration-300 shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next step</span> →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-[#07080c] font-bold text-xs font-mono px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-2 border border-emerald-400/20 shadow-emerald-500/10"
                  >
                    <span>{settingsSaving ? 'Grounding CRM Workspace...' : 'Complete & Open Workbench ✓'}</span>
                  </button>
                )}
              </div>
              
              {/* Skip to workbench shortcut */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSettings(prev => ({ ...prev, isTrained: true }));
                  }}
                  className="text-gray-600 hover:text-gray-500 font-mono text-[9px] hover:underline"
                >
                  Skip Wizard Setup (Quick Developer Access)
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f2ede4] font-sans flex flex-col antialiased">
      {/* Upper Status Banner - Sleek and Professional */}
      <header className="border-b border-white/[0.04] bg-[#0c0d12] py-4 px-6 flex justify-between items-center z-10 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/15 text-orange-400">
            <Bot size={16} className="shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-white font-sans">
                {t('workbenchTitle')}
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.04] text-gray-400 font-medium border border-white/[0.04]">
                {t('enterpriseConsole')}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Centered Command Palette Shortcut */}
        <button
          onClick={() => {
            setIsCommandBarOpen(true);
            setCommandSearchQuery('');
            setCommandSelectedIndex(0);
          }}
          className="hidden md:flex items-center gap-2.5 bg-white/[0.02] hover:bg-white/[0.05] active:bg-white/[0.01] border border-white/[0.05] hover:border-white/[0.08] px-4 py-2 rounded-xl text-gray-400 hover:text-gray-200 transition-all text-xs font-sans font-medium cursor-pointer select-none max-w-[240px] w-full justify-between"
          title="Open global search & commands"
        >
          <div className="flex items-center gap-2">
            <Search size={13} className="text-orange-500/80 shrink-0" />
            <span className="text-[11px] text-gray-400">Search workbench...</span>
          </div>
          <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-gray-500 border border-white/[0.04] shadow-inner shrink-0 leading-none">
            {typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Mac') !== -1 ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>

        {/* Right Header: Dynamic Connection Sync Badge & Profile Badge */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-mono">
            {connectionError ? (
              <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 text-[10.5px]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Offline Mode</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-[10.5px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Synced</span>
              </span>
            )}
          </div>

          {employee && (
            <div className="flex items-center gap-4 text-xs font-sans border-l border-white/[0.06] pl-4">
              <div className="flex flex-col items-end">
                <span className="text-gray-200 font-semibold text-[12px] flex items-center gap-1">
                  <User size={12} className="text-gray-400" /> {employee.name}
                </span>
                <span className="text-[9px] text-gray-500 font-mono tracking-wide uppercase">
                  {employee.role}
                </span>
              </div>
              <button
                id="header_logout_btn"
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors border border-white/[0.05] hover:border-red-500/25 active:scale-95 text-[10px] font-mono flex items-center gap-1 cursor-pointer select-none"
                title="Logout from workbench"
              >
                <LogOut size={11} />
                <span>LOGOUT</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Rail */}
        <aside className="w-[220px] bg-[#0c0d12] border-r border-white/[0.04] flex flex-col justify-between py-6">
          <div className="space-y-6">
            <div className="px-4">
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-2 mb-3">
                {uiLang === 'en' ? 'Main Console' : 'मुख्य कंसोल'}
              </div>
              <nav className="space-y-1">
                {employee?.role === 'Business Owner' ? (
                  <>
                    {/* SaaS Owner tabs */}
                    <motion.button
                      id="nav_btn_dashboard"
                      onClick={() => setActiveTab('dashboard')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-colors select-none cursor-pointer overflow-hidden ${
                        activeTab === 'dashboard' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'dashboard' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <BarChart3 size={16} className={activeTab === 'dashboard' ? "text-orange-400" : "text-gray-450"} />
                        <span>{uiLang === 'en' ? 'Live dashboard' : 'सक्रिय डैशबोर्ड'}</span>
                      </div>
                    </motion.button>

                    <motion.button
                      id="nav_btn_grounding"
                      onClick={() => setActiveTab('grounding')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-colors select-none cursor-pointer overflow-hidden ${
                        activeTab === 'grounding' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'grounding' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <Sparkles size={16} className={activeTab === 'grounding' ? "text-orange-400" : "text-gray-450"} />
                        <span>{t('groundingTab')}</span>
                      </div>
                    </motion.button>

                    <motion.button
                      id="nav_btn_android"
                      onClick={() => setActiveTab('android')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-colors select-none cursor-pointer overflow-hidden ${
                        activeTab === 'android' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'android' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <Smartphone size={16} className={activeTab === 'android' ? "text-orange-400" : "text-gray-450"} />
                        <span>{t('androidSdk')}</span>
                      </div>
                    </motion.button>

                    <motion.button
                      id="nav_btn_dataset"
                      onClick={() => setActiveTab('dataset')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-colors select-none cursor-pointer overflow-hidden ${
                        activeTab === 'dataset' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'dataset' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <Database size={16} className={activeTab === 'dataset' ? "text-orange-400" : "text-gray-450"} />
                        <span>{t('trainingDataset')}</span>
                        <span className="ml-auto text-[10px] font-mono bg-[#161821] px-1.5 py-0.5 rounded text-gray-450 border border-white/[0.02]">
                          {datasets.length}
                        </span>
                      </div>
                    </motion.button>

                    <motion.button
                      id="nav_btn_subscription"
                      onClick={() => setActiveTab('subscription')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-all select-none cursor-pointer overflow-hidden ${
                        activeTab === 'subscription' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'subscription' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <CreditCard size={16} className={activeTab === 'subscription' ? "text-orange-400" : "text-gray-450"} />
                        <span>{uiLang === 'en' ? 'Subs & Billing' : 'सब्सक्रिप्शन और बिलिंग'}</span>
                        <span className={`ml-auto font-bold font-mono text-[9px] px-1.5 py-0.5 rounded border ${
                          settings?.isSubscribed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15 animate-pulse'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/15'
                        }`}>
                          {settings?.isSubscribed ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </motion.button>

                    <motion.button
                      id="nav_btn_settings"
                      onClick={() => setActiveTab('settings')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-all select-none cursor-pointer overflow-hidden ${
                        activeTab === 'settings' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'settings' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <Sliders size={16} className={activeTab === 'settings' ? "text-orange-400" : "text-gray-450"} />
                        <span>{uiLang === 'en' ? 'Business Settings' : 'व्यवसाय सेटिंग्स'}</span>
                      </div>
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Normal Employee tabs */}
                    <motion.button
                      id="nav_btn_inbox"
                      onClick={() => setActiveTab('inbox')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-colors select-none cursor-pointer overflow-hidden ${
                        activeTab === 'inbox' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'inbox' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <MessageSquare size={16} className={activeTab === 'inbox' ? "text-orange-400" : "text-gray-450"} />
                        <span>{t('supportInbox')}</span>
                        {activeEscalatedCount > 0 && (
                          <span className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                            {activeEscalatedCount}
                          </span>
                        )}
                      </div>
                    </motion.button>

                    {/* Health Metrics Tab - NEW! */}
                    <motion.button
                      id="nav_btn_health"
                      onClick={() => setActiveTab('health')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-colors select-none cursor-pointer overflow-hidden ${
                        activeTab === 'health' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'health' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <Activity size={16} className={activeTab === 'health' ? "text-orange-400" : "text-gray-450"} />
                        <span>{uiLang === 'en' ? 'Health Metrics' : 'स्वास्थ्य मापदंड'}</span>
                      </div>
                    </motion.button>

                    {/* Customer Feedback Tab - NEW! */}
                    <motion.button
                      id="nav_btn_feedback"
                      onClick={() => setActiveTab('feedback')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-colors select-none cursor-pointer overflow-hidden ${
                        activeTab === 'feedback' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'feedback' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <Star size={16} className={activeTab === 'feedback' ? "text-orange-400" : "text-gray-450"} />
                        <span>{uiLang === 'en' ? 'Completed Feedback' : 'पूर्ण फीडबैक'}</span>
                        {tickets.filter(t => t.rating !== undefined && t.rating > 0).length > 0 && (
                          <span className="ml-auto bg-orange-500/15 text-orange-400 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-orange-500/10">
                            {tickets.filter(t => t.rating !== undefined && t.rating > 0).length}
                          </span>
                        )}
                      </div>
                    </motion.button>

                    <motion.button
                      id="nav_btn_playground"
                      onClick={() => setActiveTab('playground')}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex items-center justify-between gap-3 w-full px-3.5 py-3 text-sm rounded-lg font-medium transition-colors select-none cursor-pointer overflow-hidden ${
                        activeTab === 'playground' ? 'text-orange-400 font-semibold shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
                      }`}
                    >
                      {activeTab === 'playground' && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-l-2 border-orange-500"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <Terminal size={16} className={activeTab === 'playground' ? "text-orange-400" : "text-gray-450"} />
                        <span>{t('aiPlayground')}</span>
                      </div>
                    </motion.button>
                  </>
                )}
              </nav>
            </div>

            {/* Collapsible Health & Queue Metrics */}
            <div className="px-4 border-t border-white/[0.03] pt-4">
              <button
                id="btn_toggle_sidebar_stats"
                onClick={() => setShowSidebarStats(!showSidebarStats)}
                className="flex items-center justify-between w-full text-[10px] text-gray-500 hover:text-gray-300 font-mono uppercase tracking-widest pl-2 mb-2 transition-colors select-none cursor-pointer"
              >
                <span>{t('healthMetrics')}</span>
                {showSidebarStats ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>

              {showSidebarStats && (
                <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3 space-y-2 text-[11px] font-mono animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-sans">{t('aiSuccess')}</span>
                    <span className="text-green-400 font-semibold">
                      {totalIncoming > 0 ? Math.round((activeAICount / totalIncoming) * 100) : 100}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-sans">{t('escalatedPriority')}</span>
                    <span className="text-orange-400 font-semibold">{activeEscalatedCount}</span>
                  </div>
                  
                  {/* Advanced Desk Assignment Statistics */}
                  <div className="flex justify-between items-center border-t border-white/[0.03] pt-2">
                    <span className="text-gray-500 font-sans">Claimed by Me</span>
                    <span className={`font-semibold ${myClaimedCount > 0 ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                      {myClaimedCount}
                    </span>
                  </div>

                  {/* Advanced SLA dashboard metrics */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-sans">SLA Breached</span>
                    <span className={`font-semibold ${breachedSlaCount > 0 ? 'text-rose-400 font-bold animate-pulse' : 'text-gray-400'}`}>
                      {breachedSlaCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-sans">Near Breach</span>
                    <span className={`font-semibold ${warningSlaCount > 0 ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
                      {warningSlaCount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/[0.03] pt-2">
                    <span className="text-gray-550 font-sans">Total Managed</span>
                    <span className="font-semibold text-gray-200">{totalIncoming}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick instructions widget */}
          <div className="px-6 text-[10px] text-gray-500 leading-relaxed font-mono">
            <p className="border-t border-white/[0.04] pt-4">
              Designed with Inter Display & JetBrains Mono fonts.
            </p>
          </div>
        </aside>

                {/* Content View Routing Area */}
        <div className="flex-1 flex overflow-hidden">
          <SubscriptionGate activeTab={activeTab} settings={settings} setActiveTab={setActiveTab} uiLang={uiLang}>
            <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <div key="dashboard" className="flex-1 flex flex-col overflow-hidden">
                <DashboardTab
                  employee={employee}
                  loadAiBriefing={loadAiBriefing}
                  briefingLoading={briefingLoading}
                  aiBriefing={aiBriefing}
                  tickets={tickets}
                  setStatusFilter={setStatusFilter}
                  setActiveTab={setActiveTab}
                  setSearchTerm={setSearchTerm}
                  totalIncoming={totalIncoming}
                  activeAICount={activeAICount}
                  breachedSlaCount={breachedSlaCount}
                  activeEscalatedCount={activeEscalatedCount}
                  myClaimedCount={myClaimedCount}
                  setSelectedTicketId={setSelectedTicketId}
                />
              </div>
            )}

            {activeTab === 'inbox' && (
              <div key="inbox" className="flex-1 flex flex-col overflow-hidden">
                <InboxTab
                  selectedTicketId={selectedTicketId}
                  setSelectedTicketId={setSelectedTicketId}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  assignmentFilter={assignmentFilter}
                  setAssignmentFilter={setAssignmentFilter}
                  slaFilter={slaFilter}
                  setSlaFilter={setSlaFilter}
                  sortingOrder={sortingOrder}
                  setSortingOrder={setSortingOrder}
                  filteredTickets={filteredTickets}
                  activeTicket={activeTicket}
                  employee={employee}
                  showSimulator={showSimulator}
                  setShowSimulator={setShowSimulator}
                  setSimName={setSimName}
                  setSimPhone={setSimPhone}
                  setSimMessage={setSimMessage}
                  handleResolveTicket={handleResolveTicket}
                  handleReleaseTicket={handleReleaseTicket}
                  handleClaimTicket={handleClaimTicket}
                  isOrderPanelExpanded={isOrderPanelExpanded}
                  setIsOrderPanelExpanded={setIsOrderPanelExpanded}
                  editCustEmail={editCustEmail}
                  setEditCustEmail={setEditCustEmail}
                  setTickets={setTickets}
                  manualOrderIdInput={manualOrderIdInput}
                  setManualOrderIdInput={setManualOrderIdInput}
                  handleLinkOrder={handleLinkOrder}
                  handleDeclineEscalation={handleDeclineEscalation}
                  handleAcceptEscalation={handleAcceptEscalation}
                  chatEndRef={chatEndRef}
                  handleRegenerateCopilot={handleRegenerateCopilot}
                  isRegeneratingSuggestion={isRegeneratingSuggestion}
                  getSuggestedReplies={getSuggestedReplies}
                  setAgentReplyText={setAgentReplyText}
                  agentReplyText={agentReplyText}
                  handleSendAgentReply={handleSendAgentReply}
                  uiLang={uiLang}
                  t={t}
                  setEmailPreviewContent={setEmailPreviewContent}
                  setIsEmailPreviewOpen={setIsEmailPreviewOpen}
                  tickets={tickets}
                  settings={settings}
                  simChannel={simChannel}
                  setSimChannel={setSimChannel}
                  simName={simName}
                  simPhone={simPhone}
                  simMessage={simMessage}
                  sendClickLanguage={sendClickLanguage}
                  simEndRef={simEndRef}
                  isSimulatingMessage={isSimulatingMessage}
                  selectedRating={selectedRating}
                  setSelectedRating={setSelectedRating}
                  hoveredRating={hoveredRating}
                  setHoveredRating={setHoveredRating}
                  ratingSubmitting={ratingSubmitting}
                  ratingFeedback={ratingFeedback}
                  setRatingFeedback={setRatingFeedback}
                  handleRateTicket={handleRateTicket}
                  aiAskedForDocuments={aiAskedForDocuments}
                  showAttachmentMenu={showAttachmentMenu}
                  setShowAttachmentMenu={setShowAttachmentMenu}
                  handleSendAttachmentSimulator={handleSendAttachmentSimulator}
                  handleSendSimulationMessage={handleSendSimulationMessage}
                  setRatingSubmitting={setRatingSubmitting}
                />
              </div>
            )}

            {activeTab === 'dataset' && (
              <div key="dataset" className="flex-1 flex flex-col overflow-hidden">
                <DatasetTab
                  datasets={datasets}
                  fetchDataset={fetchDataset}
                />
              </div>
            )}

            {activeTab === 'android' && (
              <div key="android" className="flex-1 flex flex-col overflow-hidden">
                <AndroidTab
                  androidFiles={androidFiles}
                  selectedAndroidFilePath={selectedAndroidFilePath}
                  setSelectedAndroidFilePath={setSelectedAndroidFilePath}
                  copiedFile={copiedFile}
                  handleCopyCode={handleCopyCode}
                />
              </div>
            )}

            {activeTab === 'playground' && (
              <div key="playground" className="flex-1 flex flex-col overflow-hidden">
                <PlaygroundTab
                  playgroundQuery={playgroundQuery}
                  setPlaygroundQuery={setPlaygroundQuery}
                  playgroundLoading={playgroundLoading}
                  playgroundResult={playgroundResult}
                  handlePlaygroundTest={handlePlaygroundTest}
                  systemPromptRule={systemPromptRule}
                />
              </div>
            )}

            {activeTab === 'grounding' && (
              <div key="grounding" className="flex-1 flex flex-col overflow-hidden">
                <GroundingTab
                  settings={settings}
                  setSettings={setSettings}
                  settingsSaving={settingsSaving}
                  setSettingsSaving={setSettingsSaving}
                  settingsSaveStatus={settingsSaveStatus}
                  setSettingsSaveStatus={setSettingsSaveStatus}
                  fetchSettings={fetchSettings}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div key="settings" className="flex-1 flex flex-col overflow-hidden">
                <SettingsTab
                  settings={settings}
                  setSettings={setSettings}
                  settingsSaving={settingsSaving}
                  setSettingsSaving={setSettingsSaving}
                  settingsSaveStatus={settingsSaveStatus}
                  setSettingsSaveStatus={setSettingsSaveStatus}
                  fetchSettings={fetchSettings}
                  uiLang={uiLang}
                />
              </div>
            )}

            {activeTab === 'subscription' && (
              <div key="subscription" className="flex-1 flex flex-col overflow-hidden">
                <SubscriptionTab
                  settings={settings}
                  fetchSettings={fetchSettings}
                  customFetch={fetch}
                  uiLang={uiLang}
                  subscriptionTier={subscriptionTier}
                  setSubscriptionTier={setSubscriptionTier}
                />
              </div>
            )}

            {activeTab === 'health' && (
              <div key="health" className="flex-1 flex flex-col overflow-hidden">
                <HealthTab
                  tickets={tickets}
                />
              </div>
            )}

            {activeTab === 'feedback' && (
              <div key="feedback" className="flex-1 flex flex-col overflow-hidden">
                <FeedbackTab
                  tickets={tickets}
                  feedbackSearchQuery={feedbackSearchQuery}
                  setFeedbackSearchQuery={setFeedbackSearchQuery}
                  feedbackRatingFilter={feedbackRatingFilter}
                  setFeedbackRatingFilter={setFeedbackRatingFilter}
                />
              </div>
            )}
          </AnimatePresence>
          </SubscriptionGate>
        </div>
      </div>

      {/* --- GLOBAL COMMAND BAR MODAL (Ctrl+K / Cmd+K) --- */}
      <AnimatePresence>
        {isCommandBarOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 select-none">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandBarOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-xs"
              id="cmd_backdrop"
            />

            {/* Main Centered Command Modal Card Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -6 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-[#0b0c11] border border-white/[0.05] rounded-xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-[65vh] z-10"
              id="cmd_modal"
            >
              {/* Header Input Area & Shortcut Badge */}
              <div className="flex items-center gap-3.5 px-4.5 py-4 border-b border-white/[0.03] bg-[#0c0d12]">
                <Search size={16} className="text-orange-500 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search tickets, conversations, or run a command... (Try 'open ticket 101' or 'settings')"
                  value={commandSearchQuery}
                  onChange={(e) => {
                    setCommandSearchQuery(e.target.value);
                    setCommandSelectedIndex(0);
                  }}
                  onKeyDown={(e) => {
                    const results = getFilteredAndScoredResults();
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setCommandSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setCommandSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (results.length > 0 && commandSelectedIndex < results.length) {
                        const targetItem = results[commandSelectedIndex];
                        if (!targetItem.disabled) {
                          registerCommandClick(targetItem.id);
                          targetItem.action();
                        }
                      }
                    } else if (e.key === 'Tab') {
                      e.preventDefault();
                      if (results.length > 0) {
                        setCommandSearchQuery(results[0].title);
                      }
                    }
                  }}
                  className="w-full bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none placeholder:font-sans font-sans"
                  id="cmd_search_input"
                />
                <button
                  onClick={() => setIsCommandBarOpen(false)}
                  className="text-[9px] font-mono px-2 py-0.5 bg-white/[0.02] border border-white/[0.04] rounded text-gray-500 hover:text-gray-300 transition leading-none select-none cursor-pointer"
                  id="cmd_close_shortcut"
                >
                  ESC
                </button>
              </div>

              {/* Categorized Fuzzy Results Panel */}
              <div className="flex-1 overflow-y-auto p-2 space-y-3.5 min-h-[140px]" id="cmd_results_container">
                {getFilteredAndScoredResults().length === 0 ? (
                  <div className="py-12 text-center text-[10.5px] text-gray-500 font-mono">
                    No matching workspace commands, tickets, or matching message logs found.
                  </div>
                ) : (
                  Object.entries(
                    getFilteredAndScoredResults().reduce<Record<string, CommandItem[]>>((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {})
                  ).map(([cat, items]) => (
                    <div key={cat} className="space-y-1.5" id={`cmd_cat_${cat.toLowerCase()}`}>
                      {/* Sub-Header Section */}
                      <span className="text-[9px] font-mono font-bold tracking-wider text-gray-550 uppercase px-3 pt-1 block select-none">
                        {cat}
                      </span>

                      {/* Section Item Rows */}
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const resultsList = getFilteredAndScoredResults();
                          const globalIdx = resultsList.findIndex(r => r.id === item.id);
                          const isSelected = globalIdx === commandSelectedIndex;

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (!item.disabled) {
                                  registerCommandClick(item.id);
                                  item.action();
                                }
                              }}
                              onMouseEnter={() => setCommandSelectedIndex(globalIdx)}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all border outline-none text-left select-none relative group ${
                                isSelected 
                                  ? 'bg-orange-500/10 border-orange-550/15 text-white' 
                                  : 'bg-transparent border-transparent text-gray-405 hover:bg-white/[0.01]'
                              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              disabled={item.disabled}
                              title={item.tooltip}
                              id={`cmd_item_${item.id}`}
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-orange-500/15 text-orange-400' : 'bg-white/[0.01] border border-white/[0.03] text-gray-550'}`}>
                                  {item.icon}
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="text-[11px] font-medium leading-normal tracking-tight font-sans">
                                    {item.title}
                                  </div>
                                  {item.highlightedSnippet ? (
                                    <div className="text-[10px] font-mono leading-relaxed text-orange-400/90 break-all bg-orange-950/20 px-2 py-1 rounded border border-orange-500/10 mt-1">
                                      {item.highlightedSnippet}
                                    </div>
                                  ) : item.subtitle ? (
                                    <div className="text-[10px] leading-relaxed text-gray-500 truncate font-mono">
                                      {item.subtitle}
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              {/* Action Metadata Indicators */}
                              {item.disabled ? (
                                <span className="text-[8.5px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0 shadow-sm">
                                  Access Restricted
                                </span>
                              ) : item.badge ? (
                                <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded shrink-0 shadow-sm ${item.badgeStyle}`}>
                                  {item.badge}
                                </span>
                              ) : isSelected ? (
                                <span className="text-[8.5px] text-orange-500/70 font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-100 shrink-0 select-none">
                                  <span>ENTER</span> <ChevronRight size={10} />
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Toolbar Footer Bar */}
              <div className="px-4.5 py-3 border-t border-white/[0.03] bg-[#0c0d12] flex flex-wrap gap-x-6 gap-y-2.5 items-center justify-between text-[9px] text-gray-500 font-mono select-none" id="cmd_footer">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.04] text-[8.5px] text-gray-400">↑↓</span> Move
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.04] text-[8.5px] text-gray-400">ENTER</span> Execute
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.04] text-[8.5px] text-gray-400">TAB</span> Auto-complete
                  </span>
                </div>

                {/* Preference Toggle Button for Standalone Tab opens */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !openTicketsInNewTab;
                    setOpenTicketsInNewTab(nextVal);
                    localStorage.setItem('vaani_command_open_new_tab', String(nextVal));
                  }}
                  className="flex items-center gap-2.5 text-gray-400 hover:text-orange-450 font-sans text-xs cursor-pointer select-none py-1 px-2.5 rounded hover:bg-white/[0.01]"
                  id="cmd_toggle_new_tab_pref"
                >
                  <div className={`w-3.5 h-3.5 rounded border border-white/[0.12] flex items-center justify-center transition-all ${openTicketsInNewTab ? 'bg-orange-500 border-orange-600' : 'bg-black/40'}`}>
                    {openTicketsInNewTab && <Check size={10} className="text-[#f2ede4] shrink-0" />}
                  </div>
                  <span className="text-[10.5px]">Open Tickets in Separate Tabs</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROFESSIONAL INVOICE EMAIL CONFIRMATION PREVIEW SYSTEM */}
      <AnimatePresence>
        {isEmailPreviewOpen && emailPreviewContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmailPreviewOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
              id="email_preview_backdrop"
            />

            {/* Simulated Desktop Mail Box Chassis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-[#0c0d12] border border-white/[0.08] rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden max-h-[85vh] z-[101]"
              id="email_preview_modal"
            >
              {/* Mail Window Header */}
              <div className="bg-[#12141c]/90 px-4 py-3.5 border-b border-white/[0.04] flex items-center justify-between select-none shrink-0">
                <div className="flex items-center gap-2">
                  {/* window dots */}
                  <div className="flex items-center gap-1.5 mr-2">
                    <button onClick={() => setIsEmailPreviewOpen(false)} className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5 uppercase tracking-wide font-bold">
                    <Mail size={12} className="text-orange-500" />
                    Support Resolution Mail Inspector
                  </span>
                </div>
                <button
                  onClick={() => setIsEmailPreviewOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Envelope Header info details */}
              <div className="bg-[#0b0c11] px-5 py-4 border-b border-white/[0.04] text-xs font-mono space-y-2 shrink-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-16 select-none uppercase text-[10px]">From Desk:</span>
                  <span className="text-gray-300 bg-white/[0.02] border border-white/[0.03] px-2 py-0.5 rounded text-[11px]">
                    {emailPreviewContent.from}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-16 select-none uppercase text-[10px]">Recipient:</span>
                  <span className="text-orange-400 bg-orange-500/5 border border-orange-500/10 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {emailPreviewContent.to}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 w-16 select-none uppercase text-[10px] mt-0.5">Subject:</span>
                  <span className="text-white font-bold leading-normal font-sans text-[12px]">
                    {emailPreviewContent.subject}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/[0.02] mt-2 leading-none select-none">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-emerald-400" /> Transmitted securely over SES proxy relays
                  </span>
                  <span>Sent: {new Date(emailPreviewContent.sentAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Email Content Sandbox Iframe Render */}
              <div className="flex-1 bg-gray-150 overflow-y-auto p-4 flex justify-center">
                <div 
                  className="w-full bg-white shadow-inner rounded-sm overflow-hidden border border-gray-200 text-left max-w-[580px] p-2"
                  dangerouslySetInnerHTML={{ __html: emailPreviewContent.html }}
                />
              </div>

              {/* Action bar and status indicator */}
              <div className="bg-[#12141c]/90 px-5 py-3 border-t border-white/[0.04] flex items-center justify-between font-mono shrink-0 select-none">
                <span className="text-[9.5px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5 bg-emerald-500/[0.03] px-2 py-0.5 rounded border border-emerald-500/5 font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STATUS: LIVE DISPATCHED SUCCESS
                </span>
                <button
                  onClick={() => setIsEmailPreviewOpen(false)}
                  className="px-4 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl text-gray-300 hover:text-white transition text-xs font-semibold cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
