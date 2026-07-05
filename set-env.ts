import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const dir = './src/environments';
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const envConfigFile = `
export const environment = {
  production: true,
  API_URL: '${process.env.API_URL}'
};
`;

writeFileSync('./src/environments/environment.ts', envConfigFile);
console.log('Arquivo environment.ts gerado com sucesso pelo Vercel!');
