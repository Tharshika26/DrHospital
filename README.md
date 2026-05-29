
# DrHospital - Advanced Hospital Management System

DrHospital is a comprehensive, full-stack Hospital Management System designed to streamline healthcare operations. The system serves Patients, Doctors, and Administrators by digitizing appointment bookings, medical report management, payments, and incorporating AI to automatically analyze and summarize medical reports.

---

## 🏗️ Project Architecture & Workflow

The project follows a standard **Client-Server Architecture** utilizing the **MERN (MongoDB, Express, React, Node.js) Stack**.

1. **Client (Frontend)**: Built with **React** and **Vite**. It provides an interactive UI for users to browse doctors, book appointments, make payments, upload medical reports, and view AI-generated insights. The frontend communicates with the backend via RESTful APIs using **Axios**.
2. **Server (Backend)**: Built with **Node.js** and **Express.js**. It handles all the business logic, authenticates users via **JWT** and **Email OTP**, processes payments, handles file uploads, extracts text using **OCR**, and interfaces with AI models.
3. **Database**: **MongoDB** is used as the primary NoSQL database, managed using **Mongoose** ORM to store structured data (Users, Appointments, Reports, etc.).
4. **Third-Party Integrations**: The backend acts as a bridge to external APIs like **Stripe** (Payments), **OpenAI** (AI Analysis), and **Nodemailer** (Notifications).

---

## 🛠️ Technologies Used & How They Are Used

### Frontend (User Interface)
Located in the `/mcfrontend` directory.
- **React 19 & Vite**: Provides a fast, modern component-based UI framework for building the Single Page Application (SPA).
- **Tailwind CSS (v4)**: Used for rapid, responsive, and highly customizable styling and layouts.
- **React Router DOM**: Handles client-side routing and navigation between pages (e.g., Home, Dashboard, Appointments).
- **Axios**: Used to make asynchronous HTTP requests to the Node.js backend APIs.
- **Stripe React (@stripe/react-stripe-js)**: Provides secure, customizable, and tokenized UI components for handling payment inputs on the frontend.
- **Lucide React**: Provides modern, lightweight SVG icons.
- **React Hot Toast**: Used for displaying aesthetic, non-blocking notification popups (success/error messages).

### Backend (Server & API)
Located in the `/mcbackend` directory.
- **Node.js & Express.js**: The core runtime and framework for building the RESTful API endpoints.
- **MongoDB & Mongoose**: The NoSQL database and Object Data Modeling (ODM) library used to enforce schemas for models like `Patient`, `Doctor`, `Appointment`, and `Service`.
- **JSON Web Tokens (JWT) & bcryptjs**: Used for securely hashing passwords and handling stateless user authentication and authorization (Role-based access control).
- **Multer**: Middleware used to handle `multipart/form-data` for file uploads (uploading Medical Reports in PDF or Image formats).
- **Tesseract.js & PDF-Parse**: Used for Optical Character Recognition (OCR). Extracting raw text from uploaded images (Tesseract) and PDF files (pdf-parse) of medical reports.
- **OpenAI API**: The extracted text is sent to OpenAI's GPT models to analyze the medical data, summarize the findings, and generate actionable insights for the doctor and patient.
- **Stripe (Node SDK)**: Handles server-side payment intent creation, validation, and securely finalizing transactions.
- **Nodemailer**: Used with SMTP to send emails, specifically for OTP-based account verification and password resets.


---

## 🌟 Key Functionalities

- **Role-Based Authentication**: Distinct dashboards and access levels for **Admin**, **Doctors**, and **Patients**. Includes Email OTP verification.
- **Doctor Discovery & Patient Profiles**: Patients can browse available doctors by specialization and view detailed profiles.
- **Smart Appointment Scheduling**: Seamless online booking system that manages doctor availability, time slots, and prevents double-booking.
- **Secure Online Payments**: Integrated Stripe checkout for patients to securely pay appointment fees online.
- **Medical Report Digitization**: Patients can upload their physical medical records as images or PDFs.
- **AI Medical Report Analyzer**: The system uses OCR to read uploaded records and OpenAI to generate an easy-to-understand summary and highlight critical health metrics for quick reference by the doctor.
- **Hospital Services Management**: Admin can list and manage various hospital services available to patients.
- **Contact & Support Module**: An integrated contact system for patients to submit queries and for admins to respond.

---

## 📂 Project Structure

```
DrHospital/
│
├── mcbackend/                 # Node.js Express Backend
│   ├── src/
│   │   ├── config/            # DB and environment configs
│   │   ├── controllers/       # Route logic and request handling
│   │   ├── middleware/        # JWT auth, error handling, file upload middlewares
│   │   ├── models/            # Mongoose schemas (User, Appointment, Report, etc.)
│   │   ├── routes/            # Express API endpoint definitions
│   │   ├── services/          # Business logic for AI, OCR, Email, etc.
│   │   └── server.js          # Backend entry point
│   ├── .env                   # Backend environment variables
│   └── package.json           # Backend dependencies
│
├── mcfrontend/                # React Vite Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level pages (Home, Dashboard, Login)
│   │   ├── assets/            # Static files (Images, CSS)
│   │   ├── App.jsx            # Main React component & Routing
│   │   └── main.jsx           # Frontend entry point
│   ├── .env                   # Frontend environment variables
│   └── package.json           # Frontend dependencies
│
└── README.md                  # Complete Project Documentation
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI or Local MongoDB Server
- API Keys for Stripe, OpenAI, and an SMTP Email account.

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd mcbackend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `mcbackend` folder (if not already present) based on the configurations needed. Ensure the following keys are populated:
   ```env
   PORT=5001
   MONGO_URI=mongodb://<username>:<password>@<cluster-url>/DrHospital?...
   JWT_SECRET=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_app_password
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   # OR
   npm start
   ```
   *The server should now be running on http://localhost:5001*

### 2. Frontend Setup

1. Open a **new** terminal and navigate to the frontend directory:
   ```bash
   cd mcfrontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. (Optional) Setup environment variables for the frontend by creating a `.env` file in the `mcfrontend` directory for Stripe public keys or backend API URLs:
   ```env
   VITE_API_URL=http://localhost:5001
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be running, typically accessible at http://localhost:5173*

---
*Built to improve the digital healthcare experience.*
