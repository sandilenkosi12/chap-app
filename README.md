chat application

Feature	Description
Real-time Messaging	    -Messages appear instantly across all connected clients
User Authentication     -	Secure signup/login with Firebase Auth
Multiple Chat Rooms	    -General, Tech, and Random rooms
Online Users	          -See who's online in real-time
Typing Indicators       -	Know when someone is typing
Message History	        -All messages persist in Firestore
Emoji Support          -Add emojis to your messages
Responsive Design	     -Works perfectly on mobile and desktop


🛠️ Built With
HTML5 - Structure

CSS3 - Styling & Animations

JavaScript (ES6+) - Functionality

Firebase - Authentication & Database

Moment.js - Time formatting

Font Awesome - Icons

live demo https://sandilenkosi12.github.io/chap-app/

📦 Installation
Prerequisites
A modern web browser

Code editor (VS Code recommended)

Basic understanding of JavaScript

Step 1: Clone the Repository
bash
git clone https://github.com/sandilenkosi12/chat-app.git
cd chat-app
Step 2: Set Up Firebase
Go to Firebase Console

Create a new project named "chat-app"

Enable Email/Password Authentication

Create a Firestore Database in test mode

Get your Firebase config from Project Settings

Step 3: Add Your Firebase Config
Open auth.js and replace the firebaseConfig object with your own:

javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
Step 4: Run the App
Open index.html in your browser or use a local server:

bash
# Using Python
python -m http.server 8000

# Using PHP
php -S localhost:8000

# Using VS Code Live Server
# Right-click index.html → Open with Live Server
Visit http://localhost:8000 in your browser.

🎯 How to Use
Register a new account or use demo credentials

Choose a chat room (General, Tech, or Random)

Start typing your message

Press Enter or click Send

See messages appear in real-time

Open another browser to test multiple users
