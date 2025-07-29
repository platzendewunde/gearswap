# Wrestling Results Processor - Setup Guide

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **Google account** with access to Google Apps Script
3. **Google Drive folder** with wrestling results markdown files
4. **Google Sheets** document for logging
5. **Gemini API key** from Google AI Studio

## Setup Instructions

### 1. Install Dependencies

```bash
cd wrestling-results-processor
npm install
```

### 2. Authenticate with Google

```bash
npm run login
```

This will open a browser window for Google authentication.

### 3. Enable Apps Script API

1. Go to [Google Apps Script Settings](https://script.google.com/home/usersettings)
2. Turn ON "Google Apps Script API"

### 4. Create the Apps Script Project

```bash
npm run create
```

This creates a new Apps Script project and updates `.clasprc.json` with the script ID.

### 5. Configure Settings

1. **Edit `src/config.js`**:
   ```javascript
   const CONFIG = {
     SOURCE_FOLDER_ID: 'your-google-drive-folder-id',
     LOG_SHEET_ID: 'your-google-sheets-id',
     // ... other settings
   };
   ```

2. **Set up Gemini API Key**:
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - In Apps Script editor: Extensions → Script Properties
   - Add property: `GEMINI_API_KEY` = your-api-key

### 6. Deploy the Code

```bash
npm run push
```

This uploads all modules to Google Apps Script.

### 7. Test the Setup

1. Open the Apps Script editor:
   ```bash
   npm run open
   ```

2. Run the test function:
   - In the editor, select `testConfiguration` function
   - Click Run ▶️
   - Check the logs for any errors

## Project Structure

```
wrestling-results-processor/
├── src/
│   ├── main.js                    # Main orchestrator
│   ├── config.js                  # Configuration
│   ├── utils/
│   │   ├── logger.js             # Logging system
│   │   └── date-utils.js         # Date parsing
│   ├── parsers/
│   │   └── markdown-parser.js    # File parsing
│   ├── formatters/
│   │   ├── gemini-formatter.js   # AI formatting
│   │   └── fallback-formatter.js # Backup formatting
│   └── files/
│       └── file-discovery.js     # File management
├── package.json                   # NPM configuration
├── appsscript.json               # Apps Script manifest
└── .clasprc.json                 # Clasp configuration
```

## Development Workflow

### Making Changes

1. **Edit code** in `src/` directory
2. **Push changes** to Apps Script:
   ```bash
   npm run push
   ```
3. **Test in Apps Script editor** or run locally

### Pulling Changes

If you make changes in the Apps Script editor:
```bash
npm run pull
```

### Deployment

Create a versioned deployment:
```bash
npm run deploy
```

### Viewing Logs

Monitor execution logs:
```bash
npm run logs
```

## Available Scripts

- `npm run login` - Authenticate with Google
- `npm run create` - Create new Apps Script project  
- `npm run push` - Upload code to Apps Script
- `npm run pull` - Download code from Apps Script
- `npm run deploy` - Create versioned deployment
- `npm run open` - Open Apps Script editor
- `npm run logs` - View execution logs
- `npm run status` - Check project status
- `npm run setup` - Complete initial setup

## Menu Functions

Once deployed, the following menu will be available in Google Sheets:

**Wrestling Results Processor**
- Process All Files
- **Configuration**
  - Test Configuration
  - Validate Config
- **Testing**
  - Test Date Extraction
  - Test Symbol Formatting
  - Test File Discovery

## Troubleshooting

### Common Issues

1. **Authentication errors**: Run `npm run login` again
2. **Permission errors**: Ensure all Google APIs are enabled
3. **API key errors**: Check that `GEMINI_API_KEY` is set in Script Properties
4. **File access errors**: Verify folder/sheet IDs in config

### Debug Mode

Enable detailed logging in `config.js`:
```javascript
PROCESSING: {
  DEBUG_MODE: true,
  // ...
}
```

### Support

- Check the execution logs in Apps Script editor
- Review the Google Sheets logging tab
- Test individual modules using the menu functions

## Migration from Monolithic Script

If migrating from the existing 2,376-line script:

1. **Backup** your current script
2. **Export configuration** (folder IDs, sheet IDs, API keys)
3. **Set up** this modular version following the guide above
4. **Test thoroughly** with a small subset of files
5. **Compare output** to ensure consistency
6. **Switch over** once confident in the new system

The modular approach provides better maintainability, testing, and debugging capabilities.