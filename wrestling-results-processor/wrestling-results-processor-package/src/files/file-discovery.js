/**
 * File Discovery Module
 * Handles discovering and organizing markdown files from Google Drive
 */

/**
 * Get all markdown files organized by year
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {Object} Files organized by year
 */
function getMarkdownFilesByYear(logSheet) {
  try {
    logProgress(logSheet, 'Starting file discovery...');
    
    const sourceFolder = DriveApp.getFolderById(CONFIG.SOURCE_FOLDER_ID);
    const files = sourceFolder.getFiles();
    const filesByYear = {};
    let totalFiles = 0;
    let mdFiles = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      totalFiles++;
      
      // Skip non-markdown files
      if (!fileName.toLowerCase().endsWith(CONFIG.FILE_PATTERNS.MARKDOWN_EXTENSION)) {
        continue;
      }
      
      mdFiles++;
      const year = parseYearFromFilename(fileName);
      
      if (year && isValidYear(year)) {
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
        logWarning(logSheet, `Could not parse year from filename: ${fileName}`);
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
    logError(logSheet, error, 'getMarkdownFilesByYear');
    throw error;
  }
}

/**
 * Get files for a specific year
 * @param {number} year - The year to get files for
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {Array} Array of file objects for the specified year
 */
function getFilesForYear(year, logSheet) {
  const allFiles = getMarkdownFilesByYear(logSheet);
  return allFiles[year] || [];
}

/**
 * Validate file access and structure
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet - Logging sheet
 * @returns {boolean} True if validation passes
 */
function validateFileAccess(logSheet) {
  try {
    logProgress(logSheet, 'Validating file access...');
    
    // Test folder access
    const sourceFolder = DriveApp.getFolderById(CONFIG.SOURCE_FOLDER_ID);
    logSuccess(logSheet, `Source folder accessible: ${sourceFolder.getName()}`);
    
    // Count files
    const files = sourceFolder.getFiles();
    let fileCount = 0;
    while (files.hasNext()) {
      files.next();
      fileCount++;
    }
    
    logProgress(logSheet, `Found ${fileCount} total files in source folder`);
    
    if (fileCount === 0) {
      logWarning(logSheet, 'No files found in source folder');
      return false;
    }
    
    return true;
    
  } catch (error) {
    logError(logSheet, error, 'validateFileAccess');
    return false;
  }
}