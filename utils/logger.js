/**
 * Logging Utilities Module
 * Handles all logging functionality for the Wrestling Results Processor
 */

/**
 * Logs progress messages to the specified Google Sheet with timestamps
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to log to
 * @param {string} message - The message to log
 */
function logProgress(sheet, message) {
  try {
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    if (sheet) {
      sheet.appendRow([timestamp, message]);
    }
  } catch (error) {
    console.error('Failed to log message:', error.message);
    console.error('Original message was:', message);
  }
}

/**
 * Initialize logging sheet and clear old entries
 * @param {string} sheetId - The Google Sheet ID for logging
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The logging sheet
 */
function initializeLogging(sheetId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getActiveSheet();
    
    // Clear old logs (keep only last 100 entries)
    const lastRow = sheet.getLastRow();
    if (lastRow > 100) {
      sheet.deleteRows(1, lastRow - 100);
    }
    
    // Add headers if needed
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Message']);
    }
    
    return sheet;
  } catch (error) {
    console.error('Failed to initialize logging:', error.message);
    throw error;
  }
}

/**
 * Log an error with stack trace
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The logging sheet
 * @param {Error} error - The error object
 * @param {string} context - Additional context about where the error occurred
 */
function logError(sheet, error, context = '') {
  const errorMessage = `ERROR${context ? ` in ${context}` : ''}: ${error.message}`;
  logProgress(sheet, errorMessage);
  
  if (error.stack) {
    logProgress(sheet, `Stack trace: ${error.stack}`);
  }
}

/**
 * Log a warning message
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The logging sheet
 * @param {string} message - The warning message
 */
function logWarning(sheet, message) {
  logProgress(sheet, `⚠️ WARNING: ${message}`);
}

/**
 * Log a success message
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The logging sheet
 * @param {string} message - The success message
 */
function logSuccess(sheet, message) {
  logProgress(sheet, `✅ ${message}`);
}

/**
 * Log debug information (only in debug mode)
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The logging sheet
 * @param {string} message - The debug message
 * @param {boolean} debugMode - Whether debug logging is enabled
 */
function logDebug(sheet, message, debugMode = false) {
  if (debugMode) {
    logProgress(sheet, `DEBUG: ${message}`);
  }
}