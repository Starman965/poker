// Global variables
let currentUser = null;
let isAdmin = false;
let members = [];
let schedule = [];
let polls = [];
let editingMemberIndex = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    initializeNavigation();
    
    // Check for event parameter and navigate to RSVP page if present
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdFromUrl = urlParams.get('event');
    
    if (eventIdFromUrl) {
        // Load data first, then navigate to RSVP
        loadData().then(() => {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                navigateToPage('rsvp');
                // Re-run setupRSVPPage to ensure event is selected
                setupRSVPPage();
            }, 100);
        });
    } else {
        // Normal page load
        loadData();
    }
});

// ==================== AUTHENTICATION ====================

function initializeAuth() {
    const authButton = document.getElementById('authButton');
    const adminInfo = document.getElementById('adminInfo');
    const adminEmail = document.getElementById('adminEmail');
    
    // Make admin info badge clickable to sign out
    adminInfo.addEventListener('click', () => {
        if (currentUser && isAdmin) {
            if (confirm('Sign out?')) {
                signOut();
            }
        }
    });
    
    auth.onAuthStateChanged(user => {
        currentUser = user;
        
        if (user) {
            isAdmin = ADMIN_EMAILS.includes(user.email);
            
            if (isAdmin) {
                // Show admin info badge, hide auth button
                adminInfo.style.display = 'block';
                adminEmail.textContent = user.email;
                authButton.style.display = 'none';
                showAdminNavigation();
            } else {
                // Non-admin user - show sign out button
                adminInfo.style.display = 'none';
                authButton.style.display = 'block';
                authButton.textContent = 'Sign Out';
                authButton.onclick = signOut;
            }
        } else {
            // Not logged in - show login button
            isAdmin = false;
            authButton.style.display = 'block';
            authButton.textContent = 'Admin Login';
            authButton.onclick = signIn;
            adminInfo.style.display = 'none';
            hideAdminNavigation();
        }
    });
}

function signIn() {
    // Show login modal
    showLoginModal();
}

