const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    let updated = content.replace(/import\s+\{([^}]*)motion([^}]*)\}\s+from\s+['"](framer-motion|motion\/react)['"]/g, (match, p1, p2, p3) => {
      // If it already has m, don't add another
      let newImports = (p1 + 'm' + p2).split(',').map(s=>s.trim()).filter(s=>s&&s!=='motion');
      // remove duplicates
      newImports = [...new Set(newImports)];
      return `import { ${newImports.join(', ')} } from '${p3}'`;
    });

    // Replace <motion. and </motion.
    updated = updated.replace(/<motion\./g, '<m.');
    updated = updated.replace(/<\/motion\./g, '</m.');

    if (content !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log('Updated:', filePath);
    }
  }
});
