import { writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { productCatalogue, PRODUCT_CATALOGUE_VERSION } from '../src/app/data/catalogue.ts';

const sqlString = value => `'${String(value).replaceAll("'", "''")}'`;
const key = 'b_interiors_products';
const statements = [
  `INSERT INTO app_kv(key,value,updated_at) VALUES (${sqlString(key)},'[]',CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value='[]',updated_at=excluded.updated_at;`,
  ...productCatalogue.map(product => `UPDATE app_kv SET value=json_insert(value,'$[#]',json(${sqlString(JSON.stringify(product))})),updated_at=CURRENT_TIMESTAMP WHERE key=${sqlString(key)};`),
  `INSERT INTO app_kv(key,value,updated_at) VALUES ('b_interiors_products_version',${sqlString(JSON.stringify(PRODUCT_CATALOGUE_VERSION))},CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at;`,
];
const sql = statements.join('\n');
const sqlPath = '/tmp/binteriorz-catalogue-seed.sql';
await writeFile(sqlPath, sql, { mode: 0o600 });
const result = spawnSync('./node_modules/.bin/wrangler', ['d1', 'execute', 'binteriorz-db', '--remote', '--file', sqlPath], { stdio: 'inherit' });
process.exit(result.status ?? 1);
