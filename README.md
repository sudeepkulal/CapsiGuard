# Capsiguard - AI-Powered Chilli Disease Detection (MERN Rebuild)

Capsiguard is a web-based agricultural dashboard designed to identify plant diseases in chilli crop leaves using machine learning. This repository contains a complete rebuild of the original Django prototype using the **MERN (MongoDB, Express, React, Node.js)** stack with **Vite** and **Tailwind CSS**.

---

## 🚀 Key Enhancements (Over Django Prototype)
- **Token-based Authentication**: Secure user registration and session management powered by JWT and bcrypt.
- **Detailed History Log**: Analysis history is tracked dynamically in MongoDB, allowing users to browse their previous reports.
- **Annotated Leaf Display**: Bounding boxes highlighting disease locations are dynamically overlaid onto leaf images on the backend using the `sharp` library (SVG compositing).
- **History Management**: Users can delete previous prediction records directly from the dashboard, which clears database entries and associated image files on disk.

---

## 📁 Repository Structure

```text
Capsiguard/
├── backend/                       # Node.js + Express API Server
│   ├── models/                    # MongoDB schemas (User, Prediction)
│   ├── middleware/                # JWT validation auth check
│   ├── routes/                    # API Endpoints (/api/auth, /api/analyze)
│   ├── uploads/                   # Local storage folder for uploaded & annotated images
│   ├── package.json               # Backend dependencies (express, mongoose, sharp, etc.)
│   └── server.js                  # Main server entrypoint
│
├── frontend/                      # React SPA with Vite & Tailwind CSS
│   ├── src/
│   │   ├── pages/                 # UI pages (Landing, Login, Signup, Dashboard)
│   │   ├── App.jsx                # Router & Auth Context provider
│   │   ├── index.css              # Styling rules & animated backgrounds
│   │   └── main.jsx               # React entrypoint
│   ├── package.json               # Frontend dependencies (react, lucide, tailwind, etc.)
│   └── tailwind.config.js         # Tailwind styling definitions
│
└── Capsiguard-Django/             # Original Django project folder (preserved & untouched)
```

---

## ⚙️ Prerequisites
Before running the project locally, ensure you have:
1. **Node.js** (v18.0.0 or higher recommended)
2. **MongoDB** installed and running locally on standard port `27017`

---

## 🛠️ Step-by-Step Setup Guide

### 1. Setup the Backend
1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables. A `.env` file has been prepared in the `backend/` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/capsiguard
   JWT_SECRET=capsiguard_super_secret_key_12345
   ROBOFLOW_API_KEY=Z329Y2FN1wOL2HvocEIg
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(The server will boot on `http://localhost:5000`)*

---

### 2. Setup the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies (resolving peer dependency configurations if needed):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
   *(The interface will be hosted locally on `http://localhost:5173/`)*

---

## 🧠 Model Specifications
This project uses the Roboflow object detection model:
- **Model Endpoint / Version**: `my-first-project-2rhyc/2`
- **Supported Detection Classes**:
  - `curl` (Leaf Curl Virus)
  - `bacterial` (Bacterial Leaf Spot)
  - `cercospora` (Cercospora Leaf Spot)
  - `healthy` (Healthy plant leaf)

Each model class matches tailored remedies built into the dashboard's treatment interface.
