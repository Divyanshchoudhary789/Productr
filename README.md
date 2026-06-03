# Productr

Productr is a full-stack web application designed for seamless user authentication and product management. It features an OTP-based login/signup flow and a robust dashboard, built with modern web technologies.

## 🚀 Live Demo & Deployment
- **Frontend:** https://productr-5edq.onrender.com
- **Backend:** https://productr-backend-1qtl.onrender.com


## 🚀 Technologies Used

*   **Frontend:** React (Vite), Tailwind CSS, React Router, Context API
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JWT (JSON Web Tokens), OTP via Email
*   **Others:** Axios, Cookie-Parser, Bcrypt.js

## 📁 Directory Structure

The project is structured into two main directories:

*   `/frontend` - Contains the React application (Vite).
*   `/backend` - Contains the Node.js/Express server API.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)
*   Git

## 🔧 Environment Variables

You need to set up environment variables for both the backend and frontend to run properly.

### Backend (`/backend/.env`)

Create a `.env` file in the `backend` directory and add the following variables:

```env
PORT=8080
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASS=your_16_digit_app_password
```

*(Note: Replace placeholders like `your_mongodb_connection_string` with your actual credentials).*

### Frontend

The frontend environment variables are managed inside `frontend/src/environment.js`. For local development, ensure the `baseURL` points to your local backend server (e.g., `http://localhost:8080`).

## 🛠️ How to Run the Application

Follow these steps to run the application locally.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Productr
```

### 2. Run the Backend Server

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server (runs on port 8080 by default)
npm start
# or if using nodemon: npm run dev
```
*The backend should now be running on `http://localhost:8080` and connected to MongoDB.*

### 3. Run the Frontend Application

Open a new terminal window/tab:

```bash
# Navigate to the frontend directory from the project root
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend should now be running, typically on `http://localhost:5173`. Open this URL in your browser.*

## 🔒 Authentication Flow

1.  Users request an OTP via their Email or Phone number on the Login/Signup page.
2.  The backend sends a 6-digit OTP to the registered email.
3.  The user enters the OTP, and the backend verifies it.
4.  Upon successful verification, the backend issues an HTTP-only JWT cookie with `secure: true` and `sameSite: "none"` for secure cross-origin authentication.
5.  The frontend redirects the user to the protected Dashboard.

## 🚀 Deployment

The application is configured to be deployed on platforms like Render, Vercel, or Heroku.
*   **Backend:** Ensure cross-origin cookies are supported by setting appropriate CORS headers in `index.js` and cookie flags in the controllers.
*   **Frontend:** Ensure the `api` configuration in `environment.js` points to the live backend URL and includes `withCredentials: true`.

---

# 👨‍💻 Author

**Divyansh Choudhary**

Full Stack Developer | MERN STACK Developer

GitHub:  
https://github.com/Divyanshchoudhary789

LinkedIn:  
https://www.linkedin.com/in/divyansh--choudhary/

Portfolio:
https://portfoliodivyansh-choudhary.vercel.app/