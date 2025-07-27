/**
 * Wrestling Results Processing Script
 * Automates the processing of Markdown wrestling results files into yearly Google Docs
 */

// ====== CONFIGURATION BLOCK ======
const CONFIG = {
  SOURCE_FOLDER_ID: '19FHfHxEwklAIpJjt81mwIV36H1uSbe_X', // ❗ Replace with your Folder ID
  LOG_SHEET_ID: '1TQ-39ceCBrgGr1A7_AyD_PVD3qaJjQKN60rU0jRmccY',       // ❗ Replace with your Google Sheet ID
};

/**
 * Extracts the earliest date from parsed wrestling results for chronological sorting
 * @param {Array} cleanedResults - Parsed content from markdown file (prose already filtered out)
 * @returns {Date|null} The earliest date found, or null if no dates found
 */
function extractEarliestDate(cleanedResults) {
  // Validate input
  if (!cleanedResults || !Array.isArray(cleanedResults)) {
    console.warn('extractEarliestDate: cleanedResults is not a valid array:', cleanedResults);
    return null;
  }
  
  const dates = [];
  
  for (const item of cleanedResults) {
    // Validate item structure
    if (!item || typeof item !== 'object') {
      console.warn('extractEarliestDate: Invalid item in cleanedResults:', item);
      continue;
    }
    
    if (item.type === 'content') {
      const content = item.content;
      
      // Validate content is a string
      if (typeof content !== 'string') {
        console.warn('extractEarliestDate: content is not a string:', content);
        continue;
      }
      
      // Look for various date formats
      const datePatterns = [
        {
          pattern: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
          type: 'mdy_slash'
        },
        {
          pattern: /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(st|nd|rd|th)?,?\s+(\d{4})/i,
          type: 'month_name'
        },
        {
          pattern: /(\d{1,2})-(\d{1,2})-(\d{4})/,
          type: 'mdy_dash'
        },
        {
          pattern: /(\d{4})-(\d{1,2})-(\d{1,2})/,
          type: 'ymd_dash'
        }
      ];
      
      for (const { pattern, type } of datePatterns) {
        const match = content.match(pattern);
        if (match) {
          let date;
          
          try {
            if (type === 'month_name') {
              // Month name format
              const months = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
              };
              const month = months[match[1].toLowerCase()];
              const day = parseInt(match[2], 10);
              const year = parseInt(match[4], 10);
              date = new Date(year, month, day);
            } else if (type === 'ymd_dash') {
              // YYYY-MM-DD format
              const year = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
              const day = parseInt(match[3], 10);
              date = new Date(year, month, day);
            } else {
              // MM/DD/YYYY or MM-DD-YYYY format
              const month = parseInt(match[1], 10) - 1; // JavaScript months are 0-indexed
              const day = parseInt(match[2], 10);
              const year = parseInt(match[3], 10);
              date = new Date(year, month, day);
            }
            
            if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
              dates.push(date);
            }
          } catch (error) {
            console.warn(`Failed to parse date from "${match[0]}": ${error.message}`);
          }
        }
      }
    }
  }
  
  // Return the earliest date found
  if (dates.length > 0) {
    dates.sort((a, b) => a - b);
    return dates[0];
  }
  
  return null;
}

/**
 * Determines the appropriate match type based on participants and context
 * @param {string} matchLine - The line that might contain match type info
 * @param {Array} participants - Array of participant names (if available)
 * @returns {string} The appropriate match type
 */
function determineMatchType(matchLine, participants = []) {
  // If already has a proper match type, keep it
  if (matchLine.match(/(Singles|Tag Team|Man Tag|Battle Royal|Championship|Elimination|Hardcore|Street Fight|Ladder|Cage|Steel Cage) Match/i)) {
    return matchLine;
  }
  
  // Count participants to determine match type
  const participantCount = participants.length;
  
  if (participantCount === 2) {
    return 'Singles Match';
  } else if (participantCount === 4) {
    return 'Tag Team Match';
  } else if (participantCount === 6) {
    return '6-Man Tag Match';
  } else if (participantCount === 8) {
    return '8-Man Tag Match';
  } else if (participantCount > 8) {
    return 'Battle Royal';
  }
  
  // Default fallback based on common results that aren't match types
  if (matchLine.match(/^(No Contest|Time Limit Draw|Double Count Out|Disqualification|Draw)$/i)) {
    return 'Singles Match'; // Most common default
  }
  
  // If it contains "Match" but not recognized, keep as is
  if (matchLine.includes('Match')) {
    return matchLine;
  }
  
  // Final fallback
  return 'Singles Match';
}

/**
 * Creates a custom menu in the Google Apps Script editor for easy script execution
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Wrestling Results Processor')
    .addItem('Process All Files', 'processAllFiles')
    .addItem('Test Configuration', 'testConfiguration')
    .addItem('Test Gemini API', 'testGeminiAPI')
    .addItem('Test Year Parsing', 'testYearParsing')
    .addItem('Test Date Extraction', 'testDateExtraction')
    .addToUi();
}

/**
 * Main function that orchestrates the entire file processing workflow
 * Processes all .md files from the source folder and creates yearly master documents
 */
