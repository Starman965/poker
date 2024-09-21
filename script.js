// Initialize Firebase
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getDatabase,
    ref, 
    onValue, 
    set, 
    push, 
    update, 
    remove,
    get
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";

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

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function loadDataFromFirebase() {
    const dbRef = ref(database, '/');
    get(dbRef).then((snapshot) => {
        const data = snapshot.val();
        
        if (data && data.members) {
            members = Object.values(data.members);
        } else {
            members = [];
            console.warn('No members data found or invalid structure');
        }
        
        if (data && data.schedule) {
            schedule = Object.entries(data.schedule).map(([key, value]) => ({
                id: key,
                ...value
            }));
        } else {
            schedule = [];
            console.warn('No schedule data found or invalid structure');
        }
        
        console.log('Data loaded:', { members, schedule });
        
        renderMembers();
        renderSchedule();
        populateHostDropdowns();
        console.log('Data loaded successfully from Firebase!');
    }).catch((error) => {
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
        const membersRef = ref(database, 'members');
        
        // Get the current number of members to use as the new index
        get(membersRef).then((snapshot) => {
            const currentMemberCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
            
            // Add the new member with a numeric key
            set(ref(database, `members/${currentMemberCount}`), newMember)
                .then(() => {
                    console.log('Member added successfully');
                    loadDataFromFirebase(); // Reload data to reflect changes
                })
                .catch((error) => console.error('Error adding member:', error));
        }).catch((error) => console.error('Error getting member count:', error));

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
    const eventDisplaySelector = document.getElementById('eventDisplaySelector');
    if (!scheduleContainer || !editEventSelect || !eventDisplaySelector) {
        console.error('Required elements not found');
        return;
    }
    scheduleContainer.innerHTML = '';
    editEventSelect.innerHTML = '<option value="">Select an event</option>';

    schedule.sort((a, b) => new Date(a.date) - new Date(b.date));

    const currentDate = new Date();
    const upcomingEvents = schedule.filter(event => new Date(event.date) >= currentDate);
    const currentEvent = upcomingEvents[0];

   function renderEvent(event, isCurrent) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    eventDiv.innerHTML = `
        <div class="event-header" onclick="toggleEventDetails('${event.id}')">
            <h3>${isCurrent ? '<strong>' : ''}${formatDate(event.date)} - ${event.location} (Host: ${event.host})${isCurrent ? '</strong>' : ''}</h3>
            <span class="expand-icon">▼</span>
        </div>
        <div class="event-details" id="eventDetails-${event.id}" style="display: none;">
            <div class="rsvp-details">
                ${Object.entries(event.rsvps).map(([name, status]) => `
                    <div class="event-rsvp">
                        <p>${name}:</p>
                        <select onchange="updateRSVP('${event.id}', '${name}', this.value)" style="color: ${getStatusColor(status)}">
                            <option value="no-response" ${status === 'no-response' ? 'selected' : ''}>No Response</option>
                            <option value="attending" ${status === 'attending' ? 'selected' : ''}>Attending</option>
                            <option value="not-attending" ${status === 'not-attending' ? 'selected' : ''}>Not Attending</option>
                            <option value="maybe" ${status === 'maybe' ? 'selected' : ''}>Maybe</option>
                        </select>
                    </div>
                `).join('')}
            </div>
            <div class="rsvp-totals" id="rsvpTotals-${event.id}">
                <p>Total Attending: <span id="totalAttending-${event.id}">0</span></p>
                <p>Total Not Attending: <span id="totalNotAttending-${event.id}">0</span></p>
                <p>Total No Response: <span id="totalNoResponse-${event.id}">0</span></p>
                <p>Total Maybe: <span id="totalMaybe-${event.id}">0</span></p>
            </div>
            <button onclick="composeInvitationEmail('${event.id}')">Send Invitation</button>
            <button onclick="composeReminderEmail('${event.id}')">Send Reminder</button>
            <button onclick="composeFinalConfirmationEmail('${event.id}')">Send Final Confirmation</button>
        </div>
    `;
    scheduleContainer.appendChild(eventDiv);
    editEventSelect.innerHTML += `<option value="${event.id}">${formatDate(event.date)} - ${event.location} (Host: ${event.host})</option>`;
    
    // Update totals immediately after rendering
    updateTotalAttending(event.id);
}
function displayEvents() {
        scheduleContainer.innerHTML = '';
        const displayMode = eventDisplaySelector.value;
        
        if (displayMode === 'current' && currentEvent) {
            renderEvent(currentEvent, true);
        } else if (displayMode === 'future') {
            upcomingEvents.forEach((event, index) => renderEvent(event, index === 0));
        }
    }

    eventDisplaySelector.addEventListener('change', displayEvents);
    displayEvents();
}
    
function createNewEvent(date, host, location) {
    const newEvent = {
        date,
        host,
        location,
        rsvps: {}
    };

    // Initialize RSVP for all members
    members.forEach(member => {
        newEvent.rsvps[member.name] = 'no-response';
    });

    return newEvent;
}
function addEvent() {
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

        // Initialize RSVP for all members
        members.forEach(member => {
            newEvent.rsvps[member.name] = 'no-response';
        });

        push(ref(database, 'schedule'), newEvent)
            .then((newEventRef) => {
                console.log('Event added successfully');
                // Add the new event to the local schedule array
                schedule.push({
                    id: newEventRef.key,
                    ...newEvent
                });
                renderSchedule(); // Re-render the schedule
                // Clear input fields
                document.getElementById('newEventDate').value = '';
                document.getElementById('newEventHost').value = '';
                document.getElementById('newEventLocation').value = '';
            })
            .catch((error) => console.error('Error adding event:', error));
    } else {
        alert('Please fill in all fields for the new event.');
    }
}
// new save event edits
function saveEventEdits() {
    const editEventSelect = document.getElementById('editEventSelect');
    const selectedEventId = editEventSelect.value;
    
    if (selectedEventId === "") {
        alert("Please select an event to edit.");
        return;
    }

    const newDate = document.getElementById('editEventDate').value;
    const newHost = document.getElementById('editEventHost').value;
    const newLocation = document.getElementById('editEventLocation').value.trim(); // Changed from 'newEventLocation' to 'editEventLocation'

    if (newDate && newHost && newLocation) {
        const updatedEvent = {
            date: newDate,
            host: newHost,
            location: newLocation,
        };

        update(ref(database, `schedule/${selectedEventId}`), updatedEvent)
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
    const selectedEventId = editEventSelect.value;
    
    if (!selectedEventId) {
        alert("Please select an event to delete.");
        return;
    }

    if (confirm('Are you sure you want to delete this event?')) {
        // Reference to the specific event in Firebase
        const eventRef = ref(database, `schedule/${selectedEventId}`);

        // Remove the event from Firebase
        remove(eventRef)
            .then(() => {
                console.log('Event deleted successfully from Firebase');
                
                // Remove the event from the local schedule array
                schedule = schedule.filter(event => event.id !== selectedEventId);
                
                // Re-render the schedule
                renderSchedule();
                
                // Clear the edit fields
                document.getElementById('editEventDate').value = '';
                document.getElementById('editEventHost').value = '';
                document.getElementById('editEventLocation').value = '';
                
                alert("Event deleted successfully!");
            })
            .catch((error) => {
                console.error('Error deleting event:', error);
                alert("Error deleting event. Please try again.");
            });
    }
}
function updateRSVP(eventId, memberName, status) {
    const event = schedule.find(e => e.id === eventId);
    if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return;
    }

    const updatedRsvps = {
        ...event.rsvps,
        [memberName]: status
    };

    update(ref(database, `schedule/${eventId}/rsvps`), updatedRsvps)
        .then(() => {
            console.log('RSVP updated successfully');
            event.rsvps = updatedRsvps;
            updateTotalAttending(eventId);
            
            // Update the color of the select element based on the status
            const selectElement = document.querySelector(`#eventDetails-${eventId} select[onchange*="${memberName}"]`);
            if (selectElement) {
                selectElement.style.color = getStatusColor(status);
            }
            
            // Ensure the event details remain open
            const detailsElement = document.getElementById(`eventDetails-${eventId}`);
            if (detailsElement) {
                detailsElement.style.display = 'block';
                const headerElement = detailsElement.previousElementSibling.querySelector('.expand-icon');
                if (headerElement) {
                    headerElement.textContent = '▲';
                }
            }
        })
        .catch((error) => {
            console.error('Error updating RSVP:', error);
        });
}

