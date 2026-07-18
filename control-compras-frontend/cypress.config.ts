import { defineConfig } from 'cypress';
import runReportPlugin from 'cypress-mochawesome-reporter/plugin';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Media
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    downloadsFolder: 'cypress/downloads',
    
    // Retries
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Security - needed for Sanctum cookie-based auth (cross-origin)
    chromeWebSecurity: false,
    
    // Reporter
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      charts: true,
      reportPageTitle: 'Cooperativa Minera - Reporte de Pruebas E2E',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      overwrite: false,
      html: true,
      json: true,
    },
    
    setupNodeEvents(on, config) {
      runReportPlugin(on);
      return config;
    },
  },
});
