"""
Format Converter Module for Wrestling Results

This module handles conversion from old wrestling result formats to modern Dragon Gate style,
including match type detection, winner/loser marking, and proper formatting.
"""

import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

from markdown_parser import ContentItem
from date_parser import DateParser, ExtractedDate


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
            (r'(\d+)\s+way\s+tag\s+match', lambda m: f'{m.group(1)} Way Tag Match'),
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
            (r'dq', 'Disqualification'),
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
                
            elif current_event and self._is_match_line(item.content):
                # Parse match - collect all related lines
                match_content = []
                j = i
                
                # Collect lines that belong to this match
                while j < len(content_items):
                    line = content_items[j].content.strip()
                    if not line:
                        j += 1
                        continue
                    
                    # Stop if we hit another match or event
                    if j > i and (self._is_match_line(line) or self.date_parser.extract_dates_from_text(line)):
                        break
                    
                    match_content.append(line)
                    j += 1
                
                # Parse the collected match content
                if match_content:
                    match = self._parse_match_from_lines(match_content)
                    if match:
                        current_event.matches.append(match)
                
                i = j - 1  # Continue from where we left off
            
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
        attendance_match = re.search(r'(\d+)\s*$', content)
        if not attendance_match:
            attendance_match = re.search(r'attendance\s*:?\s*(\d+)', content, re.IGNORECASE)
        if attendance_match:
            event.attendance = int(attendance_match.group(1))
            content = re.sub(r'\s*-?\s*\d+\s*$', '', content)
            content = re.sub(r'attendance\s*:?\s*\d+', '', content, flags=re.IGNORECASE)
        
        # Remove date from content to get venue
        content = re.sub(re.escape(date.original_text), '', content).strip()
        content = re.sub(r'^-\s*', '', content).strip()
        content = re.sub(r'\s*-\s*$', '', content).strip()
        
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
        # Look for circled numbers
        if re.match(r'^[①②③④⑤⑥⑦⑧⑨⑩]', content):
            return True
        
        # Look for numbered matches
        if re.match(r'^\d+\.\s', content):
            return True
        
        # Look for match type keywords
        for pattern, _ in self.match_type_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def _parse_match_from_lines(self, match_lines: List[str]) -> Optional[WrestlingMatch]:
        """Parse a match from a list of content lines"""
        if not match_lines:
            return None
        
        first_line = match_lines[0]
        all_content = " ".join(match_lines)
        
        # Extract match number
        match_number = 1
        number_match = re.match(r'^(\d+)\.', first_line)
        if number_match:
            match_number = int(number_match.group(1))
        
        # Determine match type
        match_type = self._determine_match_type_from_content(all_content)
        
        # Parse participants and results
        participants, result_info = self._parse_participants_and_result(all_content)
        
        if not participants:
            return None
        
        match = WrestlingMatch(
            match_number=match_number,
            match_type=match_type,
            participants=participants,
            result=result_info.get('result', ''),
            time=result_info.get('time'),
            finish=result_info.get('finish'),
            winner_symbols=self._determine_winner_symbols_from_content(all_content, participants)
        )
        
        return match
    
    def _determine_match_type_from_content(self, content: str) -> str:
        """Determine match type from content"""
        # Remove match number
        clean_content = re.sub(r'^\d+\.\s*', '', content)
        
        # Check for explicit match types
        for pattern, match_type in self.match_type_patterns:
            if callable(match_type):
                match = re.search(pattern, clean_content, re.IGNORECASE)
                if match:
                    return match_type(match)
            elif re.search(pattern, clean_content, re.IGNORECASE):
                return match_type
        
        # Count participants to guess match type
        # Look for wrestler names (assuming they have capital letters)
        wrestler_names = re.findall(r'\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b', content)
        unique_wrestlers = list(set(wrestler_names))
        
        if len(unique_wrestlers) <= 2:
            return 'Singles Match'
        elif len(unique_wrestlers) <= 4:
            return 'Tag Team Match'
        elif len(unique_wrestlers) > 8:
            return 'Battle Royal'
        else:
            return '6-Man Tag Match'
    
    def _parse_participants_and_result(self, content: str) -> Tuple[List[str], Dict[str, str]]:
        """Parse participants and match result from content"""
        participants = []
        result_info = {}
        
        # Remove match number and type info
        clean_content = re.sub(r'^\d+\.\s*', '', content)
        clean_content = re.sub(r'(Singles|Tag Team|Championship|Battle Royal|Elimination)\s+Match\s*:?\s*', '', clean_content, flags=re.IGNORECASE)
        
        # Extract time and finish (in parentheses)
        time_match = re.search(r'\(([^)]*)\)', clean_content)
        if time_match:
            time_info = time_match.group(1)
            clean_content = clean_content[:time_match.start()].strip()
            
            # Parse time and finish
            time_parts = time_info.split(' ', 1)
            if len(time_parts) >= 1 and ':' in time_parts[0]:
                result_info['time'] = time_parts[0]
                if len(time_parts) > 1:
                    result_info['finish'] = time_parts[1]
            else:
                result_info['finish'] = time_info
        
        # Look for wrestler names - they typically have capital letters and are proper nouns
        # Also handle symbols like {W}, {L}, etc.
        wrestler_pattern = r'\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\{[WL]\})?'
        potential_wrestlers = re.findall(wrestler_pattern, clean_content)
        
        # Clean up wrestler names
        for wrestler in potential_wrestlers:
            # Remove result markers
            clean_wrestler = re.sub(r'\{[WL]\}', '', wrestler).strip()
            if clean_wrestler and len(clean_wrestler) > 1:
                participants.append(clean_wrestler)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_participants = []
        for p in participants:
            if p not in seen:
                seen.add(p)
                unique_participants.append(p)
        
        return unique_participants, result_info
    
    def _determine_winner_symbols_from_content(self, content: str, participants: List[str]) -> Dict[str, str]:
        """Determine winner/loser symbols from content"""
        symbols = {}
        
        # Check for special results first
        lower_content = content.lower()
        
        if any(special in lower_content for special in ['no contest', 'double count out', 'dq']):
            # No contest type results - all get ▲
            for participant in participants:
                symbols[participant] = self.symbols['no_contest']
        elif any(special in lower_content for special in ['time limit draw', 'double pinfall', 'draw']):
            # Draw type results - all get △
            for participant in participants:
                symbols[participant] = self.symbols['draw']
        else:
            # Look for {W} and {L} markers
            for participant in participants:
                if f'{participant}{{W}}' in content or f'{participant}{{w}}' in content:
                    symbols[participant] = self.symbols['winner']
                elif f'{participant}{{L}}' in content or f'{participant}{{l}}' in content:
                    symbols[participant] = self.symbols['loser']
            
            # If no explicit markers, assign based on position (first = winner, last = loser)
            if not any(symbol in symbols.values() for symbol in [self.symbols['winner'], self.symbols['loser']]):
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
        
        # Format participants - try to split into teams intelligently
        if len(match.participants) <= 2:
            # Singles match
            for participant in match.participants:
                symbol = match.winner_symbols.get(participant, '')
                lines.append(f"{participant}{symbol}")
            if len(match.participants) == 2:
                lines.insert(-1, "vs")  # Insert vs between the two
        else:
            # Multi-person match - split in half
            mid_point = len(match.participants) // 2
            team1 = match.participants[:mid_point]
            team2 = match.participants[mid_point:]
            
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