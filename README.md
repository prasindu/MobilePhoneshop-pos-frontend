# 🛒 MobileHub POS - Advanced Point of Sale System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)

A modern, high-performance, and Offline-Capable Point of Sale (POS) system built specifically for retail and mobile shops. It features a Progressive Web App (PWA) architecture, allowing cashiers to continue billing even when the internet connection drops, with automatic background synchronization.

## ✨ Key Features

* **📡 Offline Mode (PWA):** Seamlessly continue billing without the internet. Uses `IndexedDB` to store local inventory and saves offline sales, which automatically sync to the server once the connection is restored.
* **⚡ Keyboard Shortcuts:** Fast-paced billing optimized for minimal mouse usage (F1 to Pay, F2 for Scanner).
* **📦 Smart Inventory Management:** Real-time stock tracking, low-stock alerts, and direct image uploads via Cloudinary.
* **📊 Advanced Analytics:** Interactive charts (using Recharts) to visualize revenue, profit margins, and category-wise sales.
* **🖨️ Thermal Print & PDF:** Auto-generates 80mm thermal-friendly receipts and downloadable PDF invoices.
* **🔐 Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins/Managers vs. Cashiers.
* **🌓 Modern UI/UX:** Fully responsive design with Dark/Light theme toggles and smooth loading animations.

## 📸 Screenshots
<img width="1918" height="911" alt="Screenshot 2026-03-20 155508" src="https://github.com/user-attachments/assets/e653688f-0fe7-4b2a-80ba-657ccb9427c7" />
1. ### Billing Dashboard



  <img width="1900" height="909" alt="Screenshot 2026-03-20 155806" src="https://github.com/user-attachments/assets/b4eb521b-5b0c-4f3c-a019-eee0e06a15de" />
2. ### Inventory Management



  <img width="1902" height="910" alt="Screenshot 2026-03-20 155838" src="https://github.com/user-attachments/assets/6c1d81f7-37aa-4695-bf24-588789cfb92b" />
3. ### Analytics & Reports

## 🛠️ Tech Stack

**Frontend:**
* React.js (Context API for State Management)
* Vite (Build Tool)
* Tailwind CSS (Styling)
* Vite PWA Plugin & IDB (Offline Capabilities)
* Recharts (Data Visualization)
* Lucide React (Icons)
* Axios (API calls)

**Backend (API):**
* Java Spring Boot
* Spring Security (JWT Authentication)
* MySQL / PostgreSQL Database

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `F1` | **Pay & Print** | Completes the current sale and opens the print dialog. |
| `F2` | **Focus Scanner** | Puts the cursor directly into the Barcode Scanner input. |
| `F4` | **Clear Cart** | Empties all items currently in the cart (requires confirmation). |
| `ESC` | **Close** | Closes any open modals (like the Custom Item form or Sale Details). |

## 🚀 Getting Started

### Prerequisites
* Node.js (v16 or higher)
* Backend Spring Boot API running locally or on the cloud.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/prasindu/pos-frontend.git]
   cd mobilehub-pos

2.  **Install dependencies:**
   ```bash
   npm install
```
3. **Configure Environment Variables:**
Create a .env file in the root directory and add your API and Cloudinary credentials:
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your-cloud-name/image/upload
```
4. **Run the Development Server:**
```bash
npm run dev
```
5. **Build for Production (PWA Enabled):**
```bash
npm run build
```
## 🔄 How Offline Sync Works
1. On login, the app downloads the latest product catalog and caches it in the browser's IndexedDB.

2. If the network drops (navigator.onLine === false or ERR_NETWORK), the app switches to Offline Mode.

3. Sales are processed normally and saved to a local offline_sales table.

4. An event listener (window.addEventListener('online')) detects when the connection is back and silently pushes the pending sales to the Spring Boot backend.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License
This project is licensed under the MIT License.
  
