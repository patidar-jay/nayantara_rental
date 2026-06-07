const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'presentation');

const replacements = [
  { regex: /bg-gray-400\/10/g, replace: 'bg-surface' },
  { regex: /border-gray-500\/20/g, replace: 'border-border' },
  { regex: /from-brand-600\/40 to-brand-800\/40/g, replace: 'from-primary/40 to-primary/60' },
  { regex: /from-accent-500\/30 to-brand-700\/30/g, replace: 'from-primary/30 to-primary/40' },
  { regex: /border-brand-500\/40/g, replace: 'border-primary/40' },
  { regex: /ring-offset-surface-800/g, replace: 'ring-offset-surface' }
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

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log("Cleanup complete.");
