var firebaseConfig = {
  apiKey: "AIzaSyDvHKlApQ4wClz-y0ejSG91ahKBWvPCSM0",
  authDomain: "leeli-37413.firebaseapp.com",
  projectId: "leeli-37413",
  storageBucket: "leeli-37413.firebasestorage.app",
  messagingSenderId: "1055234470933",
  appId: "1:1055234470933:web:a7c063c08dbb21d94e8a1c",
  measurementId: "G-LMKVKWY3TB"
};
var cardApp = !firebase.apps.some(app => app.name === "cardApp")
  ? firebase.initializeApp(firebaseConfig, "cardApp")
  : firebase.app("cardApp");

var cardDb = cardApp.firestore();
console.log("✅ Card Firebase initialized");
window.cardDb = cardDb; // make global




