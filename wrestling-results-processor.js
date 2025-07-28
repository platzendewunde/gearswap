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
 * Safe wrapper for extractEarliestDate that handles any type of input
 * @param {*} input - Any input that should be parsed for dates
 * @returns {Date|null} The earliest date found, or null if no dates found
 */
function extractEarliestDateSafe(input) {
  try {
    return extractEarliestDateNew(input);
  } catch (error) {
    console.error('Error in extractEarliestDate:', error.message);
    console.error('Input was:', typeof input, input);
    return null;
  }
}

/**
 * New version of date extraction function with robust error handling
 * @param {*} cleanedResults - Input to parse for dates
 * @returns {Date|null} The earliest date found, or null if no dates found
 */
function extractEarliestDateNew(cleanedResults) {
  console.log('extractEarliestDateNew called with:', typeof cleanedResults);
  
  // Handle completely invalid inputs
  if (cleanedResults === null || cleanedResults === undefined) {
    console.warn('Input is null or undefined');
    return null;
  }
  
  // Convert to array if it's not already
  let dataArray;
  if (Array.isArray(cleanedResults)) {
    dataArray = cleanedResults;
  } else if (typeof cleanedResults === 'object' && cleanedResults.cleanedResults) {
    // Handle case where the entire parsed object was passed
    dataArray = cleanedResults.cleanedResults;
  } else {
    console.warn('Input is not an array or valid object:', typeof cleanedResults);
    return null;
  }
  
  if (!Array.isArray(dataArray)) {
    console.warn('dataArray is still not an array:', typeof dataArray);
    return null;
  }
  
  const dates = [];
  
  for (let i = 0; i < dataArray.length; i++) {
    const item = dataArray[i];
    
    if (!item || typeof item !== 'object' || item.type !== 'content') {
      continue;
    }
    
    const content = item.content;
    if (typeof content !== 'string') {
      continue;
    }
    
    // Simple date patterns for testing
    const dateMatches = [
      content.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/),
      content.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(st|nd|rd|th)?,?\s+(\d{4})/i)
    ];
    
    for (let j = 0; j < dateMatches.length; j++) {
      const match = dateMatches[j];
      if (match) {
        try {
          let date;
          if (j === 0) {
            // MM/DD/YYYY format
            const month = parseInt(match[1], 10) - 1;
            const day = parseInt(match[2], 10);
            const year = parseInt(match[3], 10);
            date = new Date(year, month, day);
          } else {
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
          }
          
          if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
            dates.push(date);
          }
        } catch (error) {
          console.warn('Date parsing error:', error.message);
        }
        break; // Only process first match per content item
      }
    }
  }
  
  if (dates.length > 0) {
    dates.sort((a, b) => a - b);
    return dates[0];
  }
  
  return null;
}

/**
 * Extracts the earliest date from parsed wrestling results for chronological sorting
 * @param {Array} cleanedResults - Parsed content from markdown file (prose already filtered out)
 * @returns {Date|null} The earliest date found, or null if no dates found
 */