function showLoginModal() {
    // Create modal HTML
    const modalHTML = `
        <div id="loginModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Admin Login</h2>
                    <button class="modal-close" onclick="closeLoginModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" class="form-input" placeholder="admin@example.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" class="form-input" placeholder="Password">
                    </div>
                    <div id="loginError" class="error-message" style="display: none;"></div>
                    <button class="btn btn-primary" onclick="submitLogin()" style="width: 100%;">Login</button>
                    <button class="btn btn-secondary" onclick="showForgotPassword()" style="width: 100%; margin-top: 10px;">Forgot Password?</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Allow Enter key to submit
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitLogin();
        }
    });
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.remove();
    }
}

async function submitLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!email || !password) {
        errorDiv.textContent = 'Please enter email and password';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        closeLoginModal();
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Login failed: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

function showForgotPassword() {
    const modalBody = document.querySelector('#loginModal .modal-body');
    modalBody.innerHTML = `
        <p>Enter your email address and we'll send you a password reset link.</p>
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="resetEmail" class="form-input" placeholder="admin@example.com">
        </div>
        <div id="resetError" class="error-message" style="display: none;"></div>
        <div id="resetSuccess" class="success-message" style="display: none;"></div>
        <button class="btn btn-primary" onclick="submitPasswordReset()" style="width: 100%;">Send Reset Link</button>
        <button class="btn btn-secondary" onclick="closeLoginModal(); signIn();" style="width: 100%; margin-top: 10px;">Back to Login</button>
    `;
}

async function submitPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    const errorDiv = document.getElementById('resetError');
    const successDiv = document.getElementById('resetSuccess');
    
    if (!email) {
        errorDiv.textContent = 'Please enter your email address';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        errorDiv.style.display = 'none';
        successDiv.textContent = 'Password reset email sent! Check your inbox.';
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            closeLoginModal();
        }, 3000);
    } catch (error) {
        console.error('Reset error:', error);
        errorDiv.textContent = 'Error: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

async function signOut() {
    try {
        await auth.signOut();
        navigateToPage('home');
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

function showAdminNavigation() {
    document.getElementById('adminNav').style.display = 'block';
}

function hideAdminNavigation() {
    document.getElementById('adminNav').style.display = 'none';
    // If user is on an admin page, navigate to home
    const currentPage = document.querySelector('.page.active');
    if (currentPage && currentPage.classList.contains('admin-page')) {
        navigateToPage('home');
    }
}

// ==================== NAVIGATION ====================

function initializeNavigation() {
    // Hamburger menu toggle for mobile
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navClose = document.getElementById('navClose');
    const leftNav = document.getElementById('leftNav');
    const navOverlay = document.getElementById('navOverlay');
    
    // Open menu
    hamburgerMenu.addEventListener('click', () => {
        leftNav.classList.add('mobile-open');
        navOverlay.classList.add('active');
        hamburgerMenu.classList.add('active');
    });
    
    // Close menu via close button
    navClose.addEventListener('click', () => {
        closeMenu();
    });
    
    // Close menu via overlay click
    navOverlay.addEventListener('click', () => {
        closeMenu();
    });
    
    // Helper function to close menu
    function closeMenu() {
        leftNav.classList.remove('mobile-open');
        navOverlay.classList.remove('active');
        hamburgerMenu.classList.remove('active');
    }
    
    // Page navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
            
            // Close mobile menu
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });
    
    // Quick links navigation
    document.querySelectorAll('.quick-link-card').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
        });
    });
}

function navigateToPage(pageName) {
    // Update active page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // Load page-specific data
    loadPageData(pageName);
}

function loadPageData(pageName) {
    switch(pageName) {
        case 'events':
            renderPublicEvents();
            break;
        case 'rsvp':
            setupRSVPPage();
            break;
        case 'reports':
            // Reports load on demand via buttons
            break;
        case 'gallery':
            loadGallery();
            break;
        case 'admin-events':
            renderAdminEvents();
            break;
        case 'admin-members':
            renderMembersList();
            break;
        case 'admin-polls':
            renderPollsList();
            break;
        case 'admin-gallery':
            loadAdminGallery();
            break;
    }
}

// ==================== DATA LOADING ====================

async function loadData() {
    try {
        // Load members
        const membersSnapshot = await database.ref('members').once('value');
        const membersData = membersSnapshot.val();
        members = membersData ? Object.values(membersData) : [];
        
        // Load schedule
        const scheduleSnapshot = await database.ref('schedule').once('value');
        const scheduleData = scheduleSnapshot.val();
        schedule = scheduleData ? Object.entries(scheduleData).map(([id, data]) => ({
            id,
            ...data
        })) : [];
        
        // Load polls
        const pollsSnapshot = await database.ref('polls').once('value');
        const pollsData = pollsSnapshot.val();
        polls = pollsData ? Object.entries(pollsData).map(([id, data]) => ({
            id,
            ...data
        })) : [];
        
        console.log('Data loaded:', { members: members.length, schedule: schedule.length, polls: polls.length });
        
        // Initial page load
        renderPublicEvents();
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ==================== EVENTS (PUBLIC) ====================

function renderPublicEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort events by date
    const sortedEvents = [...schedule].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Filter upcoming events (compare dates only, not times)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcomingEvents = sortedEvents.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now;
    });
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<div class="card"><p class="text-muted">No upcoming events scheduled.</p></div>';
        return;
    }
    
    upcomingEvents.forEach((event, index) => {
        const eventCard = createEventCard(event, index === 0);
        container.appendChild(eventCard);
    });
}

function createEventCard(event, isCurrent = false) {
    const card = document.createElement('div');
    card.className = 'event-card' + (isCurrent ? ' current-event' : '');
    
    const rsvpCounts = getRSVPCounts(event.rsvps || {});
    
    // Create RSVP lists by status
    const attendingList = [];
    const notAttendingList = [];
    const maybeList = [];
    const noResponseList = [];
    
    Object.entries(event.rsvps || {}).forEach(([name, status]) => {
        // Display Russell as "attending (in spirit)"
        const displayName = name === 'Russell Hyzen' ? 'Russell Hyzen (in spirit)' : name;
        
        switch(status) {
            case 'attending':
                attendingList.push(displayName);
                break;
            case 'not-attending':
                notAttendingList.push(displayName);
                break;
            case 'maybe':
                maybeList.push(displayName);
                break;
            default:
                noResponseList.push(displayName);
        }
    });
    
    card.innerHTML = `
        <div class="event-header">
            <div>
                <h2>${formatDate(event.date)}</h2>
                ${isCurrent ? '<span class="event-badge">Next Event</span>' : ''}
            </div>
        </div>
        <div class="event-info">
            <p><strong>Host:</strong> ${event.host}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Time:</strong> 7:00 PM</p>
        </div>
        <div class="rsvp-summary">
            <div class="rsvp-stat attending">
                <span class="rsvp-stat-number">${rsvpCounts.attending}</span>
                <span class="rsvp-stat-label">Attending</span>
            </div>
            <div class="rsvp-stat not-attending">
                <span class="rsvp-stat-number">${rsvpCounts.notAttending}</span>
                <span class="rsvp-stat-label">Not Attending</span>
            </div>
            <div class="rsvp-stat maybe">
                <span class="rsvp-stat-number">${rsvpCounts.maybe}</span>
                <span class="rsvp-stat-label">Maybe</span>
            </div>
            <div class="rsvp-stat no-response">
                <span class="rsvp-stat-number">${rsvpCounts.noResponse}</span>
                <span class="rsvp-stat-label">No Response</span>
            </div>
        </div>
        <div class="event-rsvp-details" id="rsvp-details-${event.id}" style="display: none;">
            <div class="rsvp-lists">
                ${attendingList.length > 0 ? `
                    <div class="rsvp-list">
                        <h4 style="color: #27ae60;">✓ Attending (${attendingList.length})</h4>
                        <p>${attendingList.join(', ')}</p>
                    </div>
                ` : ''}
                ${notAttendingList.length > 0 ? `
                    <div class="rsvp-list">
                        <h4 style="color: #e74c3c;">✗ Not Attending (${notAttendingList.length})</h4>
                        <p>${notAttendingList.join(', ')}</p>
                    </div>
                ` : ''}
                ${maybeList.length > 0 ? `
                    <div class="rsvp-list">
                        <h4 style="color: #f39c12;">? Maybe (${maybeList.length})</h4>
                        <p>${maybeList.join(', ')}</p>
                    </div>
                ` : ''}
                ${noResponseList.length > 0 ? `
                    <div class="rsvp-list">
                        <h4 style="color: #95a5a6;">- No Response (${noResponseList.length})</h4>
                        <p>${noResponseList.join(', ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="toggleEventRsvpDetails('${event.id}')" style="width: 100%; margin-top: 15px;">
            <span id="toggle-text-${event.id}">View RSVP Details</span>
        </button>
    `;
    
    return card;
}

function getRSVPCounts(rsvps) {
    const counts = {
        attending: 0,
        notAttending: 0,
        maybe: 0,
        noResponse: 0
    };
    
    Object.values(rsvps).forEach(status => {
        switch(status) {
            case 'attending':
                counts.attending++;
                break;
            case 'not-attending':
                counts.notAttending++;
                break;
            case 'maybe':
                counts.maybe++;
                break;
            default:
                counts.noResponse++;
        }
    });
    
    return counts;
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Los_Angeles'
    }).format(date);
}

function toggleEventRsvpDetails(eventId) {
    const detailsElement = document.getElementById(`rsvp-details-${eventId}`);
    const toggleText = document.getElementById(`toggle-text-${eventId}`);
    
    if (detailsElement.style.display === 'none') {
        detailsElement.style.display = 'block';
        toggleText.textContent = 'Hide RSVP Details';
    } else {
        detailsElement.style.display = 'none';
        toggleText.textContent = 'View RSVP Details';
    }
}

// ==================== RSVP ====================

