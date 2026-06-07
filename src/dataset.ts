import { DatasetItem } from './types';

export const vernacularDataset: DatasetItem[] = [
  {
    id: "ds_1",
    query: "Mera order abhi tak mila nahi hai, DTDC tracking me delay dikha raha hai. Kab tak aayega?",
    language: "Hinglish (Hindi-English)",
    intent: "ORDER_TRACKING",
    sentiment: "Negative",
    shouldEscalate: false,
    expectedReply: "नमस्ते! आपके ऑर्डर की ट्रैकिंग जांचने पर पता चला है कि वह रास्ते में है और अगले 24-48 घंटों में डिलीवर हो जाएगा। अपडेट के लिए हम आपको एसएमएस भेजेंगे।",
    scriptType: "Latin/Transliterated"
  },
  {
    id: "ds_2",
    query: "Item ka size bohot small hai. Mujhe L size exchange karna hai, return process kya hai?",
    language: "Hinglish (Hindi-English)",
    intent: "RETURN_REQUEST",
    sentiment: "Neutral",
    shouldEscalate: false,
    expectedReply: "नमस्ते! आप 'My Orders' सेक्शन में जाकर अपने लिए नया 'L' साइज एक्सचेंज चुन सकते हैं। कुरियर बॉय आकर आपका पुराना प्रोडक्ट ले जाएगा।",
    scriptType: "Latin/Transliterated"
  },
  {
    id: "ds_3",
    query: "Mera refund abhi tak account me nahi aaya. Maine GPay kiya tha par block ho gaya kya?",
    language: "Hinglish (Hindi-English)",
    intent: "REFUND_STATUS",
    sentiment: "Negative",
    shouldEscalate: true,
    expectedReply: "नमस्ते! हम असुविधा के लिए क्षमा चाहते हैं। रिफंड आपके मोड ऑफ पेमेंट (GPay) में 3-5 वर्किंग डेज में क्रेडिट हो जाएगा। हम इसे प्राथमिकता पर देख रहे हैं।",
    scriptType: "Latin/Transliterated"
  },
  {
    id: "ds_4",
    query: "Please share some active coupon codes. Naya order pe extra discount chahiye.",
    language: "English",
    intent: "COUPON_ISSUES",
    sentiment: "Positive",
    shouldEscalate: false,
    expectedReply: "Hello! You can use coupon code 'WELCOME10' to receive an instant 10% discount on your checkout cart.",
    scriptType: "Native"
  },
  {
    id: "ds_5",
    query: "Bakwaas service! I want to speak to your manager right now! Refund my money immediately.",
    language: "English",
    intent: "HUMAN_ESCALATION",
    sentiment: "Angry",
    shouldEscalate: true,
    expectedReply: "We sincerely apologize for the frustration. I am routing your ticket directly to our senior floor manager immediately. They will contact you shortly.",
    scriptType: "Native"
  },
  {
    id: "ds_6",
    query: "Mera payment gateway fail ho gaya, par bank account se paise kat chuke hain.",
    language: "Hinglish (Hindi-English)",
    intent: "REFUND_STATUS",
    sentiment: "Negative",
    shouldEscalate: true,
    expectedReply: "कभी-कभी गेटवे में रुकावट के कारण भुगतान अटक जाता है। यदि आपके खाते से पैसे कट गए हैं, तो वे 3 से 5 व्यावसायिक दिनों में स्वतः वापस आ जाएंगे। निश्चिंत रहें।",
    scriptType: "Latin/Transliterated"
  },
  {
    id: "ds_7",
    query: "Can I change my delivery address to Mumbai instead of Bangalore?",
    language: "English",
    intent: "DELIVERY_COMPLAINT",
    sentiment: "Neutral",
    shouldEscalate: true,
    expectedReply: "Yes, address updates can be made if the order has not been dispatched. I will forward this to shipping operations immediately.",
    scriptType: "Native"
  },
  {
    id: "ds_8",
    query: "Bhai koi badhiya sa discount code dedo, hum regular order karte hain aapse.",
    language: "Hinglish (Hindi-English)",
    intent: "COUPON_ISSUES",
    sentiment: "Positive",
    shouldEscalate: false,
    expectedReply: "नमस्ते! हमारे साथ बने रहने के लिए धन्यवाद। आप 'LOYAL5' कोड का उपयोग करके अपनी कार्ट बुकिंग पर 5% अतिरिक्त छूट पा सकते हैं।",
    scriptType: "Latin/Transliterated"
  },
  {
    id: "ds_9",
    query: "मेरा पार्सल कब तक पहुंचेगा? दिल्ली से चला था पर ३ दिन से कोई अपडेट नहीं है।",
    language: "Hindi (Native)",
    intent: "ORDER_TRACKING",
    sentiment: "Negative",
    shouldEscalate: false,
    expectedReply: "नमस्ते! आपके ऑर्डर की ताजा स्थिति इंगित करती है कि यह पारगमन में है। हम कूरियर पार्टनर से संपर्क करके डिलीवरी में तेजी लाने का प्रयास कर रहे हैं।",
    scriptType: "Native"
  },
  {
    id: "ds_10",
    query: "Wrong item delivered! Maine red saree mangayi thi par yellow dress bhej diya aapne. Replace fast.",
    language: "English",
    intent: "RETURN_REQUEST",
    sentiment: "Negative",
    shouldEscalate: true,
    expectedReply: "We are extremely sorry for sending the wrong item. We have registered an instant exchange request, and a courier rider will replace this with the original red saree inside 48 hours.",
    scriptType: "Native"
  },
  {
    id: "ds_11",
    query: "Please expedite delivery, it is a birthday gift for my special friend. Need by tomorrow.",
    language: "English",
    intent: "ORDER_TRACKING",
    sentiment: "Neutral",
    shouldEscalate: false,
    expectedReply: "Thank you for letting us know! We have contacted our shipping partner and prioritized your order for express priority delivery by tomorrow evening.",
    scriptType: "Native"
  },
  {
    id: "ds_12",
    query: "GPay payment failed check. Refund status clear karo please.",
    language: "Hinglish (Hindi-English)",
    intent: "REFUND_STATUS",
    sentiment: "Negative",
    shouldEscalate: false,
    expectedReply: "नमस्ते! अगर पेमेंट फेल हुआ है और बैंक से अमाउंट डिडक्ट हो चुका है, तो वो 3-5 वर्किंग डेज में खुद ही बैंक वापस कर देगा। चिंता न करें।",
    scriptType: "Latin/Transliterated"
  }
];
