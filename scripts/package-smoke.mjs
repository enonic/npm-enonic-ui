#!/usr/bin/env node
// Checks that the packed tarball is what a consumer can install, load, and render. Storybook builds
// from src/ (.storybook/main.ts aliases '@'), so no other CI job touches dist/.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = process.cwd();
const PKG = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));

// The bundle emits bare `react`/`react-dom` imports, so a consumer supplies them as compat aliases.
// The plain-React fixture is disabled because the bundle takes `createPortal` from `react`, which
// real React does not export — tracked in #544. Enable it once the specifier is fixed.
const FIXTURES = [
  {
    name: 'preact',
    deps: [
      'preact@10',
      'react@npm:@preact/compat',
      'react-dom@npm:@preact/compat',
      '@radix-ui/react-slot@1',
      'focus-trap-react@12',
      'preact-render-to-string@6',
    ],
    runtime: 'preact',
  },
  {
    name: 'react',
    deps: ['react@19', 'react-dom@19', '@radix-ui/react-slot@1', 'focus-trap-react@12'],
    runtime: 'react',
    skip: 'bundle imports createPortal from react (#544)',
  },
];

// A stylesheet that lost every component rule is still non-empty, so assert on utilities the
// components actually emit rather than on file size.
const CSS_SENTINELS = {
  'style.css': ['bg-btn-primary', 'text-ellipsis', 'inline-flex', '--color-btn-primary'],
  'preset.css': ['@theme', '@utility', '--color-btn-primary'],
  'tokens.css': ['--color-btn-primary', '--color-bdr-strong'],
  'base.css': ['@layer'],
  'utilities.css': ['@utility'],
};

const EXPECTED_EXPORTS = JSON.stringify(['Button', 'Input', 'Dialog', 'Tooltip', 'cn']);

const failures = [];
const skipped = [];

const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (error) {
    failures.push(name);
    const detail = String(error.message).trim().split('\n').slice(0, 6).join('\n          ');
    console.log(`  FAIL  ${name}\n          ${detail}`);
  }
};

const assert = (cond, message) => {
  if (!cond) throw new Error(message);
};

const childEnv = () => {
  const env = { ...process.env };
  delete env.NODE_PATH;
  delete env.NODE_OPTIONS;
  return env;
};

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, env: childEnv(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

// Never decide pass/fail by matching text in the output — an error message that changes shape would
// read as success. Only the exit code decides; the output is for the report.
const tryRun = (cmd, args, cwd) => {
  try {
    return { ok: true, out: run(cmd, args, cwd) };
  } catch (error) {
    return { ok: false, out: `${error.stdout ?? ''}${error.stderr ?? ''}`.trim() || String(error.message) };
  }
};

// Node resolves bare specifiers by walking every ancestor for node_modules. A fixture anywhere under
// the repo would silently borrow the repo's own dependencies and pass on a package that fails to
// declare them, so prove the fixture stands alone instead of assuming the temp dir is far enough.
const assertIsolated = dir => {
  for (let d = path.dirname(dir); d !== path.dirname(d); d = path.dirname(d)) {
    assert(!fs.existsSync(path.join(d, 'node_modules')), `ancestor node_modules would leak in: ${d}/node_modules`);
  }
};

const esmProbe = framework => `
  import fs from 'node:fs';
  import path from 'node:path';
  import { createRequire } from 'node:module';
  import { render } from 'preact-render-to-string';
  import { h } from 'preact';

  const require = createRequire(path.join(process.cwd(), 'noop.js'));
  const resolved = require.resolve('react');
  if (!resolved.startsWith(process.cwd())) {
    throw new Error('fixture resolved react from outside itself: ' + resolved);
  }

  const m = await import('${PKG.name}');
  for (const name of ${EXPECTED_EXPORTS}) {
    if (m[name] === undefined) throw new Error('missing export: ' + name);
  }

  ${
    framework === 'preact'
      ? `const html = render(h(m.Button, { variant: 'filled' }, 'Go'));
         if (!/^<button[^>]*class="[^"]*inline-flex/.test(html)) {
           throw new Error('Button did not render with its classes: ' + html.slice(0, 160));
         }`
      : ''
  }

  await import('${PKG.name}/style');
  for (const css of ['style.css', 'preset.css', 'tokens.css', 'base.css', 'utilities.css']) {
    const file = require.resolve('${PKG.name}/' + css);
    if (fs.statSync(file).size === 0) throw new Error('empty stylesheet: ' + css);
  }
`;

// CJS resolves a named import the bundle asked for but its dependency never exported to undefined
// rather than throwing, so assert on the values. ESM throws on its own, but checks the same way.
const CJS_PROBE = `
  const m = require('${PKG.name}');
  for (const name of ${EXPECTED_EXPORTS}) {
    if (m[name] === undefined) throw new Error('missing export: ' + name);
  }
  require('${PKG.name}/style');
`;

