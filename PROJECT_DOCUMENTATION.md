# Project Documentation & Architecture Blueprint
## VaaniAI: Vernacular Customer Experience (CX) Support Workbench
*Author: Google AI Studio Coding Assistant*  
*Date: May 2026*

---

## 1. Executive Project Summary
**VaaniAI Solutions** is a state-of-the-art, high-performance, full-stack customer experience (CX) and vernacular support workbench. It is designed specifically to solve the massive operational bottlenecks faced by consumer-facing enterprises communicating in multi-lingual or transliterated vernacular languages (such as **Hinglish**, **Hindi**, and regional dialects). 

By uniting a real-time ticketing CRM panel, an interactive NLP prompt-grounding engine, a localized Android SDK locale editor, and a global keyboard-driven command interface, VaaniAI enables operators to monitor, takeover, and automate multilingual customer service interactions seamlessly.

---

## 2. Comprehensive Feature Suite

### A. Global Keyboard Command Interface (Ctrl+K / Cmd+K)
*   **Behavior:** Active globally. Triggers a centered modal overlay with blur dimensions.
*   **Fuzzy Search Engine:** Real-time scoring index matching navigation tabs, configuration items, numerical ticket IDs, customer accounts, and exact conversation transcript snippets.
*   **Intelligent Prioritization:** Ranks choices dynamically according to human usage logs (claims cache) and natural language patterns (e.g., typing "open ticket 101" triggers absolute precedence).
*   **Role-Based Security Locks:** Selectively locks administrator options (e.g., audit logs and system role matrices) based on employee profile parameters.
*   **Keyboard-Only Convenience:** Supports arrows to select, `Enter` to execute, `Tab` to autocomplete current matches, and `Esc` to exit instantly.

### B. Unified Vernacular Active CRM Desk
*   **Live Ticketing Feeds:** Divided dynamically between **AI CHAT** (automated automated replies active), **OVERRIDE** (live human assistant takeover), and **RESOLVED** categories.
*   **Precise SLA Compliance Meters:** High-contrast countdown timers marking Warning and Breached thresholds (e.g. 10-minute expirations) using a visual pulse alert.
*   **Automated End-of-Conversation Resolver:** Auto-ends conversations based on sentiment, thank you keywords, or 1 minute of customer silence via an automated background inactivity worker.
*   **Multi-Channel Simulator Drawer:** Emulates live customer submissions via standard In-App Web Checkouts and multi-channel simulated WhatsApp Business Cloud Webhook payloads.

### C. Live AI Copilot & Vernacular Classifier
*   **Vernacular Language Identifier:** Identifies pure English, Hinglish, and standard Hindi inputs instantly.
*   **Subtle Sentiment Classifiers:** Groups sentiment states dynamically into Positive, Neutral, Negative, or Angry triggers.
*   **Contextual Vernacular Reply Generator:** Translates resolutions into polite transliterated scripts matching the consumer’s exact choice of writing.

### D. Grounding Knowledge Hub & Administrative Panel
*   **SLA Threshold Customizer:** Custom SLA timer durations.
*   **AI Policy Grounding Prompt Editors:** Set operational constraints, discount keys, or return guidelines.
*   **Dataset Fine-Tuning Console:** Manage training datasets, offline vernacular dictionaries, and system logs.

---

## 3. Installed Technology Stack

The workbench is built utilizing ultra-modern, high-efficiency technologies to guarantee millisecond-level responsiveness, visual beauty, and rock-solid type safety.

### Frontend Client-Side (SPA)
*   **React 19.0.1 (with TypeScript 5.8.2):** Standard-compliant functional hooks architecture ensuring fast reactivity and elimination of memory leaks.
*   **Vite 6.2.3:** High-speed, modern bundler handling rapid builds and fast loading times.
*   **Tailwind CSS v4.1.14:** Complete utility CSS compiler powering a high-contrast Space-Slate design.
*   **Motion 12.23.24 (`motion/react`):** Smooth, performance-tuned animations for route shifts, ticket popovers, and status transitions.
*   **Lucide React v0.546.0:** High-aesthetic vector interface icons.

