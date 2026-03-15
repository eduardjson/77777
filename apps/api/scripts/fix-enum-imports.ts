import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Путь к сгенерированным DTO (относительно apps/api)
const CLIENT_DTO_PATH = join(__dirname, '../../../packages/types/src/client');
const ENUMS_PATH = '../../../shared/enums'; // Относительный путь от файлов в client

function fixEnumImports() {
  console.log('🔧 Fixing enum imports in generated DTO files...');

  try {
    const models = readdirSync(CLIENT_DTO_PATH, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (models.length === 0) {
      console.log('⚠️ No models found in client DTO path');
      return;
    }

    let fixedCount = 0;

    for (const model of models) {
      const dtoPath = join(CLIENT_DTO_PATH, model, 'dto');

      try {
        const files = readdirSync(dtoPath);

        for (const file of files) {
          if (file.endsWith('.ts')) {
            const filePath = join(dtoPath, file);
            let content = readFileSync(filePath, 'utf-8');

            const newContent = content.replace(
              /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@prisma\/client['"]/g,
              (match, enumNames) => {
                const cleanedNames = enumNames
                  .split(',')
                  .map((name: string) => name.trim())
                  .join(', ');
                return `import { ${cleanedNames} } from '${ENUMS_PATH}'`;
              }
            );

            if (newContent !== content) {
              writeFileSync(filePath, newContent);
              fixedCount++;
              console.log(`  ✅ Fixed: ${filePath}`);
            }
          }
        }
      } catch (error) {
        // Игнорируем ошибки для папок без dto
      }
    }

    console.log(`\n✨ Fixed imports in ${fixedCount} files`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixEnumImports();
