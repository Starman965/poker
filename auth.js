// auth.js
import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const allowedUsers = [
    'david.lewis@example.com',
    'david.williams@example.com',
    'nasser.gaemi@example.com'
];

document.getElementById('googleSignIn').addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            const user = result.user;
            if (allowedUsers.includes(user.email)) {
                window.location.href = 'index.html';
            } else {
                signOut(auth);
                document.getElementById('errorMessage').textContent = 'Access denied. You are not authorized to use this application.';
            }
        }).catch((error) => {
            console.error('Error during sign in:', error);
            document.getElementById('errorMessage').textContent = 'An error occurred during sign in. Please try again.';
        });
});

export function checkAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            if (user && allowedUsers.includes(user.email)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

export function logoutUser() {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}
