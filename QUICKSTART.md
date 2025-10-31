# Quick Start Guide - Danville Poker Group Website v2

## For Members (Public Users)

### First Time Visit
1. Go to **danvillepokergroup.com**
2. You'll see the home page with welcome message
3. No login needed - everything is accessible!

### To RSVP for an Event

**Option 1: From Email Link** (Easiest!)
1. Click the RSVP link in your invitation/reminder email
2. The event is automatically selected for you!
3. Select your name
4. Choose your response: Attending / Not Attending / Maybe
5. Click **"Submit RSVP"**
6. Done! ✓

**Option 2: From Website**
1. Go to site and click **"RSVP"** in the left menu
2. Select the event from the dropdown
3. Select your name
4. Choose your response: Attending / Not Attending / Maybe
5. Click **"Submit RSVP"**
6. Done! ✓

### To View Upcoming Events
1. Click **"Events"** in the left menu
2. See all upcoming poker nights with dates, hosts, and locations
3. View RSVP summary counts for each event
4. Click **"View RSVP Details"** button on any event to see:
   - Who's attending
   - Who's not attending
   - Who said maybe
   - Who hasn't responded yet
5. Click **"Hide RSVP Details"** to collapse the list

### To View Reports
1. Click **"Reports"** in the left menu
2. Click any report button:
   - **Past 12 Month Attendance** - See who's been attending
   - **Hosting Report** - See hosting statistics
   - **Past Events** - View history
3. Results appear below buttons

### To Browse Photos
1. Click **"Gallery"** in the left menu
2. Browse photos in the grid
3. Click any photo to view full-size
4. Click outside to close

### To Vote in a Poll
1. You'll receive an email with a voting link
2. Click the link (takes you to vote page)
3. Select your name
4. Click your choice
5. Click **"Submit Vote"**
6. You'll see a confirmation!

## For Admins

### First Time Login
1. Go to **danvillepokergroup.com**
2. Click **"Admin Login"** button at bottom of left menu
3. Sign in with your Google account
4. Admin menu appears in navigation!

### To Add an Event
1. Login as admin
2. Click **"Manage Events"** in admin menu
3. In "Add New Event" section:
   - Select date
   - Choose host (location auto-fills)
   - Adjust location if needed
4. Click **"Add Event"**
5. Event is created with all member RSVPs set to "no-response"

### To Edit an Event
1. Login as admin
2. Click **"Manage Events"**
3. In "Edit/Delete Event" section:
   - Select event from dropdown
   - Form fills with current details
   - Make your changes
4. Click **"Save Changes"**

### To Delete an Event
1. Login as admin
2. Click **"Manage Events"**
3. Select event from dropdown
4. Click **"Delete Event"**
5. Confirm deletion

### To Send Event Invitations/Reminders
1. Login as admin
2. Click **"Manage Events"**
3. Scroll to "Event RSVPs" section
4. Find your event
5. Click the appropriate button:
   - **Send Invitation** - Initial event announcement
   - **Send Reminder** - Reminder with current RSVP status
   - **Email Non-Responders** - Only emails people who haven't responded
   - **Final Confirmation** - Final details with attendee list and Google Maps link
6. Gmail compose window opens with pre-filled email
7. Review and send!

### To Add a Member
1. Login as admin
2. Click **"Manage Members"**
3. Fill in member details:
   - Name
   - Email
   - Phone
   - Location
4. Click **"Add Member"**

### To Edit a Member
1. Login as admin
2. Click **"Manage Members"**
3. Find member in the list
4. Click **"Edit"** button
5. Make changes in form
6. Click **"Update Member"**

### To Delete a Member
1. Login as admin
2. Click **"Manage Members"**
3. Find member in the list
4. Click **"Delete"** button
5. Confirm deletion

### To Create a Poll
1. Login as admin
2. Click **"Manage Polls"**
3. In "Create New Poll" section:
   - Enter your question
   - Fill in at least 2 options
   - Click "+ Add Option" for more options
4. Click **"Create Poll"**
5. Poll is created with unique token

### To Share a Poll
1. After creating poll, note the poll ID
2. Share this URL with members:
   ```
   danvillepokergroup.com/vote.html?token=POLL_TOKEN
   ```
3. Members can click link to vote

### To View Poll Results
1. Login as admin
2. Click **"Manage Polls"**
3. Find your poll in the list
4. Click **"View Results"**
5. See vote counts and percentages

### To Delete a Poll
1. Login as admin
2. Click **"Manage Polls"**
3. Click **"Delete"** on the poll
4. Confirm deletion

### To Upload Photos
1. Login as admin
2. Click **"Manage Gallery"**
3. In "Upload Photos" section:
   - Click file input to select photos
   - Choose one or multiple photos
   - Enter album name (e.g., "January 2025 Game")
