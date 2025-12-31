#!/bin/bash
# Automated Error Handling Fix Script
# Fixes all console.error calls to be guarded by environment check

echo "🔍 Finding files with console.error..."

# Find all TypeScript files in app/api with console.error
FILES=$(grep -rl "console\.error\|console\.log\|console\.warn" app/api --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v ".bak")

if [ -z "$FILES" ]; then
  echo "✅ No console statements found in API routes!"
  exit 0
fi

echo "📝 Found $(echo "$FILES" | wc -l) files to fix"
echo ""

FIXED_COUNT=0
SKIPPED_COUNT=0

for file in $FILES; do
  # Skip if already has the guard pattern
  if grep -q "process\.env\.NODE_ENV === 'development'" "$file"; then
    echo "⏭️  Skipping $file (already has guards)"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  # Create backup
  cp "$file" "$file.bak" 2>/dev/null

  # Create temporary file for processing
  temp_file=$(mktemp)

  # Read file line by line and add guards
  in_guard=false
  while IFS= read -r line; do
    # Check if line contains console.error, console.log, or console.warn
    if echo "$line" | grep -q "^\s*console\.\(error\|log\|warn\)"; then
      # Get the indentation
      indent=$(echo "$line" | sed 's/\(^\s*\).*/\1/')
      
      # Add guard before console statement
      echo "${indent}if (process.env.NODE_ENV === 'development') {" >> "$temp_file"
      echo "$line" >> "$temp_file"
      echo "${indent}}" >> "$temp_file"
      in_guard=true
    else
      echo "$line" >> "$temp_file"
    fi
  done < "$file"

  # Replace original file with fixed version
  mv "$temp_file" "$file"
  
  echo "✅ Fixed: $file"
  FIXED_COUNT=$((FIXED_COUNT + 1))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   ✅ Fixed: $FIXED_COUNT files"
echo "   ⏭️  Skipped: $SKIPPED_COUNT files"
echo "   💾 Backups: *.bak files created"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Error handling improvements complete!"
echo ""
echo "Next steps:"
echo "1. Test the application: npm run dev"
echo "2. Check for any TypeScript errors"
echo "3. Remove .bak files: find . -name '*.bak' -delete"
echo ""
