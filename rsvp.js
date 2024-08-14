import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getDatabase,
    ref, 
    get,
    set
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventToken = urlParams.get('token');

    if (!eventToken) {
        alert('Invalid event token. Please use the link provided in your email.');
        return;
    }

    loadEventDetails(eventToken);
    loadMemberList();
    document.getElementById('rsvpForm').addEventListener('submit', handleRSVPSubmission);
});

function loadEventDetails(eventToken) {
    get(ref(database, `schedule/${eventToken}`)).then((snapshot) => {
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
    get(ref(database, 'members')).then((snapshot) => {
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

    get(ref(database, 'members')).then((snapshot) => {
        const members = snapshot.val();
        const member = Object.values(members).find(m => m.name === memberName);
        if (member && member.email === memberEmail) {
            set(ref(database, `schedule/${eventToken}/rsvps/${memberName}`), rsvpStatus).then(() => {
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