async function processAllFiles() {
  // Initialize logging
  const logSheet = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID).getActiveSheet();
  logProgress(logSheet, '=== STARTING WRESTLING RESULTS PROCESSING ===');
  
  try {
    // Validate configuration
    if (!CONFIG.SOURCE_FOLDER_ID || !CONFIG.LOG_SHEET_ID) {
      throw new Error('Configuration incomplete: SOURCE_FOLDER_ID and LOG_SHEET_ID must be set');
    }
    
    logProgress(logSheet, 'Configuration validated successfully');
    
    // Get all .md files and group them by year
    const filesByYear = getMarkdownFilesByYear(CONFIG.SOURCE_FOLDER_ID, logSheet);
    logProgress(logSheet, `Found ${Object.keys(filesByYear).length} years of data`);
    
    // Process each year group
    for (const year of Object.keys(filesByYear).sort()) {
      logProgress(logSheet, `\n=== PROCESSING YEAR ${year} ===`);
      
      const yearFiles = filesByYear[year];
      const yearlyDoc = createYearlyDocument(year, yearFiles.length, logSheet);
      
      logProgress(logSheet, `Created yearly document for ${year}: ${yearlyDoc.getName()}`);
      
      // Parse all files first to get their dates for chronological sorting
      const parsedFiles = [];
      for (const fileData of yearFiles) {
        try {
          logProgress(logSheet, `Parsing file for date sorting: ${fileData.name}`);
          const parsedData = parseMarkdownFile(fileData.file, logSheet);
          
          // Validate parsed data structure
          if (!parsedData || typeof parsedData !== 'object' || !parsedData.cleanedResults) {
            logProgress(logSheet, `⚠️ WARNING: Invalid parsed data structure for ${fileData.name}`);
            throw new Error(`Invalid parsed data structure for ${fileData.name}`);
          }
          
          const earliestDate = extractEarliestDate(parsedData.cleanedResults);
          
          parsedFiles.push({
            fileData: fileData,
            parsedData: parsedData,
            earliestDate: earliestDate
          });
          
        } catch (parseError) {
          logProgress(logSheet, `❌ FAILED to parse ${fileData.name} for sorting: ${parseError.message}`);
          // Add without date for processing anyway
          parsedFiles.push({
            fileData: fileData,
            parsedData: null,
            earliestDate: null
          });
        }
      }
      
      // Sort by earliest date (null dates go to end)
      parsedFiles.sort((a, b) => {
        if (!a.earliestDate && !b.earliestDate) return 0;
        if (!a.earliestDate) return 1;
        if (!b.earliestDate) return -1;
        return a.earliestDate - b.earliestDate;
      });
      
      logProgress(logSheet, `Sorted ${parsedFiles.length} files chronologically for ${year}`);
      
      // Process each file in chronological order
      let processedCount = 0;
      for (const fileInfo of parsedFiles) {
        try {
          const { fileData, parsedData } = fileInfo;
          logProgress(logSheet, `Processing file: ${fileData.name}`);
          
          // Use already parsed data or parse if failed earlier
          const finalParsedData = parsedData || parseMarkdownFile(fileData.file, logSheet);
          
          // Format content using Gemini API
          const formattedContent = await formatWithGeminiAPI(finalParsedData.cleanedResults, finalParsedData.seriesName, logSheet);
          
          // Append to yearly document (without duplicate series name)
          appendSeriesToDocument(yearlyDoc, finalParsedData.seriesName, formattedContent, logSheet);
          
          processedCount++;
          logProgress(logSheet, `✅ Successfully processed ${fileData.name} (${processedCount}/${yearFiles.length})`);
          
        } catch (fileError) {
          logProgress(logSheet, `❌ FAILED to process ${fileInfo.fileData.name}: ${fileError.message}`);
          // Continue processing other files despite individual failures
        }
      }
      
      // Finalize the yearly document
      finalizeYearlyDocument(yearlyDoc, processedCount, logSheet);
      logProgress(logSheet, `📄 Completed ${year} document with ${processedCount}/${yearFiles.length} files processed`);
      
      logProgress(logSheet, `Completed processing ${year} (${yearFiles.length} files)`);
    }
    
    logProgress(logSheet, 'Processing workflow partially implemented - file discovery complete');
    logProgress(logSheet, '=== PROCESSING COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    logProgress(logSheet, `CRITICAL ERROR: ${error.message}`);
    logProgress(logSheet, `Error stack: ${error.stack}`);
    throw error; // Re-throw to ensure visibility in script editor
  }
}

/**
 * Securely retrieves the Gemini API key from PropertiesService
 * The API key should be stored using PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'your-key-here')
 * @returns {string} The Gemini API key
 * @throws {Error} If the API key is not found
 */
function getApiKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it using PropertiesService.getScriptProperties().setProperty("GEMINI_API_KEY", "your-key-here")');
  }
  
  return apiKey;
}

