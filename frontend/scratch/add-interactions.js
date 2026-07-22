const fs = require('fs');

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
    
    // Add active:scale-95 to buttons.
    content = content.replace(/(<button[^>]*className="[^"]*)"/g, (match, p1) => {
        if (!p1.includes('active:scale-95')) {
            return p1 + ' active:scale-95 transition-all"';
        }
        return match;
    });

    // Add smooth hover lift to cards containing group/cursor-pointer or hover:bg
    content = content.replace(/(<div[^>]*className="[^"]*)"/g, (match, p1) => {
        if (p1.includes('border-white/5') || p1.includes('hover:bg')) {
            if ((p1.includes('cursor-pointer') || p1.includes('group')) && !p1.includes('hover:-translate-y-1')) {
                return p1 + ' transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"';
            }
        }
        return match;
    });

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Interactions added.");
