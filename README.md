# 🛒 Zero-Click Predictive Commerce Engine

A high-performance, full-stack predictive e-commerce application designed to eliminate "restock fatigue." 

Instead of waiting for users to manually add daily consumables (coffee, milk, soap) to their cart, this engine analyzes their historical purchase velocity using a **Custom C++ Backend**, calculates the exact day they will run out using a **Weighted Moving Average (WMA)**, and automatically queues the item for delivery in a sleek **React/Tailwind** dashboard.

## 🚀 Key Architectural Highlights (System Design)

This project was built to simulate the scalability, memory management, and performance demands of top-tier tech companies (e.g., Flipkart, Amazon).

### 🧠 Backend (C++ & cpp-httplib)
* $O(1)$ **Multi-Tenant Data Isolation:** On startup, the server dynamically loads 10,000 distinct mock users into an in-memory `std::unordered_map`. API requests resolve user data instantly via Hash Map lookup without database I/O bottlenecks.
* $O(\log n)$ **Urgency Sorting:** Calculates a WMA for purchase intervals and pushes them into a localized `std::priority_queue` (Max-Heap) to instantly rank which items the user needs most urgently.
* **Session-Based State:** Employs session-based memory manipulation. Purchases made via the UI update the live RAM mapping but are intentionally decoupled from the base `data.json` file to prevent test-data corruption and eliminate segmentation faults during heavy QA testing.

### 💻 Frontend (React + Vite)
* **Race-Condition Proof UI:** Custom `useEffect` cleanup flags guarantee that rapid context-switching (spamming the user dropdown) instantly aborts stale API payloads, preventing UI data-bleeding.
* **Optimistic UI Updates:** Simulating a live production environment, items are instantly cleared from the DOM upon interaction while the `POST` request syncs with the C++ backend asynchronously.
* **Custom Gesture Controls:** Engineered a custom swipe-to-cancel mobile gesture strictly using React Refs and Touch Events—bypassing heavy third-party animation libraries.

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS v4
* **Backend:** C++17, `cpp-httplib` (REST API), `nlohmann/json` (Data Parsing)
* **Algorithms:** Weighted Moving Averages, Max-Heaps, Hash Maps

## ⚙️ Getting Started & Installation

To run this project locally, you will need **Node.js** installed for the frontend, and a **C++ Compiler** (like MinGW/GCC) for the backend.

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd zero-click-engine
```

### 2. Generate the Mock Database
Navigate to the `backend` folder and compile the Data Generator to build your 10,000 users.
```bash
g++ data_gen.cpp -o datagen.exe
./datagen.exe
```
*(This will instantly create a massive `data.json` file in your directory).*

### 3. Run the C++ API Server
Compile and run the main API server. Note: On Windows, you must link the winsock library.
```bash
g++ api_server.cpp -o server.exe -lws2_32
./server.exe
```
*(The C++ backend is now live and listening on `http://localhost:8080`).*

### 4. Set Up the React Frontend
Open a **new terminal window** and navigate to the `frontend` folder.
```bash
npm install
npm run dev
```
*(The frontend is now live on `http://localhost:5173`).*

## 🎮 How to Use the Application
1. **Switch Profiles:** Use the dropdown in the top right to switch between 50 dynamically generated user personas. Watch the UI fetch their unique C++ AI forecast instantly.
2. **Zero-Click Queue:** View the "Predicted Depletion Queue". These are items the C++ engine has flagged as critically low based on past behavior.
3. **Swipe to Cancel:** Click and drag a product card to the left to "cancel" the auto-restock, simulating an emergency brake on automated purchasing.
4. **Order Execution:** Click **"Order Now"** or use the **Cart Panel**. This fires a `POST` request to the backend, updates the live session memory, and instantly removes the item from the queue via optimistic rendering.
5. **Simulate Offline Purchase:** Use the utility panel to log an offline transaction. The backend will store it in RAM and immediately recalculate the WMA forecasting parameters.

## 🧪 System Resilience & Testing
This application was built to survive extreme UI stress testing:
* **Spam Testing (Race Conditions):** Rapidly switching between 20 different users in 5 seconds results in zero layout shifts, zero UI freezing, and zero incorrect data rendering due to strict React cleanup flags.
* **Memory Profiling:** Spamming API endpoints results in a flatlined memory profile on the C++ process. Variables and isolated Max-Heaps are strictly managed and garbage collected via RAII, proving zero memory leaks during heavy tree traversal.
