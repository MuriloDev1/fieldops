import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function extractCreateTables(sql) {
  const matches = [...sql.matchAll(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-zA-Z0-9_]+)/gi)];
  return matches.map((m) => m[1].toLowerCase()).sort();
}

describe('Consistência estrutural do repositório FieldOps', () => {
  test('database/schema.sql e Flyway V1 definem exatamente as mesmas tabelas', () => {
    const schemaSql = fs.readFileSync(path.join(ROOT, 'database/schema.sql'), 'utf8');
    const flywayV1 = fs.readFileSync(
      path.join(ROOT, 'backend/src/main/resources/db/migration/V1__initial_schema.sql'),
      'utf8'
    );
    const schemaTables = extractCreateTables(schemaSql);
    const flywayTables = extractCreateTables(flywayV1);

    assert.ok(schemaTables.length >= 14, 'Esperado ao menos 14 tabelas no schema');
    assert.deepEqual(schemaTables, flywayTables);
  });

  test('database/seed.sql e Flyway V2 permanecem idênticos', () => {
    const seedSql = fs.readFileSync(path.join(ROOT, 'database/seed.sql'), 'utf8');
    const flywayV2 = fs.readFileSync(
      path.join(ROOT, 'backend/src/main/resources/db/migration/V2__seed_data.sql'),
      'utf8'
    );
    assert.equal(seedSql, flywayV2);
  });

  test('frontend/.env.example documenta variáveis VITE_ esperadas', () => {
    const envExample = fs.readFileSync(path.join(ROOT, 'frontend/.env.example'), 'utf8');
    assert.match(envExample, /^VITE_API_URL=/m);
    assert.match(envExample, /^VITE_ALLOW_DEMO_LOGIN=/m);
  });

  test('deploy_aws.sh exibe os e-mails reais do seed', () => {
    const deployScript = fs.readFileSync(path.join(ROOT, 'deploy_aws.sh'), 'utf8');
    assert.match(deployScript, /admin@fieldops\.com/);
    assert.match(deployScript, /supervisor@fieldops\.com/);
    assert.match(deployScript, /tecnico@fieldops\.com/);
  });

  test('arquivos JSON críticos são válidos', () => {
    const jsonPaths = [
      'frontend/package.json',
      'frontend/tsconfig.json',
      'frontend/.oxlintrc.json',
      'fieldops-mobile/package.json',
      'fieldops-mobile/app.json',
      'fieldops-mobile/eas.json',
      'fieldops-mobile/tsconfig.json',
      '.vscode/settings.json',
    ];
    for (const rel of jsonPaths) {
      const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      assert.doesNotThrow(() => JSON.parse(content), `JSON inválido em ${rel}`);
    }
  });
});
