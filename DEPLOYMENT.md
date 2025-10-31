# Deployment Guide - Danville Poker Group Website v2

## Prerequisites

1. **Firebase Project**: You already have the Firebase project set up (`poker-a2e1c`)
2. **Domain**: danvillepokergroup.com is configured
3. **Web Server**: Access to your hosting provider

## Deployment Steps

### Option 1: Firebase Hosting (Recommended)

Firebase Hosting is fast, secure, and integrates seamlessly with your Firebase services.

#### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase

```bash
firebase login
```

#### 3. Initialize Firebase Hosting

From the `pokersitev2` directory:

```bash
firebase init hosting
```

When prompted:
- Select your existing project: `poker-a2e1c`
- Public directory: `.` (current directory)
- Configure as single-page app: `No`
- Set up automatic builds: `No`
- Don't overwrite index.html: `No`

#### 4. Create firebase.json Configuration

Create a `firebase.json` file in the pokersitev2 directory:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "README.md",
      "DEPLOYMENT.md"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=7200"
          }
        ]
      }
    ]
  }
}
```

#### 5. Deploy

```bash
firebase deploy --only hosting
```

#### 6. Connect Custom Domain

In Firebase Console:
1. Go to Hosting section
2. Click "Add custom domain"
3. Enter: `danvillepokergroup.com`
4. Follow the DNS configuration instructions

### Option 2: Traditional Web Hosting

If you prefer your current hosting provider:

#### 1. Upload Files

Upload all files from `pokersitev2` to your web server:
- index.html
- styles.css
- app.js
- firebase-config.js
- vote.html
- README.md

#### 2. Ensure Access to Legacy Assets

All assets are now self-contained in the `pokersitev2` folder:
- `assets/images/dpg.png` (logo)
- `assets/images/pokerboys/` (member photos)
- `assets/images/favicon-32x32.png` (favicon)

#### 3. Configure HTTPS

Ensure your hosting has SSL/TLS certificate configured for secure Firebase connections.

## Firebase Configuration

### Storage Rules

Set up Firebase Storage rules for the gallery feature:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gallery/{allPaths=**} {
      // Allow public read access
      allow read: if true;
      
      // Allow write only for authenticated admin users
      allow write: if request.auth != null && 
        (request.auth.token.email == 'demandgendave@gmail.com' ||
         request.auth.token.email == 'davew102@yahoo.com' ||
         request.auth.token.email == 'nasser@gcuniverse.com' ||
         request.auth.token.email == 'nasser.gaemi@bigdates.com');
    }
  }
}
```

Apply these rules in Firebase Console:
1. Go to Storage
2. Click "Rules" tab
3. Paste the rules above
4. Click "Publish"

### Database Rules

Update Realtime Database rules:

```json
{
  "rules": {
    ".read": true,
    "members": {
      ".write": "auth != null && (auth.token.email == 'demandgendave@gmail.com' || auth.token.email == 'davew102@yahoo.com' || auth.token.email == 'nasser@gcuniverse.com' || auth.token.email == 'nasser.gaemi@bigdates.com')"
    },
    "schedule": {
      ".write": "auth != null",
      "$eventId": {
        "rsvps": {
          ".write": true
        }
      }
    },
    "polls": {
      ".write": "auth != null && (auth.token.email == 'demandgendave@gmail.com' || auth.token.email == 'davew102@yahoo.com' || auth.token.email == 'nasser@gcuniverse.com' || auth.token.email == 'nasser.gaemi@bigdates.com')",
      "$pollId": {
        "votes": {
          ".write": true
        }
      }
    },
    "gallery": {
      ".write": "auth != null && (auth.token.email == 'demandgendave@gmail.com' || auth.token.email == 'davew102@yahoo.com' || auth.token.email == 'nasser@gcuniverse.com' || auth.token.email == 'nasser.gaemi@bigdates.com')"
    }
  }
}
```

### Authentication Setup

1. In Firebase Console, go to Authentication
2. Enable **Email/Password** sign-in provider
3. Add authorized domain: `danvillepokergroup.com`
4. Admin accounts should already be set up from legacy site:
   - demandgendave@gmail.com
   - davew102@yahoo.com
   - nasser@gcuniverse.com
   - nasser.gaemi@bigdates.com
5. If you need to add/reset admin passwords, use Firebase Console > Authentication > Users

## Post-Deployment Checklist

- [ ] Verify the website loads at danvillepokergroup.com
- [ ] Test admin login with all 3 admin accounts
- [ ] Test public RSVP functionality
- [ ] Test creating an event as admin
- [ ] Test creating a poll as admin
- [ ] Test the vote.html page with a poll token
- [ ] Upload a test photo to gallery
- [ ] Verify reports are working
- [ ] Test on mobile devices
- [ ] Check browser console for any errors

## Updating the Site

To deploy updates:

### Firebase Hosting
```bash
cd /path/to/pokersitev2
firebase deploy --only hosting
```

### Traditional Hosting
- Upload changed files via FTP/SFTP
- Clear browser cache to see changes

## Troubleshooting

### Issue: Admin can't log in
- Check Firebase Console > Authentication to verify Google Sign-In is enabled
- Verify the admin email is in the ADMIN_EMAILS array in firebase-config.js
- Check that the domain is authorized in Firebase Console

### Issue: Photos won't upload
- Verify Firebase Storage is enabled
- Check Storage rules are configured correctly
- Ensure the admin is logged in
- Check browser console for specific error messages

### Issue: RSVPs not saving
- Check Database rules allow write access to schedule/rsvps
- Verify Firebase Realtime Database is enabled
- Check network tab in browser dev tools

### Issue: Member photos not showing
- Verify member photos exist in assets/images/pokerboys/
- Check that image files exist and are named correctly (lowercase first name.png)

## Maintenance

### Regular Tasks
- Monitor Firebase usage (Storage, Database, Authentication)
- Review and clean up old events periodically
- Check for and delete inappropriate gallery uploads
- Update member list as needed

### Backup
Firebase automatically backs up your data, but you can also:
1. Export database from Firebase Console > Database > Export
2. Keep local copies of member photos

## Support

For technical issues:
- Check Firebase Console logs
- Review browser console for errors
- Contact Firebase Support for platform issues
- Reach out to the developer who created this site

## URLs

- **Main Site**: https://danvillepokergroup.com
- **Poll Voting**: https://danvillepokergroup.com/vote.html?token=POLL_TOKEN
- **Firebase Console**: https://console.firebase.google.com/project/poker-a2e1c
- **Legacy Site**: Available for reference during transition period