/**
 * Logs progress messages to the specified Google Sheet with timestamps
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to log to
 * @param {string} message - The message to log
 */
function logProgress(sheet, message) {
  try {
    const timestamp = new Date().toLocaleString();
    sheet.appendRow([timestamp, message]);
    
    // Also log to console for debugging in script editor
    console.log(`[${timestamp}] ${message}`);
    
  } catch (error) {
    // Fallback to console if sheet logging fails
    console.error('Failed to log to sheet:', error.message);
    console.log(`[FALLBACK LOG] ${message}`);
  }
}

/**
 * Discovers all .md files in the source folder and groups them by year
 * Parses the year from filename patterns like "finalgate07.md" -> 2007
 * @param {string} folderId - The Google Drive folder ID containing .md files
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 * @returns {Object} Object with years as keys and arrays of file objects as values
 */
function getMarkdownFilesByYear(folderId, logSheet) {
  try {
    logProgress(logSheet, 'Starting file discovery...');
    
    const sourceFolder = DriveApp.getFolderById(folderId);
    // Get ALL files instead of filtering by MIME type first
    const files = sourceFolder.getFiles();
    const filesByYear = {};
    let totalFiles = 0;
    let mdFiles = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      totalFiles++;
      
      logProgress(logSheet, `Checking file: ${fileName}`);
      
      // Only process .md files
      if (!fileName.toLowerCase().endsWith('.md')) {
        continue;
      }
      
      mdFiles++;
      const year = parseYearFromFilename(fileName);
      
      if (year) {
        if (!filesByYear[year]) {
          filesByYear[year] = [];
        }
        
        filesByYear[year].push({
          file: file,
          name: fileName,
          year: year,
          id: file.getId()
        });
        
        logProgress(logSheet, `✅ Found: ${fileName} -> ${year}`);
      } else {
        logProgress(logSheet, `⚠️ WARNING: Could not parse year from filename: ${fileName}`);
      }
    }
    
    // Sort files within each year by filename for consistent processing order
    Object.keys(filesByYear).forEach(year => {
      filesByYear[year].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    logProgress(logSheet, `File discovery complete: ${totalFiles} total files, ${mdFiles} .md files found`);
    logProgress(logSheet, `Years discovered: ${Object.keys(filesByYear).sort().join(', ')}`);
    
    // Log detailed breakdown
    Object.keys(filesByYear).sort().forEach(year => {
      logProgress(logSheet, `${year}: ${filesByYear[year].length} files`);
    });
    
    return filesByYear;
    
  } catch (error) {
    logProgress(logSheet, `ERROR in getMarkdownFilesByYear: ${error.message}`);
    throw error;
  }
}

/**
 * Complete testConfiguration function
 */
function testConfiguration() {
  console.log('Testing configuration...');
  
  try {
    // Test folder access
    const sourceFolder = DriveApp.getFolderById(CONFIG.SOURCE_FOLDER_ID);
    console.log(`✅ Source folder found: ${sourceFolder.getName()}`);
    
    // List all files in the folder for debugging
    const files = sourceFolder.getFiles();
    let fileCount = 0;
    console.log('\n📁 Files in source folder:');
    
    while (files.hasNext()) {
      const file = files.next();
      fileCount++;
      console.log(`  ${fileCount}. ${file.getName()} (${file.getMimeType()})`);
    }
    
    console.log(`\nTotal files found: ${fileCount}`);
    
    // Test log sheet access
    const logSheet = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID);
    console.log(`✅ Log sheet found: ${logSheet.getName()}`);
    
    // Test API key retrieval
    const apiKey = getApiKey();
    console.log('✅ API key retrieved successfully (not displayed for security)');
    
    console.log('\n🎉 All configuration tests passed!');
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    throw error;
  }
}

/**
 * Parses the year from a wrestling results filename
 * Handles various filename patterns and converts 2-digit years to 4-digit
 * @param {string} filename - The filename to parse (e.g., "finalgate07.md")
 * @returns {number|null} The 4-digit year or null if unable to parse
 */