function setupRSVPPage() {
    const eventSelect = document.getElementById('rsvpEventSelect');
    const memberSelect = document.getElementById('rsvpMemberSelect');
    
    // Check for event parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdFromUrl = urlParams.get('event');
    
    // Populate event dropdown
    eventSelect.innerHTML = '<option value="">Select an event...</option>';
    const now = new Date();
    const upcomingEvents = schedule
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    upcomingEvents.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = `${formatDate(event.date)} - ${event.host}`;
        eventSelect.appendChild(option);
    });
    
    // Populate member dropdown (exclude Russell as he always attends in spirit)
    memberSelect.innerHTML = '<option value="">Select your name...</option>';
    members.forEach((member, index) => {
        if (member.name !== 'Russell Hyzen') {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = member.name;
            memberSelect.appendChild(option);
        }
    });
    
    // Event selection handler (must be attached before triggering)
    eventSelect.addEventListener('change', function() {
        const eventDetails = document.getElementById('rsvpEventDetails');
        if (this.value) {
            const event = schedule.find(e => e.id === this.value);
            document.getElementById('rsvpEventDate').textContent = formatDate(event.date);
            document.getElementById('rsvpEventHost').textContent = event.host;
            document.getElementById('rsvpEventLocation').textContent = event.location;
            eventDetails.style.display = 'block';
        } else {
            eventDetails.style.display = 'none';
        }
    });
    
    // Auto-select event: from URL token, or default to next upcoming event
    if (eventIdFromUrl && upcomingEvents.find(e => e.id === eventIdFromUrl)) {
        // Event from URL token
        eventSelect.value = eventIdFromUrl;
        eventSelect.dispatchEvent(new Event('change'));
    } else if (upcomingEvents.length > 0) {
        // Default to next upcoming event
        eventSelect.value = upcomingEvents[0].id;
        eventSelect.dispatchEvent(new Event('change'));
    }
    
    // Member selection handler
    memberSelect.addEventListener('change', function() {
        const imageContainer = document.getElementById('memberImageContainer');
        const statusContainer = document.getElementById('rsvpStatusContainer');
        const eventSelect = document.getElementById('rsvpEventSelect');
        
        if (this.value !== '' && eventSelect.value !== '') {
            const member = members[this.value];
            const event = schedule.find(e => e.id === eventSelect.value);
            
            // Show member image
            const imagePath = `assets/images/pokerboys/${member.name.split(' ')[0].toLowerCase()}.png`;
            document.getElementById('rsvpMemberImage').src = imagePath;
            imageContainer.style.display = 'block';
            
            // Show status selector and set current status
            const currentStatus = event.rsvps[member.name] || 'no-response';
            document.getElementById('rsvpStatus').value = currentStatus === 'no-response' ? '' : currentStatus;
            statusContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
            statusContainer.style.display = 'none';
        }
    });
    
    // Submit RSVP
    document.getElementById('submitRsvpBtn').addEventListener('click', submitRSVP);
}

async function submitRSVP() {
    const eventId = document.getElementById('rsvpEventSelect').value;
    const memberIndex = document.getElementById('rsvpMemberSelect').value;
    const status = document.getElementById('rsvpStatus').value;
    
    if (!eventId || memberIndex === '' || !status) {
        alert('Please select an event, your name, and your response.');
        return;
    }
    
    const member = members[memberIndex];
    
    try {
        await database.ref(`schedule/${eventId}/rsvps/${member.name}`).set(status);
        
        // Show success message
        alert(`RSVP submitted successfully! You are marked as: ${status.replace('-', ' ')}`);
        
        // Reload data
        await loadData();
        
        // Reset form
        document.getElementById('rsvpEventSelect').value = '';
        document.getElementById('rsvpMemberSelect').value = '';
        document.getElementById('rsvpEventDetails').style.display = 'none';
        document.getElementById('memberImageContainer').style.display = 'none';
        document.getElementById('rsvpStatusContainer').style.display = 'none';
        
    } catch (error) {
        console.error('Error submitting RSVP:', error);
        alert('Error submitting RSVP. Please try again.');
    }
}

// ==================== REPORTS ====================

