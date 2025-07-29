/**
 * Main Orchestrator Module
 * Clean entry point for the Wrestling Results Processor
 */

/**
 * Main processing function - simplified and focused
 */
function processAllFiles() {
  try {
    // Initialize
    validateConfig();
    const logSheet = initializeLogging(CONFIG.LOG_SHEET_ID);
    
    logProgress(logSheet, '=== STARTING WRESTLING RESULTS PROCESSING ===');
    
    // Discover files
    const filesByYear = discoverMarkdownFiles(logSheet);
    
    // Process each year
    for (const [year, files] of Object.entries(filesByYear)) {
      await processYear(parseInt(year), files, logSheet);
    }
    
    logProgress(logSheet, '=== PROCESSING COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('Critical error in main processing:', error);
    throw error;
  }
}

/**
 * Process a single year's worth of files
 * @param {number} year - The year to process
 * @param {Array} files - Array of file objects for this year
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 */
async function processYear(year, files, logSheet) {
  logProgress(logSheet, `Processing year ${year} (${files.length} files)`);
  
  // Parse all files for this year
  const allEvents = [];
  for (const fileData of files) {
    try {
      const parsedData = parseMarkdownFile(fileData.file, logSheet);
      const events = extractEventsFromParsedData(parsedData, fileData, logSheet);
      allEvents.push(...events);
    } catch (error) {
      logError(logSheet, error, `processing file ${fileData.name}`);
    }
  }
  
  // Sort events chronologically
  allEvents.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date - b.date;
  });
  
  // Group by series and format
  const document = await createYearlyDocument(year, allEvents, logSheet);
  
  logProgress(logSheet, `✅ Completed ${year} - ${allEvents.length} events processed`);
}

/**
 * Discover markdown files organized by year
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {Object} Files organized by year
 */
function discoverMarkdownFiles(logSheet) {
  // Implementation moved to files/file-discovery.js
  return getMarkdownFilesByYear(logSheet);
}

/**
 * Create yearly document with all events
 * @param {number} year - The year
 * @param {Array} events - All events for this year
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {GoogleAppsScript.Document.Document} The created document
 */
async function createYearlyDocument(year, events, logSheet) {
  // Implementation moved to formatters/document-generator.js
  return generateYearlyDocument(year, events, logSheet);
}

/**
 * Menu creation for Google Apps Script
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Wrestling Results Processor')
    .addItem('Process All Files', 'processAllFiles')
    .addSeparator()
    .addSubMenu(ui.createMenu('Configuration')
      .addItem('Test Configuration', 'testConfiguration')
      .addItem('Validate Config', 'validateConfig'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Testing')
      .addItem('Test Date Extraction', 'testDateExtraction')
      .addItem('Test Symbol Formatting', 'testSymbolFormatting')
      .addItem('Test File Discovery', 'testFileDiscovery'))
    .addToUi();
}

/**
 * Simple configuration test
 */
function testConfiguration() {
  try {
    validateConfig();
    console.log('✅ Configuration is valid');
    
    const logSheet = initializeLogging(CONFIG.LOG_SHEET_ID);
    logSuccess(logSheet, 'Configuration test passed');
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
  }
}