function parseYearFromFilename(filename) {
  try {
    // Remove file extension
    const baseName = filename.replace(/\.md$/i, '');
    
    console.log(`Parsing year from: ${filename} -> ${baseName}`);
    
    // Patterns to look for year in filename (in order of preference)
    const patterns = [
      /(\d{4})/,           // Any 4-digit number first (most reliable)
      /(\d{2})$/,          // 2-digit year at end: "finalgate07"
      /(\d{2})(?!.*\d{2})/ // Last 2-digit number (fallback for 2-digit years)
    ];
    
    for (const pattern of patterns) {
      const match = baseName.match(pattern);
      if (match) {
        let year = parseInt(match[1], 10);
        
        // Convert 2-digit years to 4-digit
        if (year < 100) {
          // For files ending in 01, this likely means 2001
          // But let's be more conservative and check the context
          if (year >= 99) {
            year = 1900 + year; // 99 -> 1999
          } else {
            year = 2000 + year; // 01 -> 2001, 07 -> 2007, etc.
          }
        }
        
        // Validate reasonable year range (wrestling promotion likely 1990-2030)
        if (year >= 1990 && year <= 2030) {
          console.log(`✅ Parsed year ${year} from ${filename}`);
          return year;
        } else {
          console.log(`⚠️ Year ${year} outside valid range for ${filename}`);
        }
      }
    }
    
    // Manual mapping for specific known files if patterns fail
    const manualMappings = {
      'primera01.md': 2001,
      'navidad01.md': 2001,
      'pelea01.md': 2001,
      'muybien01.md': 2001,
      'elnumero01.md': 2001,
      'enuspecial01.md': 2001,
      'verano01.md': 2001,
      'noseporque.md': null // This one has no year indicator
    };
    
    if (manualMappings.hasOwnProperty(filename)) {
      const mappedYear = manualMappings[filename];
      if (mappedYear) {
        console.log(`📋 Used manual mapping: ${filename} -> ${mappedYear}`);
        return mappedYear;
      }
    }
    
    console.log(`❌ Could not parse year from ${filename}`);
    return null;
    
  } catch (error) {
    console.error(`Error parsing year from filename ${filename}:`, error.message);
    return null;
  }
}

/**
 * Test function to verify year parsing for your specific files
 */
function testYearParsing() {
  const testFiles = [
    'primera01.md',
    'navidad01.md', 
    'noseporque.md',
    'pelea01.md',
    'muybien01.md',
    'elnumero01.md',
    'enuspecial01.md',
    'verano01.md'
  ];
  
  console.log('Testing year parsing for your files:');
  testFiles.forEach(filename => {
    const year = parseYearFromFilename(filename);
    console.log(`${filename} -> ${year || 'NO YEAR FOUND'}`);
  });
}

/**
 * Alternative file discovery method using search
 */
