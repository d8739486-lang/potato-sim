const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.join(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          if (!file.endsWith('.md')) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

walk('public/assets', (err, results) => {
  if (err) throw err;
  
  const assetObjects = results.map(f => {
    const url = f.replace(/\\/g, '/').replace('public', '');
    const type = (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) ? 'image' : 'audio';
    return `    { type: '${type}', url: '${url}' },`;
  }).join('\n');

  const newAssetsBlock = `  const assets = [\n${assetObjects}\n  ];`;

  let content = fs.readFileSync('src/system.ts', 'utf8');
  content = content.replace(/const assets = \[[\s\S]*?\];/, newAssetsBlock);
  fs.writeFileSync('src/system.ts', content, 'utf8');
  console.log('Preloader updated with all assets!');
});
