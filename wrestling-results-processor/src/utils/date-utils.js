/**
 * Date Utilities Module
 * Handles all date parsing and manipulation for wrestling results
 */

/**
 * Extract the earliest date from cleaned results with robust error handling
 * @param {Array} cleanedResults - Array of parsed content items
 * @returns {Date|null} The earliest date found, or null if no dates found
 */
function extractEarliestDate(cleanedResults) {
  try {
    return extractEarliestDateInternal(cleanedResults);
  } catch (error) {
    console.error('Error in extractEarliestDate:', error.message);
    console.error('Input was:', typeof cleanedResults, cleanedResults);
    return null;
  }
}

/**
 * Internal date extraction function
 * @param {*} cleanedResults - Input to parse for dates
 * @returns {Date|null} The earliest date found, or null if no dates found
 */
function extractEarliestDateInternal(cleanedResults) {
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
  
  if (!dataArray || dataArray.length === 0) {
    console.warn('Data array is empty or undefined');
    return null;
  }

  const datePatterns = CONFIG.FILE_PATTERNS.DATE_PATTERNS;
  let earliestDate = null;

  // Process each item in the array
  for (let i = 0; i < dataArray.length; i++) {
    const item = dataArray[i];
    
    if (!item || typeof item !== 'object') {
      continue;
    }
    
    const content = item.content;
    if (typeof content !== 'string') {
      continue;
    }

    // Try each date pattern
    for (let j = 0; j < datePatterns.length; j++) {
      const datePattern = datePatterns[j];
      const match = content.match(datePattern.pattern);
      
      if (match) {
        try {
          const parsedDate = parseDateFromMatch(match, datePattern.type);
          
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            if (!earliestDate || parsedDate < earliestDate) {
              earliestDate = parsedDate;
            }
          }
        } catch (parseError) {
          console.warn(`Failed to parse date from match: ${match[0]}, error: ${parseError.message}`);
        }
      }
    }
  }

  return earliestDate;
}

/**
 * Parse a date from regex match based on the pattern type
 * @param {Array} match - The regex match array
 * @param {string} type - The pattern type
 * @returns {Date|null} Parsed date or null
 */
function parseDateFromMatch(match, type) {
  switch (type) {
    case 'mdy_slash':
    case 'mdy_dash':
    case 'mdy_dot':
      return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
      
    case 'month_name':
      const monthName = match[1];
      const day = parseInt(match[2]);
      const year = parseInt(match[3]);
      const monthMap = {
        'January': 0, 'Jan': 0, 'February': 1, 'Feb': 1, 'March': 2, 'Mar': 2,
        'April': 3, 'Apr': 3, 'May': 4, 'June': 5, 'Jun': 5,
        'July': 6, 'Jul': 6, 'August': 7, 'Aug': 7, 'September': 8, 'Sep': 8,
        'October': 9, 'Oct': 9, 'November': 10, 'Nov': 10, 'December': 11, 'Dec': 11
      };
      const month = monthMap[monthName];
      return month !== undefined ? new Date(year, month, day) : null;
      
    default:
      console.warn(`Unknown date pattern type: ${type}`);
      return null;
  }
}

/**
 * Parse year from filename
 * @param {string} filename - The filename to parse
 * @returns {number|null} The year, or null if not found
 */
function parseYearFromFilename(filename) {
  const match = filename.match(CONFIG.FILE_PATTERNS.YEAR_REGEX);
  if (match) {
    const twoDigitYear = parseInt(match[1]);
    
    // Convert two-digit year to four-digit year
    // 00-30 = 2000-2030, 31-99 = 1931-1999
    if (twoDigitYear <= 30) {
      return 2000 + twoDigitYear;
    } else {
      return 1900 + twoDigitYear;
    }
  }
  return null;
}

/**
 * Format date for display
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Check if a year is within the valid processing range
 * @param {number} year - The year to check
 * @returns {boolean} True if valid
 */
function isValidYear(year) {
  const [minYear, maxYear] = CONFIG.PROCESSING.DEFAULT_YEAR_RANGE;
  return year >= minYear && year <= maxYear;
}