"""
Date Parser Module for Wrestling Results

This module handles extraction and normalization of dates from wrestling event content,
supporting multiple date formats commonly found in wrestling results.
"""

import re
from datetime import datetime, date
from typing import List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ExtractedDate:
    """Represents a date extracted from content"""
    date: datetime
    original_text: str
    confidence: float  # 0.0 to 1.0, higher means more confident
    line_number: Optional[int] = None


class DateParser:
    """Parser for extracting and normalizing dates from wrestling content"""
    
    def __init__(self):
        # Month mappings for text-based months
        self.months_full = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12
        }
        
        self.months_abbrev = {
            'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
            'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
        }
        
        # Date patterns with confidence scores
        self.date_patterns = [
            # High confidence patterns
            (r'(\d{4})-(\d{1,2})-(\d{1,2})', 'ymd_dash', 0.9),  # YYYY-MM-DD
            (r'(\d{1,2})/(\d{1,2})/(\d{4})', 'mdy_slash', 0.85),  # MM/DD/YYYY
            (r'(\d{1,2})-(\d{1,2})-(\d{4})', 'mdy_dash', 0.8),   # MM-DD-YYYY
            (r'(\d{1,2})\.(\d{1,2})\.(\d{4})', 'mdy_dot', 0.8),  # MM.DD.YYYY
            
            # Medium confidence patterns  
            (r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})', 'month_full', 0.95),
            (r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})', 'month_abbrev', 0.9),
            
            # Lower confidence patterns
            (r'(\d{1,2})/(\d{1,2})/(\d{2})', 'mdy_slash_2digit', 0.6),  # MM/DD/YY
            (r'(\d{1,2})-(\d{1,2})-(\d{2})', 'mdy_dash_2digit', 0.6),   # MM-DD-YY
        ]
    
    def extract_dates_from_text(self, text: str, line_number: Optional[int] = None) -> List[ExtractedDate]:
        """
        Extract all dates from a text string
        
        Args:
            text: Text to search for dates
            line_number: Optional line number for tracking
            
        Returns:
            List of ExtractedDate objects found in the text
        """
        dates = []
        
        for pattern, pattern_type, confidence in self.date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            
            for match in matches:
                try:
                    parsed_date = self._parse_date_match(match, pattern_type)
                    if parsed_date and self._is_valid_wrestling_date(parsed_date):
                        dates.append(ExtractedDate(
                            date=parsed_date,
                            original_text=match.group(0),
                            confidence=confidence,
                            line_number=line_number
                        ))
                except (ValueError, IndexError):
                    continue
        
        # Remove duplicates and sort by confidence
        dates = self._remove_duplicate_dates(dates)
        dates.sort(key=lambda x: x.confidence, reverse=True)
        
        return dates
    
    def _parse_date_match(self, match: re.Match, pattern_type: str) -> Optional[datetime]:
        """
        Parse a regex match into a datetime object based on pattern type
        
        Args:
            match: Regex match object
            pattern_type: Type of pattern that matched
            
        Returns:
            Parsed datetime or None if parsing failed
        """
        groups = match.groups()
        
        try:
            if pattern_type == 'ymd_dash':
                year, month, day = int(groups[0]), int(groups[1]), int(groups[2])
                return datetime(year, month, day)
                
            elif pattern_type in ['mdy_slash', 'mdy_dash', 'mdy_dot']:
                month, day, year = int(groups[0]), int(groups[1]), int(groups[2])
                return datetime(year, month, day)
                
            elif pattern_type in ['mdy_slash_2digit', 'mdy_dash_2digit']:
                month, day, year = int(groups[0]), int(groups[1]), int(groups[2])
                # Convert 2-digit year to 4-digit
                if year < 30:  # Assume 00-29 is 2000-2029
                    year += 2000
                else:  # Assume 30-99 is 1930-1999
                    year += 1900
                return datetime(year, month, day)
                
            elif pattern_type == 'month_full':
                month_name, day, year = groups[0], int(groups[1]), int(groups[2])
                month = self.months_full[month_name.lower()]
                return datetime(year, month, day)
                
            elif pattern_type == 'month_abbrev':
                month_name, day, year = groups[0], int(groups[1]), int(groups[2])
                month = self.months_abbrev[month_name.lower()]
                return datetime(year, month, day)
                
        except (ValueError, KeyError):
            pass
            
        return None
    
    def _is_valid_wrestling_date(self, date_obj: datetime) -> bool:
        """
        Check if a date is reasonable for wrestling events
        
        Args:
            date_obj: Date to validate
            
        Returns:
            True if date seems valid for wrestling
        """
        # Wrestling events should be between 1990 and 2030
        return 1990 <= date_obj.year <= 2030
    
    def _remove_duplicate_dates(self, dates: List[ExtractedDate]) -> List[ExtractedDate]:
        """
        Remove duplicate dates, keeping the highest confidence version
        
        Args:
            dates: List of extracted dates
            
        Returns:
            List with duplicates removed
        """
        unique_dates = {}
        
        for date_obj in dates:
            date_key = date_obj.date.date()
            if date_key not in unique_dates or date_obj.confidence > unique_dates[date_key].confidence:
                unique_dates[date_key] = date_obj
        
        return list(unique_dates.values())
    
    def find_earliest_date(self, dates: List[ExtractedDate]) -> Optional[ExtractedDate]:
        """
        Find the earliest date from a list of extracted dates
        
        Args:
            dates: List of extracted dates
            
        Returns:
            Earliest date or None if list is empty
        """
        if not dates:
            return None
        
        return min(dates, key=lambda x: x.date)
    
    def find_most_confident_date(self, dates: List[ExtractedDate]) -> Optional[ExtractedDate]:
        """
        Find the most confident date from a list of extracted dates
        
        Args:
            dates: List of extracted dates
            
        Returns:
            Most confident date or None if list is empty
        """
        if not dates:
            return None
        
        return max(dates, key=lambda x: x.confidence)
    
    def format_date_dragon_gate_style(self, date_obj: datetime) -> str:
        """
        Format a date in Dragon Gate style (Month DDth, YYYY)
        
        Args:
            date_obj: Date to format
            
        Returns:
            Formatted date string
        """
        month_names = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        
        day = date_obj.day
        ordinal = self._get_ordinal_suffix(day)
        
        return f"{month_names[date_obj.month - 1]} {day}{ordinal}, {date_obj.year}"
    
    def _get_ordinal_suffix(self, day: int) -> str:
        """
        Get ordinal suffix for a day (st, nd, rd, th)
        
        Args:
            day: Day of the month
            
        Returns:
            Ordinal suffix string
        """
        if 10 <= day % 100 <= 20:
            return 'th'
        else:
            return {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
    
    def extract_dates_from_content_items(self, content_items) -> List[Tuple[int, ExtractedDate]]:
        """
        Extract dates from a list of content items
        
        Args:
            content_items: List of ContentItem objects
            
        Returns:
            List of tuples (item_index, ExtractedDate)
        """
        all_dates = []
        
        for i, item in enumerate(content_items):
            dates = self.extract_dates_from_text(item.content, item.line_number)
            for date_obj in dates:
                all_dates.append((i, date_obj))
        
        return all_dates