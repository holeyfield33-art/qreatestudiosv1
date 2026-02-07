/**
 * Migration Script: Convert existing HTML-based landing pages to Puck format
 * 
 * This script helps migrate landing pages from the old HTML system
 * to the new Puck.js visual builder format.
 * 
 * Usage:
 *   npx tsx scripts/migrate-html-to-puck.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { getTemplateById } from '../lib/templates/puck-templates';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting migration: HTML templates → Puck.js format\n');

  // 1. Get all landing pages without draftContent
  const pages = await prisma.landingPage.findMany({
    where: {
      OR: [
        { draftContent: { equals: Prisma.DbNull } },
        { publishedContent: { equals: Prisma.DbNull } },
      ],
    },
    select: {
      id: true,
      name: true,
      content: true,
      templateId: true,
    },
  });

  console.log(`📊 Found ${pages.length} pages to migrate\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const page of pages) {
    try {
      console.log(`Processing: ${page.name} (${page.id})`);

      // Try to find matching Puck template
      const content: any = page.content;
      const oldTemplateId = content?.templateId || page.templateId;

      if (!oldTemplateId) {
        console.log(`  ⚠️  No template ID found, creating blank page`);
        
        // Create minimal Puck structure
        await prisma.landingPage.update({
          where: { id: page.id },
          data: {
            draftContent: {
              content: [],
              root: { props: {} },
            } as any,
          },
        });
        
        skipped++;
        continue;
      }

      // Find corresponding Puck template
      const puckTemplate = getTemplateById(oldTemplateId);

      if (puckTemplate) {
        console.log(`  ✅ Found Puck template: ${puckTemplate.name}`);
        
        // Migrate to Puck format with template defaults
        await prisma.landingPage.update({
          where: { id: page.id },
          data: {
            templateId: puckTemplate.id,
            draftContent: puckTemplate.defaultSections as any,
            metadata: puckTemplate.metadata as any,
          },
        });
        
        console.log(`  ✨ Migrated successfully\n`);
        migrated++;
      } else {
        console.log(`  ⚠️  No Puck template found for: ${oldTemplateId}`);
        console.log(`  Creating blank page with minimal structure\n`);
        
        // Create minimal Puck structure
        await prisma.landingPage.update({
          where: { id: page.id },
          data: {
            draftContent: {
              content: [],
              root: { props: {} },
            } as any,
          },
        });
        
        skipped++;
      }
    } catch (error) {
      console.error(`  ❌ Error migrating ${page.id}:`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Migrated successfully: ${migrated}`);
  console.log(`⚠️  Skipped (no template):  ${skipped}`);
  console.log(`❌ Errors:               ${errors}`);
  console.log(`📝 Total processed:      ${pages.length}`);
  console.log('='.repeat(50));

  if (migrated > 0) {
    console.log('\n✨ Migration complete! Your landing pages now use the Puck.js visual builder.');
    console.log('👉 Users can now edit pages at: /dashboard/landing-pages/[id]/builder');
  }

  if (skipped > 0) {
    console.log('\n⚠️  Some pages were skipped because no matching template was found.');
    console.log('💡 Users can add sections manually in the visual builder.');
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
