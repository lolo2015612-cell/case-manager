// يعمل تلقائيًا قبل بناء المثبّت (npm run dist):
//  1) إن وضعتَ قالبًا بالاسم العربي (مثل إخطار.docx) داخل app/templates فيُحوَّل لاسمه الإنجليزي letter-NN.docx
//  2) يُولّد النسخة المدمجة الاحتياطية app/letter-templates/lt-NN.js من القوالب الحالية
//  3) يتأكد من وجود القوالب الثلاثة عشر وإلا يوقف البناء برسالة واضحة
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const tplDir = path.join(root, 'app', 'templates');
const embedDir = path.join(root, 'app', 'letter-templates');
const NAMES = ['إخطار', 'استعجال', 'شطب', 'حكم قطعي', 'حكم خبير', 'حكم استجواب', 'حكم إحالة للتحقيق', 'قسم النقض', 'حكم إعادة للمرافعة', 'حكم وقف تعليقي', 'حكم وقف جزائي', 'تجديد من الشطب', 'تعجيل من الوقف'];
const key = s => String(s).normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/\.docx$/i, '').replace(/\s+/g, ' ').trim().toLowerCase();
const pad = n => String(n).padStart(2, '0');

fs.mkdirSync(embedDir, { recursive: true });
const present = fs.readdirSync(tplDir).filter(f => /\.docx$/i.test(f));
let bad = [];
NAMES.forEach((n, i) => {
    const alias = 'letter-' + pad(i + 1) + '.docx';
    const aliasPath = path.join(tplDir, alias);
    const arabic = present.find(f => f !== alias && key(f) === key(n));
    if (arabic) {                       // قالب جديد بالاسم العربي يُحلّ محل الإنجليزي
        fs.copyFileSync(path.join(tplDir, arabic), aliasPath);
        fs.unlinkSync(path.join(tplDir, arabic));
        console.log('تحويل اسم القالب: ' + arabic + ' -> ' + alias);
    }
    if (!fs.existsSync(aliasPath)) { bad.push(n + ' (' + alias + ')'); return; }
    const b64 = fs.readFileSync(aliasPath).toString('base64');
    fs.writeFileSync(path.join(embedDir, 'lt-' + pad(i + 1) + '.js'),
        "(window.__LT=window.__LT||{})['lt-" + pad(i + 1) + "']='" + b64 + "';\n", 'ascii');
});
if (bad.length) {
    console.error('ERROR: letter templates are missing from app/templates:\n  ' + bad.join('\n  '));
    process.exit(1);
}
console.log('OK: ' + NAMES.length + ' letter templates verified and embedded.');
