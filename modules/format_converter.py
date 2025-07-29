"""
Format Converter Module for Wrestling Results

This module handles conversion from old wrestling result formats to modern Dragon Gate style,
including match type detection, winner/loser marking, and proper formatting.
"""

import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

from .markdown_parser import ContentItem
from .date_parser import DateParser, ExtractedDate


@dataclass
class WrestlingEvent:
    """Represents a single wrestling event"""
    date: Optional[datetime]
    venue: str
    city: str
    attendance: Optional[int]
    matches: List['WrestlingMatch']
    original_content: List[ContentItem]


@dataclass
class WrestlingMatch:
    """Represents a single wrestling match"""
    match_number: int
    match_type: str
    participants: List[str]
    result: str
    time: Optional[str]
    finish: Optional[str]
    winner_symbols: Dict[str, str]  # wrestler -> symbol
    special_notes: Optional[str] = None


class FormatConverter:
    """Converts wrestling results to Dragon Gate format"""
    
    def __init__(self):
        self.date_parser = DateParser()
        
        # Circled numbers for match numbering
        self.circled_numbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
        
        # Winner/loser symbols
        self.symbols = {
            'winner': '⭕️',
            'loser': '❌',
            'no_contest': '▲',
            'draw': '△',
            'championship': '⭐︎'
        }
        
        # Match type patterns
        self.match_type_patterns = [
            (r'singles?\s+match', 'Singles Match'),
            (r'tag\s+team\s+match', 'Tag Team Match'),
            (r'(\d+)-man\s+tag\s+match', lambda m: f'{m.group(1)}-Man Tag Match'),
            (r'battle\s+royal', 'Battle Royal'),
            (r'championship\s+match', 'Championship Match'),
            (r'elimination\s+match', 'Elimination Match'),
            (r'hardcore\s+match', 'Hardcore Match'),
            (r'ladder\s+match', 'Ladder Match'),
            (r'cage\s+match', 'Cage Match'),
            (r'steel\s+cage\s+match', 'Steel Cage Match'),
        ]
        
        # Special result patterns
        self.special_results = [
            (r'no\s+contest', 'No Contest'),
            (r'time\s+limit\s+draw', 'Time Limit Draw'),
            (r'double\s+count\s+out', 'Double Count Out'),
            (r'double\s+pinfall', 'Double Pinfall'),
            (r'disqualification', 'Disqualification'),
            (r'count\s+out', 'Count Out'),
            (r'submission', 'Submission'),
        ]
    
    def convert_to_dragon_gate_format(self, content_items: List[ContentItem], series_name: str) -> str:
        """
        Convert content items to Dragon Gate format
        
        Args:
            content_items: List of content items from markdown
            series_name: Name of the series
            
        Returns:
            Formatted Dragon Gate style text
        """
        # Extract events from content
        events = self._extract_events(content_items)
        
        # Sort events chronologically
        events.sort(key=lambda e: e.date if e.date else datetime.min)
        
        # Generate formatted output
        output_lines = []
        
        # Add series header
        if series_name:
            output_lines.append(f"## {series_name}")
            output_lines.append("")
        
        # Process each event
        for i, event in enumerate(events):
            if i > 0:
                output_lines.append("——")
                output_lines.append("")
            
            # Add event header
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
            
            # Add matches
            for match in event.matches:
                output_lines.extend(self._format_match(match))
                output_lines.append("")
        
        return "\n".join(output_lines)
    
    def _extract_events(self, content_items: List[ContentItem]) -> List[WrestlingEvent]:
        """Extract wrestling events from content items"""
        events = []
        current_event = None
        current_match_number = 0
        
        i = 0
        while i < len(content_items):
            item = content_items[i]
            
            # Check if this starts a new event (contains date)
            dates = self.date_parser.extract_dates_from_text(item.content)
            if dates:
                # Finalize previous event
                if current_event:
                    events.append(current_event)
                
                # Start new event
                current_event = self._parse_event_header(item, dates[0])
                current_match_number = 0
                
            elif current_event and self._is_match_line(item.content):
                # Parse match
                match, consumed_lines = self._parse_match(content_items[i:], current_match_number + 1)
                if match:
                    current_event.matches.append(match)
                    current_match_number += 1
                    i += consumed_lines - 1  # Skip consumed lines
            
            i += 1
        
        # Add final event
        if current_event:
            events.append(current_event)
        
        return events
    
    def _parse_event_header(self, item: ContentItem, date: ExtractedDate) -> WrestlingEvent:
        """Parse an event header line"""
        event = WrestlingEvent(
            date=date.date,
            venue="",
            city="",
            attendance=None,
            matches=[],
            original_content=[item]
        )
        
        # Extract venue and attendance from the line
        content = item.content
        
        # Look for attendance pattern
        attendance_match = re.search(r'(\d+)\s+attendance', content, re.IGNORECASE)
        if attendance_match:
            event.attendance = int(attendance_match.group(1))
            content = re.sub(r'\s*\d+\s+attendance', '', content, flags=re.IGNORECASE)
        
        # Remove date from content to get venue
        content = re.sub(date.original_text, '', content).strip()
        
        # Parse city, venue format
        if ',' in content:
            parts = content.split(',', 1)
            event.city = parts[0].strip()
            event.venue = parts[1].strip()
        else:
            event.venue = content
        
        return event
    
    def _is_match_line(self, content: str) -> bool:
        """Check if a line represents the start of a match"""
        # Look for circled numbers or match type indicators
        if re.match(r'^[①②③④⑤⑥⑦⑧⑨⑩]', content):
            return True
        
        # Look for match type keywords
        for pattern, _ in self.match_type_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def _parse_match(self, content_items: List[ContentItem], match_number: int) -> Tuple[Optional[WrestlingMatch], int]:
        """
        Parse a match from content items
        
        Returns:
            Tuple of (match or None, number of lines consumed)
        """
        if not content_items:
            return None, 0
        
        consumed = 1
        first_line = content_items[0].content
        
        # Determine match type
        match_type = self._determine_match_type(first_line)
        
        # Collect match lines until we hit another match or event
        match_lines = [first_line]
        
        for i in range(1, len(content_items)):
            line = content_items[i].content
            
            # Stop if we hit another match or event
            if (self._is_match_line(line) or 
                self.date_parser.extract_dates_from_text(line) or
                line.strip() == "" and i < len(content_items) - 1 and 
                (self._is_match_line(content_items[i + 1].content) or 
                 self.date_parser.extract_dates_from_text(content_items[i + 1].content))):
                break
            
            if line.strip():
                match_lines.append(line)
            consumed += 1
        
        # Parse participants and result
        participants, result_info = self._parse_match_participants_and_result(match_lines)
        
        if not participants:
            return None, consumed
        
        match = WrestlingMatch(
            match_number=match_number,
            match_type=match_type,
            participants=participants,
            result=result_info.get('result', ''),
            time=result_info.get('time'),
            finish=result_info.get('finish'),
            winner_symbols=self._determine_winner_symbols(participants, result_info)
        )
        
        return match, consumed
    
    def _determine_match_type(self, line: str) -> str:
        """Determine match type from line content"""
        # Remove circled number if present
        clean_line = re.sub(r'^[①②③④⑤⑥⑦⑧⑨⑩]\s*', '', line)
        
        # Check for explicit match types
        for pattern, match_type in self.match_type_patterns:
            if callable(match_type):
                match = re.search(pattern, clean_line, re.IGNORECASE)
                if match:
                    return match_type(match)
            elif re.search(pattern, clean_line, re.IGNORECASE):
                return match_type
        
        # Default based on common results that aren't match types
        if re.search(r'^(No Contest|Time Limit Draw|Double Count Out|Disqualification|Draw)$', clean_line, re.IGNORECASE):
            return 'Singles Match'  # Most common default
        
        # If it already contains "Match", keep as is
        if 'Match' in clean_line:
            return clean_line
        
        return 'Singles Match'  # Final fallback
    
    def _parse_match_participants_and_result(self, match_lines: List[str]) -> Tuple[List[str], Dict[str, str]]:
        """Parse participants and match result from match lines"""
        participants = []
        result_info = {}
        
        # Join all lines and parse
        content = " ".join(match_lines)
        
        # Remove match type and number
        content = re.sub(r'^[①②③④⑤⑥⑦⑧⑨⑩]\s*', '', content)
        content = re.sub(r'(Singles|Tag Team|Championship|Battle Royal|Elimination) Match\s*', '', content, flags=re.IGNORECASE)
        
        # Extract time and finish (in parentheses at end)
        time_match = re.search(r'\(([^)]*)\)$', content)
        if time_match:
            time_info = time_match.group(1)
            content = content[:time_match.start()].strip()
            
            # Parse time and finish
            time_parts = time_info.split(' ', 1)
            if len(time_parts) >= 1 and ':' in time_parts[0]:
                result_info['time'] = time_parts[0]
                if len(time_parts) > 1:
                    result_info['finish'] = time_parts[1]
            else:
                result_info['finish'] = time_info
        
        # Split by "vs" to get teams
        if ' vs ' in content:
            teams = content.split(' vs ')
            for team in teams:
                # Split team members (assume separated by &, and, or commas)
                members = re.split(r'\s*[&,]\s*|\s+and\s+', team.strip())
                participants.extend([m.strip() for m in members if m.strip()])
        else:
            # Single line of participants
            participants = re.split(r'\s*[&,]\s*|\s+and\s+|\s+vs\s+', content)
            participants = [p.strip() for p in participants if p.strip()]
        
        return participants, result_info
    
    def _determine_winner_symbols(self, participants: List[str], result_info: Dict[str, str]) -> Dict[str, str]:
        """Determine winner/loser symbols for participants"""
        symbols = {}
        
        # Check for special results
        finish = result_info.get('finish', '').lower()
        result = result_info.get('result', '').lower()
        
        if any(special in finish or special in result for special in ['no contest', 'double count out']):
            # No contest or double count out - all get ▲
            for participant in participants:
                symbols[participant] = self.symbols['no_contest']
        elif any(special in finish or special in result for special in ['time limit draw', 'double pinfall', 'draw']):
            # Draw - all get △
            for participant in participants:
                symbols[participant] = self.symbols['draw']
        else:
            # Regular match - need to determine winner/loser
            # For now, mark first as winner, last as loser (would need more sophisticated logic)
            if len(participants) >= 2:
                symbols[participants[0]] = self.symbols['winner']
                symbols[participants[-1]] = self.symbols['loser']
        
        return symbols
    
    def _format_match(self, match: WrestlingMatch) -> List[str]:
        """Format a match in Dragon Gate style"""
        lines = []
        
        # Match number and type
        if match.match_number <= len(self.circled_numbers):
            number = self.circled_numbers[match.match_number - 1]
        else:
            number = f"{match.match_number}."
        
        lines.append(f"{number} {match.match_type}")
        
        # Participants with symbols
        # Group participants into teams (simple split for now)
        mid_point = len(match.participants) // 2
        team1 = match.participants[:mid_point] if mid_point > 0 else match.participants[:1]
        team2 = match.participants[mid_point:] if mid_point > 0 else match.participants[1:]
        
        # Format team 1
        for participant in team1:
            symbol = match.winner_symbols.get(participant, '')
            lines.append(f"{participant}{symbol}")
        
        # vs separator
        lines.append("vs")
        
        # Format team 2
        for participant in team2:
            symbol = match.winner_symbols.get(participant, '')
            lines.append(f"{participant}{symbol}")
        
        # Result line
        result_parts = []
        if match.time:
            result_parts.append(match.time)
        if match.finish:
            result_parts.append(match.finish)
        
        if result_parts:
            lines.append(f"({' '.join(result_parts)})")
        
        return lines