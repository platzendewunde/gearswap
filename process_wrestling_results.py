#!/usr/bin/env python3
"""
Wrestling Results Processor

Main script to process wrestling result markdown files and merge them into
yearly files with chronological sorting and modern Dragon Gate formatting.

This script orchestrates all the processing modules to:
1. Parse markdown files containing wrestling results
2. Extract years from filenames 
3. Group files by year
4. Sort events chronologically within each year
5. Convert to modern Dragon Gate format
6. Merge series within years with proper headers
7. Output yearly season files

Usage:
    python process_wrestling_results.py input_dir output_dir [options]
"""

import argparse
import sys
import os
from pathlib import Path

# Add modules directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'modules'))

from modules.file_merger import FileMerger
from modules.year_extractor import YearExtractor
from modules.markdown_parser import MarkdownParser
from modules.date_parser import DateParser
from modules.format_converter import FormatConverter


def main():
    """Main entry point for the wrestling results processor"""
    parser = argparse.ArgumentParser(
        description="Process wrestling result markdown files and merge by year",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process all .md files in input/ and output to yearly/
  python process_wrestling_results.py input/ yearly/
  
  # Process with verbose output
  python process_wrestling_results.py input/ yearly/ --verbose
  
  # Add custom year mapping for a specific file
  python process_wrestling_results.py input/ yearly/ --add-mapping "specialfile.md=2005"
  
  # Generate only the processing summary
  python process_wrestling_results.py input/ yearly/ --summary-only
        """
    )
    
    parser.add_argument('input_dir', 
                       help='Directory containing markdown wrestling result files')
    parser.add_argument('output_dir', 
                       help='Directory to write yearly merged files')
    parser.add_argument('--verbose', '-v', 
                       action='store_true',
                       help='Enable verbose output')
    parser.add_argument('--add-mapping', 
                       action='append',
                       metavar='FILENAME=YEAR',
                       help='Add manual year mapping (format: filename.md=2005)')
    parser.add_argument('--summary-only', 
                       action='store_true',
                       help='Generate only processing summary, no output files')
    parser.add_argument('--dry-run', 
                       action='store_true',
                       help='Show what would be processed without writing files')
    
    args = parser.parse_args()
    
    # Validate input directory
    if not os.path.isdir(args.input_dir):
        print(f"❌ Error: Input directory '{args.input_dir}' does not exist")
        sys.exit(1)
    
    # Create output directory if it doesn't exist
    if not args.dry_run and not args.summary_only:
        os.makedirs(args.output_dir, exist_ok=True)
    
    # Initialize the file merger
    merger = FileMerger()
    
    # Add any manual year mappings
    if args.add_mapping:
        for mapping in args.add_mapping:
            try:
                filename, year_str = mapping.split('=', 1)
                year = int(year_str)
                merger.add_year_mapping(filename, year)
                print(f"Added mapping: {filename} -> {year}")
            except (ValueError, IndexError):
                print(f"❌ Error: Invalid mapping format '{mapping}'. Use 'filename.md=2005'")
                sys.exit(1)
    
    print("🥽 Wrestling Results Processor")
    print("=" * 50)
    print(f"Input Directory: {args.input_dir}")
    print(f"Output Directory: {args.output_dir}")
    print()
    
    try:
        if args.dry_run:
            # Dry run - just show what would be processed
            print("🧪 DRY RUN MODE - No files will be written")
            print()
            
            yearly_outputs = run_dry_run(merger, args.input_dir)
            
        elif args.summary_only:
            # Generate summary only
            print("📊 SUMMARY ONLY MODE")
            print()
            
            yearly_outputs = merger.process_directory(args.input_dir, args.output_dir)
            
            # Write only the summary
            summary = merger.get_processing_summary(yearly_outputs)
            summary_path = os.path.join(args.output_dir, 'processing_summary.md')
            with open(summary_path, 'w', encoding='utf-8') as f:
                f.write(summary)
            
            print(f"📋 Summary written to: {summary_path}")
            
        else:
            # Full processing
            yearly_outputs = merger.process_directory(args.input_dir, args.output_dir)
            
            # Generate and write processing summary
            summary = merger.get_processing_summary(yearly_outputs)
            summary_path = os.path.join(args.output_dir, 'processing_summary.md')
            with open(summary_path, 'w', encoding='utf-8') as f:
                f.write(summary)
            
            print(f"\n📋 Processing summary written to: {summary_path}")
        
        # Display results
        if yearly_outputs:
            print(f"\n✅ Processing complete!")
            print(f"📅 Years processed: {len(yearly_outputs)}")
            print(f"📄 Total files processed: {sum(len(yo.series_files) for yo in yearly_outputs)}")
            
            if not args.dry_run:
                print(f"📁 Output files written to: {args.output_dir}")
                for yearly_output in yearly_outputs:
                    print(f"   - {yearly_output.output_filename}")
        else:
            print("⚠️ No files were processed")
            
    except KeyboardInterrupt:
        print("\n⏹️ Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error during processing: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


def run_dry_run(merger: FileMerger, input_dir: str):
    """Run in dry-run mode to show what would be processed"""
    # Find markdown files
    md_files = []
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.lower().endswith('.md'):
                filepath = os.path.join(root, file)
                md_files.append(filepath)
    
    print(f"🔍 Found {len(md_files)} markdown files:")
    for filepath in md_files:
        filename = os.path.basename(filepath)
        year = merger.year_extractor.extract_year(filename)
        print(f"   {filename} -> {year if year else 'No year detected'}")
    
    # Group by year
    files_by_year = {}
    for filepath in md_files:
        filename = os.path.basename(filepath)
        year = merger.year_extractor.extract_year(filename)
        if year:
            if year not in files_by_year:
                files_by_year[year] = []
            files_by_year[year].append(filename)
    
    print(f"\n📅 Would group into {len(files_by_year)} years:")
    for year in sorted(files_by_year.keys()):
        files = files_by_year[year]
        print(f"   {year}: {len(files)} files")
        for filename in files:
            print(f"      - {filename}")
    
    print(f"\n📄 Would generate output files:")
    for year in sorted(files_by_year.keys()):
        print(f"   - {year}_season.md")
    print(f"   - processing_summary.md")
    
    return []  # Return empty list for dry run


def test_modules():
    """Test function to verify all modules are working"""
    print("🧪 Testing modules...")
    
    try:
        # Test year extractor
        extractor = YearExtractor()
        test_files = ['primera01.md', 'navidad01.md', 'finalgate07.md', 'unknown.md']
        
        print("\n📅 Year Extractor Test:")
        for filename in test_files:
            year = extractor.extract_year(filename)
            print(f"   {filename} -> {year}")
        
        # Test date parser
        date_parser = DateParser()
        test_dates = [
            "4/26/2001 Gifu Industrial Hall 1050 Attendance",
            "November 25th, 2001 Shizuoka, Twin Messe Shizuoka - 1580 Attendance",
            "2015-08-19 Tokyo, Differ Ariake"
        ]
        
        print("\n📅 Date Parser Test:")
        for date_text in test_dates:
            dates = date_parser.extract_dates_from_text(date_text)
            if dates:
                formatted = date_parser.format_date_dragon_gate_style(dates[0].date)
                print(f"   '{date_text}' -> {formatted}")
            else:
                print(f"   '{date_text}' -> No date found")
        
        print("\n✅ All modules loaded successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Module test failed: {e}")
        return False


if __name__ == "__main__":
    # Quick module test if no arguments provided
    if len(sys.argv) == 1:
        print("🥽 Wrestling Results Processor")
        print("=" * 50)
        test_modules()
        print()
        print("Usage: python process_wrestling_results.py input_dir output_dir")
        print("Run with --help for more options")
        sys.exit(0)
    
    main()