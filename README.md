# Wrestling Results Processor

A modular Python system for processing wrestling match result markdown files. This tool automates the conversion of individual wrestling result files into yearly consolidated files with chronological sorting and modern Dragon Gate-style formatting.

## Features

- ✅ **Modular Design** - Separate modules for parsing, year extraction, date handling, format conversion, and file merging
- ✅ **Year Grouping** - Automatically groups files by year based on filename patterns
- ✅ **Chronological Sorting** - Sorts events within each year by date
- ✅ **Format Conversion** - Converts old formats to modern Dragon Gate style
- ✅ **Series Headers** - Maintains series organization within yearly files
- ✅ **Winner/Loser Symbols** - Proper ⭕️❌▲△ symbol assignment
- ✅ **Date Normalization** - Converts various date formats to "Month DDth, YYYY"
- ✅ **YAML Frontmatter** - Extracts series names from YAML metadata
- ✅ **Manual Mappings** - Support for manual year assignments
- ✅ **Dry Run Mode** - Preview processing without writing files

## Requirements

- Python 3.7+
- PyYAML
- python-dateutil

Install dependencies:
```bash
pip install -r requirements.txt
```

## Quick Start

```bash
# Process all .md files in input/ directory and output to yearly/
python3 process_wrestling_results.py input/ yearly/

# Preview what would be processed without writing files  
python3 process_wrestling_results.py input/ yearly/ --dry-run

# Add custom year mapping for files that can't be auto-detected
python3 process_wrestling_results.py input/ yearly/ --add-mapping "specialfile.md=2005"
```

## Usage

```
python3 process_wrestling_results.py input_dir output_dir [options]

Arguments:
  input_dir             Directory containing markdown wrestling result files
  output_dir            Directory to write yearly merged files

Options:
  --verbose, -v         Enable verbose output
  --add-mapping FILENAME=YEAR
                        Add manual year mapping (format: filename.md=2005)
  --summary-only        Generate only processing summary, no output files
  --dry-run             Show what would be processed without writing files
  --help, -h            Show help message
```

## Input Format

The processor expects markdown files containing wrestling results with:

### YAML Frontmatter (Optional)
```yaml
---
title: "Series Name 2001"
date: 2015-08-19  # WordPress upload date (ignored)
---
```

### Event Format
```markdown
4/26/2001 Gifu Industrial Hall 1050 Attendance

① Singles Match
SUWA vs Raimu Mishima
(3:18 FFF)

② Tag Team Match  
Dragon Kid & Genki Horiguchi vs Darkness Dragon & CIMA
(16:45 Ultra Hurricanrana)
```

## Output Format

The processor converts results to modern Dragon Gate format:

```markdown
# 2001 Season

Combined wrestling results for 2001

## Primera Special 2001

April 26th, 2001
Gifu Industrial Hall
Attendance: 1050

① Singles Match
SUWA⭕️
vs
Raimu Mishima❌
(3:18 FFF)

② Tag Team Match
Dragon Kid⭕️
Genki Horiguchi
vs
Darkness Dragon
CIMA❌
(16:45 Ultra Hurricanrana)
```

## Year Detection

The system automatically detects years from filenames using these patterns:

- **4-digit years**: `results2001.md` → 2001
- **2-digit years**: `primera01.md` → 2001, `finalgate07.md` → 2007
- **Manual mappings**: Built-in mappings for known files

### Built-in Manual Mappings
- `primera01.md` → 2001
- `navidad01.md` → 2001  
- `pelea01.md` → 2001
- `muybien01.md` → 2001
- `elnumero01.md` → 2001
- `enuspecial01.md` → 2001
- `verano01.md` → 2001

## Modules

### `markdown_parser.py`
- Parses markdown files and YAML frontmatter
- Extracts structured content items
- Handles headers and content cleaning

### `year_extractor.py`  
- Extracts years from filenames using pattern matching
- Supports manual mappings for edge cases
- Validates year ranges (1990-2030)

### `date_parser.py`
- Extracts dates from various text formats
- Converts to normalized "Month DDth, YYYY" format
- Confidence scoring for date matches

### `format_converter.py`
- Converts old wrestling formats to Dragon Gate style
- Detects match types and participants
- Assigns winner/loser symbols (⭕️❌▲△)
- Handles special results (No Contest, Draw, etc.)

### `file_merger.py`
- Orchestrates the merging process
- Groups files by year and sorts chronologically
- Maintains series headers within yearly files
- Generates processing summaries

## Symbol Usage

- ⭕️ **Winner** - Wrestler who got the pin/submission/victory
- ❌ **Loser** - Wrestler who was pinned/submitted/defeated  
- ▲ **No Contest** - Participants in no contest/double count out
- △ **Draw** - Participants in time limit draw/double pinfall
- ⭐︎ **Championship** - Title defense indicators

## Examples

### Basic Processing
```bash
python3 process_wrestling_results.py wrestling_results/ output/
```

### With Custom Mappings
```bash
python3 process_wrestling_results.py wrestling_results/ output/ \
  --add-mapping "mystery_show.md=2003" \
  --add-mapping "special_event.md=2004"
```

### Preview Mode
```bash
python3 process_wrestling_results.py wrestling_results/ output/ --dry-run
```

Sample output:
```
🔍 Found 8 markdown files:
   primera01.md -> 2001
   navidad01.md -> 2001  
   pelea01.md -> 2001
   finalgate07.md -> 2007
   
📅 Would group into 2 years:
   2001: 3 files
   2007: 1 files
   
📄 Would generate output files:
   - 2001_season.md
   - 2007_season.md
   - processing_summary.md
```

## Project Structure

```
wrestling-results-processor/
├── process_wrestling_results.py    # Main script
├── requirements.txt                # Dependencies
├── README.md                      # This file
├── modules/                       # Processing modules
│   ├── __init__.py
│   ├── markdown_parser.py         # Markdown parsing
│   ├── year_extractor.py          # Year detection
│   ├── date_parser.py             # Date handling  
│   ├── format_converter.py        # Format conversion
│   └── file_merger.py             # File merging
├── sample_input/                  # Example input files
│   ├── primera01.md
│   └── navidad01.md
└── sample_output/                 # Example output files
    ├── 2001_season.md
    └── processing_summary.md
```

## Error Handling

The processor includes robust error handling:

- **Invalid dates** - Skipped with warnings
- **Unparseable files** - Logged and skipped
- **Missing years** - Manual mapping suggestions
- **Format issues** - Fallback processing modes
- **Interrupted processing** - Graceful shutdown

## Testing

Run the module tests:
```bash
python3 process_wrestling_results.py
```

This will test:
- Year extraction from various filename patterns
- Date parsing from different formats
- Module loading and initialization

## Contributing

The modular design makes it easy to extend functionality:

1. **Add new date formats** - Edit `date_parser.py` patterns
2. **Support new filename patterns** - Modify `year_extractor.py`
3. **Add format conversions** - Extend `format_converter.py`
4. **Custom output formats** - Modify `file_merger.py`

## License

This project is provided as-is for processing wrestling results data.

---

**Note**: This system was designed specifically for Dragon Gate style wrestling results but can be adapted for other wrestling promotions by modifying the format conversion rules.