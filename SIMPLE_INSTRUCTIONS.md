# SIMPLE Instructions - Wrestling Results Processor

## What This Does
- Takes your 180 wrestling `.md` files  
- Groups them by year (2001, 2002, 2003, etc.)
- Sorts events by date within each year
- Creates clean yearly files in modern format

## Super Simple Steps

### 1. Install Python Package
Open terminal/command prompt and type:
```
pip install PyYAML
```

### 2. Put Your Files Together
1. Create a folder called `my_files` 
2. Put all your 180 wrestling `.md` files in that folder
3. Make sure this script is in the same place as the `modules` folder

### 3. Run the Simple Script
```
python3 simple_process.py
```

The script will ask you where your files are. Just press Enter to use `my_files`.

### 4. Get Your Results
You'll get a `yearly_results` folder with:
- `2001_season.md` - All 2001 events merged and sorted
- `2002_season.md` - All 2002 events merged and sorted  
- `2003_season.md` - All 2003 events merged and sorted
- etc.
- `processing_summary.md` - Report of what was processed

## Example
```
📁 Your Setup:
   ├── simple_process.py          ← Run this
   ├── modules/                   ← Processing code
   └── my_files/                  ← Your 180 .md files
       ├── primera01.md
       ├── navidad01.md
       ├── finalgate07.md
       └── ... (all your files)

📁 After Running:
   └── yearly_results/            ← Your new organized files
       ├── 2001_season.md
       ├── 2002_season.md
       ├── 2003_season.md
       ├── 2004_season.md
       └── processing_summary.md
```

## If Something Goes Wrong

**"PyYAML not found"** → Run: `pip install PyYAML`

**"python3 not found"** → Try: `python simple_process.py`

**"No files processed"** → Check that your `.md` files have years in their names

**"Folder not found"** → Make sure you created the `my_files` folder

## Need Help with File Names?
If some files don't have years that can be detected, the script will tell you. You can add them manually by editing the `year_extractor.py` file or asking for help.

That's it! The script does all the complex work automatically.