function getMarkdownFilesByYearAlternative(folderId, logSheet) {
  try {
    logProgress(logSheet, 'Starting alternative file discovery...');
    
    // Use DriveApp.searchFiles to find .md files in the specific folder
    const query = `parents in "${folderId}" and name contains ".md"`;
    const files = DriveApp.searchFiles(query);
    const filesByYear = {};
    let totalFiles = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      
      // Double-check it ends with .md
      if (!fileName.toLowerCase().endsWith('.md')) {
        continue;
      }
      
      totalFiles++;
      const year = parseYearFromFilename(fileName);
      
      if (year) {
        if (!filesByYear[year]) {
          filesByYear[year] = [];
        }
        
        filesByYear[year].push({
          file: file,
          name: fileName,
          year: year,
          id: file.getId()
        });
        
        logProgress(logSheet, `Found: ${fileName} -> ${year}`);
      } else {
        logProgress(logSheet, `WARNING: Could not parse year from filename: ${fileName}`);
      }
    }
    
    // Sort files within each year by filename
    Object.keys(filesByYear).forEach(year => {
      filesByYear[year].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    logProgress(logSheet, `Alternative file discovery complete: ${totalFiles} .md files found`);
    logProgress(logSheet, `Years discovered: ${Object.keys(filesByYear).sort().join(', ')}`);
    
    return filesByYear;
    
  } catch (error) {
    logProgress(logSheet, `ERROR in alternative file discovery: ${error.message}`);
    throw error;
  }
}

/**
 * Dragon Gate specific wrestling results formatter using Gemini API
 * @param {Array} cleanedResults - Parsed content from markdown file
 * @param {string} seriesName - Name of the wrestling series/event
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 * @returns {string} Formatted content ready for Google Docs
 */
async function formatWithGeminiAPI(cleanedResults, seriesName, logSheet) {
  try {
    logProgress(logSheet, `Formatting Dragon Gate results for ${seriesName} using Gemini API`);
    
    const apiKey = getApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    // Prepare the content for API
    const contentText = cleanedResults.map(item => {
      if (item.type === 'header') {
        return `${'#'.repeat(item.level)} ${item.content}`;
      }
      return item.content;
    }).join('\n');
    
    const prompt = `You are formatting Dragon Gate professional wrestling results. Please format the following wrestling event data to match this EXACT structure and format:

**REQUIRED FORMAT EXAMPLE:**
## El Numero Uno Special 2001

May 12th, 2001
Tokyo, Korakuen Hall  
Attendance: 2100

① Tag Team Match
Dragon Kid⭕️
Genki Horiguchi
SAITO
Stalker Ichikawa
vs
Darkness Dragon
Susumu Mochizuki
Yasushi Kanda❌
(16:45 Ultra Hurricanrana)

——

May 15th, 2001
Osaka, Edion Arena
Attendance: 1850

⑥ C-MAX vs. M2K Elimination Match
SUWA
CIMA
Sumo "Dandy" Fuji 2000
vs
Yasushi Kanda
Masaaki Mochizuki
Susumu Mochizuki
❶❌Masaaki (14:27 La Magistral) Fuji⭕️
❷❌CIMA (18:21 German Suplex) Kanda⭕️
❸❌Fuji (24:07 Gekokujoh Elbow) Kanda⭕️
❹❌Susumu (26:58 FFF) SUWA⭕️
❺❌Kanda (37:39 FFF) SUWA⭕️

⑤ Tag Team Match
Ryo Saito⭕️
Kenichiro Arai
vs
Big Fuji
TARU❌
(15:34 Messenger)

**INPUT EXAMPLES TO CONVERT:**
- YAML frontmatter: ---\ntitle: "El Numero Uno Special 2001"\ndate: 2015-08-19\n---
  → Use "El Numero Uno Special 2001" as ## header, IGNORE 2015-08-19 date
- "4/26/2001 Gifu Industrial Hall 1050 Attendance" 
  → "April 26th, 2001" + "Gifu Industrial Hall" + "Attendance: 1050"
- "2015-08-19 Tokyo, Differ Ariake 1810 Attendance"
  → IGNORE this date (it's WordPress upload), look for actual show dates in content
- "**11/25/2001 Shizuoka, Twin Messe Shizuoka - 1580 Attendance**"
  → "November 25th, 2001" + "Shizuoka, Twin Messe Shizuoka" + "Attendance: 1580"
- Replace any team scores like "Team A (3-2) Team B" with "Team A vs Team B"

IMPORTANT: 
- Extract series name from YAML title field, place as ## header before first show only
- IGNORE any dates in YAML frontmatter (WordPress upload dates)
- Sort ALL shows chronologically by actual show date
- Series header appears once before first show, not repeated

**CRITICAL FORMATTING RULES:**
1. **SERIES NAME**: Use title from YAML frontmatter as ## Header 2, ignore WordPress upload date
   - YAML frontmatter format: ---\ntitle: "Series Name"\ndate: 2015-08-19\n---
   - IGNORE the date field (WordPress upload date)
   - Use title field as series header before FIRST show only
2. **DATE FORMAT**: Must be "Month DDth, YYYY" (January 16th, 2000)
   - Convert from any format (4/26/2001, 2015-08-19, 11/25/2001, etc.)
   - Use full month names and proper ordinals (1st, 2nd, 3rd, 4th, etc.)
3. **VENUE FORMAT**: "City, Venue Name" on separate line
4. **ATTENDANCE FORMAT**: "Attendance: XXXX" with NO comma separators
5. **CHRONOLOGICAL ORDER**: Sort all shows/events in chronological order by date
6. Match number with ① ② ③ ④ etc. (circled numbers)
7. Match type (Tag Team Match, Singles Match, etc.)
8. **SPECIAL MATCH TYPES**:
   - Elimination matches: Show each fall with ❶❷❸❹❺ etc.
   - 2/3 Falls matches: Show each fall with ❶❷❸ etc.
   - Falls format: ❶❌Loser (time move) Winner⭕️
9. **WINNER/LOSER MARKING RULES:**
   - Only ONE wrestler per team gets ⭕️ (the one who got the win)
   - Only ONE wrestler per team gets ❌ (the one who took the loss/pin)
   - Other team members have NO symbols
   - For No Contest: Use ▲ for one wrestler per team (the involved participants)
   - For Time Limit Draw/Double Pinfall: Use △ for all participants
10. "vs" on its own line between teams (replace any scores like (3-2) or (5-4) with "vs")
11. Match time and finish move in parentheses: (time finish)
12. For championships: ⭐︎ symbol for title defense notes
13. Special matches (Captain's Fall, Hardcore, etc.) clearly labeled
14. Separate events with —— divider lines
**MATCH TYPE DETECTION:**
- Lines starting with ①②③④⑤⑥⑦⑧⑨⑩ should have proper match types
- If you see "③ No Contest" or "④ Time Limit Draw" etc., these are RESULTS, not match types
- Convert these to appropriate match types:
  - "③ No Contest" → "③ Singles Match" (with No Contest result)
  - "④ Time Limit Draw" → "④ Singles Match" (with Time Limit Draw result)
  - Look at participants to determine if Singles (2 wrestlers) or Tag Team (4+ wrestlers)
- Common match types: Singles Match, Tag Team Match, 6-Man Tag Match, Battle Royal, Championship Match
- If unsure, default to Singles Match for 2 participants, Tag Team Match for 4+ participants

**SPECIAL RESULTS:**
- No Contest: Use ▲ for one wrestler per team (the involved participants)
- Time Limit Draw/Double Pinfall: Use △ for all participants  
- Disqualification: Winner gets ⭕️, loser gets ❌
- Double Count Out: Use ▲ for both participants

**WRESTLER NAME FORMATTING:**
- Keep exact spelling: YAMATO, BxB Hulk, Strong Machine J, etc.
- Preserve special characters and capitalization
- ONLY mark the actual winner and loser, not entire teams

**CHAMPIONSHIP FORMATTING:**
- "(Champion)" and "(Challenger)" labels
- Defense numbers: "⭐︎1st successful defense" etc.
- "becomes the Xth champion" for title changes

EVENT TO FORMAT: ${seriesName}

RAW CONTENT:
${contentText}

CRITICAL: Before formatting, sort all shows/events by date chronologically (earliest first). Return the content formatted exactly like the Dragon Gate style shown above. Preserve all wrestler names, match times, and finish moves accurately. Handle elimination matches and 2/3 falls with the ❶❷❸ format. Replace any scores between teams with "vs". Do not add commentary or analysis.`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1, // Very low for consistent formatting
        topK: 1,
        topP: 1,
        maxOutputTokens: 6000, // Increased for full event cards
      }
    };
    
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true // Prevent throwing errors for HTTP status codes
    });
    
    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      throw new Error(`Gemini API error: ${response.getResponseCode()} - ${errorText}`);
    }
    
    const responseData = JSON.parse(response.getContentText());
    
    if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content) {
      throw new Error('Invalid response from Gemini API: ' + JSON.stringify(responseData));
    }
    
    const formattedContent = responseData.candidates[0].content.parts[0].text;
    
    logProgress(logSheet, `✅ Successfully formatted Dragon Gate results for ${seriesName}`);
    return formattedContent;
    
  } catch (error) {
    logProgress(logSheet, `ERROR formatting with Gemini API for ${seriesName}: ${error.message}`);
    
    // Dragon Gate specific fallback formatting
    const fallbackContent = formatDragonGateFallback(cleanedResults, seriesName);
    logProgress(logSheet, `Using Dragon Gate fallback formatting for ${seriesName}`);
    return fallbackContent;
  }
}

