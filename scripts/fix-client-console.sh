#!/bin/bash
# Fix console.error in client-side components

echo "🔍 Finding client components with console.error..."

FILES=$(grep -rl "console\.error\|console\.log\|console\.warn" app/dashboard --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".bak")

if [ -z "$FILES" ]; then
  echo "✅ No console statements found!"
  exit 0
fi

echo "📝 Found $(echo "$FILES" | wc -l) files to fix"
echo ""

FIXED_COUNT=0

for file in $FILES; do
  # Create backup
  cp "$file" "$file.bak" 2>/dev/null

  # Create temporary file
  temp_file=$(mktemp)

  while IFS= read -r line; do
    if echo "$line" | grep -q "^\s*console\.\(error\|log\|warn\)"; then
      indent=$(echo "$line" | sed 's/\(^\s*\).*/\1/')
      echo "${indent}if (process.env.NODE_ENV === 'development') {" >> "$temp_file"
      echo "$line" >> "$temp_file"
      echo "${indent}}" >> "$temp_file"
    else
      echo "$line" >> "$temp_file"
    fi
  done < "$file"

  mv "$temp_file" "$file"
  echo "✅ Fixed: $file"
  FIXED_COUNT=$((FIXED_COUNT + 1))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary: Fixed $FIXED_COUNT files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Client-side error handling complete!"
