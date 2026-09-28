import { defineConfig } from 'react-doctor/api';

export default defineConfig({
  blocking: 'warning',
  supplyChain: { enabled: false },
  ignore: {
    overrides: [
      {
        // These effects do disconnect their observers — the rule cannot trace `observe()` through a nested helper.
        files: ['src/components/skeleton/skeleton.tsx', 'src/hooks/use-overflow-detection.ts'],
        rules: ['react-doctor/effect-needs-cleanup'],
      },
    ],
  },
  rules: {
    // Off: `onDblClick` is the deliberate Preact/React dual handler, and oxlint's
    // `react/no-unknown-property` in vite.config.ts already covers every other prop.
    'react-doctor/no-unknown-property': 'off',
    // Off for the same reason as `jsx-a11y/prefer-tag-over-role` in vite.config.ts.
    'react-doctor/prefer-tag-over-role': 'off',
    // Off: every hit is over a handful of elements, so a Set buys nothing.
    'react-doctor/js-set-map-lookups': 'off',
  },
  surfaces: {
    // Real findings deferred to their own work: reported by `pnpm check:react`, but they don't fail CI.
    ciFailure: {
      excludeRules: [
        // Same sites as the React Compiler lints left off in vite.config.ts.
        'react-doctor/no-ref-current-in-render',
        'react-doctor/no-adjust-state-on-prop-change',
        'react-doctor/no-derived-state',
        'react-doctor/no-reset-all-state-on-prop-change',
        'react-doctor/rendering-hydration-no-flicker',
        // Refactors that need their own issues.
        'react-doctor/no-giant-component',
        'react-doctor/no-high-complexity-react-function',
        'react-doctor/no-pass-live-state-to-parent',
        'react-doctor/no-pass-data-to-parent',
        'react-doctor/no-prop-callback-in-effect',
        // Date/time picker popovers: native `<dialog>` behaviour needs verifying before any swap.
        'react-doctor/prefer-html-dialog',
      ],
    },
  },
});
