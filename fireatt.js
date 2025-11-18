// -----------------------------
// Firebase Project 1: Card DB
// -----------------------------
var firebaseConfigCard = {
  apiKey: "AIzaSyB2JTBAGNR64d_yRN4g8q9d1GpMfiiHxkE",
  authDomain: "kcardentry.firebaseapp.com",
  projectId: "kcardentry",
  storageBucket: "kcardentry.firebasestorage.app",
  messagingSenderId: "897372470233",
  appId: "1:897372470233:web:e672fc3683b4985b7b37c8",
  measurementId: "G-B2D7VLDT9X"
};

var cardApp = !firebase.apps.some(app => app.name === "cardApp")
              ? firebase.initializeApp(firebaseConfigCard, "cardApp")
              : firebase.app("cardApp");

var cardDb = cardApp.firestore();
console.log("✅ Card Firebase initialized");
window.cardDb = cardDb; // optional global access

// -----------------------------
// Firebase Project 2: Walk-in DB
// -----------------------------
var firebaseConfigWalkin = {
   apiKey: "AIzaSyCMOPJnK_qpUZcHUWi6EQz-qclrNsDky3U",
  authDomain: "psysko-8d035.firebaseapp.com",
  projectId: "psysko-8d035",
  storageBucket: "psysko-8d035.firebasestorage.app",
  messagingSenderId: "176989826632",
  appId: "1:176989826632:web:bae58e639edbd8d4adf27d",
  measurementId: "G-XL5YJR6L74"
};

var walkinApp = !firebase.apps.some(app => app.name === "walkinApp")
                ? firebase.initializeApp(firebaseConfigWalkin, "walkinApp")
                : firebase.app("walkinApp");

var walkinDb = walkinApp.firestore();
console.log("✅ Walkin Firebase initialized");
window.walkinDb = walkinDb; // optional global access


// -----------------------------
// Firebase Project 3: Walk-in test DB
// -----------------------------
var firebaseConfigWalkinT = {
   apiKey: "AIzaSyD6npGK2ODuTM55hhn-Kirpq1I562AvGVE",
  authDomain: "walkint.firebaseapp.com",
  projectId: "walkint",
  storageBucket: "walkint.firebasestorage.app",
  messagingSenderId: "681695627675",
  appId: "1:681695627675:web:ef74621bebbd8b52f3b93e",
  measurementId: "G-KZNQX1KPY3"
};

var walkinAppT = !firebase.apps.some(app => app.name === "walkinAppT")
                ? firebase.initializeApp(firebaseConfigWalkinT, "walkinAppT")
                : firebase.app("walkinAppT");

var walkinTDb = walkinAppT.firestore();
console.log("✅ Walkin Firebase initialized");
window.walkinTDb = walkinTDb; // optional global access


var firebaseConfigAtten = {
  apiKey: "AIzaSyDvHKlApQ4wClz-y0ejSG91ahKBWvPCSM0",
  authDomain: "leeli-37413.firebaseapp.com",
  projectId: "leeli-37413",
  storageBucket: "leeli-37413.firebasestorage.app",
  messagingSenderId: "1055234470933",
  appId: "1:1055234470933:web:a7c063c08dbb21d94e8a1c",
  measurementId: "G-LMKVKWY3TB"
};

var cardApp = !firebase.apps.some(app => app.name === "cardApp")
              ? firebase.initializeApp(firebaseConfigCard, "cardApp")
              : firebase.app("cardApp");

var cardDb = cardApp.firestore();
console.log("✅ Card Firebase initialized");
window.cardDb = cardDb; // optional global access
