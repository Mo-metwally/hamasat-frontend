const fs = require('fs');
const path = require('path');
const dirSrc = 'E:\\WEB DESIGN\\Work\\2025\\hamasat-home-next.js\\NewHamasat\\hamasat-frontend\\src';

const oldDescBase = 'معرض همسات للأدوات المنزلية يجمع لك كل ما يحتاجه المطبخ العصري: زجاج، كاسات، شربات، أطقم صيني وخزف، أنتيكات وكرستالات، أدوات المائدة، أطقم التسالي، أطقم الميلامين، أطقم الأركوبال والأركوبايركس، أطقم السفرة، أطقم الشاي والجاتوه، أطقم العشاء، والمزيد... مع تشكيلة واسعة من التصاميم الأنيقة، وجودة عالية بأسعار تنافسية تناسب كل الأذواق.';
const newDesc = 'معرض همسات هوم لتجهيز العرائس والمنزل العصري يقدم لكِ كل ما تحتاجينه تحت سقف واحد: أحدث الأجهزة الكهربائية، مفروشات راقية، وأدوات مطبخ متكاملة (زجاج، كاسات، أطقم صيني وخزف، أدوات المائدة، أطقم عشاء، والمزيد). استمتعي بتشكيلة واسعة من التصاميم الأنيقة، جودة عالية، وأسعار تنافسية تناسب جميع الأذواق.';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        if (fs.statSync(file).isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(dirSrc);
let modifiedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    const descRegex = new RegExp(oldDescBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'g');
    if (descRegex.test(content)) {
        content = content.replace(descRegex, newDesc);
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedFiles++;
        console.log('Fixed spacing in:', file);
    }
});
console.log('Total fixed:', modifiedFiles);
