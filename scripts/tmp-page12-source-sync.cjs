const fs = require('fs');
const { execFileSync } = require('child_process');

const sourcePath = 'src/data/workbook/pages/read-intro.ts';
const registryPath = 'src/data/solutions/registry.ts';
const sourceBlobSha = execFileSync('git', ['hash-object', sourcePath], { encoding: 'utf8' }).trim();
const registry = fs.readFileSync(registryPath, 'utf8');
const pattern = /(sourceFile: 'src\/data\/workbook\/pages\/read-intro\.ts',\n\s*sourceBlobSha: ')[0-9a-f]+(')/;
if (!pattern.test(registry)) throw new Error('READ_INTRO sourceBlobSha entry not found');
fs.writeFileSync(registryPath, registry.replace(pattern, `$1${sourceBlobSha}$2`));
