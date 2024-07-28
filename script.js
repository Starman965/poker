// David
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    ref, 
    onValue, 
    set, 
    push, 
    update, 
    remove 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";

// Your web app's Firebase configuration
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

// Initialize Firebase
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

function loadDataFromFirebase() {
    const dbRef = ref(window.firebaseDatabase, '/');
    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        
        // Convert members object to array
        members = data.members ? Object.values(data.members) : [];
        
        // Convert schedule object to array if it's not already
        schedule = data.schedule ? (Array.isArray(data.schedule) ? data.schedule : Object.values(data.schedule)) : [];
        
        renderMembers();
        renderSchedule();
        populateHostDropdowns();
        console.log('Data loaded successfully from Firebase!');
    }, (error) => {
        console.error('Error loading data from Firebase:', error);
    });
}

// Function to save data to Firebase
function saveDataToFirebase() {
  set(ref(database, '/'), {
    members: members,
    schedule: schedule
  }).then(() => {
    console.log('Data saved successfully to Firebase!');
  }).catch((error) => {
    console.error('Error saving data to Firebase:', error);
  });
}

// Load data when the page is ready
document.addEventListener('DOMContentLoaded', loadDataFromFirebase);
function renderMembers() {
    const membersList = document.getElementById('membersList');
    const memberCount = document.getElementById('memberCount');
    if (!membersList || !memberCount) return;
    membersList.innerHTML = '';
    memberCount.textContent = members.length;
    
    members.forEach((member, index) => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-email">${member.email}</div>
                <div class="member-location">${member.location}</div>
            </div>
            <div class="member-actions">
                <button onclick="startEditMember(${index})">EDIT</button>
                <button onclick="confirmDeleteMember(${index})">DELETE</button>
                <button class="email-button" onclick="composeMemberEmail('${member.email}')">EMAIL</button>
            </div>
        `;
        membersList.appendChild(memberItem);
    });
}
function addMember() {
    const name = document.getElementById('newMemberName').value.trim();
    const email = document.getElementById('newMemberEmail').value.trim();
    const location = document.getElementById('newMemberLocation').value.trim();

    if (name && email && location) {
        const newMember = { name, email, location };
        const membersRef = ref(window.firebaseDatabase, 'members');
        push(membersRef, newMember)
            .then(() => {
                console.log('Member added successfully');
                loadDataFromFirebase(); // Reload data to reflect changes
            })
            .catch((error) => console.error('Error adding member:', error));

        // Clear input fields
        document.getElementById('newMemberName').value = '';
        document.getElementById('newMemberEmail').value = '';
        document.getElementById('newMemberLocation').value = '';
    } else {
        alert('Please fill in all fields for the new member.');
    }
}
function startEditMember(index) {
    const member = members[index];
    document.getElementById('newMemberName').value = member.name;
    document.getElementById('newMemberEmail').value = member.email;
    document.getElementById('newMemberLocation').value = member.location;
    
    const addButton = document.querySelector('button[onclick="addMember()"]');
    addButton.textContent = 'Update Member';
    addButton.onclick = () => updateMember(index);

    // Scroll to the edit member area
    const editMemberArea = document.querySelector('.admin-panel');
    editMemberArea.scrollIntoView({ behavior: 'smooth' });
}

function updateMember(index) {
    const name = document.getElementById('newMemberName').value.trim();
    const email = document.getElementById('newMemberEmail').value.trim();
    const location = document.getElementById('newMemberLocation').value.trim();

    if (name && email && location) {
        const updatedMember = { name, email, location };
        update(ref(database, `members/${index}`), updatedMember)
            .then(() => {
                console.log('Member updated successfully');
                loadDataFromFirebase(); // Reload data to reflect changes
            })
            .catch((error) => console.error('Error updating member:', error));

        // Reset the form
        document.getElementById('newMemberName').value = '';
        document.getElementById('newMemberEmail').value = '';
        document.getElementById('newMemberLocation').value = '';
        const addButton = document.querySelector('button[onclick="addMember()"]');
        addButton.textContent = 'Add Member';
        addButton.onclick = addMember;
    } else {
        alert('Please fill in all fields for the member.');
    }
}

function confirmDeleteMember(index) {
    if (confirm('Are you sure you want to delete this member?')) {
        remove(ref(database, `members/${index}`))
            .then(() => {
                console.log('Member deleted successfully');
                loadDataFromFirebase(); // Reload data to reflect changes
            })
            .catch((error) => console.error('Error deleting member:', error));
    }
}

function composeMemberEmail(email) {
    const subject = encodeURIComponent("Poker Night");
    const body = encodeURIComponent("Hello,\n\nI hope this email finds you well. I'm reaching out regarding our upcoming poker night.\n\nBest regards,\nNasser");
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}
function renderSchedule() {
    const scheduleContainer = document.getElementById('scheduleContainer');
    const editEventSelect = document.getElementById('editEventSelect');
    if (!scheduleContainer || !editEventSelect) return;
    scheduleContainer.innerHTML = '';
    editEventSelect.innerHTML = '<option value="">Select an event</option>';
    
    schedule.forEach((event, eventIndex) => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        eventDiv.innerHTML = `
            <div class="event-header" onclick="toggleEventDetails(${eventIndex})">
                <h3>${moment(event.date).format('MMMM D, YYYY')} - ${event.location} (Host: ${event.host})</h3>
                <span class="expand-icon">▼</span>
            </div>
            <div class="event-details" id="eventDetails-${eventIndex}" style="display: none;">
                <button class="email-button" onclick="composeInvitationEmail(${eventIndex})">Send Invitation</button>
                <button class="email-button" onclick="composeReminderEmail(${eventIndex})">Send Reminder</button>
                <button class="email-button" onclick="composeFinalConfirmationEmail(${eventIndex})">Send Final Confirmation</button>
                <table class="rsvp-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>RSVP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${members.map(member => `
                            <tr>
                                <td>${member.name}</td>
                                <td>
                                    <select class="rsvp-select" onchange="updateRSVP(${eventIndex}, '${member.name}', this.value)">
                                        <option value="no-response" ${(event.rsvps[member.name] || 'no-response') === 'no-response' ? 'selected' : ''}>No Response</option>
                                        <option value="attending" ${event.rsvps[member.name] === 'attending' ? 'selected' : ''}>Attending</option>
                                        <option value="not-attending" ${event.rsvps[member.name] === 'not-attending' ? 'selected' : ''}>Not Attending</option>
                                        <option value="maybe" ${event.rsvps[member.name] === 'maybe' ? 'selected' : ''}>Maybe</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p>Total Attending: <span id="totalAttending-${eventIndex}">0</span></p>
            </div>
        `;
        scheduleContainer.appendChild(eventDiv);
        updateTotalAttending(eventIndex);

        editEventSelect.innerHTML += `<option value="${eventIndex}">${moment(event.date).format('MMMM D, YYYY')} - ${event.location} (Host: ${event.host})</option>`;
    });

    // Clear edit fields and selection after rendering
    document.getElementById('editEventSelect').value = "";
    document.getElementById('editEventDate').value = '';
    document.getElementById('editEventHost').value = '';
    document.getElementById('editEventLocation').value = '';
}

function addEvent() {
    populateHostDropdowns(); // Add this line
    const date = document.getElementById('newEventDate').value;
    const host = document.getElementById('newEventHost').value;
    const location = document.getElementById('newEventLocation').value.trim();

    if (date && host && location) {
        const newEvent = {
            date,
            host,
            location,
            rsvps: {}
        };
        push(ref(database, 'schedule'), newEvent)
            .then(() => {
                console.log('Event added successfully');
                loadDataFromFirebase(); // Reload data to reflect changes
            })
            .catch((error) => console.error('Error adding event:', error));

        // Clear input fields
        document.getElementById('newEventDate').value = '';
        document.getElementById('newEventHost').value = '';
        document.getElementById('newEventLocation').value = '';
    } else {
        alert('Please fill in all fields for the new event.');
    }
}

function saveEventEdits() {
    const editEventSelect = document.getElementById('editEventSelect');
    const selectedIndex = editEventSelect.value;
    
    if (selectedIndex === "") {
        alert("Please select an event to edit.");
        return;
    }

    const newDate = document.getElementById('editEventDate').value;
    const newHost = document.getElementById('editEventHost').value;
    const newLocation = document.getElementById('editEventLocation').value.trim();

    if (newDate && newHost && newLocation) {
        const updatedEvent = {
            date: newDate,
            host: newHost,
            location: newLocation,
            rsvps: schedule[selectedIndex].rsvps || {}
        };
        update(ref(database, `schedule/${selectedIndex}`), updatedEvent)
            .then(() => {
                console.log('Event updated successfully');
                loadDataFromFirebase(); // Reload data to reflect changes
                alert("Event updated successfully!");
            })
            .catch((error) => console.error('Error updating event:', error));
    } else {
        alert("Please fill in all fields.");
    }
}

function deleteEvent() {
    const editEventSelect = document.getElementById('editEventSelect');
    const selectedIndex = editEventSelect.value;
    
    if (selectedIndex === "") {
        alert("Please select an event to delete.");
        return;
    }

    if (confirm('Are you sure you want to delete this event?')) {
        remove(ref(database, `schedule/${selectedIndex}`))
            .then(() => {
                console.log('Event deleted successfully');
                loadDataFromFirebase(); // Reload data to reflect changes
                alert("Event deleted successfully!");
            })
            .catch((error) => console.error('Error deleting event:', error));
    }
}

function updateRSVP(eventIndex, memberName, status) {
    update(ref(database, `schedule/${eventIndex}/rsvps/${memberName}`), status)
        .then(() => {
            console.log('RSVP updated successfully');
            loadDataFromFirebase(); // Reload data to reflect changes
        })
        .catch((error) => console.error('Error updating RSVP:', error));
}

function updateTotalAttending(eventIndex) {
    const totalAttendingElement = document.getElementById(`totalAttending-${eventIndex}`);
    if (!totalAttendingElement) return;
    
    const event = schedule[eventIndex];
    const totalAttending = Object.values(event.rsvps).filter(status => status === 'attending').length;
    totalAttendingElement.textContent = totalAttending;
}

function toggleEventDetails(eventIndex) {
    const detailsElement = document.getElementById(`eventDetails-${eventIndex}`);
    const headerElement = detailsElement.previousElementSibling.querySelector('.expand-icon');
    
    if (detailsElement.style.display === 'none') {
        detailsElement.style.display = 'block';
        headerElement.textContent = '▲';
    } else {
        detailsElement.style.display = 'none';
        headerElement.textContent = '▼';
    }
}

function populateHostDropdowns() {
    const newEventHost = document.getElementById('newEventHost');
    const editEventHost = document.getElementById('editEventHost');
    
    if (!newEventHost || !editEventHost) return;

    const hostOptions = members.map(member => `<option value="${member.name}">${member.name}</option>`).join('');
    
    newEventHost.innerHTML = `<option value="">Select a host</option>${hostOptions}`;
    editEventHost.innerHTML = `<option value="">Select a host</option>${hostOptions}`;
}

function updateHostLocation() {
    const hostSelect = document.activeElement.id === 'newEventHost' ? 'newEventHost' : 'editEventHost';
    const locationInput = hostSelect === 'newEventHost' ? 'newEventLocation' : 'editEventLocation';
    
    const selectedHost = document.getElementById(hostSelect).value;
    const member = members.find(m => m.name === selectedHost);
    
    if (member) {
        document.getElementById(locationInput).value = member.location;
    }
}
function composeInvitationEmail(eventIndex) {
    const event = schedule[eventIndex];
    const subject = encodeURIComponent(`Poker Night Invitation - ${moment(event.date).format('MMMM D, YYYY')} - Host: ${event.host}`);
    const body = encodeURIComponent(`Danville Poker Group,

It's that time again for our monthly poker group this month:

Date: ${moment(event.date).format('MMMM D, YYYY')}
Time: 7:00 PM
Location: ${event.location}
Host: ${event.host}

Please RSVP ASAP so we can start planning. 

Looking forward to seeing you there!

Best regards,
Nasser`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=DanvillePoker@groups.io&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

function composeReminderEmail(eventIndex) {
    const event = schedule[eventIndex];
    const attendees = [];
    const maybes = [];
    const notAttending = [];
    const noResponse = [];

    members.forEach(member => {
        const status = event.rsvps[member.name] || 'no-response';
        switch(status) {
            case 'attending':
                attendees.push(member.name);
                break;
            case 'maybe':
                maybes.push(member.name);
                break;
            case 'not-attending':
                notAttending.push(member.name);
                break;
            default:
                noResponse.push(member.name);
        }
    });

    const subject = encodeURIComponent(`Poker Night Reminder - ${moment(event.date).format('MMMM D, YYYY')} - Host: ${event.host}`);
    const body = encodeURIComponent(`Danville Poker Group,

This is a reminder about our upcoming poker night:

Date: ${moment(event.date).format('MMMM D, YYYY')}
Time: 7:00 PM
Location: ${event.location}
Host: ${event.host}

Current RSVP Status:
Attending (${attendees.length}):
${attendees.join('\n')}

Not Attending (${notAttending.length}):
${notAttending.join('\n')}

Maybe (${maybes.length}):
${maybes.join('\n')}

No Response Yet (${noResponse.length}):
${noResponse.join('\n')}

To those who haven't RSVP'd or are still in the "Maybe" category, please RSVP as soon as possible so we can get a final count.

Looking forward to seeing you all!

Best regards,
Nasser`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=DanvillePoker@groups.io&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

function composeFinalConfirmationEmail(eventIndex) {
    const event = schedule[eventIndex];
    const attendees = [];
    const notAttending = [];

    members.forEach(member => {
        const status = event.rsvps[member.name] || 'no-response';
        if (status === 'attending') {
            attendees.push(member.name);
        } else if (status === 'not-attending') {
            notAttending.push(member.name);
        }
    });

    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

    const subject = encodeURIComponent(`Final Confirmation - Poker Night ${moment(event.date).format('MMMM D, YYYY')} - Host: ${event.host}`);
    const body = encodeURIComponent(`Danville Poker Group,

This is the final confirmation for our upcoming poker night:

Date: ${moment(event.date).format('MMMM D, YYYY')}
Time: 7:00 PM
Location: ${event.location}
Host: ${event.host}

Google Maps Link: ${googleMapsLink}

Final Attendee List (${attendees.length}):
${attendees.join('\n')}

Not Attending:
${notAttending.join('\n') || 'None'}

Looking forward to another great Poker Night!

Best regards,
Nasser`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=DanvillePoker@groups.io&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}
function showPastEventsReport() {
    const reportContainer = document.getElementById('reportContainer');
    if (!reportContainer) return;
    const currentDate = new Date();
    const pastEvents = schedule.filter(event => new Date(event.date) < currentDate);

    let reportHTML = '<h3>Past Events Report</h3>';
    
    pastEvents.forEach((event, index) => {
        const attendees = Object.entries(event.rsvps)
            .filter(([_, status]) => status === 'attending')
            .map(([name, _]) => name);
        
        reportHTML += `
            <div class="event-item">
                <div class="event-header" onclick="togglePastEventDetails(${index})">
                    <h4>${moment(event.date).format('MMMM D, YYYY')} - ${event.location}</h4>
                    <span class="expand-icon">▼</span>
                </div>
                <div class="event-details" id="pastEventDetails-${index}" style="display: none;">
                    <p>Host: ${event.host}</p>
                    <p>Attendees: ${attendees.length}</p>
                    <p>Who Attended: ${attendees.join(', ') || 'None'}</p>
                </div>
            </div>
        `;
    });

    reportContainer.innerHTML = reportHTML;
}

function showAttendanceReport() {
    const reportContainer = document.getElementById('reportContainer');
    if (!reportContainer) return;
    const currentDate = new Date();
    const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

    const recentEvents = schedule.filter(event => new Date(event.date) >= oneYearAgo && new Date(event.date) <= currentDate);

    const attendanceCounts = {};
    members.forEach(member => attendanceCounts[member.name] = 0);

    recentEvents.forEach(event => {
        Object.entries(event.rsvps).forEach(([member, status]) => {
            if (status === 'attending') {
                attendanceCounts[member]++;
            }
        });
    });

    let reportHTML = '<h3>12-Month Attendance Report</h3>';
    reportHTML += '<table><tr><th>Member</th><th>Events Attended</th></tr>';

    // Sort the members alphabetically by name
    const sortedMembers = Object.keys(attendanceCounts).sort((a, b) => a.localeCompare(b));

    sortedMembers.forEach(member => {
        const count = attendanceCounts[member];
        const percentage = (count / recentEvents.length * 100).toFixed(2);
        reportHTML += `
            <tr>
                <td>${member}</td>
                <td>${count} / ${percentage}%</td>
            </tr>
        `;
    });

    reportHTML += '</table>';
    reportContainer.innerHTML = reportHTML;
}
function togglePastEventDetails(index) {
    const detailsElement = document.getElementById(`pastEventDetails-${index}`);
    const headerElement = detailsElement.previousElementSibling.querySelector('.expand-icon');
    
    if (detailsElement.style.display === 'none') {
        detailsElement.style.display = 'block';
        headerElement.textContent = '▲';
    } else {
        detailsElement.style.display = 'none';
        headerElement.textContent = '▼';
    }
}
function toggleMemberList() {
    const memberListContainer = document.getElementById('memberListContainer');
    const headerElement = memberListContainer.previousElementSibling.querySelector('.expand-icon');
    
    if (memberListContainer.style.display === 'none') {
        memberListContainer.style.display = 'block';
        headerElement.textContent = '▲';
    } else {
        memberListContainer.style.display = 'none';
        headerElement.textContent = '▼';
    }
}
function toggleEventList() {
    const scheduleContainer = document.getElementById('scheduleContainer');
    const headerElement = scheduleContainer.previousElementSibling.querySelector('.expand-icon');
    
    if (scheduleContainer.style.display === 'none') {
        scheduleContainer.style.display = 'block';
        headerElement.textContent = '▲';
    } else {
        scheduleContainer.style.display = 'none';
        headerElement.textContent = '▼';
    }
}
function loadEventForEditing() {
    const editEventSelect = document.getElementById('editEventSelect');
    const selectedIndex = editEventSelect.value;
    
    if (selectedIndex !== "") {
        const event = schedule[selectedIndex];
        document.getElementById('editEventDate').value = event.date;
        document.getElementById('editEventHost').value = event.host;
        document.getElementById('editEventLocation').value = event.location;
    } else {
        document.getElementById('editEventDate').value = '';
        document.getElementById('editEventHost').value = '';
        document.getElementById('editEventLocation').value = '';
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('newEventHost').addEventListener('change', updateHostLocation);
    document.getElementById('editEventHost').addEventListener('change', updateHostLocation);
    document.getElementById('editEventSelect').addEventListener('change', loadEventForEditing);
});

// Export functions to global scope
window.toggleMemberList = toggleMemberList;
window.toggleEventList = toggleEventList;
window.addMember = addMember;
window.startEditMember = startEditMember;
window.confirmDeleteMember = confirmDeleteMember;
window.composeMemberEmail = composeMemberEmail;
window.addEvent = addEvent;
window.saveEventEdits = saveEventEdits;
window.deleteEvent = deleteEvent;
window.updateRSVP = updateRSVP;
window.toggleEventDetails = toggleEventDetails;
window.composeInvitationEmail = composeInvitationEmail;
window.composeReminderEmail = composeReminderEmail;
window.composeFinalConfirmationEmail = composeFinalConfirmationEmail;
window.showPastEventsReport = showPastEventsReport;
window.showAttendanceReport = showAttendanceReport;
