import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Ticket, Message, DatasetItem, Order } from '../src/types';
import { vernacularDataset } from '../src/dataset';
import { SecuredEmployee, Settings } from './types';

// Load Firebase configuration explicitly via fs to guarantee ES compatibility
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));

export const firebaseApp = initializeApp({
  projectId: firebaseConfig.projectId
});

export let firestoreInstance = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

try {
  firestoreInstance.settings({ ignoreUndefinedProperties: true });
} catch (e) {
  console.warn("Failed to set ignoreUndefinedProperties on primary firestoreInstance:", e);
}

export let isUsingCustomDatabase = !!firebaseConfig.firestoreDatabaseId;
export let firestoreAuthErrorDetected = { value: false }; // Packaged object to keep other modules synced

// Proxy interface to dynamic firestoreInstance to keep rest of codebase compatible
export const firestore = {
  collection(name: string) {
    return firestoreInstance.collection(name);
  },
  batch() {
    return firestoreInstance.batch();
  }
};

export const handleFirestoreErrorAndCheckFallback = async (err: any, retryFn?: () => Promise<any>): Promise<any> => {
  const errMsg = (err?.message || String(err)).toUpperCase();
  const errCode = err?.code;
  const isFallbackNeeded = 
    errMsg.includes('PERMISSION_DENIED') || 
    errMsg.includes('INSUFFICIENT PERMISSIONS') ||
    errMsg.includes('INSUFFICIENT_PERMISSIONS') ||
    errMsg.includes('NOT_FOUND') ||
    errMsg.includes('NOT FOUND') ||
    errCode === 5 ||
    errCode === 7 ||
    errCode === 16 ||
    String(errCode) === '5' ||
    String(errCode) === '7' ||
    String(errCode) === '16';

  if (isFallbackNeeded) {
    if (isUsingCustomDatabase) {
      console.log("[Firestore] Custom database not yet reachable or lacks credentials. Gradual recovery: retrying on standard (default) database...");
      firestoreInstance = getFirestore(firebaseApp);
      try {
        firestoreInstance.settings({ ignoreUndefinedProperties: true });
      } catch (e) {
        console.warn("Failed to set ignoreUndefinedProperties on fallback firestoreInstance:", e);
      }
      isUsingCustomDatabase = false;
      if (retryFn) {
        try {
          return await retryFn();
        } catch (retryErr: any) {
          const retryMsg = (retryErr?.message || String(retryErr)).toUpperCase();
          const retryCode = retryErr?.code;
          const isRetryFallbackNeeded = 
            retryMsg.includes('PERMISSION_DENIED') || 
            retryMsg.includes('INSUFFICIENT PERMISSIONS') ||
            retryMsg.includes('INSUFFICIENT_PERMISSIONS') ||
            retryMsg.includes('NOT_FOUND') ||
            retryMsg.includes('NOT FOUND') ||
            retryCode === 5 ||
            retryCode === 7 ||
            retryCode === 16 ||
            String(retryCode) === '5' ||
            String(retryCode) === '7' ||
            String(retryCode) === '16';

          if (isRetryFallbackNeeded) {
            if (!firestoreAuthErrorDetected.value) {
              console.log("[Firestore] Default database also has restricted credentials or is not initialized. Activating high-uptime local backup JSON storage.");
              firestoreAuthErrorDetected.value = true;
            }
          } else {
            throw retryErr;
          }
        }
      }
    } else {
      if (!firestoreAuthErrorDetected.value) {
        console.log("[Firestore] Active database not yet reachable. Activating high-uptime local backup JSON storage.");
        firestoreAuthErrorDetected.value = true;
      }
    }
  } else {
    throw err;
  }
};

// Seed initial empty operational tickets so customers can add them manually via the simulator
export let tickets: Ticket[] = [];

// Seeding mock orders database with realistic orders
export const mockOrders: Order[] = [
  {
    id: "OD-90210",
    customerName: "Rahul Sharma",
    itemName: "Premium Silk Kurta Set",
    status: "In Transit",
    paymentMode: "UPI (Paytm)",
    cost: 2199,
    carrier: "Delhivery Tracker",
    estimatedDelivery: "Expected in 2 days"
  },
  {
    id: "OD-70415",
    customerName: "Priya Patel",
    itemName: "Cotton Anarkali Dress",
    status: "Shipped",
    paymentMode: "Net Banking",
    cost: 3499,
    carrier: "BlueDart Express",
    estimatedDelivery: "Expected tomorrow by 5 PM"
  },
  {
    id: "OD-30912",
    customerName: "Amit Verma",
    itemName: "Classic Denim Jacket",
    status: "Delivered",
    paymentMode: "Cash on Delivery",
    cost: 1899,
    carrier: "Ecom Express",
    estimatedDelivery: "Delivered yesterday"
  }
];

