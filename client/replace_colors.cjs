const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.jsx')) results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('/home/amb/src/cfms/client/src', (err, results) => {
  if (err) throw err;
  let count = 0;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Grays -> Charcoal (Charcoal Brown: #2e382e)
    content = content.replace(/gray-900/g, 'charcoal');
    content = content.replace(/gray-800/g, 'charcoal');
    content = content.replace(/gray-600/g, 'charcoal/80');
    content = content.replace(/gray-500/g, 'charcoal/60');
    content = content.replace(/gray-200/g, 'charcoal/20');
    content = content.replace(/gray-100/g, 'charcoal/10');
    content = content.replace(/gray-50/g, 'charcoal/5');
    
    // Blues -> Grape for primary action (Dusty Grape: #52489c), or Blue for backgrounds (Icy Blue: #add9f4)
    content = content.replace(/blue-700/g, 'grape');
    content = content.replace(/blue-600/g, 'grape');
    content = content.replace(/blue-500/g, 'grape/80');
    content = content.replace(/blue-200/g, 'blue/80');
    content = content.replace(/blue-100/g, 'blue/50');
    content = content.replace(/blue-50/g, 'blue/20');
    
    // Purples -> Pink (Pink Mist: #e08dac)
    content = content.replace(/purple-700/g, 'pink');
    content = content.replace(/purple-600/g, 'pink');
    content = content.replace(/purple-500/g, 'pink/80');
    content = content.replace(/purple-100/g, 'pink/20');
    
    // Greens -> Green (Willow Green: #87c38f)
    content = content.replace(/green-700/g, 'green/90');
    content = content.replace(/green-600/g, 'green');
    content = content.replace(/green-500/g, 'green');
    content = content.replace(/green-100/g, 'green/20');

    if (content !== original) {
      fs.writeFileSync(file, content);
      count++;
    }
  });
  console.log(`Replaced colors in ${count} files`);
});
