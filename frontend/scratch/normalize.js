const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Borders
    content = content.replace(/border-\[\#1a1a1a\]/g, 'border-white/5');
    content = content.replace(/border-\[\#2C2C2E\]\/60/g, 'border-white/5');
    content = content.replace(/border-\[\#2C2C2E\]\/50/g, 'border-white/5');
    content = content.replace(/border-\[\#2C2C2E\]\/70/g, 'border-white/5');
    content = content.replace(/border-neutral-900/g, 'border-white/5');
    
    // Typography
    content = content.replace(/text-\[10px\] font-bold text-neutral-500 uppercase tracking-widest/g, 'text-[11px] font-medium text-neutral-500 uppercase tracking-widest');
    content = content.replace(/text-xs font-bold text-neutral-500 uppercase tracking-widest/g, 'text-[11px] font-medium text-neutral-500 uppercase tracking-widest');
    
    // Radii
    content = content.replace(/rounded-xl/g, 'rounded-2xl');
    
    fs.writeFileSync(file, content, 'utf8');
});

console.log("Normalization complete.");
