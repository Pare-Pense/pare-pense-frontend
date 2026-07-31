import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,
  experimentalRunAllSpecs: true,
  e2e: {
    viewportWidth: 440,
    viewportHeight: 850,
  },
});
