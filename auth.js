import { auth, googleProvider } from './firebase-config.js';
import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const allowedUsers = [
    'demandgendave@gmail.com',
    'davew102@yahoo.com',
    'nasser@gcuniverse.com'
];

function signInWithGoogle() {
    signInWithRedirect(auth, googleProvider);
}

function handleRedirectResult() {
    getRedirectResult(auth)
        .then((result) => {
            if (result) {
                const user = result.user;
                if (allowedUsers.includes(user.email)) {
                    console.log("User signed in successfully");
                    // Proceed with authorized access
                } else {
                    console.log("User not authorized");
                    signOut(auth);
                }
            }
        })
        .catch((error) => {
            console.error("Error during sign in:", error);
        });
}

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

    googleSignIn.addEventListener('click', signInWithGoogle);

    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            showLogin();
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });

    handleRedirectResult();
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