const main = () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'enonic-ui-smoke-'));
  const artifacts = path.join(work, 'artifacts');
  fs.mkdirSync(artifacts);

  console.log('Packing');
  run('pnpm', ['pack', '--pack-destination', artifacts], REPO);
  const tarball = path.join(
    artifacts,
    fs.readdirSync(artifacts).find(f => f.endsWith('.tgz')),
  );
  console.log(`  ${path.basename(tarball)}\n`);

  const extracted = path.join(work, 'extracted');
  fs.mkdirSync(extracted);
  run('tar', ['xzf', tarball, '-C', extracted], work);
  const shipped = new Set(
    run('tar', ['tzf', tarball], work)
      .split('\n')
      .filter(Boolean)
      .map(f => f.replace(/^package\//, '')),
  );

  console.log('Tarball contents');
  for (const [subpath, target] of Object.entries(PKG.exports)) {
    const targets = typeof target === 'string' ? [target] : Object.values(target);
    for (const t of targets) {
      check(`exports "${subpath}" ships ${t}`, () =>
        assert(shipped.has(t.replace(/^\.\//, '')), 'declared in exports but absent from the tarball'),
      );
    }
  }
  for (const field of ['main', 'module', 'types', 'style']) {
    check(`"${field}" ships ${PKG[field]}`, () =>
      assert(shipped.has(PKG[field].replace(/^\.\//, '')), 'declared in package.json but absent from the tarball'),
    );
  }
  check('no source shipped', () => assert(![...shipped].some(f => f.startsWith('src/')), 'src/ is in the tarball'));
  check('no build report shipped', () =>
    assert(![...shipped].some(f => f.endsWith('stats.html')), 'dist/stats.html is in the tarball'),
  );

  console.log('\nStylesheets');
  for (const [file, sentinels] of Object.entries(CSS_SENTINELS)) {
    check(`${file} carries its rules`, () => {
      const css = fs.readFileSync(path.join(extracted, 'package/dist/styles', file), 'utf8');
      const missing = sentinels.filter(s => !css.includes(s));
      assert(missing.length === 0, `missing: ${missing.join(', ')}`);
      assert(!/@import\s/.test(css), 'ships an unresolved @import, which consumers cannot follow');
    });
  }

  console.log('\nManifest');
  // Errors only. --strict would also fail on the warning that one .d.ts serves both the "import"
  // and "require" conditions, which is a manifest defect this check does not own (#544).
  const publint = tryRun('pnpm', ['exec', 'publint', '--level', 'error', tarball], REPO);
  check('publint', () => assert(publint.ok, publint.out));

  for (const fixture of FIXTURES) {
    if (fixture.skip) {
      skipped.push(`${fixture.name} (${fixture.skip})`);
      console.log(`\nConsumer fixture: ${fixture.name}\n  skip  ${fixture.skip}`);
      continue;
    }

    console.log(`\nConsumer fixture: ${fixture.name}`);
    const dir = path.join(work, `fixture-${fixture.name}`);
    fs.mkdirSync(dir);
    check(`${fixture.name}: fixture is isolated`, () => assertIsolated(dir));
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      `${JSON.stringify({ name: 'fixture', private: true }, null, 2)}\n`,
    );

    // npm, not pnpm: no workspace detection and a flat layout, so nothing resolves through a symlink
    // back into the repo store. --legacy-peer-deps is what keeps npm from installing the peers
    // itself, which would defeat the point and has been observed to overwrite the compat aliases.
    const install = tryRun(
      'npm',
      ['install', '--no-audit', '--no-fund', '--no-package-lock', '--legacy-peer-deps', tarball, ...fixture.deps],
      dir,
    );
    if (!install.ok) {
      failures.push(`${fixture.name}: install`);
      console.log(`  FAIL  install\n          ${install.out.split('\n').slice(-4).join('\n          ')}`);
      continue;
    }

    const esm = tryRun('node', ['--input-type=module', '-e', esmProbe(fixture.runtime)], dir);
    check(`${fixture.name}: import, render, subpaths`, () => assert(esm.ok, esm.out));
    const cjs = tryRun('node', ['-e', CJS_PROBE], dir);
    check(`${fixture.name}: require`, () => assert(cjs.ok, cjs.out));

    // Negative control: if removing a dependency the bundle needs does not break the import, the
    // fixture is resolving from somewhere else and every check above is meaningless.
    fs.rmSync(path.join(dir, 'node_modules', fixture.runtime), { recursive: true, force: true });
    const control = tryRun('node', ['--input-type=module', '-e', `await import('${PKG.name}')`], dir);
    check(`${fixture.name}: negative control`, () =>
      assert(!control.ok, `import still succeeded without ${fixture.runtime} installed`),
    );
  }

  fs.rmSync(work, { recursive: true, force: true });

  console.log('');
  for (const s of skipped) console.log(`skipped: ${s}`);
  if (failures.length > 0) {
    console.error(`\npackage smoke FAILED (${failures.length}): ${failures.join(', ')}`);
    process.exit(1);
  }
  console.log('package smoke passed');
};

main();
