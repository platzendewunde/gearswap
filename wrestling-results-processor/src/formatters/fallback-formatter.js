/**
 * Fallback Formatter Module
 * Provides basic formatting when Gemini API is unavailable
 */

/**
 * Fallback formatting function (no API required)
 * @param {Array} cleanedResults - Parsed content from markdown file
 * @param {string} seriesName - Name of the wrestling series/event
 * @returns {string} Basic formatted wrestling results
 */
function formatWithFallback(cleanedResults, seriesName) {
  logProgress(null, `Using fallback formatting for ${seriesName}`);
  
  const formatted = [];
  const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
  
  // Add series header
  if (seriesName) {
    formatted.push(`## ${seriesName}`);
    formatted.push('');
  }
  
  let matchNumber = 0;
  let inMatchDetails = false;
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
      } else if (content.match(/(Singles|Tag Team|Man Tag|Battle Royal|Championship|Elimination) Match/i) ||
                 content.includes('Match')) {
        // Also catch explicit match type declarations without circled numbers
        matchNumber++;
        const matchType = determineMatchType(content);
        formatted.push(`${circledNumbers[matchNumber - 1] || `⑩`} ${matchType}`);
        inMatchDetails = true;
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
        } else {
          // Wrestler names and other content
          formatted.push(content);
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
 * Determine the proper match type based on input
 * @param {string} input - Raw match description
 * @returns {string} Formatted match type
 */
function determineMatchType(input) {
  const lowerInput = input.toLowerCase();
  
  // Handle specific patterns
  if (lowerInput.includes('singles') || lowerInput.includes('1 vs 1')) {
    return 'Singles Match';
  }
  
  if (lowerInput.includes('tag team') || lowerInput.includes('tag match')) {
    return 'Tag Team Match';
  }
  
  if (lowerInput.includes('6-man') || lowerInput.includes('6 man')) {
    return '6-Man Tag Match';
  }
  
  if (lowerInput.includes('8-man') || lowerInput.includes('8 man')) {
    return '8-Man Tag Match';
  }
  
  if (lowerInput.includes('battle royal')) {
    return 'Battle Royal';
  }
  
  if (lowerInput.includes('championship') || lowerInput.includes('title')) {
    return 'Championship Match';
  }
  
  if (lowerInput.includes('elimination')) {
    return 'Elimination Match';
  }
  
  if (lowerInput.includes('handicap')) {
    return 'Handicap Match';
  }
  
  if (lowerInput.includes('three way') || lowerInput.includes('3 way')) {
    return 'Three Way Match';
  }
  
  if (lowerInput.includes('four way') || lowerInput.includes('4 way')) {
    return 'Four Way Match';
  }
  
  // Default fallback
  if (lowerInput.includes('match')) {
    return input; // Return as-is if it already contains "match"
  }
  
  return 'Singles Match'; // Safe default
}