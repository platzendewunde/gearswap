# Wrestling Results Processor - Beginner Guide

## What This Tool Does
✅ Takes your ~180 wrestling `.md` files  
✅ Groups them by year (2001, 2002, 2003, etc.)  
✅ Sorts all events by date within each year  
✅ Converts to modern Dragon Gate format  
✅ Creates one file per year with all series included  

## Before You Start
1. **Install Python** - Download from [python.org](https://python.org) (check "Add to PATH")
2. **Install required package** - Open terminal and type: `pip install PyYAML`

## Super Simple Method (Recommended for Beginners)

### Step 1: Set Up Your Files
```
📁 Create this folder structure:
   ├── simple_process.py       ← The main script
   ├── modules/                ← All the processing code (don't touch)
   └── my_files/               ← Put ALL your .md files here
       ├── primera01.md
       ├── navidad01.md
       ├── finalgate07.md
       └── ... (your other 177 files)
```

### Step 2: Run the Script
Open terminal/command prompt where the files are and type:
```bash
python3 simple_process.py
```
(If that doesn't work, try `python simple_process.py`)

### Step 3: Follow the Prompts
- It will ask where your files are
- Just press **Enter** to use the `my_files` folder
- The script will do everything automatically

### Step 4: Get Your Results
You'll get a new `yearly_results` folder with:
- `2001_season.md` - All 2001 events chronologically
- `2002_season.md` - All 2002 events chronologically
- `2003_season.md` - All 2003 events chronologically
- etc. for each year
- `processing_summary.md` - Report of what was processed

## Example Run
```
🥽 SIMPLE Wrestling Results Processor
==================================================

Step 1: Where are your wrestling .md files?
Enter folder path (or just press Enter for 'my_files'): [Press Enter]

Step 2: Results will be saved to 'yearly_results' folder

Step 3: Processing files...
Reading from: my_files
Writing to: yearly_results

Found 180 markdown files
Grouped into 7 years: [2001, 2002, 2003, 2004, 2005, 2006, 2007]

=== Processing 2001 ===
Processing 25 files for 2001
  ✅ Written to: yearly_results/2001_season.md

=== Processing 2002 ===
Processing 28 files for 2002
  ✅ Written to: yearly_results/2002_season.md

... (continues for each year)

✅ SUCCESS!
📅 Processed 7 years
📄 Total files: 180
```

## Common Problems & Solutions

| Problem | Solution |
|---------|----------|
| "python3 not found" | Try `python simple_process.py` instead |
| "PyYAML not found" | Run `pip install PyYAML` |
| "No files processed" | Check that your .md files have years in names |
| "Folder not found" | Make sure you created the `my_files` folder |

## What the Output Looks Like

**Before (your individual files):**
```
primera01.md → Contains 3 events from different dates
navidad01.md → Contains 2 events from different dates
pelea01.md → Contains 4 events from different dates
```

**After (yearly organized files):**
```
2001_season.md → All 9 events sorted chronologically by date
                 Each series gets its own header
                 Modern Dragon Gate format with proper symbols
```

## File Name Requirements
Your files need years in their names for auto-detection:
- ✅ `primera01.md` → detected as 2001
- ✅ `finalgate07.md` → detected as 2007
- ✅ `results2003.md` → detected as 2003
- ❌ `random_name.md` → can't detect year

If some files can't be detected, the script will tell you and you can ask for help.

## Need Help?
If something doesn't work:
1. Make sure Python is installed correctly
2. Make sure PyYAML is installed (`pip install PyYAML`)
3. Check that your files are in the right folder
4. Make sure your .md files have years in their names

The tool handles all the complex stuff automatically - date parsing, format conversion, chronological sorting, etc. You just need to run it!

---

**That's it! You're ready to organize your 180 wrestling files into clean yearly archives.**