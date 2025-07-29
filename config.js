/**
 * Configuration Module
 * Centralized configuration for the Wrestling Results Processor
 */

const CONFIG = {
  // Google Drive and Sheets IDs
  SOURCE_FOLDER_ID: '19FHfHxEwklAIpJjt81mwIV36H1uSbe_X', // Wrestling results folder
  LOG_SHEET_ID: '1TQ-39ceCBrgGr1A7_AyD_PVD3qaJjQKN60rU0jRmccY',       // Logging spreadsheet
  
  // API Configuration
  GEMINI_API_CONFIG: {
    temperature: 0.1,  // Very low for consistent formatting
    topK: 1,
    topP: 1,
    maxOutputTokens: 6000
  },
  
  // Processing Options
  PROCESSING: {
    MAX_EVENTS_PER_DOCUMENT: 100,
    DEFAULT_YEAR_RANGE: [2000, 2030],
    ENABLE_FALLBACK_FORMATTING: true
  },
  
  // File Patterns
  FILE_PATTERNS: {
    MARKDOWN_EXTENSION: '.md',
    YEAR_REGEX: /(\d{2})(?:\.md)?$/,
    DATE_PATTERNS: [
      { pattern: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, type: 'mdy_slash' },
      { pattern: /(\d{1,2})-(\d{1,2})-(\d{4})/, type: 'mdy_dash' },
      { pattern: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, type: 'mdy_dot' },
      { pattern: /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i, type: 'month_name' }
    ]
  }
};

/**
 * Get API key from Google Apps Script properties
 * @returns {string} The Gemini API key
 */
function getApiKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in script properties. Please set it in the script editor.');
  }
  return apiKey;
}

/**
 * Validate configuration on startup
 * @throws {Error} If configuration is invalid
 */
function validateConfig() {
  if (!CONFIG.SOURCE_FOLDER_ID) {
    throw new Error('SOURCE_FOLDER_ID not configured');
  }
  if (!CONFIG.LOG_SHEET_ID) {
    throw new Error('LOG_SHEET_ID not configured');
  }
  
  try {
    getApiKey();
  } catch (error) {
    throw new Error('API key validation failed: ' + error.message);
  }
}