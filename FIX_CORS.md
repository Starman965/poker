# Fix CORS Issue for Firebase Storage

## The Problem
Firebase Storage is blocking uploads due to CORS (Cross-Origin Resource Sharing) restrictions.

## Solution Steps

### Step 1: Install Google Cloud SDK (if not installed)

**On Mac:**
```bash
brew install google-cloud-sdk
```

**Or download from:** https://cloud.google.com/sdk/docs/install

### Step 2: Authenticate with Google Cloud

```bash
gcloud auth login
```

This will open a browser window to log in with your Google account (use the same account that owns the Firebase project).

### Step 3: Set Your Project

```bash
gcloud config set project poker-a2e1c
```

### Step 4: Apply CORS Configuration

From the `pokersitev2` directory where `cors.json` is located, run:

```bash
gsutil cors set cors.json gs://poker-a2e1c.appspot.com
```

### Step 5: Verify CORS Configuration

```bash
gsutil cors get gs://poker-a2e1c.appspot.com
```

This should show you the CORS configuration you just applied.

---

## Alternative: Use Google Cloud Console

If you don't want to use the command line:

1. Go to: https://console.cloud.google.com/storage/browser
2. Select project: **poker-a2e1c**
3. Click on your bucket: **poker-a2e1c.appspot.com**
4. Click the **"Permissions"** tab
5. Click **"Grant Access"** button
6. Add principal: `allUsers`
7. Select role: **Storage Object Viewer**
8. Save

---

## After Applying CORS

1. Wait 1-2 minutes for changes to propagate
2. Refresh your website
3. Try uploading photos again
4. CORS errors should be gone!

---

## Troubleshooting

### Still seeing CORS errors?

1. **Clear browser cache** (hard refresh: Cmd+Shift+R on Mac)
2. **Check Storage Rules** are published in Firebase Console
3. **Wait a few minutes** - changes can take time to propagate
4. **Try incognito mode** to rule out cache issues

### Commands not working?

Make sure you're authenticated:
```bash
gcloud auth list
```

Make sure correct project is set:
```bash
gcloud config list
```

### Need to reinstall SDK?

```bash
brew uninstall google-cloud-sdk
brew install google-cloud-sdk
gcloud init
```