4. Click **"Upload Photos"**
5. Wait for upload to complete
6. Photos appear in gallery!

### To Delete a Photo
1. Login as admin
2. Click **"Manage Gallery"**
3. Hover over photo to see overlay
4. Click **"Delete"** button
5. Confirm deletion

## Common Tasks

### Workflow: Monthly Event Setup
1. **Add Event** (beginning of month) - Use "Manage Events"
2. **Send invitation email** - Click "Send Invitation" button
3. **Monitor RSVPs** - Check RSVP summary in event list
4. **Send reminder** - Click "Send Reminder" after a week
5. **Email non-responders** - Click "Email Non-Responders" if needed
6. **Send final confirmation** - Click "Final Confirmation" a few days before
7. **Host the event** 🎉
8. **Upload photos** after the event

### Workflow: Group Decision via Poll
1. **Create Poll** with question and options
2. **Email poll link** to all members
3. **Monitor votes** using "View Results"
4. **Share results** once voting complete
5. **Delete poll** after decision is implemented

### Workflow: New Member Onboarding
1. **Add Member** with their information
2. **Ensure member photo** exists in `pokerboys/` folder
   - Filename: `firstname.png` (lowercase)
   - Size: Square image, 200x200px or larger
3. **Test RSVP** to make sure their name appears
4. **Send welcome email** with site link

## Tips & Tricks

### For Everyone
- **Mobile Menu**: On phones, tap the hamburger icon (≡) to open/close menu
- **Quick Links**: Use home page cards for fast navigation
- **Browser Bookmark**: Add site to bookmarks for easy access

### For Members
- **Update RSVP**: You can change your RSVP anytime before the event
- **Check Reports**: See your attendance record in reports
- **View Past Events**: Reports show complete event history

### For Admins
- **Batch Operations**: Upload multiple photos at once
- **Auto-fill Location**: When you select a host, location auto-fills
- **Stay Logged In**: Your login persists until you sign out
- **Mobile Admin**: All admin features work on mobile too!

## Troubleshooting

### "I can't see the admin menu"
- Make sure you're logged in (click Admin Login)
- Verify you're using an authorized admin email
- Try refreshing the page

### "My RSVP didn't submit"
- Check that you selected both event and name
- Make sure you chose a response (Attending/Not Attending/Maybe)
- Check your internet connection
- Try again - the form should clear if successful

### "Photo won't upload"
- Check file size (very large files may time out)
- Ensure you entered an album name
- Verify you're logged in as admin
- Check your internet connection
- Try uploading fewer photos at once

### "Poll link doesn't work"
- Verify the complete URL including ?token=...
- Check that poll wasn't deleted
- Try copying and pasting full URL

### "Changes aren't showing"
- Wait a few seconds for data to sync
- Refresh the page (Ctrl+R or Cmd+R)
- Check browser console for errors (F12)

## Getting Help

If you encounter issues:

1. **Check browser console**: Press F12, look for red error messages
2. **Try different browser**: Test in Chrome, Firefox, or Safari
3. **Clear cache**: Browser settings > Clear browsing data
4. **Check Firebase Console**: Verify services are running
5. **Contact admin**: Reach out to Dave, David, or Nasser

## Security Notes

### For Members
- No password needed - site is public for viewing
- RSVPs and poll votes are public to the group
- Don't share admin login credentials

### For Admins
- Keep your Google account secure
- Sign out when using shared computers
- Don't share poll tokens publicly outside the group
- Review Firebase usage occasionally

## Browser Support

The site works best in modern browsers:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer not supported

## Mobile Apps

Currently web-only, but the site is fully responsive:
- Works perfectly on iPhone
- Works perfectly on Android
- Works on tablets
- No app installation needed!

Future: Native iOS/Android apps may be developed to complement the site.

## Site Performance

Expected performance:
- **Initial load**: 1-2 seconds
- **Page navigation**: Instant (no reload)
- **RSVP submission**: < 1 second
- **Photo upload**: Depends on size, ~5-10s per photo
- **Reports**: Instant

## Privacy

- Member emails are visible to admins only
- Phone numbers are visible to admins only
- Event RSVPs are visible to all (by design)
- Poll votes are anonymous (only totals shown)
- Gallery photos are public to all

## Best Practices

### For Admins
- Add events at least 2 weeks in advance
- Upload photos within a few days of event
- Review member list quarterly for accuracy
- Clean up old polls after decisions made
- Monitor Firebase storage usage

### For Members
- RSVP within 24 hours of invitation
- Update RSVP if plans change
- Participate in polls when asked
- Enjoy the gallery and relive good times!

---

**Welcome to the new Danville Poker Group website! 🎉**

*If you have questions, suggestions, or find bugs, please contact the administrators.*

