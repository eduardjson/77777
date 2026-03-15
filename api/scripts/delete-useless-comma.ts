import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ENUMS_FILE_PATH = join(__dirname, '../../packages/types/src/shared/enums.ts');

function fixEnumsFile() {
  console.log('🔧 Fixing enums.ts file...');

  try {
    let content = readFileSync(ENUMS_FILE_PATH, 'utf-8');

    // Разбиваем на строки
    let lines = content.split('\n');
    let fixedLines: string[] = []; // Явно указываем тип массива

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Если строка содержит только запятую или пустая с запятой
      if (line.trim() === ',' || line.trim() === '},') {
        // Пропускаем эту строку
        continue;
      }

      // Если строка заканчивается на }, и следующая строка начинается с export
      if (
        line.trim().endsWith('}') &&
        i + 1 < lines.length &&
        lines[i + 1].trim().startsWith('export')
      ) {
        fixedLines.push(line);
        // Добавляем пустую строку для разделения enum
        fixedLines.push('');
        continue;
      }

      fixedLines.push(line);
    }

    // Убираем множественные пустые строки
    const finalContent = fixedLines.join('\n').replace(/\n{3,}/g, '\n\n'); // заменяем 3+ пустых строк на 2

    if (content !== finalContent) {
      writeFileSync(ENUMS_FILE_PATH, finalContent);
      console.log('  ✅ Successfully fixed enums.ts');

      // Показываем результат
      console.log('\n📄 Fixed content:');
      console.log(finalContent);
    } else {
      console.log('  ✅ File is already correct');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixEnumsFile();
