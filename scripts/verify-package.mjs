import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const distribution = join(root, 'dist', 'storage-manager');
const temporaryProject = mkdtempSync(join(tmpdir(), 'storage-manager-install-'));

try {
  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--json'], { cwd: distribution }).toString(),
  );
  const packageName = JSON.parse(readFileSync(join(distribution, 'package.json'), 'utf8')).name;
  const archive = join(distribution, packed[0].filename);
  writeFileSync(
    join(temporaryProject, 'package.json'),
    '{"name":"package-check","private":true,"type":"module"}\n',
  );
  execFileSync('npm', ['install', archive, '@angular/compiler@^20.3.0', '--ignore-scripts'], {
    cwd: temporaryProject,
    stdio: 'inherit',
  });
  execFileSync(
    'node',
    ['--input-type=module', '--eval', `import '@angular/compiler'; import '${packageName}';`],
    {
      cwd: temporaryProject,
      stdio: 'inherit',
    },
  );
  console.log(
    `El paquete ${packageName} se instaló e importó correctamente en un proyecto independiente.`,
  );
} finally {
  rmSync(temporaryProject, { recursive: true, force: true });
}
