// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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

    database.ref('polls').orderByChild('token').equalTo(pollToken).once('value', (snapshot) => {
        const polls = snapshot.val();
        if (polls) {
            currentPoll = Object.values(polls)[0];
            displayPollQuestion();
            calculateAndDisplayResults();
        } else {
            alert('Poll not found');
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

    Object.values(votes).forEach(vote => {
        results[vote.option]++;
        totalVotes++;
    });

    const resultsContainer = document.getElementById('pollResults');
    resultsContainer.innerHTML = '';

    currentPoll.options.forEach((option, index) => {
        const votes = results[index];
        const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(2) : 0;

        const resultElement = document.createElement('div');
        resultElement.className = 'poll-result';
        resultElement.innerHTML = `
            <p>${option}</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${percentage}%"></div>
            </div>
            <p>${votes} votes (${percentage}%)</p>
        `;
        resultsContainer.appendChild(resultElement);
    });

    const totalElement = document.createElement('p');
    totalElement.textContent = `Total votes: ${totalVotes}`;
    resultsContainer.appendChild(totalElement);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', loadPollResults);