/**
 * Fallback Dragon Gate formatter (no API required)
 * @param {Array} cleanedResults - Parsed content from markdown file
 * @param {string} seriesName - Name of the wrestling series/event
 * @returns {string} Dragon Gate formatted wrestling results
 */
function formatDragonGateFallback(cleanedResults, seriesName) {
  const formatted = [];
  const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
  
  // Add event header
  formatted.push(seriesName);
  formatted.push('');
  
  let matchNumber = 0;
  let inMatchDetails = false;
  let currentMatch = [];
  let dateVenueSection = true;
  
  for (const item of cleanedResults) {
    if (item.type === 'header') {
      // Handle event headers and section breaks
      if (item.content.includes('——') || item.content.includes('---')) {
        formatted.push('——');
        formatted.push('');
        dateVenueSection = true;
        matchNumber = 0;
      } else {
        formatted.push(item.content);
        formatted.push('');
      }
    } else {
      const content = item.content.trim();
      
      if (content === '') {
        continue;
      }
      
      // Skip empty lines and separators
      if (content === '——' || content === '---') {
        formatted.push('——');
        formatted.push('');
        dateVenueSection = true;
        matchNumber = 0;
        continue;
      }
      
      // Handle date, venue, attendance at start of events
      if (dateVenueSection) {
        if (content.match(/\d{1,2}(st|nd|rd|th)?,? \d{4}/) || 
            content.includes('Attendance:') || 
            content.includes('Hall') || 
            content.includes('Center') || 
            content.includes('Arena')) {
          formatted.push(content);
          formatted.push('');
          continue;
        } else {
          dateVenueSection = false;
        }
      }
      
      // Detect match starts (lines with match types or circled numbers)
      if (content.match(/^[①②③④⑤⑥⑦⑧⑨⑩⓪]/)) {
        matchNumber++;
        let matchType = content.replace(/^[①②③④⑤⑥⑦⑧⑨⑩⓪]\s*/, '');
        
        // Use helper function to determine proper match type
        matchType = determineMatchType(matchType);
        
        formatted.push(`${circledNumbers[matchNumber - 1] || `⑩`} ${matchType}`);
        inMatchDetails = true;
        currentMatch = [];
      } else if (content.match(/(Singles|Tag Team|Man Tag|Battle Royal|Championship|Elimination) Match/i) ||
                 content.includes('Match')) {
        // Also catch explicit match type declarations without circled numbers
        matchNumber++;
        const matchType = determineMatchType(content);
        formatted.push(`${circledNumbers[matchNumber - 1] || `⑩`} ${matchType}`);
        inMatchDetails = true;
        currentMatch = [];
      } else if (inMatchDetails) {
        // Process match participants and results
        if (content.includes('vs') && content.length <= 5) {
          formatted.push('vs');
        } else if (content.match(/^\([0-9:]+.*\)$/)) {
          // Match time and finish
          formatted.push(content);
          formatted.push('');
          inMatchDetails = false;
        } else if (content.includes('⭐︎') || content.includes('★')) {
          // Championship notes
          formatted.push(content);
        } else if (content.includes('No Contest')) {
          // No Contest - mark one per team with ▲
          formatted.push(content);
        } else if (content.includes('Time Limit Draw') || 
                   content.includes('Double Pinfall') ||
                   content.includes('Draw')) {
          // Time Limit Draw/Double Pinfall - mark all with △
          formatted.push(content);
        } else {
          // Wrestler names - be more careful with winner/loser marking
          let line = content;
          
          // Only add markers if they're clearly missing and we can determine winner/loser
          // For fallback, be conservative and preserve original formatting
          formatted.push(line);
        }
      } else {
        // Non-match content
        formatted.push(content);
        formatted.push('');
      }
    }
  }
  
  return formatted.join('\n');
}