export function detectAndAssignOrder(ticket: Ticket) {
  if (!ticket.messages || ticket.messages.length === 0) return;
  const allText = ticket.messages.map(m => m.content).join(" ").toUpperCase() + " " + (ticket.customerName || "").toUpperCase();
  
  // 1. Check literal ID matches
  for (const ord of mockOrders) {
    if (allText.includes(ord.id.toUpperCase())) {
      ticket.orderId = ord.id;
      ticket.orderDetail = ord;
      return;
    }
    // Match numeric part as fallback (e.g. "90210" for OD-90210)
    const numericPart = ord.id.replace("OD-", "");
    if (allText.includes(numericPart)) {
      ticket.orderId = ord.id;
      ticket.orderDetail = ord;
      return;
    }
  }

  // 2. Generic match of any OD-XXXXX
  const regex = /OD[- ]?(\d{4,6})/gi;
  let match;
  while ((match = regex.exec(allText)) !== null) {
    const matchedDigits = match[1];
    const foundId = `OD-${matchedDigits}`;
    const ord = mockOrders.find(o => o.id === foundId);
    if (ord) {
      ticket.orderId = ord.id;
      ticket.orderDetail = ord;
      return;
    } else {
      // Dynamic fallback order tailored for requested item or general apparel
      const newOrder: Order = {
        id: foundId,
        customerName: ticket.customerName || "Customer",
        itemName: "Standard Order Item",
        status: "In Transit",
        paymentMode: "UPI (Paytm)",
        cost: 2199,
        carrier: "Delhivery Tracker",
        estimatedDelivery: "Within 3-4 working days"
      };
      mockOrders.push(newOrder);
      ticket.orderId = foundId;
      ticket.orderDetail = newOrder;
      return;
    }
  }

  // 3. Match pure digits matching pre-seeded order numbers
  const digitsMatch = allText.match(/\b\d{4,6}\b/);
  if (digitsMatch) {
    const digits = digitsMatch[0];
    const foundId = `OD-${digits}`;
    const ord = mockOrders.find(o => o.id === foundId || o.id.includes(digits));
    if (ord) {
      ticket.orderId = ord.id;
      ticket.orderDetail = ord;
      return;
    }
  }

  // Fallback check: if the customer name matches any mock order customer name
  const matchedByName = mockOrders.find(o => o.customerName.toLowerCase() === ticket.customerName.toLowerCase());
  if (matchedByName) {
    ticket.orderId = matchedByName.id;
    ticket.orderDetail = matchedByName;
  }
}

// Current local intents database
export let datasets: DatasetItem[] = [...vernacularDataset];

// Persistent Employee Database File Config
export const EMPLOYEES_FILE = path.join(process.cwd(), 'users.json');

export let employees: SecuredEmployee[] = [];

