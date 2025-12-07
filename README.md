# 🚨 RapidReport  
### *“Report Fast. Stay Safe.”*

RapidReport is an anonymous, real-time crime and safety reporting platform where users can instantly raise alerts, report crimes, track area safety levels, and trigger SOS signals. It empowers communities to stay aware, stay informed, and stay safe — with just one tap.

---

## 🧠 What is RapidReport?

RapidReport is a smart public-safety platform built for:

- Anonymous crime reporting  
- SOS emergency alerts  
- Volunteer rescue response  
- Area-wise crime heatmap  
- Real-time tracking & notifications  
- AI-based image analysis (optional)

Everything is **anonymous** — no user login required.

---

## ✨ Key Features

### 🔴 1. Anonymous Crime Reporting
- Simple 3-step reporting  
- No login or identity required  
- Generate unique Report ID  
- Track report status anytime  
- Admin panel for verification  

### 🗺️ 2. Area Crime Heatmap
- Users pin crime locations on a map  
- Color-coded risk levels:
  - 🟥 High Risk  
  - 🟧 Medium Risk  
  - 🟨 Low Risk  
- Live-updating heatmap based on reports  

### 🆘 3. SOS Emergency Alert
- Floating SOS button  
- Long-press for confirmation  
- Sends user location + optional photo  
- Nearby volunteers get immediate alerts  
- Real-time map tracking (user ↔ volunteer)

### 🧑‍🤝‍🧑 4. Volunteer System
- Volunteer registration/login  
- Accept SOS requests  
- Update availability  
- Live location tracking  
- Helps users during emergencies  

### 📸 5. Image Analysis (Optional Enhancement)
- Upload or capture image  
- AI model analyzes for threats  
- Helps reduce false reports  

---

## 🏗️ Tech Stack

### **Frontend**
- React / TypeScript  
- Tailwind UI  
- Map SDK (Leaflet / Google Maps)  
- Socket.io client  

### **Backend**
- Node.js + Express  
- MongoDB + Mongoose  
- WebSockets (Socket.io)  
- Multer (image upload)  
- GeoJSON for location queries  
- JWT authentication (volunteers only)

---

## 📡 API Overview

### **Report APIs**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submit-report` | Submit anonymous crime report |
| GET  | `/track-report/:id` | Track report status |
| POST | `/analyze-image` | AI image analysis |

### **SOS APIs**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sos/trigger` | Trigger SOS alert |
| GET  | `/sos/active` | List all active SOS |
| GET  | `/sos/:id` | Get SOS alert details |
| PUT  | `/sos/:id/accept` | Volunteer accepts alert |
| PUT  | `/sos/:id/cancel` | Cancel alert |

### **Volunteer APIs**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/volunteer/register` | Register volunteer |
| POST | `/volunteer/login` | Login volunteer |
| GET  | `/volunteer/profile` | Get profile |
| PUT  | `/volunteer/availability` | Update availability |
| PUT  | `/volunteer/location` | Update location |
| GET  | `/volunteer/nearby` | Get nearby volunteers |
| POST | `/volunteer/accept-sos` | Accept SOS |

---

## 🚀 How to Run the Project

### **Backend Setup**
```bash
cd server
npm install
npm start
Frontend Setup
cd client
npm install
npm run dev

📁 Folder Structure (Short)
rapidReport/
 ├── server/
 │   ├── Controllers/
 │   ├── routes/
 │   ├── models/
 │   ├── services/
 │   ├── utils/
 │   └── server.js
 ├── client/
 │   ├── src/
 │   └── public/
 └── README.md
