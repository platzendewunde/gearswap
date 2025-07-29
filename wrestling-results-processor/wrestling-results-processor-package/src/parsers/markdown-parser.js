/**
 * Markdown Parser Module
 * Handles parsing of markdown wrestling results files
 */

/**
 * Parse a markdown file and extract wrestling results
 * @param {GoogleAppsScript.Drive.File} file - The markdown file to parse
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {Object} Parsed data with seriesName and cleanedResults
 */
function parseMarkdownFile(file, logSheet) {
  try {
    const content = file.getBlob().getDataAsString();
    const fileName = file.getName();
    
    logProgress(logSheet, `Parsing wrestling results file: ${fileName}`);
    
    // Validate file content
    if (typeof content !== 'string') {
      throw new Error(`File content is not a string: ${typeof content}`);
    }
    
    if (content.length === 0) {
      logWarning(logSheet, `File ${fileName} is empty`);
      return { seriesName: fileName, cleanedResults: [] };
    }
    
    const { seriesName, contentBody } = extractFrontmatter(content, fileName);
    const cleanedResults = parseContentBody(contentBody, logSheet);
    
    logSuccess(logSheet, `Parsed ${fileName}: ${cleanedResults.length} content items`);
    
    return {
      seriesName: seriesName,
      cleanedResults: cleanedResults
    };
    
  } catch (error) {
    logError(logSheet, error, `parseMarkdownFile(${file.getName()})`);
    throw error;
  }
}

/**
 * Extract YAML frontmatter and series name from content
 * @param {string} content - Raw file content
 * @param {string} fileName - Filename for fallback
 * @returns {Object} Object with seriesName and contentBody
 */
function extractFrontmatter(content, fileName) {
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
  
  return { seriesName, contentBody };
}

/**
 * Parse the content body and filter out prose
 * @param {string} contentBody - The main content to parse
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {Array} Array of cleaned content items
 */
function parseContentBody(contentBody, logSheet) {
  const lines = contentBody.split('\n');
  const cleanedResults = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') continue;
    
    // Filter out prose content but keep wrestling data
    if (!isProseContent(line)) {
      cleanedResults.push({
        type: 'content',
        content: line
      });
    }
  }
  
  return cleanedResults;
}

/**
 * Determine if a line is prose content that should be filtered out
 * @param {string} line - The line to check
 * @returns {boolean} True if the line should be filtered out
 */
function isProseContent(line) {
  const trimmed = line.trim();
  
  // Whitelist: Lines that should NEVER be filtered out
  const preservePatterns = [
    /^\*\*.*\*\*$/,                    // Bold headers like **Event Name**
    /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/, // Dates
    /attendance:/i,                     // Attendance info
    /(singles|tag team|man tag|battle royal|championship|elimination) match/i, // Match types
    /^[①②③④⑤⑥⑦⑧⑨⑩⓪]/,              // Match numbers
    /[⭕️❌▲△]/,                       // Result symbols
    /^\([0-9:]+.*\)$/,                 // Match times like (15:30 Ultra Hurricanrana)
    /vs/i,                             // "vs" separator
    /\*.*champion/i,                   // Championship notes
    /^\*\*/,                           // Bold formatting
    /^\s*$$/                           // Empty lines
  ];
  
  // If it matches any preserve pattern, don't filter it
  for (const pattern of preservePatterns) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }
  
  // Very short lines are probably not prose
  if (trimmed.length < 10) {
    return false;
  }
  
  // Conservative prose detection - only filter very long narrative text
  const isProbablyProse = (
    trimmed.length > 250 &&
    !trimmed.includes('vs') &&
    !trimmed.includes('①') &&
    !trimmed.includes('②') &&
    !trimmed.includes('③') &&
    !trimmed.includes('④') &&
    !trimmed.includes('⑤') &&
    trimmed.split(' ').length > 20
  );
  
  return isProbablyProse;
}

/**
 * Extract individual events from parsed data
 * @param {Object} parsedData - Data from parseMarkdownFile
 * @param {Object} fileData - File metadata
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {Array} Array of individual event objects
 */
function extractEventsFromParsedData(parsedData, fileData, logSheet) {
  const events = [];
  const cleanedResults = parsedData.cleanedResults;
  
  if (!Array.isArray(cleanedResults)) {
    logWarning(logSheet, `No cleanedResults array found in ${fileData.name}`);
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
        currentEvent.date = extractEarliestDate(currentEvent.cleanedResults);
        events.push(currentEvent);
        
        logProgress(logSheet, `Extracted event from ${fileData.name}: ${currentEvent.date ? currentEvent.date.toDateString() : 'No date found'}`);
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
    currentEvent.date = extractEarliestDate(currentEvent.cleanedResults);
    events.push(currentEvent);
    
    logProgress(logSheet, `Extracted final event from ${fileData.name}: ${currentEvent.date ? currentEvent.date.toDateString() : 'No date found'}`);
  }
  
  // If no separators were found, treat the entire file as one event
  if (events.length === 0 && cleanedResults.length > 0) {
    const singleEvent = {
      cleanedResults: cleanedResults,
      seriesName: parsedData.seriesName,
      fileName: fileData.name,
      date: extractEarliestDate(cleanedResults)
    };
    events.push(singleEvent);
    
    logProgress(logSheet, `Treating entire file ${fileData.name} as single event: ${singleEvent.date ? singleEvent.date.toDateString() : 'No date found'}`);
  }
  
  return events;
}