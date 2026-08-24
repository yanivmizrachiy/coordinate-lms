const fs = require('fs');
const path = 'RULES.md';
let src = fs.readFileSync(path, 'utf8');
const marker = '- `#/workbook/:n` must render the canonical page itself and then add the LMS layer. Do not create a separately authored computerized workbook.\n';
const block = `- **Resolved canonical content decisions are part of this source of truth and must not be reverted by older tests, stale answer keys or historical wording:**\n  - Page 11: the two undefined duplicate \`ההסבר\` lines are retired. In their place, the canonical worksheet uses two deterministic true/false statements that test whether ordered-pair order changes the point. The same content appears in print and computerized practice.\n  - Page 12, section ג: the approved wording is exactly \`איזו נקודה נמצאת במיקום הימני ביותר?\`; do not restore the older \`הרחוקה ביותר ימינה\` wording or a blanket rule that forbids \`נמצאת\` here.\n  - Page 12, section ד: the canonical question is \`איזו נקודה מרחקה מציר x זהה למרחקה מציר y?\`, with E(3,3) and distance 3 as the exact deterministic result.\n  - Page 12, section ה: the obsolete vague task about points being \`קרובות\` is retired. The canonical replacement asks for the point that is both right of D and above B; the exact result is F(8,6).\n`;
if (!src.includes(block)) {
  if (!src.includes(marker)) throw new Error('RULES insertion marker not found');
  src = src.replace(marker, marker + block);
  fs.writeFileSync(path, src);
}
