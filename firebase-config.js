/* 
// Orignal firebase-config.js
export const firebaseConfig = {
    apiKey: "AIzaSyBHqMut5DC2YiBhEhMvtyX2L_5KBbKg1AU",
    authDomain: "poker-a2e1c.firebaseapp.com",
    databaseURL: "https://poker-a2e1c-default-rtdb.firebaseio.com",
    projectId: "poker-a2e1c",
    storageBucket: "poker-a2e1c.appspot.com",
    messagingSenderId: "813172723871",
    appId: "1:813172723871:web:8595f1cb0ffdecd4a5d2aa",
    measurementId: "G-NSL5SLKE5H"
};
*/

// new autho version of firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";

export const firebaseConfig = {
    apiKey: "AIzaSyBHqMut5DC2YiBhEhMvtyX2L_5KBbKg1AU",
    authDomain: "poker-a2e1c.firebaseapp.com",
    databaseURL: "https://poker-a2e1c-default-rtdb.firebaseio.com",
    projectId: "poker-a2e1c",
    storageBucket: "poker-a2e1c.appspot.com",
    messagingSenderId: "813172723871",
    appId: "1:813172723871:web:8595f1cb0ffdecd4a5d2aa",
    measurementId: "G-NSL5SLKE5H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);
export const analytics = getAnalytics(app);
