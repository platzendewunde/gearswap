"""
Markdown Parser Module for Wrestling Results

This module handles parsing of markdown files containing wrestling match results,
extracting structured content including headers, YAML frontmatter, and content blocks.
"""

import re
import yaml
from typing import Dict, List, Optional, Any
from dataclasses import dataclass


@dataclass
class ContentItem:
    """Represents a piece of content from the markdown file"""
    type: str  # 'header', 'content', 'yaml'
    content: str
    level: Optional[int] = None  # For headers
    line_number: Optional[int] = None


@dataclass
class ParsedMarkdown:
    """Represents the complete parsed markdown structure"""
    series_name: str
    yaml_frontmatter: Optional[Dict[str, Any]]
    content_items: List[ContentItem]
    raw_content: str


class MarkdownParser:
    """Parser for wrestling results markdown files"""
    
    def __init__(self):
        self.date_patterns = [
            # Various date formats found in wrestling files
            r'(\d{1,2})/(\d{1,2})/(\d{4})',  # MM/DD/YYYY
            r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
            r'(\d{1,2})-(\d{1,2})-(\d{4})',  # MM-DD-YYYY
            r'(\d{1,2})\.(\d{1,2})\.(\d{4})',  # MM.DD.YYYY
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})',  # Month DD, YYYY
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})',  # Mon DD, YYYY
        ]
    
    def parse_file(self, file_path: str) -> ParsedMarkdown:
        """
        Parse a markdown file and return structured content
        
        Args:
            file_path: Path to the markdown file
            
        Returns:
            ParsedMarkdown object containing structured content
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return self.parse_content(content)
    
    def parse_content(self, content: str) -> ParsedMarkdown:
        """
        Parse markdown content string
        
        Args:
            content: Raw markdown content
            
        Returns:
            ParsedMarkdown object containing structured content
        """
        lines = content.split('\n')
        content_items = []
        yaml_frontmatter = None
        series_name = ""
        
        # Check for YAML frontmatter
        yaml_content, content_start = self._extract_yaml_frontmatter(lines)
        if yaml_content:
            yaml_frontmatter = yaml_content
            if 'title' in yaml_content:
                series_name = yaml_content['title']
        
        # Process remaining content
        for i, line in enumerate(lines[content_start:], content_start):
            line = line.strip()
            
            if not line:
                continue
                
            # Check if it's a header
            if line.startswith('#'):
                level = len(line) - len(line.lstrip('#'))
                header_content = line.lstrip('#').strip()
                content_items.append(ContentItem(
                    type='header',
                    content=header_content,
                    level=level,
                    line_number=i + 1
                ))
                
                # If no series name from YAML, use first header
                if not series_name and level <= 2:
                    series_name = header_content
                    
            else:
                # Regular content
                content_items.append(ContentItem(
                    type='content',
                    content=line,
                    line_number=i + 1
                ))
        
        return ParsedMarkdown(
            series_name=series_name,
            yaml_frontmatter=yaml_frontmatter,
            content_items=content_items,
            raw_content=content
        )
    
    def _extract_yaml_frontmatter(self, lines: List[str]) -> tuple[Optional[Dict[str, Any]], int]:
        """
        Extract YAML frontmatter from the beginning of the file
        
        Args:
            lines: List of file lines
            
        Returns:
            Tuple of (yaml_dict, content_start_line)
        """
        if not lines or not lines[0].strip() == '---':
            return None, 0
        
        yaml_lines = []
        yaml_end = None
        
        for i, line in enumerate(lines[1:], 1):
            if line.strip() == '---':
                yaml_end = i + 1
                break
            yaml_lines.append(line)
        
        if yaml_end is None:
            return None, 0
        
        try:
            yaml_content = yaml.safe_load('\n'.join(yaml_lines))
            return yaml_content, yaml_end
        except yaml.YAMLError:
            return None, 0
    
    def extract_dates_from_content(self, content_items: List[ContentItem]) -> List[ContentItem]:
        """
        Find and extract date information from content
        
        Args:
            content_items: List of content items to search
            
        Returns:
            List of content items that contain dates
        """
        date_items = []
        
        for item in content_items:
            if self._contains_date(item.content):
                date_items.append(item)
        
        return date_items
    
    def _contains_date(self, text: str) -> bool:
        """Check if text contains a date pattern"""
        for pattern in self.date_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def clean_content_for_processing(self, content_items: List[ContentItem]) -> List[ContentItem]:
        """
        Clean and filter content items for further processing
        
        Args:
            content_items: Raw content items
            
        Returns:
            Cleaned content items
        """
        cleaned = []
        
        for item in content_items:
            # Skip empty content
            if not item.content.strip():
                continue
                
            # Clean up common markdown artifacts
            content = item.content
            content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)  # Remove bold
            content = re.sub(r'\*(.*?)\*', r'\1', content)      # Remove italic
            content = re.sub(r'`(.*?)`', r'\1', content)        # Remove code
            
            cleaned.append(ContentItem(
                type=item.type,
                content=content.strip(),
                level=item.level,
                line_number=item.line_number
            ))
        
        return cleaned