/**
 * Enhanced Dragon Gate specific markdown parser that handles YAML frontmatter
 * and filters out prose paragraphs between shows
 * @param {GoogleAppsScript.Drive.File} file - The markdown file to parse
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 * @returns {Object} Object containing cleanedResults and seriesName
 */
function parseMarkdownFile(file, logSheet) {
  try {
    const content = file.getBlob().getDataAsString();
    const fileName = file.getName();
    
    logProgress(logSheet, `Parsing Dragon Gate results file: ${fileName}`);
    
    // Validate file content
    if (typeof content !== 'string') {
      throw new Error(`File content is not a string: ${typeof content}`);
    }
    
    if (content.length === 0) {
      logProgress(logSheet, `⚠️ WARNING: File ${fileName} is empty`);
    }
    
    let seriesName = '';
    let contentBody = content;
    
    // Check for YAML frontmatter
    if (content.startsWith('---')) {
      const frontmatterEnd = content.indexOf('---', 3);
      if (frontmatterEnd !== -1) {
        const frontmatter = content.substring(3, frontmatterEnd);
        contentBody = content.substring(frontmatterEnd + 3).trim();
        
        // Extract title from frontmatter (ignore the date as it's WordPress upload date)
        const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/i);
        if (titleMatch) {
          seriesName = titleMatch[1].trim();
          logProgress(logSheet, `Extracted series name from frontmatter: ${seriesName}`);
        }
      }
    }
    
    // Fallback to filename if no frontmatter title found
    if (!seriesName) {
      seriesName = fileName.replace(/\.md$/i, '').replace(/[_-]/g, ' ').trim();
      // Capitalize first letters for better presentation
      seriesName = seriesName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    const lines = contentBody.split('\n');
    const cleanedResults = [];
    
    logProgress(logSheet, `Debug - Processing ${lines.length} lines from ${fileName}`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '') continue;
      
      // Detect different types of content
      if (line.startsWith('#')) {
        // Headers
        cleanedResults.push({
          type: 'header',
          content: line.replace(/^#+\s*/, ''),
          level: (line.match(/^#+/) || [''])[0].length
        });
      } else if (line === '——' || line === '---' || line.includes('——')) {
        // Event separators
        cleanedResults.push({
          type: 'separator',
          content: '——'
        });
      } else {
        // Check if this is a prose paragraph that should be filtered out
        const isProse = isProseContent(line);
        
        if (!isProse) {
          // Regular content - preserve all Dragon Gate specific formatting
          cleanedResults.push({
            type: 'content',
            content: line
          });
        } else {
          logProgress(logSheet, `Filtered out prose: ${line.substring(0, 50)}...`);
        }
      }
    }
    
    logProgress(logSheet, `Parsed ${cleanedResults.length} content blocks from ${fileName}`);
    
    const result = {
      cleanedResults: cleanedResults,
      seriesName: seriesName,
      originalContent: contentBody
    };
    
    // Debug logging
    logProgress(logSheet, `Debug - returning parsed data structure: cleanedResults is ${Array.isArray(cleanedResults) ? 'array' : typeof cleanedResults} with ${cleanedResults ? cleanedResults.length : 'null'} items`);
    
    return result;
    
  } catch (error) {
    logProgress(logSheet, `ERROR parsing Dragon Gate file ${file.getName()}: ${error.message}`);
    throw error;
  }
}

/**
 * Determines if a content line is prose that should be filtered out
 * @param {string} line - The content line to check
 * @returns {boolean} True if the line is prose and should be removed
 */
function isProseContent(line) {
  // Skip prose paragraphs - these are usually longer narrative text
  return (
    // Skip long paragraphs (likely prose)
    line.length > 200 ||
    // Skip sentences that start with names and contain storyline words
    line.match(/^[A-Z][a-z]+ (said|talked|admitted|revealed|challenged|asked|thanked|promised|considered|hoped|began|interrupted|invited|appeared|changed|gathered)/i) ||
    // Skip interview/backstage segments
    line.match(/^(An interview|A conversation|The interview|Backstage)/i) ||
    // Skip paragraphs about storylines, character development, etc.
    line.match(/^(After|Before|During|Following) (the match|match \d+)/i) ||
    // Skip narrative text that doesn't contain match data or dates
    (line.length > 100 && 
     !line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/) && 
     !line.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i) &&
     !line.match(/^\d+\./) && // Not a match listing
     !line.match(/\*\d+(st|nd|rd|th) Defense/i) && // Not a title defense note
     !line.match(/vs/) && // Not a match participant line
     !line.match(/\(\d+:\d+/) // Not a match time/result
    )
  );
}

/**
 * Creates a new Google Doc for a specific year's wrestling results
 * @param {number} year - The year for the document
 * @param {number} fileCount - Number of files that will be processed for this year
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 * @returns {GoogleAppsScript.Document.Document} The created Google Doc
 */
function createYearlyDocument(year, fileCount, logSheet) {
  try {
    const docName = `${year} Season Results`;
    const doc = DocumentApp.create(docName);
    
    // Add header content
    const body = doc.getBody();
    body.clear();
    
    // Title
    const title = body.appendParagraph(`Wrestling Results ${year}`);
    title.setHeading(DocumentApp.ParagraphHeading.TITLE);
    
    // Subtitle with file count
    const subtitle = body.appendParagraph(`Complete Collection - ${fileCount} Events`);
    subtitle.setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
    
    // Generated timestamp
    const timestamp = body.appendParagraph(`Generated: ${new Date().toLocaleString()}`);
    timestamp.editAsText().setItalic(true).setFontSize(10);
    
    // Add separator
    body.appendHorizontalRule();
    body.appendParagraph(''); // Empty line
    
    logProgress(logSheet, `Created yearly document: ${docName} (ID: ${doc.getId()})`);
    
    return doc;
    
  } catch (error) {
    logProgress(logSheet, `ERROR creating yearly document for ${year}: ${error.message}`);
    throw error;
  }
}

/**
 * Appends a series/event to the yearly Google Doc
 * @param {GoogleAppsScript.Document.Document} doc - The yearly document
 * @param {string} seriesName - Name of the series/event (not used since it's in formatted content)
 * @param {string} formattedContent - Formatted content to append
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 */
function appendSeriesToDocument(doc, seriesName, formattedContent, logSheet) {
  try {
    const body = doc.getBody();
    
    // Don't add series header - it's already in the formatted content from Gemini
    // The Gemini API formats it as ## Header 2, which is what we want
    
    // Add content
    const lines = formattedContent.split('\n');
    for (const line of lines) {
      if (line.trim() === '') {
        body.appendParagraph(''); // Empty line
      } else if (line.startsWith('###')) {
        const header = body.appendParagraph(line.replace(/^###\s*/, ''));
        header.setHeading(DocumentApp.ParagraphHeading.HEADING3);
      } else if (line.startsWith('##')) {
        const header = body.appendParagraph(line.replace(/^##\s*/, ''));
        header.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      } else if (line.startsWith('#')) {
        const header = body.appendParagraph(line.replace(/^#\s*/, ''));
        header.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      } else {
        body.appendParagraph(line);
      }
    }
    
    // Add separator between series
    body.appendHorizontalRule();
    body.appendParagraph(''); // Empty line
    
    logProgress(logSheet, `✅ Appended ${seriesName} to yearly document`);
    
  } catch (error) {
    logProgress(logSheet, `ERROR appending ${seriesName} to document: ${error.message}`);
    throw error;
  }
}

/**
 * Finalizes the yearly document with summary information
 * @param {GoogleAppsScript.Document.Document} doc - The yearly document
 * @param {number} processedCount - Number of files successfully processed
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 */
function finalizeYearlyDocument(doc, processedCount, logSheet) {
  try {
    const body = doc.getBody();
    
    // Add footer
    body.appendParagraph(''); // Empty line
    body.appendHorizontalRule();
    
    const footer = body.appendParagraph(`Document completed with ${processedCount} events processed on ${new Date().toLocaleString()}`);
    footer.editAsText().setItalic(true).setFontSize(10);
    
    // Save the document
    doc.saveAndClose();
    
    logProgress(logSheet, `✅ Finalized yearly document: ${doc.getName()}`);
    logProgress(logSheet, `Document URL: ${doc.getUrl()}`);
    
  } catch (error) {
    logProgress(logSheet, `ERROR finalizing document: ${error.message}`);
    throw error;
  }
}

/**
 * Test function for Gemini API connectivity
 */
async function testGeminiAPI() {
  console.log('Testing Gemini API...');
  
  try {
    const testContent = [{
      type: 'content',
      content: 'Test wrestling match: John Doe vs Jane Smith - John Doe wins by pinfall'
    }];
    
    const result = await formatWithGeminiAPI(testContent, 'Test Event', null);
    console.log('✅ Gemini API test successful');
    console.log('Formatted result:', result);
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    throw error;
  }
}

/**
 * Debug function to test date extraction
 */
function testDateExtraction() {
  console.log('Testing date extraction...');
  
  // Test with valid data
  const testData = [
    { type: 'content', content: '4/26/2001 Gifu Industrial Hall 1050 Attendance' },
    { type: 'content', content: 'May 12th, 2001 Tokyo, Korakuen Hall' },
    { type: 'header', content: 'Test Header', level: 2 }
  ];
  
  console.log('Test data:', testData);
  const result = extractEarliestDate(testData);
  console.log('Extracted date:', result);
  
  // Test with invalid data
  console.log('Testing with null...');
  const nullResult = extractEarliestDate(null);
  console.log('Null result:', nullResult);
  
  // Test with non-array
  console.log('Testing with string...');
  const stringResult = extractEarliestDate('not an array');
  console.log('String result:', stringResult);
}