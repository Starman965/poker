// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let currentPoll = null;
let currentMember = null;

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Load poll data
function loadPollData() {
    const pollToken = getUrlParameter('token');
    if (!pollToken) {
        alert('Invalid poll token');
        return;
    }

    const pollsRef = ref(database, 'polls');
    onValue(pollsRef, (snapshot) => {
        const polls = snapshot.val();
        if (polls) {
            currentPoll = Object.values(polls).find(poll => poll.token === pollToken);
            if (currentPoll) {
                displayPollQuestion();
                displayPollOptions();
            } else {
                alert('Poll not found');
            }
        } else {
            alert('No polls found');
        }
    });
}

// Display poll question
function displayPollQuestion() {
    document.getElementById('pollQuestion').textContent = currentPoll.question;
}

// Display poll options
function displayPollOptions() {
    const pollOptionsContainer = document.getElementById('pollOptions');
    pollOptionsContainer.innerHTML = '';
    currentPoll.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.innerHTML = `
            <input type="radio" id="option${index}" name="pollOption" value="${index}">
            <label for="option${index}">${option}</label>
        `;
        pollOptionsContainer.appendChild(optionElement);
    });
}

// Load member data
function loadMemberData() {
    const membersRef = ref(database, 'members');
    onValue(membersRef, (snapshot) => {
        const members = snapshot.val();
        const memberSelect = document.getElementById('memberSelect');
        memberSelect.innerHTML = '<option value="">Select your name</option>';
        Object.values(members).forEach((member, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = member.name;
            memberSelect.appendChild(option);
        });
    });
}

// Load member image
function loadMemberImage() {
    const memberSelect = document.getElementById('memberSelect');
    const memberImage = document.getElementById('memberImage');
    const selectedIndex = memberSelect.value;

    if (selectedIndex !== '') {
        const memberRef = ref(database, `members/${selectedIndex}`);
        onValue(memberRef, (snapshot) => {
            currentMember = snapshot.val();
            if (currentMember && currentMember.image) {
                memberImage.src = currentMember.image;
                memberImage.style.display = 'block';
            } else {
                memberImage.style.display = 'none';
            }
        });
    } else {
        memberImage.style.display = 'none';
    }
}

// Submit vote
function submitVote() {
    if (!currentMember) {
        alert('Please select your name');
        return;
    }

    const selectedOption = document.querySelector('input[name="pollOption"]:checked');
    if (!selectedOption) {
        alert('Please select an option');
        return;
    }

    const voteData = {
        memberId: currentMember.id || currentMember.name, // Ensure you have the member ID or name
        option: parseInt(selectedOption.value),
        timestamp: new Date().toISOString()
    };

    if (!voteData.memberId) {
        alert('Error: Member ID is missing');
        return;
    }

    const voteRef = ref(database, `polls/${currentPoll.id}/votes/${currentMember.id}`);
    update(voteRef, voteData)
        .then(() => {
            alert('Your vote has been recorded');
            window.location.href = `votebox.html?token=${getUrlParameter('token')}`;
        })
        .catch((error) => {
            console.error('Error submitting vote:', error);
            alert('There was an error submitting your vote. Please try again.');
        });
}


// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadPollData();
    loadMemberData();
    
    // Add event listener for member selection
    const memberSelect = document.getElementById('memberSelect');
    if (memberSelect) {
        memberSelect.addEventListener('change', loadMemberImage);
    }
    
    // Add event listener for submit button
    const submitButton = document.querySelector('button');
    if (submitButton) {
        submitButton.addEventListener('click', submitVote);
    }    
});