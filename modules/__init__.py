"""
Wrestling Results Processing Modules

A modular system for processing wrestling result markdown files:
- Parsing markdown content and YAML frontmatter
- Extracting years from filenames
- Parsing and normalizing dates
- Converting formats to modern Dragon Gate style
- Merging files by year with chronological sorting
"""

__version__ = "1.0.0"

from .markdown_parser import MarkdownParser, ParsedMarkdown, ContentItem
from .year_extractor import YearExtractor
from .date_parser import DateParser, ExtractedDate
from .format_converter import FormatConverter, WrestlingEvent, WrestlingMatch
from .file_merger import FileMerger, FileInfo, YearlyOutput

__all__ = [
    'MarkdownParser', 'ParsedMarkdown', 'ContentItem',
    'YearExtractor',
    'DateParser', 'ExtractedDate',
    'FormatConverter', 'WrestlingEvent', 'WrestlingMatch',
    'FileMerger', 'FileInfo', 'YearlyOutput'
]