### Backend Application Server
*   **NodeJS & Express 4.21.2:** Sturdy web server layer exposing lightweight JSON API routes (`/api/*`) for data mutations, settings updates, and AI queries.
*   **TSX v4.21.0:** High-efficiency loader allowing direct, zero-overhead execution of TypeScript scripts during active dev modes.
*   **ESBuild v0.25.0:** Automates backend bundling to compile `server.ts` into a dedicated, single-file CommonJS module inside `dist/server.cjs` for lightning-fast container startups and zero module-resolution friction.

### AI & Core Modeling Integrations
*   **Google GenAI SDK v2.4.0 (`@google/genai`):** Connects the backend securely to state-of-the-art Gemini LLMs (such as Gemini 2.5 Flash and Gemini 2.5 Pro) with strict API-key protection.
*   **Anthropic SDK v0.98.0:** Integrated backend SDK support providing a comparative model evaluation framework.

### Database & State Security
*   **Google Cloud Firestore / Firebase Admin SDK v13.10.0:** Real-time document database syncing ticket statuses, messages, employee logins, and business options globally.
*   **Graceful InMemory Memory Fallback:** Employs an automated fallback caching mechanism. If database sync experiences cloud connection blocks, it backs up locally to `local-settings.json` and memory buffers to prevent system downtime.

---

## 4. System Architecture & Connection Flow

The backend and frontend are tightly integrated in a full-stack secure proxy setup:

```
+---------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                  |
|                                                                                 |
|  [ React 19 UI Components ]  <--->  [ Global Store / State Manager ]            |
|               ^                                   ^                             |
|               | (Keyboard Triggers)               |                             |
|               v                                   v                             |
|  [ Command Bar Palette Ctrl+K ]        [ Fetch / Axios API Requests /api/* ]    |
+---------------------------------------------------------------------------------+
                                                     ^
                                                     | (HTTPS Requests)
                                                     v
+---------------------------------------------------------------------------------+
|                                 EXPRESS BACKEND                                 |
|                                                                                 |
|  +------------------------+      +-------------------+      +----------------+  |
|  |   API Routes Proxy     | ---> |  Google GenAI     | --->|  Gemini API    |  |
|  |   (Authentication,      |      |  SDK Integration  |      |  (Cloud Key)   |  |
|  |    Tickets, Settings)  |      +-------------------+      +----------------+  |
|  +------------------------+                                                     |
|               ^                                                                 |
|               |                                                                 |
|               v                                                                 |
|  +------------------------+      +-------------------+      +----------------+  |
|  |  Firebase Admin SDK   | ---> |  Firebase Cloud   | --->|  Backup Cache  |  |
|  |  Firestore Client      |      |  Firestore DB     |      |  (Local JSON)  |  |
|  +------------------------+      +-------------------+      +----------------+  |
+---------------------------------------------------------------------------------+
```

### Flow Highlights:
1.  **Client-Side Ingress:** The Vite client acts as a Single Page Application (SPA), routing state changes purely in memory.
2.  **API Masking Proxy:** The browser never accesses the `GEMINI_API_KEY` or `FIREBASE_PROJECT_ID` directly. Instead, it queries local Express endpoints (`/api/tickets/...`), and Node proxies authentication tokens server-side, securing organizational credentials.
3.  **Active Cloud Sync:** Real-time reads, status mutations, and message chains are immediately piped to Cloud Firestore via Firebase Admin.
4.  **Auto-SLA Inactivity Worker:** A server-side checker monitors for inactivity every 5 seconds to automatically close idle tickets.

---

## 5. Target Industries & Use Cases

This workbench is exceptionally valuable across various industries:

### 1. Vernacular E-Commerce & Retail (D2C)
*   **Challenge:** Indian and Southeast Asian D2C brands experience over 70% of inbound user queries written in transliterated phonetic dialetcs (like Hinglish: *"mera order deliver kab hoga?"*).
*   **Solution:** VaaniAI translates complex shipping questions instantly and responds in the exact transliterated tone specified, boosting customer happiness.

### 2. High-Growth FinTech & Micro-Lending
*   **Challenge:** Financial platforms catering to rural regions deal with support loads regarding payment failures and dynamic transaction options.
*   **Solution:** Immediate intent identification (e.g., PAYMENT_FAILURE) flags high-priority items so human teams can step in, meeting regulatory SLA compliance rules.

