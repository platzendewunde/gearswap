#!/usr/bin/env python3
"""
SIMPLE WRESTLING RESULTS PROCESSOR

This is a simplified version with step-by-step instructions.
Just put your .md files in a folder and run this script!
"""

import os
import sys

def main():
    print("🥽 SIMPLE Wrestling Results Processor")
    print("=" * 50)
    
    # Check if modules exist
    if not os.path.exists('modules'):
        print("❌ ERROR: 'modules' folder not found!")
        print("Make sure you have all the files in the same folder.")
        return
    
    # Add modules to path
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'modules'))
    
    try:
        from file_merger import FileMerger
    except ImportError as e:
        print(f"❌ ERROR: Could not load modules: {e}")
        print("Make sure you have PyYAML installed: pip install PyYAML")
        return
    
    # Get input folder
    print("\nStep 1: Where are your wrestling .md files?")
    input_folder = input("Enter folder path (or just press Enter for 'my_files'): ").strip()
    if not input_folder:
        input_folder = "my_files"
    
    if not os.path.exists(input_folder):
        print(f"❌ ERROR: Folder '{input_folder}' not found!")
        print(f"Please create the folder '{input_folder}' and put your .md files in it.")
        return
    
    # Get output folder
    output_folder = "yearly_results"
    print(f"\nStep 2: Results will be saved to '{output_folder}' folder")
    
    # Process files
    print(f"\nStep 3: Processing files...")
    print(f"Reading from: {input_folder}")
    print(f"Writing to: {output_folder}")
    print()
    
    try:
        merger = FileMerger()
        yearly_outputs = merger.process_directory(input_folder, output_folder)
        
        if yearly_outputs:
            print(f"\n✅ SUCCESS!")
            print(f"📅 Processed {len(yearly_outputs)} years")
            print(f"📄 Total files: {sum(len(yo.series_files) for yo in yearly_outputs)}")
            print(f"\nYour yearly files are in '{output_folder}':")
            for yo in yearly_outputs:
                print(f"   📄 {yo.output_filename}")
            print(f"   📋 processing_summary.md")
        else:
            print("⚠️ No files were processed")
            print("Make sure your .md files have years in the filename (like 'primera01.md')")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print("If you need help, check that:")
        print("1. Your .md files are in the input folder")
        print("2. The files have years in their names")
        print("3. PyYAML is installed (pip install PyYAML)")

if __name__ == "__main__":
    main()