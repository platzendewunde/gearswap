# 🚀 Local Setup Instructions

Since we're in a remote environment, you'll need to complete the setup on your local machine. Here's the exact process:

## Prerequisites Check ✅

You already have:
- ✅ Node.js installed (clasp requires it)
- ✅ Google account with Apps Script access
- ✅ Project files ready to deploy

## Step-by-Step Local Setup

### 1. Download the Project Files

Copy all the files from this workspace to your local machine:

```bash
# Create local directory
mkdir -p ~/wrestling-results-processor
cd ~/wrestling-results-processor

# You'll need to copy these files:
# - package.json
# - appsscript.json  
# - .clasprc.json
# - setup.md
# - All files in src/ directory
```

### 2. Install Dependencies Locally

```bash
cd ~/wrestling-results-processor
npm install
```

### 3. Authenticate with Google

```bash
npm run login
```

This will:
- Open your browser
- Ask you to sign in to Google
- Grant Apps Script API permissions
- Save credentials locally

### 4. Enable Apps Script API

**IMPORTANT**: Before creating the project, enable the API:

1. Go to [Google Apps Script Settings](https://script.google.com/home/usersettings)
2. Turn ON "Google Apps Script API"
3. Wait a few seconds for it to activate

### 5. Create the Apps Script Project

```bash
npm run create
```

This will:
- Create a new Apps Script project
- Set the title to "Wrestling Results Processor"
- Update `.clasprc.json` with the script ID

### 6. Configure Your Settings

Edit `src/config.js` with your specific IDs:

```javascript
const CONFIG = {
  SOURCE_FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID',     // Replace this
  LOG_SHEET_ID: 'YOUR_GOOGLE_SHEETS_ID',               // Replace this
  // ... rest of config
};
```

**How to find your IDs:**
- **Folder ID**: Open Google Drive folder, URL shows: `https://drive.google.com/drive/folders/{FOLDER_ID}`
- **Sheet ID**: Open Google Sheets, URL shows: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### 7. Set Up Gemini API Key

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Deploy the code first: `npm run push`
3. Open Apps Script editor: `npm run open`
4. Go to Extensions → Script Properties
5. Add property: 
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your API key

### 8. Deploy the Code

```bash
npm run push
```

This uploads all modules to Google Apps Script.

### 9. Test the Setup

```bash
npm run open
```

In the Apps Script editor:
1. Select `testConfiguration` function
2. Click Run ▶️
3. Grant permissions when prompted
4. Check execution logs for success

## 🎯 Quick Commands Reference

```bash
# Development workflow
npm run push          # Deploy code changes
npm run pull          # Sync from Apps Script  
npm run open          # Open web editor
npm run logs          # View execution logs

# Project management
npm run status        # Check project status
npm run deploy        # Create versioned deployment
npm run versions      # List deployments
```

## 🔧 Troubleshooting

### Common Issues

**Authentication Error:**
```bash
npm run login
```

**API Not Enabled:**
- Go to [Apps Script Settings](https://script.google.com/home/usersettings)
- Enable "Google Apps Script API"

**Permission Errors:**
- Run `testConfiguration` in Apps Script editor
- Grant all requested permissions

**Config Issues:**
- Double-check folder/sheet IDs in `src/config.js`
- Ensure API key is set in Script Properties

## 🚀 Development Workflow

### Making Changes
1. Edit files in `src/` locally
2. Run `npm run push` to deploy
3. Test in Apps Script editor

### Testing
1. Use the menu functions in Google Sheets
2. Check logs with `npm run logs`
3. Debug in Apps Script editor

### Backup
Your code is now in:
- ✅ Local Git repository
- ✅ Google Apps Script cloud
- ✅ NPM version control

## 📋 Verification Checklist

After setup, verify these work:

- [ ] `npm run push` deploys successfully
- [ ] `npm run open` opens the Apps Script editor  
- [ ] `testConfiguration` runs without errors
- [ ] Menu appears in Google Sheets
- [ ] Test file processing works
- [ ] Logs show in Google Sheets

## 🎉 Success!

When setup is complete, you'll have:
- ✅ Professional development environment
- ✅ Automated deployment pipeline
- ✅ Modular, maintainable codebase
- ✅ Comprehensive testing framework

The wrestling results processor is now a professional-grade application!

---

## Next Steps After Setup

1. **Test with sample data** using the menu functions
2. **Compare output** with your existing system  
3. **Migrate configuration** from old script
4. **Run full processing** on small dataset
5. **Scale up** once confident

You've transformed a 2,376-line monolith into a modern, modular application! 🎊