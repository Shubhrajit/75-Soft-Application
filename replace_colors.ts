import * as fs from 'fs';
import * as path from 'path';

const replacements: Record<string, string> = {
  '\\[#FCFAF8\\]': 'background',
  '\\[#1D1C1B\\]': 'foreground',
  '\\[#9CB4A1\\]': 'primary',
  '\\[#8AA38F\\]': 'primary-hover',
  '\\[#D5E8D7\\]': 'secondary',
  '\\[#1B2D20\\]': 'secondary-foreground',
  '\\[#E8D5EB\\]': 'accent',
  '\\[#D8C5DB\\]': 'accent-hover',
  '\\[#4A2B4D\\]': 'accent-foreground',
  '\\[#F2EFEA\\]': 'muted',
  '\\[#EAE4DE\\]': 'muted-hover',
  '\\[#4A4745\\]': 'muted-foreground',
  '\\[#CDC9C6\\]': 'border',
};

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  for (const [hex, name] of Object.entries(replacements)) {
    const regex = new RegExp(hex, 'g');
    content = content.replace(regex, name);
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Processed ${filePath}`);
}

const files = [
  'src/App.tsx',
  'src/components/Home.tsx',
  'src/components/Dashboard.tsx',
  'src/components/Settings.tsx',
  'src/components/PostMortemModal.tsx'
];

files.forEach(processFile);