function extractEarliestDate(cleanedResults) {
  console.log('extractEarliestDate called with:', typeof cleanedResults, cleanedResults);
  
  // Validate input - using more defensive coding
  if (cleanedResults === null || cleanedResults === undefined) {
    console.warn('extractEarliestDate: cleanedResults is null or undefined');
    return null;
  }
  
  if (!Array.isArray(cleanedResults)) {
    console.warn('extractEarliestDate: cleanedResults is not an array, type:', typeof cleanedResults, 'value:', cleanedResults);
    return null;
  }
  
  const dates = [];
  
    // Use traditional for loop instead of for...of to avoid iteration issues
  for (let i = 0; i < cleanedResults.length; i++) {
    const item = cleanedResults[i];
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
         },
         {
           pattern: /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
           type: 'mdy_dot'
         },
         {
           pattern: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(st|nd|rd|th)?,?\s+(\d{4})/i,
           type: 'month_abbrev'
         }
       ];
      
      for (let j = 0; j < datePatterns.length; j++) {
        const { pattern, type } = datePatterns[j];
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
             } else if (type === 'month_abbrev') {
               // Month abbreviation format
               const months = {
                 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
               };
               const month = months[match[1].toLowerCase().substring(0, 3)];
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
               // MM/DD/YYYY, MM-DD-YYYY, or MM.DD.YYYY format
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
    .addItem('Test Event Extraction', 'testEventExtraction')
    .addItem('Test Chronological Sort', 'testChronologicalSorting')
    .addItem('Test Year Filtering', 'testYearFiltering')
    .addItem('Test Output Formatting', 'testOutputFormatting')
    .addItem('Test Prose Filtering', 'testProseFiltering')
    .addItem('Test Series Headers', 'testSeriesHeaders')
    .addItem('Test Wrestler Lines', 'testWrestlerLineFormatting')
    .addItem('Test Special Results', 'testSpecialResultFormatting')
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
      
      // Parse all files and extract individual events for global chronological sorting
      const allEvents = [];
      const parsedFiles = [];
      
      for (const fileData of yearFiles) {
        try {
          logProgress(logSheet, `Parsing file and extracting events: ${fileData.name}`);
          const parsedData = parseMarkdownFile(fileData.file, logSheet);
          
          // Validate parsed data structure
          if (!parsedData || typeof parsedData !== 'object' || !parsedData.cleanedResults) {
            logProgress(logSheet, `⚠️ WARNING: Invalid parsed data structure for ${fileData.name}`);
            throw new Error(`Invalid parsed data structure for ${fileData.name}`);
          }
          
          // Extract individual events from this file
          const events = extractEventsFromParsedData(parsedData, fileData, logSheet);
          allEvents.push(...events);
          
          parsedFiles.push({
            fileData: fileData,
            parsedData: parsedData,
            eventCount: events.length
          });
          
        } catch (parseError) {
          logProgress(logSheet, `❌ FAILED to parse ${fileData.name}: ${parseError.message}`);
          parsedFiles.push({
            fileData: fileData,
            parsedData: null,
            eventCount: 0
          });
        }
      }
      
      // Sort all events globally by date
      allEvents.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date - b.date;
      });
      
      logProgress(logSheet, `Extracted and sorted ${allEvents.length} individual events chronologically for ${year}`);
      
      // Debug: Log the chronological order
      logProgress(logSheet, 'CHRONOLOGICAL ORDER DEBUG:');
      allEvents.forEach((event, index) => {
        const dateStr = event.date ? event.date.toISOString().split('T')[0] : 'NO DATE';
        logProgress(logSheet, `${index + 1}. ${dateStr} - ${event.fileName} - ${event.seriesName}`);
      });
      
      // Process all events in chronological order, tracking series changes
      let processedCount = 0;
      let currentSeries = null;
      
      for (const event of allEvents) {
        try {
          // Validate event year matches target year
          const eventYear = event.date ? event.date.getFullYear() : null;
          if (eventYear && eventYear !== year) {
            logProgress(logSheet, `⚠️ Skipping event from ${event.fileName} - wrong year (${eventYear} vs ${year})`);
            continue;
          }
          
          logProgress(logSheet, `Processing event from ${event.fileName}: ${event.seriesName}`);
          
          // Check if this is a new series
          const isNewSeries = currentSeries !== event.seriesName;
          
          // Format this individual event using Gemini API (without series header)
          const formattedContent = await formatWithGeminiAPI(event.cleanedResults, '', logSheet);
          
          if (isNewSeries) {
            // Add series header for new series
            appendSeriesHeader(yearlyDoc, event.seriesName, logSheet);
            currentSeries = event.seriesName;
          }
          
          // Append event content to yearly document (without series name)
          appendEventToDocument(yearlyDoc, formattedContent, logSheet);
          
          processedCount++;
          logProgress(logSheet, `✅ Successfully processed event (${processedCount}/${allEvents.length})`);
          
        } catch (eventError) {
          logProgress(logSheet, `❌ FAILED to process event from ${event.fileName}: ${eventError.message}`);
          // Continue processing other events despite individual failures
        }
      }
      
      // Finalize the yearly document
      finalizeYearlyDocument(yearlyDoc, processedCount, logSheet);
      logProgress(logSheet, `📄 Completed ${year} document with ${processedCount} events from ${yearFiles.length} files processed`);
      
      logProgress(logSheet, `Completed processing ${year} (${allEvents.length} events from ${yearFiles.length} files, chronologically sorted)`);
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
 * Extracts individual events from parsed markdown data for chronological sorting
 * @param {Object} parsedData - The parsed markdown data
 * @param {Object} fileData - The original file data
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 * @returns {Array} Array of individual events with dates
 */
