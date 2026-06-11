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

  if (intent === 'ORDER_TRACKING') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! हमने चेक किया है: आपका ऑर्डर 'DTD12498' दिल्ली हब से डिस्पैच हो चुका है। यह कल शाम ६ बजे से पहले डिलीवर हो जाएगा। कृपया धैर्य रखें!";
    } else {
      supportText = "Hello! Quick status update regarding your shipment: our logistics team confirms package DTD12498 is dispatched and in transit via the Delhi hub. It is scheduled for delivery tomorrow before 6 PM. Thank you!";
    }
  } else if (intent === 'REFUND_STATUS') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! कृपया निश्चिंत रहें। आपके ऑर्डर का INR 1,499 का रिफंड प्रक्रिया में है (UPI Ref ID: TXN89324X)। यह ३ से ५ व्यावसायिक दिनों में आपके खाते में जुड़ जाएगा। धन्यवाद।";
    } else {
      supportText = "Hello! We apologize for the delay. Your refund of INR 1,499 has been authorized and initiated to your source payment account (UPI Ref: TXN89324X). It should reflect in your statement within 3-5 business days.";
    }
  } else if (intent === 'RETURN_REQUEST') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! रिप्लेसमेंट/रिटर्न अरेंज कर दिया गया है। आप ऐप के पर 'My Orders' सेक्शन में जाकर 'Return/Exchange' दर्ज कर सकते हैं। सोमवार सुबह हमारा एजेंट डिलीवरी पिकअप के लिए आएगा।";
    } else {
      supportText = "Hello! We've scheduled a pickup for this return. Please initiate the request from the 'My Orders' screen, select 'Return/Exchange' along with your size/item correction preference. A courier will collect it Monday morning.";
    }
  } else if (intent === 'COUPON_ISSUES') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! यदि पुराना कूप कोड नहीं चल रहा, तो कृपया 'WELCOME10' कूपन कोड दर्ज करें, यह आपको तत्काल आपके कार्ट मूल्य पर १०% की अतिरिक्त छूट प्रदान करेगा।";
    } else {
      supportText = "Hello! It appears the code was invalid. To fix this, please try using coupon code 'WELCOME10' at checkpoint for an instant flat 10% cash discount on your total cart checkout value.";
    }
  } else if (intent === 'HUMAN_ESCALATION') {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! हमारे वरिष्ठ सहायता विशेषज्ञ चर्चा में शामिल हो सकते हैं, लेकिन तब तक क्या मैं आपके ऑर्डर नंबर या समस्या का विवरण जानकर सीधे समाधान करने में आपकी कोई और मदद कर सकता हूँ?";
    } else {
      supportText = "Hello! A senior support associate can be looped in, but in the meantime, please let me know your order number or query details so I can attempt to solve this directly for you right away!";
    }
  } else {
    if (isHindiOrHinglish) {
      supportText = "नमस्ते! वाणीAI कस्टमर केयर टीम में आपका स्वागत है। हम आपके विवरण की जाँच कर रहे हैं और तत्काल समाधान के साथ प्रस्तुत होंगे।";
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
