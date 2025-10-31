# Danville Poker Group Website v2

A modern, responsive website for managing the Danville Poker Group with both public and admin features.

## Features

### Public Features (No Login Required)
- **Home**: Welcome page with quick links
- **Events**: View all upcoming poker events with RSVP counts
- **RSVP**: Submit your response to upcoming events
- **Reports**: View attendance statistics and hosting history
- **Gallery**: Browse photos from past events (coming soon)

### Admin Features (Login Required)
Admins can access additional features after logging in with their Google account:

- **Manage Events**: Add, edit, and delete poker events
- **Manage Members**: Add, edit, and delete group members
- **Manage Polls**: Create and manage polls for the group
- **Manage Gallery**: Upload and manage photos

## Setup

1. Place the `pokersitev2` folder on your web server
2. Make sure Firebase is configured properly (firebase-config.js)
3. Member photos are located in `assets/images/pokerboys/`

## Admin Access

Admins log in using email and password (same credentials as legacy site):
- demandgendave@gmail.com
- davew102@yahoo.com  
- nasser@gcuniverse.com
- nasser.gaemi@bigdates.com

Click "Admin Login" button and enter your email and password.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Realtime Database, Authentication, Storage)
- **Responsive Design**: Mobile-first approach with left navigation menu
- **Authentication**: Email/Password for admins (same as legacy site)

## File Structure

```
pokersitev2/
├── index.html          # Main HTML file with all pages
├── styles.css          # All styling
├── app.js             # Application logic
├── firebase-config.js  # Firebase configuration
└── README.md          # This file
```

## Design Features

- **Left Navigation Menu**: Collapsible sidebar navigation
- **Responsive**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, card-based design with smooth animations
- **Dark Theme Navigation**: Professional dark sidebar
- **Accessible**: Clear typography and good contrast ratios

## Database Structure

The site uses the existing Firebase Realtime Database structure:

```
- members/
  - 0, 1, 2... (indexed members)
    - name
    - email
    - phoneNumber
    - location

- schedule/
  - eventId
    - date
    - host
    - location
    - rsvps/
      - memberName: status

- polls/
  - pollId
    - question
    - options[]
    - created
    - token
    - votes/
```

## Future Enhancements

- Photo gallery with Firebase Storage integration
- Push notifications for new events
- Mobile app integration
- Advanced reporting and analytics
- Email integration for automatic invitations

## Support

For questions or issues, contact the administrators.

