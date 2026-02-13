# ☕ Cafe Finder

A production-ready full stack web application that helps users discover nearby cafes in real time using geolocation and Google Places API.

🔗 **Live Demo:** cafe-finder-production-32da.up.railway.app

---

## 🚀 Features

* 📍 Detects user location to recommend nearby cafes
* 🔎 Fetches real-time data using Google Places API
* 🔐 Secure backend proxy to protect API keys
* ❤️ Save favorite cafes for later
* 🚫 Prevents duplicate recommendations
* 🌙 Minimal dark-themed responsive UI
* ☁️ Fully deployed on the cloud

---

## 🧠 Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript

**Backend**

* Node.js
* Express.js

**APIs & Deployment**

* Google Places API
* Railway

---

## 🏗️ Architecture

The application uses a backend proxy server to securely communicate with the Google Places API.

User → Express Server → Google Places API → Server → Client

This prevents exposing sensitive API keys on the client side.

---

## 🔐 Environment Variables

| Variable   | Description           |
| ---------- | --------------------- |
| PLACES_KEY | Google Places API key |

⚠️ Never commit your `.env` file.

---

## 🎯 What I Learned

* Building and structuring a full stack application
* Securing API keys using a backend proxy
* Working with real-world REST APIs
* Handling geolocation data
* Deploying production-ready applications
* Managing environment variables

---

## 🔮 Future Improvements

* 🗺️ Map-based visualization
* ⭐ Cafe ratings & reviews
* 👤 User authentication
* 🧠 AI-powered cafe recommendations
* 📱 Progressive Web App (PWA)

---

## 👨‍💻 Author

**Sahaj Gandharv**

If you liked this project, feel free to connect or reach out!