function extractEventsFromParsedData(parsedData, fileData, logSheet) {
  const events = [];
  const cleanedResults = parsedData.cleanedResults;
  
  if (!Array.isArray(cleanedResults)) {
    logProgress(logSheet, `⚠️ No cleanedResults array found in ${fileData.name}`);
    return events;
  }
  
  let currentEvent = {
    cleanedResults: [],
    seriesName: parsedData.seriesName,
    fileName: fileData.name,
    date: null
  };
  
  let hasEventContent = false;
  
  for (let i = 0; i < cleanedResults.length; i++) {
    const item = cleanedResults[i];
    
    // Check if this is a separator that indicates a new event OR a new event header
    const isEventSeparator = item.type === 'separator' || 
                            (item.type === 'content' && (item.content === '——' || item.content === '---'));
    
    // Also check if this looks like a new event header (contains date and venue)
    const isEventHeader = item.type === 'content' && 
                         item.content.match(/^\*\*.*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}.*\*\*/) && 
                         currentEvent.cleanedResults.length > 0; // Only if we already have content
    
    if (isEventSeparator || isEventHeader) {
      // If we have accumulated content, save the current event
      if (hasEventContent && currentEvent.cleanedResults.length > 0) {
        // Try to extract date for this event
        currentEvent.date = extractEarliestDateSafe(currentEvent.cleanedResults);
        
        // Debug: Log the content being used for date extraction
        const contentForDate = currentEvent.cleanedResults
          .filter(r => r.type === 'content')
          .map(r => r.content)
          .slice(0, 3) // First 3 lines
          .join(' | ');
        
        events.push(currentEvent);
        
        logProgress(logSheet, `Extracted event from ${fileData.name}: ${currentEvent.date ? currentEvent.date.toDateString() : 'No date found'} - Content: ${contentForDate.substring(0, 100)}...`);
      }
      
      // Start a new event
      currentEvent = {
        cleanedResults: [],
        seriesName: parsedData.seriesName,
        fileName: fileData.name,
        date: null
      };
      hasEventContent = false;
      
      // If this was an event header (not separator), include it in the new event
      if (isEventHeader) {
        currentEvent.cleanedResults.push(item);
        hasEventContent = true;
      }
      
    } else {
      // Add this item to the current event
      currentEvent.cleanedResults.push(item);
      
      // Check if this looks like event content (not just empty lines)
      if (item.type === 'content' && item.content.trim() !== '') {
        hasEventContent = true;
      }
    }
  }
  
  // Don't forget the last event if there's no final separator
  if (hasEventContent && currentEvent.cleanedResults.length > 0) {
    currentEvent.date = extractEarliestDateSafe(currentEvent.cleanedResults);
    events.push(currentEvent);
    
    logProgress(logSheet, `Extracted final event from ${fileData.name}: ${currentEvent.date ? currentEvent.date.toDateString() : 'No date found'}`);
  }
  
  // If no separators were found, treat the entire file as one event
  if (events.length === 0 && cleanedResults.length > 0) {
    const singleEvent = {
      cleanedResults: cleanedResults,
      seriesName: parsedData.seriesName,
      fileName: fileData.name,
      date: extractEarliestDateSafe(cleanedResults)
    };
    events.push(singleEvent);
    
    logProgress(logSheet, `Treating entire file ${fileData.name} as single event: ${singleEvent.date ? singleEvent.date.toDateString() : 'No date found'}`);
  }
  
  return events;
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
- DO NOT include series name headers (##) in the output - these are handled separately
- IGNORE any dates in YAML frontmatter (WordPress upload dates)
- Sort ALL shows chronologically by actual show date
- Focus on formatting individual event content only
- DO NOT add separators (——) between matches - these are handled separately

**CRITICAL FORMATTING RULES:**
1. **NO SERIES HEADERS**: Do not include any ## headers in the output - only format the event content
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
   - For Double Count Out: Use ▲ for one wrestler per team (the involved participants)
   - For Time Limit Draw: Use △ for all participants
   - For Double Pinfall: Use △ for all participants
10. **WRESTLER LINE FORMATTING**:
   - Each wrestler on their own individual line
   - "vs" on its own separate line between teams
   - NEVER put wrestlers on same line as "vs"
   - Replace any scores like (3-2) or (5-4) with just "vs"
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
  Example: Genki Horiguchi▲ vs Chocoflake K-ICHI▲ (7:24 No Contest)
- Double Count Out: Use ▲ for one wrestler per team (the involved participants)  
  Example: Genki Horiguchi▲ vs Chocoflake K-ICHI▲ (7:24 Double Count Out)
- Time Limit Draw: Use △ for all participants
  Example: Genki Horiguchi△ vs Chocoflake K-ICHI△ (30:00 Time Limit Draw)
- Double Pinfall: Use △ for all participants
  Example: Genki Horiguchi△ vs Chocoflake K-ICHI△ (15:30 Double Pinfall)
- Disqualification: Winner gets ⭕️, loser gets ❌

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

**CRITICAL SPECIAL RESULT FORMATTING RULES:**
- ▲ symbol is ONLY for: No Contest, Double Count Out, Disqualification (loser)
- △ symbol is ONLY for: Time Limit Draw, Double Pinfall, Draw
- ⭕️ symbol is ONLY for: Actual winners (pins, submissions, etc.)
- ❌ symbol is ONLY for: Actual losers (pinned, submitted, etc.)

**CRITICAL WRESTLER LINE FORMATTING EXAMPLES:**
CORRECT Singles Match Format:
② El Numero Uno Block C:
SUWA▲
vs
Darkness Dragon▲
(8:01 Double Count Out)

WRONG Format (DO NOT DO THIS):
SUWA▲ vs Darkness Dragon▲

CORRECT Tag Team Format:
① Tag Team Match
Dragon Kid⭕️
Genki Horiguchi
vs
Darkness Dragon
CIMA❌
(16:45 Ultra Hurricanrana)

**DO NOT CONFUSE THESE SYMBOLS:**
- If it says "No Contest" anywhere → use ▲ 
- If it says "Double Count Out" anywhere → use ▲
- If it says "Time Limit Draw" anywhere → use △
- If it says "Double Pinfall" anywhere → use △

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
        } else if (content.includes(' vs ')) {
          // Split wrestlers that are on the same line with vs
          const parts = content.split(' vs ');
          for (let i = 0; i < parts.length; i++) {
            if (parts[i].trim()) {
              formatted.push(parts[i].trim());
            }
            if (i < parts.length - 1) {
              formatted.push('vs');
            }
          }
        } else if (content.match(/^\([0-9:]+.*\)$/)) {
          // Match time and finish
          formatted.push(content);
          formatted.push('');
          inMatchDetails = false;
        } else if (content.includes('⭐︎') || content.includes('★')) {
          // Championship notes
          formatted.push(content);
        } else if (content.includes('No Contest') || content.includes('Double Count Out')) {
          // No Contest or Double Count Out - mark one per team with ▲
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
  // NEVER filter out event headers and important structural content
  if (
    // Event headers with dates and venues (like **1/31/2004 Tokyo, Korakuen Hall**)
    line.match(/^\*\*.*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}.*\*\*/) ||
    // Bold event headers
    line.match(/^\*\*.*Attendance.*\*\*/) ||
    // Any line with bold formatting that contains dates or venues
    line.match(/^\*\*.*\*\*/) ||
    // Lines starting with match numbers or circled numbers
    line.match(/^[①②③④⑤⑥⑦⑧⑨⑩\d]+[\.\)]\s/) ||
    // Lines with dates (any format)
    line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/) ||
    line.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i) ||
    // Lines with attendance info
    line.match(/attendance/i) ||
    // Lines with match types
    line.match(/(Singles|Tag Team|Battle Royal|Championship|Elimination|Hardcore|Street Fight|Ladder|Cage) Match/i) ||
    // Lines with vs
    line.match(/\bvs\b/) ||
    // Lines with match times and results
    line.match(/\(\d+:\d+/) ||
    // Lines with wrestler win/loss symbols
    line.match(/[⭕❌▲△]/) ||
    // Lines with title defense info
    line.match(/\*\d+(st|nd|rd|th) Defense/i) ||
    // Short lines (likely wrestler names or match info)
    line.length <= 50
  ) {
    return false; // Don't filter these out
  }
  
  // Filter out actual prose content
  return (
    // Very long paragraphs (likely prose)
    line.length > 250 ||
    // Sentences that start with names and contain storyline words
    line.match(/^[A-Z][a-z]+ (said|talked|admitted|revealed|challenged|asked|thanked|promised|considered|hoped|began|interrupted|invited|appeared|changed|gathered)/i) ||
    // Interview/backstage segments
    line.match(/^(An interview|A conversation|The interview|Backstage)/i) ||
    // Paragraphs about storylines, character development, etc.
    line.match(/^(After|Before|During|Following) (the match|match \d+)/i) ||
    // Long narrative text without wrestling-specific content
    (line.length > 150 && 
     !line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/) && 
     !line.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i) &&
     !line.match(/match/i) &&
     !line.match(/vs/) &&
     !line.match(/attendance/i) &&
     !line.match(/hall|center|arena|gym/i) &&
     !line.match(/\(\d+:\d+/) &&
     !line.match(/[⭕❌▲△]/)
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
 * Appends just a series header to the yearly Google Doc
 * @param {GoogleAppsScript.Document.Document} doc - The yearly document
 * @param {string} seriesName - Name of the series
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 */
function appendSeriesHeader(doc, seriesName, logSheet) {
  try {
    const body = doc.getBody();
    
    // Add series header as Header 2
    const header = body.appendParagraph(seriesName);
    header.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    
    // Add empty line after header
    body.appendParagraph('');
    
    logProgress(logSheet, `✅ Added series header: ${seriesName}`);
    
  } catch (error) {
    logProgress(logSheet, `ERROR adding series header ${seriesName}: ${error.message}`);
    throw error;
  }
}

/**
 * Appends event content to the yearly Google Doc (without series header)
 * @param {GoogleAppsScript.Document.Document} doc - The yearly document
 * @param {string} formattedContent - Formatted content to append
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Sheet for logging progress
 */
function appendEventToDocument(doc, formattedContent, logSheet) {
  try {
    const body = doc.getBody();
    
    // Add content
    const lines = formattedContent.split('\n');
    for (const line of lines) {
      if (line.trim() === '') {
        body.appendParagraph(''); // Empty line
      } else if (line.startsWith('###')) {
        const header = body.appendParagraph(line.replace(/^###\s*/, ''));
        header.setHeading(DocumentApp.ParagraphHeading.HEADING3);
      } else if (line.startsWith('##')) {
        // Skip ## headers since we handle series headers separately
        continue;
      } else if (line.startsWith('#')) {
        const header = body.appendParagraph(line.replace(/^#\s*/, ''));
        header.setHeading(DocumentApp.ParagraphHeading.HEADING3);
      } else {
        body.appendParagraph(line);
      }
    }
    
    // Add separator after event
    body.appendParagraph('');
    body.appendParagraph('——');
    body.appendParagraph('');
    
  } catch (error) {
    logProgress(logSheet, `ERROR appending event content: ${error.message}`);
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



/**
 * Test function to verify chronological sorting with realistic data
 */
function testChronologicalSorting() {
  console.log('Testing chronological sorting with realistic data...');
  
  // Simulate multiple files with events in different orders
  const file1Data = {
    seriesName: 'Spring Tournament 2002',
    cleanedResults: [
      { type: 'content', content: '**5/15/2002 Tokyo, Korakuen Hall - 2100 Attendance**' },
      { type: 'content', content: '① Singles Match' },
      { type: 'content', content: 'Dragon Kid vs CIMA' },
      { type: 'separator', content: '——' },
      { type: 'content', content: '**5/10/2002 Osaka, Prefectural Gym - 1800 Attendance**' },
      { type: 'content', content: '② Tag Team Match' },
      { type: 'content', content: 'Team A vs Team B' }
    ]
  };
  
  const file2Data = {
    seriesName: 'April Championship 2002',
    cleanedResults: [
      { type: 'content', content: '**4/25/2002 Hiroshima, Sports Center - 1500 Attendance**' },
      { type: 'content', content: '③ Battle Royal' },
      { type: 'content', content: 'Multiple wrestlers' },
      { type: 'separator', content: '——' },
      { type: 'content', content: '**4/20/2002 Fukuoka, Civic Hall - 1200 Attendance**' },
      { type: 'content', content: '④ Championship Match' },
      { type: 'content', content: 'Champion vs Challenger' }
    ]
  };
  
  const mockLogSheet = {
    appendRow: () => {}
  };
  
  // Extract events from both files
  const events1 = extractEventsFromParsedData(file1Data, { name: 'spring2002.md' }, mockLogSheet);
  const events2 = extractEventsFromParsedData(file2Data, { name: 'april2002.md' }, mockLogSheet);
  
  // Combine all events
  const allEvents = [...events1, ...events2];
  
  console.log('\n=== BEFORE SORTING ===');
  allEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.date ? event.date.toDateString() : 'No date'} - ${event.fileName}`);
  });
  
  // Sort chronologically
  allEvents.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date - b.date;
  });
  
  console.log('\n=== AFTER CHRONOLOGICAL SORTING ===');
  allEvents.forEach((event, index) => {
    console.log(`${index + 1}. ${event.date ? event.date.toDateString() : 'No date'} - ${event.fileName}`);
  });
  
  console.log('\n=== EXPECTED ORDER ===');
  console.log('1. April 20, 2002 (fukuoka)');
  console.log('2. April 25, 2002 (hiroshima)');
  console.log('3. May 10, 2002 (osaka)');
  console.log('4. May 15, 2002 (tokyo)');
}

/**
 * Test function to verify event extraction and chronological sorting
 */
function testEventExtraction() {
  console.log('Testing event extraction...');
  
  // Simulate parsed data with multiple events
  const testParsedData = {
    seriesName: 'Test Tournament 2002',
    cleanedResults: [
      { type: 'content', content: '**5/15/2002 Tokyo, Korakuen Hall - 2100 Attendance**' },
      { type: 'content', content: '① Singles Match' },
      { type: 'content', content: 'Dragon Kid vs CIMA' },
      { type: 'content', content: '(15:30 Ultra Hurricanrana)' },
      { type: 'separator', content: '——' },
      { type: 'content', content: '**5/10/2002 Osaka, Prefectural Gym - 1800 Attendance**' },
      { type: 'content', content: '② Tag Team Match' },
      { type: 'content', content: 'Team A vs Team B' },
      { type: 'content', content: '(20:15 Suplex)' },
      { type: 'separator', content: '——' },
      { type: 'content', content: '**5/20/2002 Hiroshima, Sports Center - 1500 Attendance**' },
      { type: 'content', content: '③ Battle Royal' },
      { type: 'content', content: 'Multiple wrestlers' },
      { type: 'content', content: '(25:00 Last man standing)' }
    ]
  };
  
  const testFileData = {
    name: 'test-may2002.md',
    id: 'test123'
  };
  
  // Create a mock log sheet
  const mockLogSheet = {
    appendRow: () => {},
    getRange: () => ({ setValues: () => {}, setFontWeight: () => {}, setBackground: () => {}, setFontColor: () => {} })
  };
  
  const events = extractEventsFromParsedData(testParsedData, testFileData, mockLogSheet);
  
  console.log(`\n=== EXTRACTED ${events.length} EVENTS ===`);
  events.forEach((event, index) => {
    console.log(`Event ${index + 1}:`);
    console.log(`  Date: ${event.date ? event.date.toDateString() : 'No date'}`);
    console.log(`  Series: ${event.seriesName}`);
    console.log(`  File: ${event.fileName}`);
    console.log(`  Content blocks: ${event.cleanedResults.length}`);
    console.log('');
  });
  
  // Test chronological sorting
  events.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date - b.date;
  });
  
  console.log('=== AFTER CHRONOLOGICAL SORTING ===');
  events.forEach((event, index) => {
    console.log(`${index + 1}. ${event.date ? event.date.toDateString() : 'No date'}`);
  });
}

/**
 * Test function to verify prose filtering
 */
function testProseFiltering() {
  console.log('Testing prose filtering...');
  
  const testLines = [
    // These should NOT be filtered (wrestling content)
    '**1/31/2004 Tokyo, Korakuen Hall - 2350 Attendance**',
    '**1/29/2004 Hiroshima, Saeki-ku Sports Center - 800 Attendance**',
    '① Singles Match',
    'Dragon Kid⭕️',
    'vs',
    'CIMA❌',
    '(15:30 Ultra Hurricanrana)',
    '4/26/2001 Gifu Industrial Hall 1050 Attendance',
    'May 12th, 2001',
    'Tag Team Match',
    '⭐︎1st successful defense',
    
    // These SHOULD be filtered (prose content)
    'After the match, Dragon Kid talked about his feelings regarding the upcoming tournament and how he hoped to make his mark in the promotion while also considering his future options in the wrestling business.',
    'An interview was conducted backstage where the wrestler discussed his strategy.',
    'The interview revealed that CIMA had been planning this for weeks.',
    'Following the main event, there was a lengthy celebration as fans cheered for their favorite wrestlers and the promotion announced several upcoming shows for the next month.',
    'Backstage, several wrestlers gathered to discuss the recent developments in their ongoing storylines and character arcs.'
  ];
  
  console.log('\n=== TESTING PROSE FILTERING ===');
  testLines.forEach((line, index) => {
    const isFiltered = isProseContent(line);
    const shouldKeep = !isFiltered;
    const linePreview = line.length > 50 ? line.substring(0, 50) + '...' : line;
    
    console.log(`${index + 1}. ${shouldKeep ? '✅ KEEP' : '❌ FILTER'}: ${linePreview}`);
  });
  
  console.log('\n=== SUMMARY ===');
  console.log('✅ Lines marked KEEP should be wrestling content (events, matches, results)');
  console.log('❌ Lines marked FILTER should be prose/narrative content');
}

/**
 * Test function to verify series header behavior
 */
async function testSeriesHeaders() {
  console.log('Testing series header behavior...');
  
  const logSheet = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID).getActiveSheet();
  
  // Test formatting without series header
  const testData = [
    { type: 'content', content: '**5/15/2002 Tokyo, Korakuen Hall - 2100 Attendance**' },
    { type: 'content', content: '① Singles Match' },
    { type: 'content', content: 'Dragon Kid vs CIMA' },
    { type: 'content', content: '(15:30 Ultra Hurricanrana)' }
  ];
  
  try {
    const result = await formatWithGeminiAPI(testData, '', logSheet);
    console.log('Formatted result:');
    console.log(result);
    
    // Check that no ## headers are included
    const lines = result.split('\n');
    let hasSeriesHeader = false;
    
    for (const line of lines) {
      if (line.trim().startsWith('##')) {
        hasSeriesHeader = true;
        console.log(`❌ Found series header: ${line}`);
        break;
      }
    }
    
    if (!hasSeriesHeader) {
      console.log('✅ No series headers found in formatted output');
    } else {
      console.log('❌ Series headers found - should be handled separately');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Test function to verify wrestler line formatting
 */
async function testWrestlerLineFormatting() {
  console.log('Testing wrestler line formatting...');
  
  const logSheet = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID).getActiveSheet();
  
  const testData = [
    { type: 'content', content: '② El Numero Uno Block C:' },
    { type: 'content', content: 'SUWA vs Darkness Dragon' },
    { type: 'content', content: '(8:01 Double Count Out)' },
    { type: 'separator', content: '——' },
    { type: 'content', content: '③ El Numero Uno Block B:' },
    { type: 'content', content: 'Super Shisa vs Masaaki Mochizuki' },
    { type: 'content', content: '(8:33 Shisa Clutch II)' }
  ];
  
  try {
    const result = await formatWithGeminiAPI(testData, 'Wrestler Line Test', logSheet);
    console.log('Formatted result:');
    console.log(result);
    
    // Check for correct line formatting
    const lines = result.split('\n');
    let hasCorrectFormat = false;
    let hasIncorrectFormat = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for incorrect format (wrestlers on same line as vs)
      if (line.match(/\w+.*vs.*\w+/)) {
        hasIncorrectFormat = true;
        console.log(`❌ Found incorrect format: ${line}`);
      }
      
      // Check for correct format (vs on its own line)
      if (line === 'vs' && i > 0 && i < lines.length - 1) {
        const prevLine = lines[i - 1].trim();
        const nextLine = lines[i + 1].trim();
        if (prevLine && nextLine && !prevLine.includes('vs') && !nextLine.includes('vs')) {
          hasCorrectFormat = true;
          console.log(`✅ Found correct format: ${prevLine} / vs / ${nextLine}`);
        }
      }
    }
    
    if (hasCorrectFormat && !hasIncorrectFormat) {
      console.log('✅ All wrestler lines formatted correctly');
    } else if (hasIncorrectFormat) {
      console.log('❌ Found incorrect wrestler line formatting');
    } else {
      console.log('⚠️ Could not determine formatting quality');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Test function to verify special result formatting
 */
async function testSpecialResultFormatting() {
  console.log('Testing special result formatting...');
  
  const logSheet = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID).getActiveSheet();
  
  const testData = [
    { type: 'content', content: '② Singles Match' },
    { type: 'content', content: 'Genki Horiguchi' },
    { type: 'content', content: 'vs' },
    { type: 'content', content: 'Chocoflake K-ICHI' },
    { type: 'content', content: '(7:24 Double Count Out)' },
    { type: 'separator', content: '——' },
    { type: 'content', content: '③ Singles Match' },
    { type: 'content', content: 'Ryo Saito' },
    { type: 'content', content: 'vs' },
    { type: 'content', content: 'Masato Yoshino' },
    { type: 'content', content: '(30:00 Time Limit Draw)' }
  ];
  
  try {
    const result = await formatWithGeminiAPI(testData, 'Special Results Test', logSheet);
    console.log('Formatted result:');
    console.log(result);
    
    // Check for correct symbols
    if (result.includes('▲') && result.includes('Double Count Out')) {
      console.log('✅ Double Count Out correctly formatted with ▲');
    } else {
      console.log('❌ Double Count Out formatting issue');
    }
    
    if (result.includes('△') && result.includes('Time Limit Draw')) {
      console.log('✅ Time Limit Draw correctly formatted with △');
    } else {
      console.log('❌ Time Limit Draw formatting issue');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Test function to verify year filtering and date consistency
 */
async function testYearFiltering() {
  console.log('Testing year filtering and date consistency...');
  
  const logSheet = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID).getActiveSheet();
  
  // Test with mixed year data
  const testEvents = [
    {
      fileName: 'test2002.md',
      seriesName: 'Test Series 2002',
      date: new Date(2002, 4, 15), // May 15, 2002
      cleanedResults: [
        { type: 'content', content: '**May 15th, 2002 - Tokyo, Korakuen Hall**' }
      ]
    },
    {
      fileName: 'test2000.md', 
      seriesName: 'Test Series 2000',
      date: new Date(2000, 2, 27), // March 27, 2000
      cleanedResults: [
        { type: 'content', content: '**March 27th, 2000 - Niigata, Welfare Hall**' }
      ]
    },
    {
      fileName: 'test2002b.md',
      seriesName: 'Test Series 2002 Part 2', 
      date: new Date(2002, 9, 14), // October 14, 2002
      cleanedResults: [
        { type: 'content', content: '**October 14th, 2002 - Shimane, Matsue**' }
      ]
    }
  ];
  
  const targetYear = 2002;
  let validEvents = 0;
  let filteredEvents = 0;
  
  console.log(`Testing year filtering for target year: ${targetYear}`);
  
  for (const event of testEvents) {
    const eventYear = event.date ? event.date.getFullYear() : null;
    
    if (eventYear && eventYear !== targetYear) {
      console.log(`❌ Would filter: ${event.fileName} (year ${eventYear})`);
      filteredEvents++;
    } else {
      console.log(`✅ Would include: ${event.fileName} (year ${eventYear})`);
      validEvents++;
    }
  }
  
  console.log(`\nResults: ${validEvents} included, ${filteredEvents} filtered`);
  
  if (validEvents === 2 && filteredEvents === 1) {
    console.log('✅ Year filtering test passed!');
  } else {
    console.log('❌ Year filtering test failed!');
  }
}

/**
 * Test function to debug output formatting issues
 */
async function testOutputFormatting() {
  console.log('Testing output formatting...');
  
  const logSheet = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID).getActiveSheet();
  
  // Create test events with proper structure
  const testEvents = [
    {
      fileName: 'test1.md',
      seriesName: 'Test Series A',
      date: new Date(2002, 2, 15), // March 15, 2002
      cleanedResults: [
        { type: 'content', content: '**March 15th, 2002**' },
        { type: 'content', content: 'Tokyo, Korakuen Hall' },
        { type: 'content', content: 'Attendance: 1800' },
        { type: 'content', content: '① Singles Match' },
        { type: 'content', content: 'Wrestler A⭕️ vs Wrestler B❌' },
        { type: 'content', content: '(10:30 Special Move)' }
      ]
    },
    {
      fileName: 'test1.md',
      seriesName: 'Test Series A',
      date: new Date(2002, 2, 22), // March 22, 2002
      cleanedResults: [
        { type: 'content', content: '**March 22nd, 2002**' },
        { type: 'content', content: 'Osaka, Prefectural Gym' },
        { type: 'content', content: 'Attendance: 1200' },
        { type: 'content', content: '① Tag Team Match' },
        { type: 'content', content: 'Team A⭕️ vs Team B❌' },
        { type: 'content', content: '(15:45 Double Team Move)' }
      ]
    },
    {
      fileName: 'test2.md',
      seriesName: 'Test Series B',
      date: new Date(2002, 3, 5), // April 5, 2002
      cleanedResults: [
        { type: 'content', content: '**April 5th, 2002**' },
        { type: 'content', content: 'Nagoya, Congress Center' },
        { type: 'content', content: 'Attendance: 2000' },
        { type: 'content', content: '① Championship Match' },
        { type: 'content', content: 'Champion⭕️ vs Challenger❌' },
        { type: 'content', content: '(20:15 Finishing Move)' }
      ]
    }
  ];
  
  console.log('Testing individual event formatting...');
  
  try {
    let currentSeries = null;
    
    for (let i = 0; i < testEvents.length; i++) {
      const event = testEvents[i];
      
      console.log(`\n--- Processing Event ${i + 1} ---`);
      console.log(`Series: ${event.seriesName}`);
      console.log(`Date: ${event.date.toDateString()}`);
      
      // Check if this is a new series
      const isNewSeries = currentSeries !== event.seriesName;
      console.log(`Is new series: ${isNewSeries}`);
      
      if (isNewSeries) {
        console.log(`🏷️ Would add series header: ${event.seriesName}`);
        currentSeries = event.seriesName;
      }
      
      // Format the event content
      const formattedContent = await formatWithGeminiAPI(event.cleanedResults, '', logSheet);
      
      console.log(`📄 Formatted content (first 200 chars):`);
      console.log(formattedContent.substring(0, 200) + '...');
      
      // Check for separators in formatted content
      const lines = formattedContent.split('\n');
      const separatorCount = lines.filter(line => line.trim() === '——').length;
      console.log(`🔍 Separators found in formatted content: ${separatorCount}`);
      
      console.log(`📤 Would append event to document with separator`);
    }
    
    console.log('\n✅ Output formatting test completed');
    
  } catch (error) {
    console.error('❌ Output formatting test failed:', error.message);
  }
}