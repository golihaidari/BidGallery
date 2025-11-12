const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
     supportFile: 'cypress/support/e2e.js',
    experimentalStudio: true,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  env: {
    apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:8080'
  }
});
