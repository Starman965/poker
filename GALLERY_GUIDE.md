# Gallery Feature Guide

## Overview

The Gallery feature allows you to share photos from poker nights with all members. It uses Firebase Storage for hosting images and Firebase Realtime Database for metadata.

## How It Works

### For Members (Public View)

**Gallery Page** - Accessible from the left navigation menu (📸 Gallery)

**What Members See:**
- Grid of all uploaded photos
- Album name and upload date on hover
- Click any photo to view full-size in a lightbox/modal
- Sorted by newest photos first
- Lazy loading for performance (images load as you scroll)

**Current Status:**
- Shows placeholder text: "Gallery coming soon! Photos will be added here."
- This will automatically update once admins upload photos

---

## For Admins

### Admin Gallery Management

**Location:** Admin section → "Manage Gallery"

### Uploading Photos

**Steps:**
1. Click "Manage Gallery" in admin navigation
2. Enter an **Album Name** (e.g., "January 2025 Game", "Annual Championship 2025")
3. Click **"Select Photos"** to choose one or multiple image files
4. Click **"Upload Photos"** button
5. Watch the live progress indicator showing upload status
6. Wait for "Upload Complete!" confirmation

**Large Batch Uploads (100+ photos):**
- **Yes, you can upload 118 photos at once!**
- System automatically warns when uploading >50 photos
- Live progress bar shows: "X of Y" photos uploaded
- Uploads happen sequentially (one at a time for reliability)
- Estimated time: ~2-5 seconds per photo (depends on file size and connection)
- For 118 photos: expect 4-10 minutes total
- If upload fails partway through, already uploaded photos remain saved
- Progress indicator is fixed in top-right corner during upload

**Technical Details:**
- Supports unlimited multiple file uploads
- Images are uploaded to Firebase Storage (`gallery/` folder)
- Each photo gets a unique timestamp + random suffix filename
- Sequential upload (not parallel) ensures reliability
- Visual progress bar updates in real-time
- Error handling: shows how many uploaded before failure
- Metadata saved includes:
  - Download URL
  - Album name
  - Upload timestamp
  - Uploader's email
  - Storage path
  - Original filename

### Managing Photos

**Admin Gallery View Shows:**
- All uploaded photos in a grid
- Album name and date on each photo
- **Delete button** on each photo (hover to see)
- Ability to remove photos you no longer want displayed

**Delete Photo Function:**
1. Hover over any photo in the admin gallery view
2. Click the red "Delete" button
3. Photo will be removed from:
   - Firebase Storage (the actual image file)
   - Firebase Realtime Database (the metadata)
4. Gallery refreshes automatically

---

## Technical Architecture

### Firebase Storage Structure
```
storage/
└── gallery/
    ├── 1704067200000_poker_night_1.jpg
    ├── 1704067201000_poker_night_2.jpg
    └── 1704067202000_group_photo.jpg
```

### Firebase Database Structure
```json
{
  "gallery": {
    "-NxYZ123abc": {
      "url": "https://firebasestorage.googleapis.com/...",
      "albumName": "January 2025 Game",
      "uploadedAt": 1704067200000,
      "uploadedBy": "admin@example.com",
      "storagePath": "gallery/1704067200000_poker_night_1.jpg",
      "filename": "poker_night_1.jpg"
    },
    "-NxYZ456def": {
      "url": "https://firebasestorage.googleapis.com/...",
      "albumName": "January 2025 Game",
      "uploadedAt": 1704067201000,
      "uploadedBy": "admin@example.com",
      "storagePath": "gallery/1704067201000_poker_night_2.jpg",
      "filename": "poker_night_2.jpg"
    }
  }
}
```

---

## Key Functions

### Public Functions (app.js)

#### `loadGallery()`
- **Purpose:** Loads and displays photos for public viewing
- **Called When:** User navigates to Gallery page
- **Displays:** Photo grid with album names and dates
- **Features:** Click to view full-size images

#### `viewFullSizeImage(url)`
- **Purpose:** Opens photo in full-screen modal/lightbox
- **Parameter:** Image URL
- **User Action:** Click on any photo

### Admin Functions (app.js)