function showAttendanceReport() {
    const output = document.getElementById('reportOutput');
    const attendance = {};
    
    // Show output area and scroll
    output.style.display = 'block';
    setTimeout(() => {
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);
    twelveMonthsAgo.setDate(today.getDate() + 1); // Start from day after 12 months ago
    
    const recentEvents = schedule.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00');
        return eventDate >= twelveMonthsAgo && eventDate <= today;
    });
    
    // Count both attended and eligible events for each member
    recentEvents.forEach(event => {
        if (event.rsvps) {
            Object.entries(event.rsvps).forEach(([member, status]) => {
                if (!attendance[member]) {
                    attendance[member] = {
                        attended: 0,
                        eligible: 0
                    };
                }
                
                attendance[member].eligible++;
                
                if (status === 'attending') {
                    attendance[member].attended++;
                }
            });
        }
    });
    
    // Calculate percentages and sort
    const sortedAttendance = Object.entries(attendance)
        .map(([member, data]) => ({
            member,
            attended: data.attended,
            eligible: data.eligible,
            percentage: (data.attended / data.eligible * 100)
        }))
        .sort((a, b) => {
            // Sort by percentage descending, then by attended count as tiebreaker
            if (b.percentage !== a.percentage) {
                return b.percentage - a.percentage;
            }
            return b.attended - a.attended;
        });
    
    // Generate HTML with trophies
    let html = '<h2>Past 12 Month Attendance Report</h2>';
    html += `<table class="attendance-report">
        <thead>
            <tr>
                <th>Member</th>
                <th>Events Attended</th>
                <th>Attendance %</th>
            </tr>
        </thead>
        <tbody>`;
    
    sortedAttendance.forEach(({ member, attended, eligible, percentage }) => {
        // Award trophies based on percentage
        let trophy = '';
        let trophyClass = '';
        
        if (percentage >= 90) {
            trophy = '🏆';
            trophyClass = 'trophy-gold';
        } else if (percentage >= 75) {
            trophy = '🥈';
            trophyClass = 'trophy-silver';
        } else if (percentage >= 60) {
            trophy = '🥉';
            trophyClass = 'trophy-bronze';
        }
        
        html += `
            <tr>
                <td>
                    <span class="member-name">${member}</span>
                    ${trophy ? `<span class="trophy ${trophyClass}">${trophy}</span>` : ''}
                </td>
                <td>${attended} / ${eligible}</td>
                <td><strong>${percentage.toFixed(1)}%</strong></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    // Add legend
    html += `
        <div class="report-legend">
            <h3>Award Levels</h3>
            <p><span class="trophy trophy-gold">🏆</span> Gold: 90%+ attendance</p>
            <p><span class="trophy trophy-silver">🥈</span> Silver: 75-89% attendance</p>
            <p><span class="trophy trophy-bronze">🥉</span> Bronze: 60-74% attendance</p>
        </div>
    `;
    
    // Add back button
    html += '<button class="btn btn-secondary back-to-reports-btn" onclick="backToReports()">← Back to Reports</button>';
    
    output.innerHTML = html;
}

function showAllTimeAttendanceReport() {
    const output = document.getElementById('reportOutput');
    const attendance = {};
    
    // Show output area and scroll
    output.style.display = 'block';
    setTimeout(() => {
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all past events (not future ones)
    const pastEvents = schedule.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00');
        return eventDate <= today;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Find earliest event date for display
    const earliestEvent = pastEvents.length > 0 ? pastEvents[0].date : null;
    
    // Count attendance for each member
    pastEvents.forEach(event => {
        if (event.rsvps) {
            Object.entries(event.rsvps).forEach(([member, status]) => {
                if (!attendance[member]) {
                    attendance[member] = {
                        attended: 0,
                        eligible: 0
                    };
                }
                
                attendance[member].eligible++;
                
                if (status === 'attending') {
                    attendance[member].attended++;
                }
            });
        }
    });
    
    // Calculate percentages and sort
    const sortedAttendance = Object.entries(attendance)
        .map(([member, data]) => ({
            member,
            attended: data.attended,
            eligible: data.eligible,
            percentage: (data.attended / data.eligible * 100)
        }))
        .sort((a, b) => {
            if (b.percentage !== a.percentage) {
                return b.percentage - a.percentage;
            }
            return b.attended - a.attended;
        });
    
    // Generate HTML with trophies
    let html = '<h2>All Time Attendance Report</h2>';
    
    if (earliestEvent) {
        const formattedDate = formatDate(earliestEvent);
        html += `<p class="text-muted" style="margin-bottom: 20px;">Data available from <strong>${formattedDate}</strong> to present</p>`;
    }
    
    html += `<table class="attendance-report">
        <thead>
            <tr>
                <th>Member</th>
                <th>Events Attended</th>
                <th>Attendance %</th>
            </tr>
        </thead>
        <tbody>`;
    
    sortedAttendance.forEach(({ member, attended, eligible, percentage }) => {
        // Award trophies based on percentage
        let trophy = '';
        let trophyClass = '';
        
        if (percentage >= 90) {
            trophy = '🏆';
            trophyClass = 'trophy-gold';
        } else if (percentage >= 75) {
            trophy = '🥈';
            trophyClass = 'trophy-silver';
        } else if (percentage >= 60) {
            trophy = '🥉';
            trophyClass = 'trophy-bronze';
        }
        
        html += `
            <tr>
                <td>
                    <span class="member-name">${member}</span>
                    ${trophy ? `<span class="trophy ${trophyClass}">${trophy}</span>` : ''}
                </td>
                <td>${attended} / ${eligible}</td>
                <td><strong>${percentage.toFixed(1)}%</strong></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    // Add legend
    html += `
        <div class="report-legend">
            <h3>Award Levels</h3>
            <p><span class="trophy trophy-gold">🏆</span> Gold: 90%+ attendance</p>
            <p><span class="trophy trophy-silver">🥈</span> Silver: 75-89% attendance</p>
            <p><span class="trophy trophy-bronze">🥉</span> Bronze: 60-74% attendance</p>
        </div>
    `;
    
    // Add back button
    html += '<button class="btn btn-secondary back-to-reports-btn" onclick="backToReports()">← Back to Reports</button>';
    
    output.innerHTML = html;
}

function showHostingReport() {
    const output = document.getElementById('reportOutput');
    const hostingCounts = {};
    
    // Show output area and scroll
    output.style.display = 'block';
    setTimeout(() => {
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    
    members.forEach(member => {
        hostingCounts[member.name] = { total: 0, 2024: 0, 2025: 0, 2026: 0, 2027: 0 };
    });
    
    schedule.forEach(event => {
        const year = new Date(event.date).getFullYear();
        if (hostingCounts[event.host]) {
            hostingCounts[event.host].total++;
            if (hostingCounts[event.host][year] !== undefined) {
                hostingCounts[event.host][year]++;
            }
        }
    });
    
    const sorted = Object.entries(hostingCounts).sort((a, b) => b[1].total - a[1].total);
    
    let html = '<h2>Hosting Report</h2>';
    html += '<table><thead><tr><th>Member</th><th>Total</th><th>2024</th><th>2025</th><th>2026</th><th>2027</th></tr></thead><tbody>';
    
    sorted.forEach(([member, counts]) => {
        html += `<tr>
            <td>${member}</td>
            <td>${counts.total}</td>
            <td>${counts[2024]}</td>
            <td>${counts[2025]}</td>
            <td>${counts[2026]}</td>
            <td>${counts[2027]}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    
    // Add back button
    html += '<button class="btn btn-secondary back-to-reports-btn" onclick="backToReports()">← Back to Reports</button>';
    
    output.innerHTML = html;
}

function showPastEventsReport() {
    const output = document.getElementById('reportOutput');
    
    // Show output area and scroll
    output.style.display = 'block';
    setTimeout(() => {
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    
    const now = new Date();
    
    const pastEvents = schedule
        .filter(event => new Date(event.date) < now)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '<h2>Past Events Report</h2>';
    
    if (pastEvents.length === 0) {
        html += '<p class="text-muted">No past events found.</p>';
    } else {
        html += '<table><thead><tr><th>Date</th><th>Host</th><th>Location</th><th>Attendees</th></tr></thead><tbody>';
        
        pastEvents.forEach(event => {
            const attendees = Object.entries(event.rsvps || {})
                .filter(([_, status]) => status === 'attending')
                .map(([name, _]) => name);
            
            html += `<tr>
                <td>${formatDate(event.date)}</td>
                <td>${event.host}</td>
                <td>${event.location}</td>
                <td>${attendees.length} (${attendees.join(', ')})</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
    }
    
    // Add back button
    html += '<button class="btn btn-secondary back-to-reports-btn" onclick="backToReports()">← Back to Reports</button>';
    
    output.innerHTML = html;
}

function backToReports() {
    const output = document.getElementById('reportOutput');
    const cardsGrid = document.querySelector('.report-cards-grid');
    
    // Hide report output
    output.style.display = 'none';
    output.innerHTML = '';
    
    // Scroll back to cards
    cardsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== GALLERY ====================

let galleryPhotos = [];
let currentPhotoIndex = 0;

async function loadGallery() {
    const container = document.getElementById('galleryGrid');
    container.innerHTML = '<div class="loading">Loading photos...</div>';
    
    try {
        const photosSnapshot = await database.ref('gallery').once('value');
        const photosData = photosSnapshot.val();
        
        if (!photosData || Object.keys(photosData).length === 0) {
            container.innerHTML = '<p class="text-muted">No photos available yet. Check back soon!</p>';
            return;
        }
        
        container.innerHTML = '';
        galleryPhotos = Object.entries(photosData).map(([id, data]) => ({ id, ...data }));
        
        // Sort by upload date (newest first)
        galleryPhotos.sort((a, b) => b.uploadedAt - a.uploadedAt);
        
        galleryPhotos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${photo.url}" alt="${photo.albumName}" loading="lazy">
                <div class="gallery-item-overlay">
                    <p><strong>${photo.albumName}</strong></p>
                    <p>${new Date(photo.uploadedAt).toLocaleDateString()}</p>
                </div>
            `;
            
            // Click to view in lightbox
            item.addEventListener('click', () => {
                openLightbox(index);
            });
            
            container.appendChild(item);
        });
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        container.innerHTML = '<p class="text-muted">Error loading photos. Please try again later.</p>';
    }
}

function openLightbox(index) {
    currentPhotoIndex = index;
    const photo = galleryPhotos[currentPhotoIndex];
    
    // Create lightbox if it doesn't exist
    let lightbox = document.getElementById('photoLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'photoLightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
                <button class="lightbox-prev" onclick="navigateLightbox(-1)">&#10094;</button>
                <button class="lightbox-next" onclick="navigateLightbox(1)">&#10095;</button>
                <img id="lightboxImage" src="" alt="">
                <div class="lightbox-info">
                    <p id="lightboxAlbum"></p>
                    <p id="lightboxDate"></p>
                    <p id="lightboxCounter"></p>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', handleLightboxKeyboard);
    }
    
    updateLightboxImage();
    lightbox.style.display = 'flex';
}

function closeLightbox() {
    const lightbox = document.getElementById('photoLightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
    }
}

function navigateLightbox(direction) {
    currentPhotoIndex += direction;
    
    // Loop around
    if (currentPhotoIndex < 0) {
        currentPhotoIndex = galleryPhotos.length - 1;
    } else if (currentPhotoIndex >= galleryPhotos.length) {
        currentPhotoIndex = 0;
    }
    
    updateLightboxImage();
}

function updateLightboxImage() {
    const photo = galleryPhotos[currentPhotoIndex];
    document.getElementById('lightboxImage').src = photo.url;
    document.getElementById('lightboxAlbum').innerHTML = `<strong>${photo.albumName}</strong>`;
    document.getElementById('lightboxDate').textContent = new Date(photo.uploadedAt).toLocaleDateString();
    document.getElementById('lightboxCounter').textContent = `${currentPhotoIndex + 1} of ${galleryPhotos.length}`;
}

function handleLightboxKeyboard(e) {
    const lightbox = document.getElementById('photoLightbox');
    if (!lightbox || lightbox.style.display === 'none') return;
    
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
    }
}

async function loadAdminGallery() {
    const container = document.getElementById('adminGalleryGrid');
    container.innerHTML = '<div class="loading">Loading photos...</div>';
    
    try {
        const photosSnapshot = await database.ref('gallery').once('value');
        const photosData = photosSnapshot.val();
        
        if (!photosData || Object.keys(photosData).length === 0) {
            container.innerHTML = '<p class="text-muted">No photos uploaded yet.</p>';
            return;
        }
        
        container.innerHTML = '';
        const photos = Object.entries(photosData).map(([id, data]) => ({ id, ...data }));
        
        // Sort by upload date (newest first)
        photos.sort((a, b) => b.uploadedAt - a.uploadedAt);
        
        photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.style.position = 'relative';
            
            item.innerHTML = `
                <img src="${photo.url}" alt="${photo.albumName}" loading="lazy">
                <div class="gallery-item-overlay">
                    <p><strong id="albumName-${photo.id}">${photo.albumName}</strong></p>
                    <p>${new Date(photo.uploadedAt).toLocaleDateString()}</p>
                    <div style="display: flex; gap: 5px; margin-top: 10px; flex-wrap: wrap;">
                        <button class="btn btn-secondary btn-sm" 
                                onclick="editAlbumName('${photo.id}', '${photo.albumName.replace(/'/g, "\\'")}')" 
                                style="flex: 1;">
                            Edit Name
                        </button>
                        <button class="btn btn-danger btn-sm" 
                                onclick="deletePhoto('${photo.id}', '${photo.storagePath}')" 
                                style="flex: 1;">
                            Delete
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
        
    } catch (error) {
        console.error('Error loading admin gallery:', error);
        container.innerHTML = '<p class="text-muted">Error loading photos. Please try again later.</p>';
    }
}

async function uploadPhotos() {
    const fileInput = document.getElementById('photoUpload');
    const albumName = document.getElementById('photoAlbumName').value.trim();
    
    if (!fileInput.files.length) {
        alert('Please select at least one photo.');
        return;
    }
    
    if (!albumName) {
        alert('Please enter an album name.');
        return;
    }
    
    const files = Array.from(fileInput.files);
    const totalFiles = files.length;
    let uploadedCount = 0;
    
    // Warn for large batches
    if (totalFiles > 50) {
        const proceed = confirm(`You're about to upload ${totalFiles} photos. This may take several minutes. Continue?`);
        if (!proceed) return;
    }
    
    // Create progress indicator
    const progressDiv = document.createElement('div');
    progressDiv.id = 'uploadProgress';
    progressDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; min-width: 250px;';
    progressDiv.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">Uploading Photos</h4>
        <div style="background: #f0f0f0; border-radius: 4px; height: 20px; overflow: hidden; margin-bottom: 10px;">
            <div id="progressBar" style="background: #4CAF50; height: 100%; width: 0%; transition: width 0.3s;"></div>
        </div>
        <p id="progressText" style="margin: 0; color: #666;">0 of ${totalFiles}</p>
    `;
    document.body.appendChild(progressDiv);
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    try {
        for (const file of files) {
            // Create unique filename
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(7);
            const filename = `${timestamp}_${randomSuffix}_${file.name}`;
            const storagePath = `gallery/${filename}`;
            
            // Upload to Firebase Storage
            const storageRef = storage.ref(storagePath);
            await storageRef.put(file);
            
            // Get download URL
            const downloadURL = await storageRef.getDownloadURL();
            
            // Save metadata to database
            await database.ref('gallery').push({
                url: downloadURL,
                albumName: albumName,
                uploadedAt: Date.now(),
                uploadedBy: currentUser.email,
                storagePath: storagePath,
                filename: file.name
            });
            
            uploadedCount++;
            
            // Update progress
            const percent = (uploadedCount / totalFiles) * 100;
            progressBar.style.width = percent + '%';
            progressText.textContent = `${uploadedCount} of ${totalFiles}`;
        }
        
        // Success
        progressDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #4CAF50;">✓ Upload Complete!</h4>
            <p style="margin: 0;">Successfully uploaded ${uploadedCount} photo(s)!</p>
        `;
        
        setTimeout(() => {
            document.body.removeChild(progressDiv);
        }, 3000);
        
        // Clear form
        fileInput.value = '';
        document.getElementById('photoAlbumName').value = '';
        
        // Reload gallery
        loadAdminGallery();
        
    } catch (error) {
        console.error('Error uploading photos:', error);
        progressDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #f44336;">⚠ Upload Error</h4>
            <p style="margin: 0;">Uploaded ${uploadedCount} of ${totalFiles}</p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">${error.message}</p>
        `;
        
        setTimeout(() => {
            document.body.removeChild(progressDiv);
        }, 5000);
    }
}

async function editAlbumName(photoId, currentName) {
    const newName = prompt('Edit Album Name:', currentName);
    
    if (newName === null || newName.trim() === '') {
        return; // User cancelled or entered empty string
    }
    
    if (newName === currentName) {
        return; // No change
    }
    
    try {
        // Update in Database
        await database.ref(`gallery/${photoId}`).update({
            albumName: newName.trim()
        });
        
        // Update the display immediately
        const albumNameElement = document.getElementById(`albumName-${photoId}`);
        if (albumNameElement) {
            albumNameElement.textContent = newName.trim();
        }
        
        alert('Album name updated successfully!');
        
    } catch (error) {
        console.error('Error updating album name:', error);
        alert('Error updating album name: ' + error.message);
    }
}

async function deletePhoto(photoId, storagePath) {
    if (!confirm('Are you sure you want to delete this photo?')) {
        return;
    }
    
    try {
        // Delete from Storage
        const storageRef = storage.ref(storagePath);
        await storageRef.delete();
        
        // Delete from Database
        await database.ref(`gallery/${photoId}`).remove();
        
        alert('Photo deleted successfully!');
        loadAdminGallery();
        
    } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Error deleting photo: ' + error.message);
    }
}

// ==================== ADMIN: EVENTS ====================

function renderAdminEvents() {
    populateHostDropdowns();
    populateEditEventDropdown();
    displayAdminEventsList();
}

function populateHostDropdowns() {
    const newEventHost = document.getElementById('newEventHost');
    const editEventHost = document.getElementById('editEventHost');
    
    const options = '<option value="">Select a host...</option>' + 
        members.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
    
    newEventHost.innerHTML = options;
    editEventHost.innerHTML = options;
    
    // Add change listeners to auto-fill location
    newEventHost.addEventListener('change', function() {
        const member = members.find(m => m.name === this.value);
        if (member) {
            document.getElementById('newEventLocation').value = member.location;
        }
    });
    
    editEventHost.addEventListener('change', function() {
        const member = members.find(m => m.name === this.value);
        if (member) {
            document.getElementById('editEventLocation').value = member.location;
        }
    });
}

function populateEditEventDropdown() {
    const editEventSelect = document.getElementById('editEventSelect');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcomingEvents = schedule
        .filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= now;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    editEventSelect.innerHTML = '<option value="">Select an event...</option>' +
        upcomingEvents.map(event => 
            `<option value="${event.id}">${formatDate(event.date)} - ${event.host}</option>`
        ).join('');
    
    editEventSelect.addEventListener('change', function() {
        if (this.value) {
            const event = schedule.find(e => e.id === this.value);
            document.getElementById('editEventDate').value = event.date;
            document.getElementById('editEventHost').value = event.host;
            document.getElementById('editEventLocation').value = event.location;
        } else {
            document.getElementById('editEventDate').value = '';
            document.getElementById('editEventHost').value = '';
            document.getElementById('editEventLocation').value = '';
        }
    });
}

function displayAdminEventsList() {
    const container = document.getElementById('adminEventsContainer');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcomingEvents = schedule
        .filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= now;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p class="text-muted">No upcoming events.</p>';
        return;
    }
    
    let html = '';
    upcomingEvents.forEach(event => {
        const rsvpCounts = getRSVPCounts(event.rsvps || {});
        const rsvpList = Object.entries(event.rsvps || {})
            .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
            .map(([name, status]) => {
                // Display Russell as "attending (in spirit)"
                const displayName = name === 'Russell Hyzen' ? 'Russell Hyzen (in spirit)' : name;
                const isRussell = name === 'Russell Hyzen';
                
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
                        <span style="flex: 1;">${displayName}</span>
                        <select 
                            class="form-select" 
                            style="width: auto; min-width: 150px; padding: 5px 10px; font-size: 14px;"
                            onchange="updateRSVP('${event.id}', '${name.replace(/'/g, "\\'")}', this.value)"
                            ${isRussell ? 'disabled' : ''}>
                            <option value="no-response" ${status === 'no-response' ? 'selected' : ''}>No Response</option>
                            <option value="attending" ${status === 'attending' ? 'selected' : ''}>Attending${isRussell ? ' (in spirit)' : ''}</option>
                            <option value="not-attending" ${status === 'not-attending' ? 'selected' : ''}>Not Attending</option>
                            <option value="maybe" ${status === 'maybe' ? 'selected' : ''}>Maybe</option>
                        </select>
                    </div>
                `;
            }).join('');
        
        html += `
            <div class="card" style="margin-bottom: 20px;">
                <h3>${formatDate(event.date)} - ${event.host}</h3>
                <p><strong>Location:</strong> ${event.location}</p>
                <div style="margin: 15px 0;">
                    <strong>RSVP Summary:</strong> 
                    <span style="color: #27ae60;">✓ ${rsvpCounts.attending}</span> | 
                    <span style="color: #e74c3c;">✗ ${rsvpCounts.notAttending}</span> | 
                    <span style="color: #f39c12;">? ${rsvpCounts.maybe}</span> | 
                    <span style="color: #95a5a6;">- ${rsvpCounts.noResponse}</span>
                </div>
                <div class="button-group" style="margin-bottom: 15px;">
                    <button class="btn btn-sm btn-secondary" onclick="sendInvitationEmail('${event.id}')">Send Invitation</button>
                    <button class="btn btn-sm btn-secondary" onclick="sendReminderEmail('${event.id}')">Send Reminder</button>
                    <button class="btn btn-sm btn-secondary" onclick="sendNonRespondersEmail('${event.id}')">Email Non-Responders</button>
                    <button class="btn btn-sm btn-secondary" onclick="sendFinalConfirmationEmail('${event.id}')">Final Confirmation</button>
                </div>
                <details>
                    <summary style="cursor: pointer; font-weight: bold; margin: 15px 0;">View/Edit All RSVPs</summary>
                    <div style="margin-top: 10px;">${rsvpList}</div>
                </details>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function getStatusColor(status) {
    switch(status) {
        case 'attending': return '#27ae60';
        case 'not-attending': return '#e74c3c';
        case 'maybe': return '#f39c12';
        default: return '#95a5a6';
    }
}

async function addEvent() {
    const date = document.getElementById('newEventDate').value;
    const host = document.getElementById('newEventHost').value;
    const location = document.getElementById('newEventLocation').value.trim();
    
    if (!date || !host || !location) {
        alert('Please fill in all fields.');
        return;
    }
    
    const newEvent = {
        date,
        host,
        location,
        rsvps: {}
    };
    
    // Initialize RSVPs for all members
    members.forEach(member => {
        // Russell Hyzen always attends in spirit
        if (member.name === 'Russell Hyzen') {
            newEvent.rsvps[member.name] = 'attending';
        } else {
            newEvent.rsvps[member.name] = 'no-response';
        }
    });
    
    try {
        await database.ref('schedule').push(newEvent);
        alert('Event added successfully!');
        
        // Clear form
        document.getElementById('newEventDate').value = '';
        document.getElementById('newEventHost').value = '';
        document.getElementById('newEventLocation').value = '';
        
        // Reload data
        await loadData();
        renderAdminEvents();
        
    } catch (error) {
        console.error('Error adding event:', error);
        alert('Error adding event. Please try again.');
    }
}

async function saveEventEdits() {
    const eventId = document.getElementById('editEventSelect').value;
    const date = document.getElementById('editEventDate').value;
    const host = document.getElementById('editEventHost').value;
    const location = document.getElementById('editEventLocation').value.trim();
    
    if (!eventId) {
        alert('Please select an event to edit.');
        return;
    }
    
    if (!date || !host || !location) {
        alert('Please fill in all fields.');
        return;
    }
    
    try {
        await database.ref(`schedule/${eventId}`).update({
            date,
            host,
            location
        });
        
        alert('Event updated successfully!');
        await loadData();
        renderAdminEvents();
        
    } catch (error) {
        console.error('Error updating event:', error);
        alert('Error updating event. Please try again.');
    }
}

async function deleteEvent() {
    const eventId = document.getElementById('editEventSelect').value;
    
    if (!eventId) {
        alert('Please select an event to delete.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        await database.ref(`schedule/${eventId}`).remove();
        alert('Event deleted successfully!');
        
        // Clear form
        document.getElementById('editEventSelect').value = '';
        document.getElementById('editEventDate').value = '';
        document.getElementById('editEventHost').value = '';
        document.getElementById('editEventLocation').value = '';
        
        await loadData();
        renderAdminEvents();
        
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
    }
}

async function updateRSVP(eventId, memberName, newStatus) {
    try {
        // Update the RSVP status in Firebase
        await database.ref(`schedule/${eventId}/rsvps/${memberName}`).set(newStatus);
        
        // Update local data
        await loadData();
        
        // Re-render the admin events list to show updated counts
        displayAdminEventsList();
        
        console.log(`Updated RSVP for ${memberName} to ${newStatus}`);
        
    } catch (error) {
        console.error('Error updating RSVP:', error);
        alert('Error updating RSVP. Please try again.');
    }
}

// ==================== ADMIN: MEMBERS ====================

function renderMembersList() {
    const container = document.getElementById('membersListContainer');
    const countEl = document.getElementById('memberCount');
    
    countEl.textContent = members.length;
    
    if (members.length === 0) {
        container.innerHTML = '<p class="text-muted">No members found.</p>';
        return;
    }
    
    container.innerHTML = members.map((member, index) => `
        <div class="member-card">
            <div class="member-info">
                <h3>${member.name}</h3>
                <p>📧 ${member.email}</p>
                <p>📱 ${member.phoneNumber || 'No phone'}</p>
                <p>📍 ${member.location}</p>
            </div>
            <div class="member-actions">
                <button class="btn btn-sm btn-secondary" onclick="editMember(${index})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteMember(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function addMember() {
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const phoneNumber = document.getElementById('memberPhone').value.trim();
    const location = document.getElementById('memberLocation').value.trim();
    
    if (!name || !email || !location) {
        alert('Please fill in name, email, and location.');
        return;
    }
    
    const newMember = { name, email, phoneNumber, location };
    
    try {
        if (editingMemberIndex !== null) {
            // Update existing member
            await database.ref(`members/${editingMemberIndex}`).set(newMember);
            alert('Member updated successfully!');
            editingMemberIndex = null;
        } else {
            // Add new member
            const currentCount = members.length;
            await database.ref(`members/${currentCount}`).set(newMember);
            alert('Member added successfully!');
        }
        
        // Clear form
        clearMemberForm();
        
        // Reload data
        await loadData();
        renderMembersList();
        
    } catch (error) {
        console.error('Error saving member:', error);
        alert('Error saving member. Please try again.');
    }
}

function editMember(index) {
    const member = members[index];
    editingMemberIndex = index;
    
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberEmail').value = member.email;
    document.getElementById('memberPhone').value = member.phoneNumber || '';
    document.getElementById('memberLocation').value = member.location;
    
    document.getElementById('memberFormTitle').textContent = 'Edit Member';
    document.getElementById('saveMemberBtn').textContent = 'Update Member';
    document.getElementById('cancelMemberBtn').style.display = 'inline-block';
    
    // Scroll to form
    document.getElementById('memberFormTitle').scrollIntoView({ behavior: 'smooth' });
}

async function deleteMember(index) {
    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }
    
    try {
        await database.ref(`members/${index}`).remove();
        alert('Member deleted successfully!');
        
        await loadData();
        renderMembersList();
        
    } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member. Please try again.');
    }
}

