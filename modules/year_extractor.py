"""
Year Extractor Module for Wrestling Results

This module handles extraction of years from wrestling result filenames,
including manual mappings for specific files and pattern-based detection.
"""

import re
from typing import Optional, Dict


class YearExtractor:
    """Extracts years from wrestling result filenames"""
    
    def __init__(self):
        # Manual mappings for specific known files from the Google Apps Script
        self.manual_mappings = {
            'primera01.md': 2001,
            'navidad01.md': 2001,
            'pelea01.md': 2001,
            'muybien01.md': 2001,
            'elnumero01.md': 2001,
            'enuspecial01.md': 2001,
            'verano01.md': 2001,
            'noseporque.md': None  # This one has no year indicator
        }
        
        # Patterns to look for year in filename (in order of preference)
        self.patterns = [
            r'(\d{4})',           # Any 4-digit number first (most reliable)
            r'(\d{2})$',          # 2-digit year at end: "finalgate07"
            r'(\d{2})(?!.*\d{2})' # Last 2-digit number (fallback for 2-digit years)
        ]
    
    def extract_year(self, filename: str) -> Optional[int]:
        """
        Extract year from filename
        
        Args:
            filename: Name of the file (with or without .md extension)
            
        Returns:
            Year as integer, or None if no year could be determined
        """
        # Normalize filename
        base_name = filename.lower()
        if not base_name.endswith('.md'):
            base_name += '.md'
        
        # Check manual mappings first
        if base_name in self.manual_mappings:
            mapped_year = self.manual_mappings[base_name]
            if mapped_year:
                print(f"📋 Used manual mapping: {filename} -> {mapped_year}")
                return mapped_year
            else:
                print(f"⚠️ Manual mapping indicates no year for: {filename}")
                return None
        
        # Remove file extension for pattern matching
        base_name_no_ext = base_name.replace('.md', '')
        
        print(f"Parsing year from: {filename} -> {base_name_no_ext}")
        
        # Try each pattern
        for pattern in self.patterns:
            match = re.search(pattern, base_name_no_ext)
            if match:
                year = int(match.group(1))
                
                # Convert 2-digit years to 4-digit
                if year < 100:
                    # For files ending in 01, this likely means 2001
                    # But let's be more conservative and check the context
                    if year >= 99:
                        year = 1900 + year  # 99 -> 1999
                    else:
                        year = 2000 + year  # 01 -> 2001, 07 -> 2007, etc.
                
                # Validate reasonable year range (wrestling promotion likely 1990-2030)
                if self._is_valid_year(year):
                    print(f"✅ Parsed year {year} from {filename}")
                    return year
                else:
                    print(f"⚠️ Year {year} outside valid range for {filename}")
        
        print(f"❌ Could not parse year from {filename}")
        return None
    
    def _is_valid_year(self, year: int) -> bool:
        """
        Check if year is in valid range for wrestling results
        
        Args:
            year: Year to validate
            
        Returns:
            True if year is valid, False otherwise
        """
        return 1990 <= year <= 2030
    
    def group_files_by_year(self, filenames: list[str]) -> Dict[int, list[str]]:
        """
        Group filenames by their extracted years
        
        Args:
            filenames: List of filenames to group
            
        Returns:
            Dictionary mapping years to lists of filenames
        """
        files_by_year = {}
        
        for filename in filenames:
            year = self.extract_year(filename)
            if year:
                if year not in files_by_year:
                    files_by_year[year] = []
                files_by_year[year].append(filename)
            else:
                print(f"⚠️ Skipping file with no extractable year: {filename}")
        
        # Sort files within each year
        for year in files_by_year:
            files_by_year[year].sort()
        
        return files_by_year
    
    def add_manual_mapping(self, filename: str, year: Optional[int]):
        """
        Add a manual filename-to-year mapping
        
        Args:
            filename: Filename to map
            year: Year to map to (or None for no year)
        """
        # Normalize filename
        if not filename.lower().endswith('.md'):
            filename += '.md'
        
        self.manual_mappings[filename.lower()] = year
        print(f"Added manual mapping: {filename} -> {year}")
    
    def get_manual_mappings(self) -> Dict[str, Optional[int]]:
        """
        Get all manual mappings
        
        Returns:
            Dictionary of filename to year mappings
        """
        return self.manual_mappings.copy()