#### `loadAdminGallery()`
- **Purpose:** Loads photos in admin view with delete options
- **Called When:** Admin navigates to "Manage Gallery"
- **Extra Features:** Delete button on each photo

#### `uploadPhotos()`
- **Purpose:** Handles multiple photo uploads to Firebase
- **Process:**
  1. Validates file selection and album name
  2. Uploads each file to Firebase Storage
  3. Gets download URL for each photo
  4. Saves metadata to Realtime Database
  5. Shows progress alerts
  6. Clears form and refreshes admin gallery

#### `deletePhoto(photoId, storagePath)`
- **Purpose:** Removes photo from storage and database
- **Parameters:**
  - `photoId`: Database entry ID
  - `storagePath`: Firebase Storage path
- **Process:**
  1. Confirms deletion with user
  2. Deletes from Firebase Storage
  3. Removes database entry
  4. Refreshes admin gallery

---

## Features & Benefits

### ✅ What's Implemented

1. **Multi-upload support** - Upload multiple photos at once
2. **Album organization** - Group photos by event/date
3. **Auto-sorting** - Newest photos appear first
4. **Lazy loading** - Images load as needed for performance
5. **Full-size viewing** - Click to see larger versions
6. **Admin controls** - Easy photo management and deletion
7. **Metadata tracking** - Know who uploaded what and when
8. **Responsive design** - Works on mobile and desktop
9. **Hover overlays** - Show info without cluttering the grid

### 📝 Future Enhancement Ideas

1. **Download button** - Let members download photos
2. **Batch delete** - Select multiple photos to delete at once
3. **Album filtering** - Filter by album name or date
4. **Search functionality** - Search by album name
5. **Photo comments** - Let members comment on photos
6. **Like/favorite system** - Members can favorite photos
7. **Slideshow mode** - Auto-advance through photos
8. **Share functionality** - Share individual photos
9. **Image optimization** - Auto-compress large images
10. **Thumbnail generation** - Faster grid loading

---

## Usage Tips

### For Best Results:

**Album Naming:**
- Use descriptive names: "March 2025 Championship"
- Include date/month for easy reference
- Be consistent with naming conventions

**Photo Selection:**
- Upload high-quality images
- Group photos by event for better organization
- Consider privacy - get permission before uploading photos with faces

**Performance:**
- Don't upload extremely large files (Firebase has limits)
- Modern phones take high-res photos, but web display doesn't need full resolution
- Consider resizing large images before upload

**Large Batch Upload Tips (100+ photos):**
1. **Stable Connection**: Use WiFi, not cellular data
2. **Keep Browser Open**: Don't close the tab or navigate away during upload
3. **One Album at a Time**: Don't try to upload multiple batches simultaneously
4. **Watch Progress**: The progress indicator will show you exactly where you are
5. **If It Fails**: Already uploaded photos are saved, just retry with remaining photos
6. **Time Management**: For 118 photos, plan for ~5-10 minutes
7. **Don't Refresh**: Let the process complete naturally
8. **Browser Console**: If issues arise, open browser console (F12) to see detailed errors

---

## Troubleshooting

### Photos Not Showing Up?

**Check:**
1. Are you logged in as admin?
2. Did the upload complete successfully?
3. Check browser console for errors
4. Verify Firebase Storage rules allow reads
5. Check Firebase Realtime Database rules

### Can't Delete Photos?

**Verify:**
1. You're logged in as admin
2. Firebase Storage rules allow deletes
3. Firebase Database rules allow deletes
4. Check browser console for error messages

### Upload Failing?

**Common Issues:**
1. File too large (Firebase limits)
2. No album name entered
3. No files selected
4. Firebase Storage rules incorrect
5. Network issues

---

## Firebase Setup Requirements

### Storage Rules (firebase-config.js)
Your Storage rules should allow:
- Public read access (so members can view)
- Admin write/delete access (so admins can manage)

### Database Rules
Your Database rules for `/gallery` should:
- Allow public read
- Allow admin write
- Allow admin delete

### Storage Bucket
Ensure Firebase Storage is enabled in your Firebase project console.

---

## Current Status

✅ **Fully Implemented and Ready to Use**

- Public gallery view works
- Admin upload works
- Admin delete works
- Responsive design
- Firebase integration complete

**Next Step:** Just upload your first photos! 📸


