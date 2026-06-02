import { build } from 'esbuild';
import { execSync } from 'child_process';
import { copyFile, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(root, 'dist/web-grpc');

await rm(outDir, { recursive: true, force: true });

const platformForkPlugin = {
  name: 'platform-fork',
  setup(build) {
    build.onResolve({ filter: /grpc\.js$/ }, (args) => {
      if (args.path === './grpc.js' || args.path.endsWith('/connection/grpc.js')) {
        return { path: path.resolve(root, 'src/connection/grpc-web.ts') };
      }
      return null;
    });
    build.onResolve({ filter: /base64\.js$/ }, (args) => {
      if (args.path === './base64.js' || args.path.endsWith('/utils/base64.js')) {
        return { path: path.resolve(root, 'src/utils/base64.browser.ts') };
      }
      return null;
    });
  },
};

const common = {
  entryPoints: [path.join(root, 'src/index.ts')],
  bundle: true,
  platform: 'browser',
  conditions: ['browser'],
  minify: true,
  treeShaking: true,
  outdir: outDir,
  logLevel: 'info',
  alias: {
    '#httpAgent': path.resolve(root, 'src/utils/httpAgent.browser.ts'),
    'nice-grpc': 'nice-grpc-common',
  },
  plugins: [platformForkPlugin],
};

await build({ ...common, format: 'esm' });
await build({ ...common, format: 'cjs', outExtension: { '.js': '.cjs' } });

execSync(
  'tsc --emitDeclarationOnly --declaration --outDir dist/web-grpc --module esnext --moduleResolution bundler',
  { stdio: 'inherit', cwd: root },
);
await copyFile(path.join(outDir, 'index.d.ts'), path.join(outDir, 'index.d.cts'));
