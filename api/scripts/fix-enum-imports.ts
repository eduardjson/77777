import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Путь к сгенерированным DTO (относительно apps/api)
const CLIENT_DTO_PATH = join(__dirname, '../../../packages/types/src/client');
const ENUMS_PATH = '../../../shared/enums'; // Относительный путь от файлов в client
const ENUMS_FILE_PATH = join(__dirname, '../../../packages/types/src/shared/enums.ts');

export function deleteUselessComma() {
  console.log('🔧 Checking enums.ts for useless commas...');

  try {
    let content = readFileSync(ENUMS_FILE_PATH, 'utf-8');

    // Удаляем запятые между объявлениями enum
    // Паттерн: ищем закрывающую скобку }, за которой следует запятая и перенос строки, затем export
    const fixedContent = content.replace(/}\s*,\s*\n\s*export/g, '}\n\nexport');

    // Также обрабатываем случай, если запятая в конце файла
    const finalContent = fixedContent.replace(/}\s*,\s*$/, '}');

    if (content !== finalContent) {
      writeFileSync(ENUMS_FILE_PATH, finalContent);
      console.log('  ✅ Removed useless commas in enums.ts');
    } else {
      console.log('  ✅ enums.ts is already correct');
    }
  } catch (error) {
    console.error('❌ Error fixing enums.ts:', error.message);
  }
}

function processDirectory(dirPath: string, description: string) {
  try {
    const files = readdirSync(dirPath);
    let fixedCount = 0;

    for (const file of files) {
      if (file.endsWith('.ts')) {
        const filePath = join(dirPath, file);
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
          console.log(`  ✅ Fixed ${description}: ${filePath}`);
        }
      }
    }
    return fixedCount;
  } catch (error) {
    // Игнорируем ошибки для папок, которые не существуют
    return 0;
  }
}

function fixEnumImports() {
  console.log('🔧 Fixing enum imports in generated files...');

  try {
    const models = readdirSync(CLIENT_DTO_PATH, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (models.length === 0) {
      console.log('⚠️ No models found in client path');
      return;
    }

    let totalFixedCount = 0;

    for (const model of models) {
      const modelPath = join(CLIENT_DTO_PATH, model);

      // Обрабатываем dto папку
      const dtoPath = join(modelPath, 'dto');
      const dtoFixedCount = processDirectory(dtoPath, 'dto');
      totalFixedCount += dtoFixedCount;

      // Обрабатываем entities папку
      const entitiesPath = join(modelPath, 'entities');
      const entitiesFixedCount = processDirectory(entitiesPath, 'entities');
      totalFixedCount += entitiesFixedCount;

      if (dtoFixedCount > 0 || entitiesFixedCount > 0) {
        console.log(
          `  📁 Model ${model}: ${dtoFixedCount} dto files, ${entitiesFixedCount} entities files fixed`
        );
      }
    }

    console.log(`\n✨ Fixed imports in ${totalFixedCount} files total`);

    // Вызываем функцию удаления запятых
    deleteUselessComma();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Запускаем основную функцию если скрипт вызван напрямую
if (require.main === module) {
  fixEnumImports();
}
