// auth.js
import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const allowedUsers = [
    'demandgendave@gmail.com',
    'davew102@yahoo.com',
    'nasser@gcuniverse.com'
];

document.addEventListener('DOMContentLoaded', () => {
    const loadingMessage = document.getElementById('loadingMessage');
    const loginContainer = document.getElementById('loginContainer');
    const content = document.getElementById('content');
    const googleSignIn = document.getElementById('googleSignIn');
    const logoutButton = document.getElementById('logoutButton');
    const errorMessage = document.getElementById('errorMessage');

    function showContent(user) {
        loadingMessage.style.display = 'none';
        loginContainer.style.display = 'none';
        content.style.display = 'block';
        logoutButton.style.display = 'block';
        errorMessage.textContent = '';
    }

    function showLogin() {
        loadingMessage.style.display = 'none';
        loginContainer.style.display = 'block';
        content.style.display = 'none';
        logoutButton.style.display = 'none';
    }

    onAuthStateChanged(auth, (user) => {
        if (user && allowedUsers.includes(user.email)) {
            showContent(user);
        } else {
            showLogin();
        }
    });

    googleSignIn.addEventListener('click', () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                const user = result.user;
                if (allowedUsers.includes(user.email)) {
                    showContent(user);
                } else {
                    signOut(auth);
                    errorMessage.textContent = 'Access denied. You are not authorized to use this application.';
                }
            }).catch((error) => {
                console.error('Error during sign in:', error);
                errorMessage.textContent = 'An error occurred during sign in. Please try again.';
            });
    });

    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            showLogin();
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });
});

export function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user && allowedUsers.includes(user.email)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}