### 3. Hyper-Local Logistics & Delivery Providers
*   **Challenge:** Couriers and drivers navigating routes need real-time, lightweight support portals to resolve delivery issues on low-bandwidth apps.
*   **Solution:** Lightweight, responsive design and multi-language support offer immediate, clear, low-latency assistance.

---

## 6. Financial Viability, API, Protocol & Token Costing

Implementing VaaniAI is exceptionally cost-effective. Below is an exhaustive cost modeling spreadsheet based on model structures from Google Vertex / Google AI Studio and Firebase billing profiles.

### Assumed Baseline Operational Scale:
*   **Monthly Customer Inquiries:** 100,000 Chats
*   **Average Messages per Ticket:** 4 Messages (2 Customer, 2 Agent/AI)
*   **Average Tokens per Message:**
    *   *Input (System commands, grounding prompt, history):* ~1,500 Tokens
    *   *Output (Vernacular responder response):* ~120 Tokens

---

### A. Monthly AI API Token Cost Spreadsheet (Using Gemini 2.5 Flash)

| Dimension | Rate (per Million Tokens) | Calculation Details | Monthly Estimated Cost |
| :--- | :--- | :--- | :--- |
| **Input Tokens** | $0.075 / 1,000,000 | 100k tickets × 4 messages × 1,500 context tokens = 600 Million Tokens | $45.00 |
| **Output Tokens** | $0.300 / 1,000,000 | 100k tickets × 2 AI replies × 120 response tokens = 24 Million Tokens | $7.20 |
| **Grounding Storage** | Free tier | Vector embedding parameters stored in-memory | $0.00 |
| **TOTAL TOKENS BILL** | | **624 Million Inbound / Outbound Tokens Processed** | **$52.20 / Month** |

---

### B. Monthly Cloud Database Billing Blueprint (Google Cloud Firestore)

Firestore offers a substantial free tier (50,000 free reads, 20,000 free writes daily) and very low pricing above that.

| Event Type | Rate (per 100K Events) | Calculation Details | Monthly Estimated Cost |
| :--- | :--- | :--- | :--- |
| **Document Writes** | $0.18 / 100,000 writes | 100k tickets × (1 create + 4 message logs + 1 status update) = 600,000 writes | $1.08 |
| **Document Reads** | $0.06 / 100,000 reads | Operator dashboards, list refreshes, and API calls = 1,200,000 reads | $0.72 |
| **Data Storage** | $0.18 / GB | ~2 GB active transactional records | $0.36 |
| **TOTAL DATA BILL** | | **Cloud database sync overhead costs** | **$2.16 / Month** |

---

### C. Monthly Runtime Infrastructure Charges (Cloud Run)

| Item Code | Details | Configuration | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Server Instance** | Google Cloud Run Container | 1 vCPU, 2GB RAM (Scales down to 0 instances when idle) | $12.00 |
| **Network Egress** | Content Delivery Network (CDN) | ~40 GB global content egress volume | $3.50 |
| **TOTAL INFRA CHG** | | **Standard secure production operations** | **$15.50 / Month** |

---

### D. Consolidated Cost & Business Return on Investment (ROI)

*   **Total Monthly Operational Cost:** **$69.86 / Month (~70 USD)**
*   **Cost per resolved ticket:** **$0.0007 / Ticket (Less than 1/10th of a cent!)**
*   **Human Support Equivalent Cost:** Handling 100k chats manually would require at least 15 full-time support agents, costing upwards of **$18,000 / Month**.
*   **Total Savings:** Implementing VaaniAI drives **99.6% savings** in low-level support overheads, freeing up human specialists to tackle high-end complex escalations.

---

## 7. Future Capability Scalability Matrix

The workspace has been built following complete SOLID engineering standards, allowing for easy expansion:
1.  **Fully Realized WhatsApp API integrations:** Connect webhook structures to live Twilio or Meta Developer numbers.
2.  **Voice Interaction Grounding (Vocal Assistant):** Hook Gemini Live API audio websocket interfaces directly to our backend server framework to handle verbal chats.
3.  **Advanced CRM Connectors:** Embed synchronization connectors for Salesforce Service Cloud and Zendesk.

---
*Document produced and verified inside Google AI Studio Sandbox.*
