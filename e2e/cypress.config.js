const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalStudio: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    supportFile: false,
  },
  env: {
    apiUrl: 'http://localhost:8080'
  }
});