function cancelMemberEdit() {
    clearMemberForm();
}

function clearMemberForm() {
    document.getElementById('memberName').value = '';
    document.getElementById('memberEmail').value = '';
    document.getElementById('memberPhone').value = '';
    document.getElementById('memberLocation').value = '';
    
    document.getElementById('memberFormTitle').textContent = 'Add New Member';
    document.getElementById('saveMemberBtn').textContent = 'Add Member';
    document.getElementById('cancelMemberBtn').style.display = 'none';
    
    editingMemberIndex = null;
}

// ==================== ADMIN: POLLS ====================

function renderPollsList() {
    const container = document.getElementById('pollsListContainer');
    
    if (polls.length === 0) {
        container.innerHTML = '<p class="text-muted">No active polls.</p>';
        return;
    }
    
    container.innerHTML = polls.map(poll => {
        const voteCount = poll.votes ? Object.keys(poll.votes).length : 0;
        return `
            <div class="card" style="margin-bottom: 20px;">
                <h3>${poll.question}</h3>
                <p class="text-muted">Created: ${new Date(poll.created).toLocaleDateString()}</p>
                <p>Total votes: ${voteCount}</p>
                <div class="button-group">
                    <button class="btn btn-sm btn-secondary" onclick="viewPollResults('${poll.id}')">View Results</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePoll('${poll.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function addPollOption() {
    const container = document.getElementById('pollOptionsContainer');
    const optionCount = container.querySelectorAll('.poll-option').length;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input poll-option';
    input.placeholder = `Option ${optionCount + 1}`;
    
    container.appendChild(input);
}

async function createPoll() {
    const question = document.getElementById('pollQuestion').value.trim();
    const optionInputs = document.querySelectorAll('.poll-option');
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    if (!question) {
        alert('Please enter a question.');
        return;
    }
    
    if (options.length < 2) {
        alert('Please enter at least 2 options.');
        return;
    }
    
    const newPoll = {
        question,
        options,
        created: Date.now(),
        token: generateToken(),
        votes: {}
    };
    
    try {
        await database.ref('polls').push(newPoll);
        alert('Poll created successfully!');
        
        // Clear form
        document.getElementById('pollQuestion').value = '';
        document.getElementById('pollOptionsContainer').innerHTML = `
            <input type="text" class="form-input poll-option" placeholder="Option 1">
            <input type="text" class="form-input poll-option" placeholder="Option 2">
        `;
        
        await loadData();
        renderPollsList();
        
    } catch (error) {
        console.error('Error creating poll:', error);
        alert('Error creating poll. Please try again.');
    }
}

function viewPollResults(pollId) {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    
    const results = poll.options.map((option, index) => {
        const voteCount = poll.votes ? 
            Object.values(poll.votes).filter(vote => vote.option === index).length : 0;
        return { option, votes: voteCount };
    });
    
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
    
    let message = `Poll: ${poll.question}\n\nResults:\n`;
    results.forEach(r => {
        const percentage = totalVotes > 0 ? ((r.votes / totalVotes) * 100).toFixed(1) : 0;
        message += `${r.option}: ${r.votes} votes (${percentage}%)\n`;
    });
    message += `\nTotal votes: ${totalVotes}`;
    
    alert(message);
}

async function deletePoll(pollId) {
    if (!confirm('Are you sure you want to delete this poll?')) {
        return;
    }
    
    try {
        await database.ref(`polls/${pollId}`).remove();
        alert('Poll deleted successfully!');
        
        await loadData();
        renderPollsList();
        
    } catch (error) {
        console.error('Error deleting poll:', error);
        alert('Error deleting poll. Please try again.');
    }
}

function generateToken() {
    return Math.random().toString(36).substring(2, 12);
}

// ==================== EMAIL COMPOSITION ====================

function sendInvitationEmail(eventId) {
    const event = schedule.find(e => e.id === eventId);
    if (!event) {
        alert('Event not found');
        return;
    }
    
    const rsvpLink = `https://www.danvillepokergroup.com/?event=${eventId}#rsvp`;
    const subject = encodeURIComponent(`[DanvillePoker] Poker Night - ${formatDate(event.date)} @ 7:00pm - Host: ${event.host}`);
    const body = encodeURIComponent(`Danville Poker Group,

It's that time again for our monthly poker night!

Date: ${formatDate(event.date)}
Time: 7:00 PM
Location: ${event.location}
Host: ${event.host}

Please RSVP ASAP so we can start planning. You can submit your RSVP here:
${rsvpLink}

Looking forward to seeing you there!

Best regards,
Nasser

P.S. Don't forget to check out www.danvillepokergroup.com for photos, event calendar, game ideas, rules, bylaws, and more.`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=DanvillePoker@groups.io&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

function sendReminderEmail(eventId) {
    const event = schedule.find(e => e.id === eventId);
    if (!event) {
        alert('Event not found');
        return;
    }
    
    const rsvpLink = `https://www.danvillepokergroup.com/?event=${eventId}#rsvp`;
    const attendees = [];
    const maybes = [];
    const notAttending = [];
    const noResponse = [];
    
    Object.entries(event.rsvps || {}).forEach(([name, status]) => {
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
    
    const subject = encodeURIComponent(`[DanvillePoker] Reminder: Poker Night - ${formatDate(event.date)} @ 7:00pm - Host: ${event.host}`);
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
Nasser

P.S. Don't forget to check out www.danvillepokergroup.com for photos, event calendar, game ideas, rules, bylaws, and more.`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=DanvillePoker@groups.io&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

function sendNonRespondersEmail(eventId) {
    const event = schedule.find(e => e.id === eventId);
    if (!event) {
        alert('Event not found');
        return;
    }
    
    const rsvpLink = `https://www.danvillepokergroup.com/?event=${eventId}#rsvp`;
    
    // Filter non-responders and get their email addresses
    const nonResponders = members.filter(member => 
        event.rsvps[member.name] === 'no-response'
    );
    
    if (nonResponders.length === 0) {
        alert('Everyone has responded to this event!');
        return;
    }
    
    // Compose the email addresses string
    const toEmails = nonResponders.map(member => member.email).join(',');
    
    const subject = encodeURIComponent(`[DanvillePoker] Reminder: Poker Night - ${formatDate(event.date)} @ 7:00pm - Host: ${event.host}`);
    const body = encodeURIComponent(`Danville Poker Group,

We still haven't received your RSVP for our upcoming poker night:

Date: ${formatDate(event.date)}
Time: 7:00 PM
Location: ${event.location}
Host: ${event.host}

Your response is important for planning. Please take a moment to RSVP using the link below:

${rsvpLink}

We're looking forward to a great night of poker and hope you can join us!

Best regards,
Nasser

P.S. Don't forget to check out www.danvillepokergroup.com for photos, event calendar, game ideas, rules, bylaws, and more.`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmails)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

function sendFinalConfirmationEmail(eventId) {
    const event = schedule.find(e => e.id === eventId);
    if (!event) {
        alert('Event not found');
        return;
    }
    
    const rsvpLink = `https://www.danvillepokergroup.com/?event=${eventId}#rsvp`;
    const attendees = [];
    const maybes = [];
    const notAttending = [];
    
    Object.entries(event.rsvps || {}).forEach(([name, status]) => {
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
    
    const subject = encodeURIComponent(`[DanvillePoker] Final Confirmation: Poker Night - ${formatDate(event.date)} @ 7:00pm - Host: ${event.host}`);
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
Nasser

P.S. Don't forget to check out www.danvillepokergroup.com for photos, event calendar, game ideas, rules, bylaws, and more.`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=DanvillePoker@groups.io&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

