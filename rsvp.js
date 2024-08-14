// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getDatabase,
    ref, 
    onValue, 
    set, 
    push, 
    update, 
    remove,
    get // Add this line
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

let members = [];
let schedule = [];

// Check connection
const connectedRef = ref(database, ".info/connected");
onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
        console.log("Connected to Firebase");
    } else {
        console.log("Not connected to Firebase");
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventToken = urlParams.get('token');

    if (!eventToken) {
        alert('Invalid event token. Please use the link provided in your email.');
        return;
    }

    // Load event details
    loadEventDetails(eventToken);

    // Load member list
    loadMemberList();

    // Handle form submission
    document.getElementById('rsvpForm').addEventListener('submit', handleRSVPSubmission);
});

function loadEventDetails(eventToken) {
    database.ref(`schedule/${eventToken}`).once('value').then((snapshot) => {
        const event = snapshot.val();
        if (event) {
            document.getElementById('eventDate').textContent = moment(event.date).format('MMMM D, YYYY');
            document.getElementById('eventHost').textContent = event.host;
            document.getElementById('eventLocation').textContent = event.location;
        } else {
            alert('Event not found. Please check your invitation link.');
        }
    }).catch((error) => {
        console.error('Error loading event details:', error);
        alert('Error loading event details. Please try again later.');
    });
}

function loadMemberList() {
    database.ref('members').once('value').then((snapshot) => {
        const members = snapshot.val();
        const memberSelect = document.getElementById('memberSelect');
        
        Object.values(members).forEach((member) => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            memberSelect.appendChild(option);
        });
    }).catch((error) => {
        console.error('Error loading member list:', error);
        alert('Error loading member list. Please try again later.');
    });
}

function handleRSVPSubmission(event) {
    event.preventDefault();

    const memberName = document.getElementById('memberSelect').value;
    const memberEmail = document.getElementById('memberEmail').value;
    const rsvpStatus = document.getElementById('rsvpStatus').value;
    const eventToken = new URLSearchParams(window.location.search).get('token');

    // Verify member email
    database.ref('members').orderByChild('name').equalTo(memberName).once('value').then((snapshot) => {
        const member = snapshot.val();
        if (member && Object.values(member)[0].email === memberEmail) {
            // Update RSVP in Firebase
            database.ref(`schedule/${eventToken}/rsvps/${memberName}`).set(rsvpStatus).then(() => {
                window.location.href = `confirmation.html?status=${rsvpStatus}&token=${eventToken}`;
            }).catch((error) => {
                console.error('Error updating RSVP:', error);
                alert('Error updating RSVP. Please try again later.');
            });
        } else {
            alert('The selected name does not match the provided email. Please check and try again.');
        }
    }).catch((error) => {
        console.error('Error verifying member:', error);
        alert('Error verifying member information. Please try again later.');
    });
}
