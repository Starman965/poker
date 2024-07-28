// Firebase configuration
const firebaseConfig = {
    // Your web app's Firebase configuration
    // You can find this in your Firebase project settings
    databaseURL: "https://poker-a2e1c-default-rtdb.firebaseio.com",
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Get a reference to the database service
  const database = firebase.database();
  
  let members = [];
  let schedule = [];
  
  // Function to load data from Firebase
  function loadDataFromFirebase() {
    database.ref('/').once('value').then((snapshot) => {
      const data = snapshot.val();
      members = data.members || [];
      schedule = data.schedule || [];
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
    database.ref('/').set({
      members: members,
      schedule: schedule
    }).then(() => {
      console.log('Data saved successfully to Firebase!');
    }).catch((error) => {
      console.error('Error saving data to Firebase:', error);
    });
  }
  
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
          members.push({ name, email, location });
          renderMembers();
          populateHostDropdowns();
          saveDataToFirebase();
          
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
          members[index] = { name, email, location };
          renderMembers();
          populateHostDropdowns();
          saveDataToFirebase();
          
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
          members.splice(index, 1);
          renderMembers();
          populateHostDropdowns();
          saveDataToFirebase();
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
          schedule.push(newEvent);
          renderSchedule();
          saveDataToFirebase();
          
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
          schedule[selectedIndex].date = newDate;
          schedule[selectedIndex].host = newHost;
          schedule[selectedIndex].location = newLocation;
          
          renderSchedule();
          saveDataToFirebase();
          alert("Event updated successfully!");
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
          schedule.splice(selectedIndex, 1);
          renderSchedule();
          saveDataToFirebase();
          alert("Event deleted successfully!");
      }
  }
  
  function updateRSVP(eventIndex, memberName, status) {
      schedule[eventIndex].rsvps[memberName] = status;
      updateTotalAttending(eventIndex);
      saveDataToFirebase();
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
  
  function populateHostDropdowns() {
      const newEventHost = document.getElementById('newEventHost');
      const editEventHost = document.getElementById('editEventHost');
      
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
  
  // Add event listeners
  document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('newEventHost').addEventListener('change', updateHostLocation);
      document.getElementById('editEventHost').addEventListener('change', updateHostLocation);
      document.getElementById('editEventSelect').addEventListener('change', loadEventForEditing);
  });