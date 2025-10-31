// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBHqMut5DC2YiBhEhMvtyX2L_5KBbKg1AU",
    authDomain: "poker-a2e1c.firebaseapp.com",
    databaseURL: "https://poker-a2e1c-default-rtdb.firebaseio.com",
    projectId: "poker-a2e1c",
    storageBucket: "poker-a2e1c.appspot.com",
    messagingSenderId: "813172723871",
    appId: "1:813172723871:web:8595f1cb0ffdecd4a5d2aa",
    measurementId: "G-NSL5SLKE5H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Admin email addresses
const ADMIN_EMAILS = [
    'demandgendave@gmail.com',
    'davew102@yahoo.com',
    'nasser@gcuniverse.com',
    'nasser.gaemi@bigdates.com'
];