export const saveEmployees = () => {
  try {
    fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(employees, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to persist employee record to DB file:", err);
  }
};

export const loadEmployees = () => {
  try {
    if (fs.existsSync(EMPLOYEES_FILE)) {
      const data = fs.readFileSync(EMPLOYEES_FILE, 'utf8');
      const parsed = JSON.parse(data);
      employees.length = 0;
      employees.push(...parsed);
      console.log(`Backend employee DB loaded: ${employees.length} records active.`);
    } else {
      // Default standard workbench employees seeds
      const seeds = [
        {
          id: "emp_1",
          email: "harshad@vaani.ai",
          name: "Harshad Phadtare",
          role: "Senior Operations Lead",
          passwordHash: "password123",
          createdAt: new Date().toISOString()
        },
        {
          id: "emp_2",
          email: "ashish@vaani.ai",
          name: "Ashish Sharma",
          role: "Vernacular Specialist",
          passwordHash: "vaani2026",
          createdAt: new Date().toISOString()
        },
        {
          id: "emp_103",
          email: "handy103@gmail.com",
          name: "Handy Agent",
          role: "Business Owner",
          passwordHash: "password123",
          createdAt: new Date().toISOString()
        },
        {
          id: "emp_104",
          email: "donaldtrump01@gmail.com",
          name: "Donald Trump",
          role: "Business Owner",
          passwordHash: "Hmss@9594",
          createdAt: new Date().toISOString()
        }
      ];
      employees.length = 0;
      employees.push(...seeds);
      saveEmployees();
      console.log("Backend seeded new employee records.");
    }
  } catch (err) {
    console.warn("Using in-memory employee database fallback:", err);
  }
};

// Global settings
export let globalSettings: Settings = {
  companyName: "XYZ Corp",
  supportEmail: "support@xyz.com",
  slaMinutes: 10,
  botEnabled: true,
  defaultGreeting: "Welcome to our Support Assist! How can we help you today with your order?",
  aiPolicyInstructions: "1. Always be highly empathetic, polite, and respect dynamic vernacular phrasing.\n2. When client claims delivery issues, apologize sincerely and say our courier wing is investigating.\n3. Keep responses brief, under 3 sentences where possible.\n4. Do not offer discounts or cash refunds unless the purchase status is confirmed broken/lost.",
  isTrained: false, // Starts as false to simulate new/fresh business onboarding!
  businessIndustry: "General Retail & Delivery",
  supportTone: "Empathetic, Polite, Professional",
  brandKnowledge: "We sell supreme custom commodities and general utility goods. Delivery takes 3-5 days. Return policy accepts items with original tags intact.",
  isSubscribed: false, // Inactive by default! Owner must purchase in subs & billing hub
  subscriptionPlan: 'monthly',
  subscriptionTier: 'PRO',
  subscriptionExpiresAt: "",
  subscriptionDaysLeft: 0,
  subscriptionStartedAt: ""
};

// --- Multi-Tenant & Company Settings ---
export let companySettings: { [companyName: string]: Settings } = {};

export const loadCompanySettings = () => {
  try {
    const file = path.join(process.cwd(), 'company-settings.json');
    if (fs.existsSync(file)) {
      companySettings = JSON.parse(fs.readFileSync(file, 'utf8'));
      console.log(`Loaded ${Object.keys(companySettings).length} company settings from local file backup.`);
    }
  } catch (err) {
    console.error("Failed to load company settings:", err);
  }
};

export const saveCompanySettings = () => {
  try {
    const file = path.join(process.cwd(), 'company-settings.json');
    fs.writeFileSync(file, JSON.stringify(companySettings, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to save company settings:", err);
  }
};

export const getSubscriptionDaysLeft = (expiresAtStr?: string): number => {
  if (!expiresAtStr) return 0;
  const expiresAt = new Date(expiresAtStr);
  const diffTime = expiresAt.getTime() - Date.now();
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getSettingsForCompany = (companyName?: string): Settings => {
  let settings: Settings;
  if (companyName && companySettings[companyName]) {
    settings = companySettings[companyName];
  } else {
    settings = {
      ...globalSettings,
      companyName: companyName || globalSettings.companyName
    };
  }

  // Calculate dynamic countdown remaining if subscribed
  if (settings.isSubscribed && settings.subscriptionExpiresAt) {
    const days = getSubscriptionDaysLeft(settings.subscriptionExpiresAt);
    settings.subscriptionDaysLeft = days;
    if (days <= 0) {
      settings.isSubscribed = false;
      settings.subscriptionDaysLeft = 0;
    }
  } else {
    settings.subscriptionDaysLeft = 0;
  }

  return settings;
};

export const saveCompanySettingsToFirestore = async (companyName: string, settings: Settings) => {
  saveCompanySettings();
  if (firestoreAuthErrorDetected.value) return;
  try {
    const docId = companyName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    // Safely remove any undefined properties to satisfy Firestore document schema
    const sanitizedSettings = JSON.parse(JSON.stringify(settings));
    await firestore.collection('company_settings').doc(docId).set(sanitizedSettings);
  } catch (e) {
    console.warn(`Firestore saveCompanySettings failed to sync: ${e instanceof Error ? e.message : e}`);
  }
};

export const loadCompanySettingsFromFirestore = async () => {
  loadCompanySettings();
  if (firestoreAuthErrorDetected.value) return;
  try {
    const snapshot = await firestore.collection('company_settings').get();
    snapshot.forEach(doc => {
      const data = doc.data() as Settings;
      if (data && data.companyName) {
        companySettings[data.companyName] = data;
      }
    });
    console.log(`Loaded ${snapshot.size} company settings configurations from Firestore cloud.`);
  } catch (e) {
    console.warn("Firestore loadCompanySettings failed: using local fallback.");
  }
};

export const saveTicketsToLocalBackup = () => {
  try {
    const localTicketsPath = path.join(process.cwd(), 'local-tickets.json');
    fs.writeFileSync(localTicketsPath, JSON.stringify(tickets, null, 2), 'utf-8');
    console.log("Operational tickets successfully backed up to local JSON storage.");
  } catch (e) {
    console.error("Failed to write local-tickets.json backup:", e);
  }
};

export const saveTicketToFirestore = async (ticket: Ticket) => {
  // Always update our local backup first
  saveTicketsToLocalBackup();
  
  if (firestoreAuthErrorDetected.value) return;

  const runWrite = async () => {
    const { messages, ...ticketMeta } = ticket;
    const ticketRef = firestore.collection('tickets').doc(ticket.id);
    
    // Safely remove any undefined properties
    const metaToSave = JSON.parse(JSON.stringify(ticketMeta));
    
    await ticketRef.set({
      ...metaToSave,
      updatedAt: new Date().toISOString()
    });
    
    if (messages && messages.length > 0) {
      const batch = firestore.batch();
      messages.forEach(msg => {
        const msgRef = ticketRef.collection('messages').doc(msg.id);
        const msgToSave = JSON.parse(JSON.stringify(msg));
        batch.set(msgRef, msgToSave);
      });
      await batch.commit();
    }
  };

  try {
    await runWrite();
  } catch (err: any) {
    try {
      await handleFirestoreErrorAndCheckFallback(err, runWrite);
    } catch (e) {
      console.warn(`Firestore saveTicket: Ticket successfully saved locally, but remote Cloud Sync was skipped (${e?.message || String(e)})`);
    }
  }
};

export const saveMessageToFirestore = async (ticketId: string, message: Message) => {
  // Always update our local backup first
  saveTicketsToLocalBackup();

  if (firestoreAuthErrorDetected.value) return;

  const runWrite = async () => {
    const ticketRef = firestore.collection('tickets').doc(ticketId);
    await ticketRef.update({ updatedAt: new Date().toISOString() });
    
    const msgRef = ticketRef.collection('messages').doc(message.id);
    const msgToSave = JSON.parse(JSON.stringify(message));
    await msgRef.set(msgToSave);
  };

  try {
    await runWrite();
  } catch (err: any) {
    try {
      await handleFirestoreErrorAndCheckFallback(err, runWrite);
    } catch (e) {
      console.warn(`Firestore saveMessage: Message successfully saved locally, but remote Cloud Sync was skipped (${e?.message || String(e)})`);
    }
  }
};

export const loadSettingsFromFirestore = async () => {
  // Try loading from local backup first if available
  const localSettingsPath = path.join(process.cwd(), 'local-settings.json');
  if (fs.existsSync(localSettingsPath)) {
    try {
      globalSettings = JSON.parse(fs.readFileSync(localSettingsPath, 'utf-8'));
      console.log("Global settings loaded from local-settings.json backup:", globalSettings);
    } catch (e) {
      console.error("Failed to load local settings backup:", e);
    }
  }

  if (firestoreAuthErrorDetected.value) return;

  const runRead = async () => {
    const docRef = firestore.collection('settings').doc('global');
    const doc = await docRef.get();
    if (doc.exists) {
      globalSettings = doc.data() as Settings;
      console.log("Global settings loaded from Firestore:", globalSettings);
    } else {
      await docRef.set(globalSettings);
      console.log("Initial settings seeded to Firestore.");
    }
  };

  try {
    await runRead();
  } catch (err: any) {
    try {
      await handleFirestoreErrorAndCheckFallback(err, runRead);
    } catch (e) {
      console.warn("Using local backup settings (remote Cloud Sync was skipped/unauthorized):", e?.message || String(e));
    }
  }
};

export const loadTicketsFromFirestore = async () => {
  // Try loading from local backup first if available
  const localTicketsPath = path.join(process.cwd(), 'local-tickets.json');
  if (fs.existsSync(localTicketsPath)) {
    try {
      const backupTickets = JSON.parse(fs.readFileSync(localTicketsPath, 'utf-8')) as Ticket[];
      if (backupTickets && backupTickets.length > 0) {
        tickets.length = 0;
        tickets.push(...backupTickets);
        console.log(`Loaded ${tickets.length} tickets from local backup file.`);
      }
    } catch (e) {
      console.error("Failed to load local tickets backup:", e);
    }
  }

  if (firestoreAuthErrorDetected.value) return;

  const runRead = async () => {
    const snapshot = await firestore.collection('tickets').orderBy('createdAt', 'desc').get();
    const dbTickets: Ticket[] = [];
    
    for (const doc of snapshot.docs) {
      const ticketData = doc.data() as Omit<Ticket, 'messages'>;
      
      // Fetch subcollection messages
      const msgSnapshot = await doc.ref.collection('messages').orderBy('createdAt', 'asc').get();
      const messages = msgSnapshot.docs.map(mDoc => mDoc.data() as Message);
      
      dbTickets.push({
        ...ticketData,
        id: doc.id,
        messages
      } as Ticket);
    }
    
    const defaultIds = ['ticket_101', 'ticket_102', 'ticket_103'];
    const cleanTickets = dbTickets.filter(t => !defaultIds.includes(t.id));

    if (cleanTickets.length > 0) {
      tickets.length = 0;
      tickets.push(...cleanTickets);
      console.log(`Successfully synced ${tickets.length} clean tickets from Firestore!`);
    } else {
      tickets.length = 0;
      console.log("No new tickets found in Firestore.");
    }
  };

  try {
    await runRead();
  } catch (err: any) {
    try {
      await handleFirestoreErrorAndCheckFallback(err, runRead);
    } catch (e) {
      console.warn("Using local backup ticket database (remote Cloud Sync was skipped/unauthorized):", e?.message || String(e));
    }
  }
};
