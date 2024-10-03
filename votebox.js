// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let currentPoll = null;

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Load poll data and results
function loadPollResults() {
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
                calculateAndDisplayResults();
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

// Calculate and display results
function calculateAndDisplayResults() {
    const votes = currentPoll.votes || {};
    const results = currentPoll.options.map(() => 0);
    let totalVotes = 0;

    // If no votes are present, avoid errors
    if (Object.keys(votes).length === 0) {
        document.getElementById('pollResults').textContent = 'No votes have been recorded yet.';
        return;
    }

    Object.values(votes).forEach(vote => {
        results[vote.option]++;
        totalVotes++;
    });

    const resultsContainer = document.getElementById('pollResults');
    resultsContainer.innerHTML = '';

    currentPoll.options.forEach((option, index) => {
        const voteCount = results[index];
        const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100).toFixed(2) : 0;

        const resultElement = document.createElement('div');
        resultElement.className = 'poll-result';
        resultElement.innerHTML = `
            <p>${option}</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${percentage}%"></div>
            </div>
            <p>${voteCount} votes (${percentage}%)</p>
        `;
        resultsContainer.appendChild(resultElement);
    });

    const totalElement = document.createElement('p');
    totalElement.textContent = `Total votes: ${totalVotes}`;
    resultsContainer.appendChild(totalElement);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', loadPollResults);