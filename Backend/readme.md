# 🧠 Backend API - User Management System

This repository contains the backend logic for user registration, authentication, and MongoDB integration using Node.js, Express.js, and Mongoose.

---

## 📚 Table of Contents

- [🔍 Overview](#-overview)
- [🧾 User Registration](#-user-registration)
  - [⚙️ How It Works](#️-how-it-works)
  - [✅ Validation Rules](#-validation-rules)
  - [📬 Example Request](#-example-request)
  - [⚠️ Error Handling](#️-error-handling)
- [⚙️ Environment Setup](#-environment-setup)
- [🚀 Running the Server](#-running-the-server)

---

## 🔍 Overview

The backend is built with:

- **Node.js** & **Express.js** for server-side logic  
- **MongoDB** with **Mongoose** for database operations  
- **JWT** for secure authentication  
- **bcrypt.js** for password hashing  
- **express-validator** for request validation

> This system provides APIs for user registration and login using token-based authentication.

---

## 🧾 User Registration

**Endpoint:** `POST /users/register`  
Registers a new user in the system.

---

### ⚙️ How It Works

#### 1. **Route:**
- Defined in: `routes/user.routes.js`
- Validates request using `express-validator`

#### 2. **Controller:**
- Function: `registerUser` in `controllers/user.controllers.js`
- Responsibilities:
  - Validates body fields
  - Hashes password using `userModel.hashPassword`
  - Creates a new user
  - Returns token & user info

#### 3. **Service:**
- Function: `createUser` in `services/user.services.js`
- Saves user to MongoDB using Mongoose

#### 4. **Response:**
- JWT token generated via `generateAuthToken` method
- Returns:
  ```json
  {
    "token": "<JWT_TOKEN>",
    "user": {
      "_id": "<USER_ID>",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "johndoe@example.com"
    }
  }
---

## 🔑 User Login

**Endpoint:** `POST /users/login`  
Authenticates an existing user and returns a JWT token.

---

### ⚙️ How It Works

#### 1. **Route:**
- Defined in: `routes/user.routes.js`
- Validates request using `express-validator`

#### 2. **Controller:**
- Function: `loginUser` in `controllers/user.controllers.js`
- Responsibilities:
  - Validates body fields
  - Checks if the user exists in the database
  - Compares the provided password with the hashed password using `userModel.comparePassword`
  - Returns a JWT token and user info if authentication is successful

#### 3. **Response:**
- JWT token generated via `generateAuthToken` method
- Returns:
  ```json
  {
    "token": "<JWT_TOKEN>",
    "user": {
      "_id": "<USER_ID>",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "johndoe@example.com"
    }
  }