function getStatusColor(status) {
    switch (status) {
        case 'no-response': return 'red';
        case 'attending': return 'green';
        case 'not-attending':
        case 'maybe':
        default: return 'black';
    }
}
function updateTotalAttending(eventId) {
    const totalAttendingElement = document.getElementById(`totalAttending-${eventId}`);
    const totalNotAttendingElement = document.getElementById(`totalNotAttending-${eventId}`);
    const totalNoResponseElement = document.getElementById(`totalNoResponse-${eventId}`);
    const totalMaybeElement = document.getElementById(`totalMaybe-${eventId}`);

    if (!totalAttendingElement || !totalNotAttendingElement || !totalNoResponseElement || !totalMaybeElement) {
        console.warn(`Total element not found for event ID ${eventId}`);
        return;
    }

    const event = schedule.find(e => e.id === eventId);
    if (!event || !event.rsvps) {
        console.warn(`Invalid event data for ID ${eventId}`, event);
        totalAttendingElement.textContent = '0';
        totalNotAttendingElement.textContent = '0';
        totalNoResponseElement.textContent = '0';
        totalMaybeElement.textContent = '0';
        return;
    }

    const totalAttending = Object.values(event.rsvps).filter(status => status === 'attending').length;
    const totalNotAttending = Object.values(event.rsvps).filter(status => status === 'not-attending').length;
    const totalNoResponse = Object.values(event.rsvps).filter(status => status === 'no-response').length;
    const totalMaybe = Object.values(event.rsvps).filter(status => status === 'maybe').length;

    totalAttendingElement.textContent = totalAttending.toString();
    totalNotAttendingElement.textContent = totalNotAttending.toString();
    totalNoResponseElement.textContent = totalNoResponse.toString();
    totalMaybeElement.textContent = totalMaybe.toString();
}
function toggleEventDetails(eventId) {
    const detailsElement = document.getElementById(`eventDetails-${eventId}`);
    const headerElement = detailsElement.previousElementSibling.querySelector('.expand-icon');
    
    console.log(`Toggling details for event ID: ${eventId}`);
    if (detailsElement.style.display === 'none' || detailsElement.style.display === '') {
        detailsElement.style.display = 'block';
        headerElement.textContent = '▲';
        console.log(`Showing details for event ID: ${eventId}`);
        // Update totals when the event is expanded
        updateTotalAttending(eventId);
    } else {
        detailsElement.style.display = 'none';
        headerElement.textContent = '▼';
        console.log(`Hiding details for event ID: ${eventId}`);
    }
}
function populateHostDropdowns() {
    const newEventHost = document.getElementById('newEventHost');
    const editEventHost = document.getElementById('editEventHost');
    
    if (!newEventHost || !editEventHost) {
        console.error('Host dropdown elements not found');
        return;
    }

    const hostOptions = members.map(member => `<option value="${member.name}">${member.name}</option>`).join('');
    
    newEventHost.innerHTML = `<option value="">Select a host</option>${hostOptions}`;
    editEventHost.innerHTML = `<option value="">Select a host</option>${hostOptions}`;

    console.log('Host dropdowns populated');
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
function composeInvitationEmail(eventId) {
    const event = schedule.find(e => e.id === eventId);
    if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return;
    }

    const rsvpLink = `https://www.danvillepokergroup.com/rsvp.html?token=${eventId}`;
    const subject = encodeURIComponent(`[DanvillePoker] Reminder: Poker Night -  ${formatDate(event.date)} @ 7:00pm - Host: ${event.host}`);
    const body = encodeURIComponent(`Danville Poker Group,

It's that time again for our monthly poker group this month:

Date: ${formatDate(event.date)}
Time: 7:00 PM
Location: ${event.location}
Host: ${event.host}

Please RSVP ASAP so we can start planning. You can submit your RSVP here:
${rsvpLink}

You can also see the upcoming hosting schedule at: https://www.danvillepokergroup.com/scheduled.html

Looking forward to seeing you there!

Best regards,
Nasser`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=DanvillePoker@groups.io&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

function composeReminderEmail(eventId) {
    const event = schedule.find(e => e.id === eventId);
    if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return;
    }

    const rsvpLink = `https://www.danvillepokergroup.com/rsvp.html?token=${eventId}`;
    const attendees = [];
    const maybes = [];
    const notAttending = [];
    const noResponse = [];

    Object.entries(event.rsvps).forEach(([name, status]) => {
        switch(status) {
            case 'attending':
                attendees.push(name);
                break;
            case 'maybe':
                maybes.push(name);
                break;
            case 'not-attending':
                notAttending.push(name);
                break;
            default:
                noResponse.push(name);
        }
    });

    const subject = encodeURIComponent(`[DanvillePoker] Reminder: Poker Night -  ${formatDate(event.date)} @ 7:00pm - Host: ${event.host}`);
    const body = encodeURIComponent(`Danville Poker Group,

This is a reminder about our upcoming poker night:

Date: ${formatDate(event.date)}
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

To those who haven't RSVP'd or are still in the "Maybe" category, please RSVP as soon as possible so we can get a final count. You can submit or update your RSVP here:
${rsvpLink}

Looking forward to seeing you all!

Best regards,
Nasser`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=DanvillePoker@groups.io&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

function composeFinalConfirmationEmail(eventId) {
    const event = schedule.find(e => e.id === eventId);
    if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return;
    }

    const rsvpLink = `https://www.danvillepokergroup.com/rsvp.html?token=${eventId}`;
    const attendees = [];
    const maybes = [];
    const notAttending = [];

    Object.entries(event.rsvps).forEach(([name, status]) => {
        switch(status) {
            case 'attending':
                attendees.push(name);
                break;
            case 'maybe':
                maybes.push(name);
                break;
            case 'not-attending':
                notAttending.push(name);
                break;
        }
    });

    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

    const subject = encodeURIComponent(`[DanvillePoker] Poker Night -  ${formatDate(event.date)} @ 7:00pm - Host: ${event.host}`);
    const body = encodeURIComponent(`Danville Poker Group,

This is the final confirmation for our upcoming poker night:

Date: ${formatDate(event.date)}
Time: 7:00 PM
Location: ${event.location}
Host: ${event.host}

Google Maps Link: ${googleMapsLink}

Attendees (${attendees.length}):
${attendees.join('\n')}

Maybe (${maybes.length}):
${maybes.join('\n')}

Not Attending (${notAttending.length}):
${notAttending.join('\n')}

If you need to make any last-minute changes to your RSVP, you can do so here:
${rsvpLink}

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
                    <h4>${formatDate(event.date)} - ${event.host} - ${event.location}</h4>
                    <span class="expand-icon">▼</span>
                </div>
                <div class="event-details" id="pastEventDetails-${index}" style="display: none;">
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

    let reportHTML = '<h3>2024 Attendance Report</h3>';
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
function showHostingReport() {
    const reportContainer = document.getElementById('reportContainer');
    if (!reportContainer) return;

    const hostingCounts = {};
    members.forEach(member => {
        hostingCounts[member.name] = {
            2024: 0, 2025: 0, 2026: 0, 2027: 0, 2028: 0, 2029: 0, 2030: 0
        };
    });

    schedule.forEach(event => {
        const eventYear = new Date(event.date).getFullYear();
        if (eventYear >= 2024 && eventYear <= 2030) {
            if (hostingCounts[event.host]) {
                hostingCounts[event.host][eventYear]++;
            }
        }
    });

    let reportHTML = '<h3>Hosting Report</h3>';
    reportHTML += '<table><tr><th>Member</th><th>2024</th><th>2025</th><th>2026</th><th>2027</th><th>2028</th><th>2029</th><th>2030</th></tr>';

    Object.entries(hostingCounts).forEach(([member, years]) => {
        reportHTML += `
            <tr>
                <td>${member}</td>
                <td>${years[2024]}</td>
                <td>${years[2025]}</td>
                <td>${years[2026]}</td>
                <td>${years[2027]}</td>
                <td>${years[2028]}</td>
                <td>${years[2029]}</td>
                <td>${years[2030]}</td>
            </tr>
        `;
    });

    reportHTML += '</table>';
    reportContainer.innerHTML = reportHTML;
}

function togglePastEventDetails(index) {
    const detailsElement = document.getElementById(`pastEventDetails-${index}`);
    const headerElement = detailsElement.previousElementSibling.querySelector('.expand-icon');
    
    if (detailsElement.style.display === 'none' || detailsElement.style.display === '') {
        detailsElement.style.display = 'block';
        headerElement.textContent = '▲';
    } else {
        detailsElement.style.display = 'none';
        headerElement.textContent = '▼';
    }
}

// Export the function to the global scope
window.togglePastEventDetails = togglePastEventDetails;

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
    const selectedEventId = editEventSelect.value;
    
    if (selectedEventId !== "") {
        const event = schedule.find(e => e.id === selectedEventId);
        if (event) {
            document.getElementById('editEventDate').value = event.date;
            document.getElementById('editEventHost').value = event.host;
            document.getElementById('editEventLocation').value = event.location;
        } else {
            console.error(`Event with ID ${selectedEventId} not found`);
        }
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
 const eventDisplaySelector = document.getElementById('eventDisplaySelector');
    if (eventDisplaySelector) {
        eventDisplaySelector.addEventListener('change', renderSchedule);
    }
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
window.showHostingReport = showHostingReport;
