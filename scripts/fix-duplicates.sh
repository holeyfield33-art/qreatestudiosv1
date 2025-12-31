#!/bin/bash
# Fix duplicate if statements in console.error guards

echo "Fixing duplicate if statements..."

# Find all TypeScript files in app/api and fix duplicates
find app/api -name "*.ts" -type f | while read file; do
  # Use perl to handle multi-line replacements
  perl -i -pe 's/if \(process\.env\.NODE_ENV === '\''development'\''\) \{\s+if \(process\.env\.NODE_ENV === '\''development'\''\) \{/if (process.env.NODE_ENV === '\''development'\'') {/g' "$file"
  
  # Also handle variations with indentation
  perl -i -0pe 's/if \(process\.env\.NODE_ENV === '\''development'\''\) \{\n\s*if \(process\.env\.NODE_ENV === '\''development'\''\) \{/if (process.env.NODE_ENV === '\''development'\'') {/g' "$file"
  
  # Fix double closing braces
  perl -i -0pe 's/console\.error\([^)]+\);\n\s*\}\n\s*\}/console.error($1);\n    }/g' "$file"
done

echo "Done!"
