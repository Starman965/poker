// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let currentPoll = null;
let currentMember = null;
let members = []; // Global members array

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
        const membersData = snapshot.val(); // Fetch members data from Firebase
        const memberSelect = document.getElementById('memberSelect');
        memberSelect.innerHTML = '<option value="">Select your name</option>';

        // Store the members globally
        members = Object.values(membersData);

        // Populate the dropdown
        members.forEach((member, index) => {
            const option = document.createElement('option');
            option.value = index; // Use index as the value
            option.textContent = member.name; // Display the member's name
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
        const selectedMember = members[selectedIndex]; // Fetch the correct member from the global array
        currentMember = selectedMember; // Set currentMember
        const imagePath = `/pokerboys/${selectedMember.name.split(' ')[0].toLowerCase()}.png`; // Construct the image path
        memberImage.src = imagePath;
        memberImage.style.display = 'block';
    } else {
        memberImage.style.display = 'none';
        currentMember = null; // Reset currentMember if no member is selected
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

    const memberId = currentMember.id || currentMember.name; // Ensure the memberId is either ID or name
    if (!memberId) {
        alert('Error: Member ID is missing');
        return;
    }

    // Ensure currentPoll.id exists
    if (!currentPoll || !currentPoll.id) {
        alert('Poll ID is missing');
        return;
    }

    const voteData = {
        memberId: memberId,
        option: parseInt(selectedOption.value),
        timestamp: new Date().toISOString()
    };

    // Use the proper path for storing the vote in the correct poll
    const voteRef = ref(database, `polls/${currentPoll.id}/votes/${memberId}`);
    update(voteRef, voteData)
        .then(() => {
            alert('Your vote has been recorded');
            // Redirect to the votebox (results page) with the current poll token
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