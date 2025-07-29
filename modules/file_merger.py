"""
File Merger Module for Wrestling Results

This module handles merging multiple wrestling result files by year,
sorting events chronologically, and organizing series headers.
"""

import os
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime

from markdown_parser import MarkdownParser, ParsedMarkdown, ContentItem
from year_extractor import YearExtractor
from date_parser import DateParser, ExtractedDate
from format_converter import FormatConverter, WrestlingEvent


@dataclass
class FileInfo:
    """Information about a wrestling results file"""
    filepath: str
    filename: str
    year: int
    series_name: str
    parsed_data: Optional[ParsedMarkdown] = None
    events: List[WrestlingEvent] = None


@dataclass
class YearlyOutput:
    """Represents the merged output for a single year"""
    year: int
    series_files: List[FileInfo]
    merged_content: str
    output_filename: str


class FileMerger:
    """Merges wrestling results files by year"""
    
    def __init__(self):
        self.markdown_parser = MarkdownParser()
        self.year_extractor = YearExtractor()
        self.date_parser = DateParser()
        self.format_converter = FormatConverter()
    
    def process_directory(self, input_dir: str, output_dir: str) -> List[YearlyOutput]:
        """
        Process all markdown files in a directory and merge them by year
        
        Args:
            input_dir: Directory containing markdown files
            output_dir: Directory to write yearly output files
            
        Returns:
            List of YearlyOutput objects
        """
        # Find all markdown files
        md_files = self._find_markdown_files(input_dir)
        print(f"Found {len(md_files)} markdown files")
        
        # Group files by year
        files_by_year = self._group_files_by_year(md_files)
        print(f"Grouped into {len(files_by_year)} years: {sorted(files_by_year.keys())}")
        
        # Process each year
        yearly_outputs = []
        for year in sorted(files_by_year.keys()):
            print(f"\n=== Processing {year} ===")
            year_files = files_by_year[year]
            
            yearly_output = self._process_year(year, year_files, output_dir)
            if yearly_output:
                yearly_outputs.append(yearly_output)
        
        return yearly_outputs
    
    def _find_markdown_files(self, directory: str) -> List[str]:
        """Find all .md files in directory"""
        md_files = []
        
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.lower().endswith('.md'):
                    filepath = os.path.join(root, file)
                    md_files.append(filepath)
        
        return md_files
    
    def _group_files_by_year(self, filepaths: List[str]) -> Dict[int, List[FileInfo]]:
        """Group files by extracted year"""
        files_by_year = {}
        
        for filepath in filepaths:
            filename = os.path.basename(filepath)
            year = self.year_extractor.extract_year(filename)
            
            if year:
                if year not in files_by_year:
                    files_by_year[year] = []
                
                file_info = FileInfo(
                    filepath=filepath,
                    filename=filename,
                    year=year,
                    series_name=""  # Will be filled when parsing
                )
                
                files_by_year[year].append(file_info)
        
        # Sort files within each year by filename
        for year in files_by_year:
            files_by_year[year].sort(key=lambda f: f.filename)
        
        return files_by_year
    
    def _process_year(self, year: int, file_infos: List[FileInfo], output_dir: str) -> Optional[YearlyOutput]:
        """Process all files for a single year"""
        print(f"Processing {len(file_infos)} files for {year}")
        
        # Parse all files and extract events
        parsed_files = []
        all_events = []
        
        for file_info in file_infos:
            try:
                print(f"  Parsing: {file_info.filename}")
                
                # Parse markdown file
                parsed_data = self.markdown_parser.parse_file(file_info.filepath)
                file_info.parsed_data = parsed_data
                file_info.series_name = parsed_data.series_name
                
                # Extract events from the file
                events = self._extract_events_from_file(parsed_data, file_info)
                file_info.events = events
                all_events.extend(events)
                
                parsed_files.append(file_info)
                
                print(f"    Series: {file_info.series_name}")
                print(f"    Events: {len(events)}")
                
            except Exception as e:
                print(f"    ❌ Error parsing {file_info.filename}: {e}")
                continue
        
        if not parsed_files:
            print(f"  No valid files for {year}")
            return None
        
        # Sort all events chronologically
        all_events.sort(key=lambda e: e.date if e.date else datetime.min)
        
        print(f"  Total events across all series: {len(all_events)}")
        
        # Group events by series and generate output
        merged_content = self._generate_merged_output(year, parsed_files, all_events)
        
        # Write output file
        output_filename = f"{year}_season.md"
        output_path = os.path.join(output_dir, output_filename)
        
        os.makedirs(output_dir, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(merged_content)
        
        print(f"  ✅ Written to: {output_path}")
        
        return YearlyOutput(
            year=year,
            series_files=parsed_files,
            merged_content=merged_content,
            output_filename=output_filename
        )
    
    def _extract_events_from_file(self, parsed_data: ParsedMarkdown, file_info: FileInfo) -> List[WrestlingEvent]:
        """Extract wrestling events from a parsed markdown file"""
        # Clean content for processing
        cleaned_content = self.markdown_parser.clean_content_for_processing(parsed_data.content_items)
        
        # Extract events using the format converter
        events = self.format_converter._extract_events(cleaned_content)
        
        # Add file metadata to events
        for event in events:
            event.series_name = file_info.series_name
            event.source_file = file_info.filename
        
        return events
    
    def _generate_merged_output(self, year: int, parsed_files: List[FileInfo], all_events: List[WrestlingEvent]) -> str:
        """Generate the merged output content for a year"""
        output_lines = []
        
        # Year header
        output_lines.append(f"# {year} Season")
        output_lines.append("")
        output_lines.append(f"Combined wrestling results for {year}")
        output_lines.append("")
        
        # Group events by series to maintain series headers
        events_by_series = {}
        series_order = []  # Track order of first appearance
        
        for event in all_events:
            series_name = getattr(event, 'series_name', 'Unknown Series')
            if series_name not in events_by_series:
                events_by_series[series_name] = []
                series_order.append(series_name)
            events_by_series[series_name].append(event)
        
        # Generate output by series, but with chronological ordering within
        for series_name in series_order:
            series_events = events_by_series[series_name]
            
            # Add series header
            output_lines.append(f"## {series_name}")
            output_lines.append("")
            
            # Format events for this series
            for i, event in enumerate(series_events):
                if i > 0:
                    output_lines.append("——")
                    output_lines.append("")
                
                # Event header
                if event.date:
                    date_str = self.date_parser.format_date_dragon_gate_style(event.date)
                    output_lines.append(date_str)
                
                if event.city and event.venue:
                    output_lines.append(f"{event.city}, {event.venue}")
                elif event.venue:
                    output_lines.append(event.venue)
                
                if event.attendance:
                    output_lines.append(f"Attendance: {event.attendance}")
                
                output_lines.append("")
                
                # Format matches
                for match in event.matches:
                    match_lines = self.format_converter._format_match(match)
                    output_lines.extend(match_lines)
                    output_lines.append("")
            
            output_lines.append("")  # Extra space between series
        
        return "\n".join(output_lines)
    
    def get_processing_summary(self, yearly_outputs: List[YearlyOutput]) -> str:
        """Generate a summary of the processing results"""
        summary_lines = []
        summary_lines.append("# Wrestling Results Processing Summary")
        summary_lines.append("")
        
        total_files = sum(len(yo.series_files) for yo in yearly_outputs)
        total_years = len(yearly_outputs)
        
        summary_lines.append(f"**Total Years Processed:** {total_years}")
        summary_lines.append(f"**Total Files Processed:** {total_files}")
        summary_lines.append("")
        
        # Year-by-year breakdown
        for yearly_output in sorted(yearly_outputs, key=lambda yo: yo.year):
            summary_lines.append(f"## {yearly_output.year}")
            summary_lines.append("")
            summary_lines.append(f"**Output File:** {yearly_output.output_filename}")
            summary_lines.append(f"**Series Count:** {len(yearly_output.series_files)}")
            summary_lines.append("")
            
            # List series
            for file_info in yearly_output.series_files:
                total_events = len(file_info.events) if file_info.events else 0
                summary_lines.append(f"- **{file_info.series_name}** ({file_info.filename}) - {total_events} events")
            
            summary_lines.append("")
        
        return "\n".join(summary_lines)
    
    def add_year_mapping(self, filename: str, year: int):
        """Add a manual year mapping for a specific file"""
        self.year_extractor.add_manual_mapping(filename, year)