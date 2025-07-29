/**
 * Gemini AI Formatter Module
 * Handles AI-powered formatting of wrestling results using Google's Gemini API
 */

/**
 * Format wrestling results using Gemini API
 * @param {Array} cleanedResults - Array of parsed content items
 * @param {string} seriesName - Name of the wrestling series/event
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {string} Formatted wrestling results
 */
async function formatWithGeminiAPI(cleanedResults, seriesName, logSheet) {
  try {
    logProgress(logSheet, `Formatting results with Gemini AI for: ${seriesName}`);
    
    const apiKey = getApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    // Convert cleaned results to text
    const contentText = cleanedResults
      .map(item => item.content)
      .join('\n');
    
    const prompt = buildGeminiPrompt(contentText, seriesName);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: CONFIG.GEMINI_API_CONFIG
    };
    
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true
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
    
    logSuccess(logSheet, `Successfully formatted results for ${seriesName}`);
    return formattedContent;
    
  } catch (error) {
    logError(logSheet, error, `formatWithGeminiAPI for ${seriesName}`);
    
    // Fall back to basic formatting if Gemini fails
    if (CONFIG.PROCESSING.ENABLE_FALLBACK_FORMATTING) {
      logProgress(logSheet, `Using fallback formatting for ${seriesName}`);
      return formatWithFallback(cleanedResults, seriesName);
    }
    
    throw error;
  }
}

/**
 * Build the detailed prompt for Gemini API
 * @param {string} contentText - Raw content to format
 * @param {string} seriesName - Name of the series
 * @returns {string} Complete prompt for Gemini
 */
function buildGeminiPrompt(contentText, seriesName) {
  return `You are a professional wrestling results formatter. Format these Dragon Gate wrestling results into a clean, consistent style.

IMPORTANT: 
- Extract series name from YAML title field, place as ## header before first show only
- IGNORE any dates in YAML frontmatter (WordPress upload dates) 
- Sort ALL shows chronologically by actual show date
- Series header appears once before first show, not repeated
- PRESERVE all event headers and ensure complete event information is maintained
- Each event should start with a clear date/venue header

**CRITICAL FORMATTING RULES:**
1. **SERIES NAME**: Use title from YAML frontmatter as ## Header 2, ignore WordPress upload date
   - YAML frontmatter format: ---\\ntitle: "Series Name"\\ndate: 2015-08-19\\n---
   - IGNORE the date field (WordPress upload date)
   - Use title field as series header before FIRST show only

2. **MATCH TYPE IDENTIFICATION:**
- Look at participant count and context:
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
- EVERY MATCH MUST HAVE BOTH WINNER AND LOSER MARKED (except special results)
- ONLY mark the actual winner and loser, not entire teams
- Singles matches: Winner gets ⭕️, loser gets ❌
- Tag/Multi-man matches: One winner per team gets ⭕️, one loser per team gets ❌

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

**MANDATORY WINNER/LOSER MARKING:**
- EVERY MATCH must have clearly marked winners and losers
- Singles Match: One ⭕️ winner, one ❌ loser (unless special result)
- Tag Match: One ⭕️ per winning team, one ❌ per losing team  
- Multi-man Match: One ⭕️ per winning team, one ❌ per losing team
- NO CONTEST matches: All participants get ▲ (replace winner/loser symbols)
- DRAW matches: All participants get △ (replace winner/loser symbols)

**CRITICAL WRESTLER LINE FORMATTING EXAMPLES:**

CORRECT Singles Match Format:
② Singles Match
SUWA⭕️
vs
Raimu Mishima❌
(3:18 FFF)

CORRECT No Contest Format:
② Singles Match
Jorge Rivera▲
vs
Darkness Dragon▲
(4:50 No Contest due to M2K interference)

CORRECT Draw Format:
② Tag Team Match
Masaaki Mochizuki△
Kenichiro Arai△
vs
Dragon Kid△
Ryo Saito△
(15:00 Draw)

WRONG Singles Format (MISSING LOSER SYMBOL):
② Singles Match
SUWA⭕️
vs
Raimu Mishima
(3:18 FFF)

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

CRITICAL: Before formatting, sort all shows/events by date chronologically (earliest first). Return the content formatted exactly like the Dragon Gate style shown above. Preserve all wrestler names, match times, and finish moves accurately. Handle elimination matches and 2/3 falls with the ❶❷❸ format. Replace any scores between teams with "vs". Do not add commentary or analysis.

FINAL REMINDER - SYMBOL REQUIREMENTS:
- EVERY regular match MUST have both ⭕️ winner AND ❌ loser marked
- NO CONTEST matches: ALL participants get ▲ (no ⭕️ or ❌)
- DRAW matches: ALL participants get △ (no ⭕️ or ❌)
- Check every match before completing to ensure proper symbols are applied`;
}