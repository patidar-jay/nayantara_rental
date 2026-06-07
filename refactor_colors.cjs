const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'presentation');

const replacements = [
  { regex: /shadow-brand-600\/(20|25)/g, replace: 'shadow-primary/$1' },
  { regex: /divide-white\/5/g, replace: 'divide-border' },
  { regex: /bg-white\/\[0\.02\]/g, replace: 'bg-surface' },
  { regex: /text-gray-(200|300)/g, replace: 'text-text-muted' },
  { regex: /bg-gray-500/g, replace: 'bg-surface' },
  { regex: /border-surface-600/g, replace: 'border-border' },
  { regex: /text-surface-600/g, replace: 'text-text-muted' },
  { regex: /text-brand-300/g, replace: 'text-primary' },
  { regex: /border-brand-500\/20/g, replace: 'border-primary/20' },
  { regex: /bg-brand-400/g, replace: 'bg-primary' },
  { regex: /text-brand-700/g, replace: 'text-background' },
  { regex: /ring-white\/10/g, replace: 'ring-border' },
  { regex: /bg-gradient-to-br from-brand-900 to-surface-800/g, replace: 'bg-surface' },
  { regex: /bg-gradient-to-br from-brand-600\/30 to-brand-800\/30/g, replace: 'bg-primary/20' },
  { regex: /bg-gradient-to-b from-brand-950\/50 via-surface-950 to-surface-950/g, replace: 'bg-gradient-to-b from-primary/10 via-background to-background' },
  { regex: /bg-gradient-to-r from-brand-600 to-brand-800/g, replace: 'bg-primary' },
  { regex: /bg-gradient-to-br from-brand-900\/40 to-surface-800/g, replace: 'bg-surface' },
  { regex: /hover:text-brand-300/g, replace: 'hover:opacity-90' },
  { regex: /hover:bg-primary/g, replace: 'hover:opacity-90' }, // fix double replace from previous
  { regex: /hover:opacity-90 transition-all hover:shadow-lg/g, replace: 'hover:opacity-90 transition-all hover:shadow-lg' }, // cleanup
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      replacements.forEach(({ regex, replace }) => {
        content = content.replace(regex, replace);
      });

      // Additional cleanups: 
      // replace "hover:bg-primary" if it's already a bg-primary element to avoid duplicate rules, 
      // instead just rely on hover:opacity-90 that was added.
      // Wait, let's just let the regex run.

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log("Cleanup complete.");
