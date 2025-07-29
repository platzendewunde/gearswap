#!/bin/bash

# Wrestling Results Processor - Package Creation Script
echo "🎯 Creating Wrestling Results Processor Package..."

# Create package directory
PACKAGE_DIR="wrestling-results-processor-package"
rm -rf $PACKAGE_DIR
mkdir -p $PACKAGE_DIR

# Copy essential files (excluding node_modules)
echo "📦 Copying project files..."
cp package.json $PACKAGE_DIR/
cp appsscript.json $PACKAGE_DIR/
cp .clasprc.json $PACKAGE_DIR/
cp *.md $PACKAGE_DIR/

# Copy source directory
cp -r src $PACKAGE_DIR/

# Create README for the package
cat > $PACKAGE_DIR/README.md << 'EOF'
# Wrestling Results Processor - Modular Edition

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Follow setup guide:**
   - See `LOCAL_SETUP_INSTRUCTIONS.md` for complete setup
   - Configure `src/config.js` with your folder/sheet IDs
   - Set up Gemini API key

3. **Deploy:**
   ```bash
   npm run login
   npm run create  
   npm run push
   ```

## 📁 Project Structure

- `src/` - All source code modules
- `package.json` - NPM configuration
- `appsscript.json` - Apps Script manifest
- `LOCAL_SETUP_INSTRUCTIONS.md` - Complete setup guide

## 🎯 Key Benefits

✅ Modular architecture (8 focused modules)
✅ Professional development workflow with clasp
✅ Version control and automated deployment
✅ Comprehensive testing framework
✅ Better debugging and maintenance

This replaces the monolithic 2,376-line script with a modern, maintainable solution.

See `MIGRATION_SUMMARY.md` for complete transformation details.
EOF

# Show package contents
echo "📋 Package contents:"
find $PACKAGE_DIR -type f | sort

echo ""
echo "✅ Package created: $PACKAGE_DIR"
echo "📦 Files ready for download and local setup!"

# Create a simple file listing
echo ""
echo "🎯 File Summary:"
echo "- Configuration: $(find $PACKAGE_DIR -name "*.json" | wc -l) files"
echo "- Source modules: $(find $PACKAGE_DIR/src -name "*.js" | wc -l) files"  
echo "- Documentation: $(find $PACKAGE_DIR -name "*.md" | wc -l) files"
echo "- Total files: $(find $PACKAGE_DIR -type f | wc -l)"