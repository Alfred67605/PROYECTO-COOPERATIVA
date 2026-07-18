/// <reference types="cypress" />
import './commands';

// ============================================================
// Global E2E Support - Cooperativa Minera
// ============================================================

// Prevent uncaught exceptions from failing tests
// (React/Framer Motion may throw during animations)
Cypress.on('uncaught:exception', (err) => {
  // Ignore ResizeObserver errors (common with responsive layouts)
  if (err.message.includes('ResizeObserver')) return false;
  // Ignore chunk loading errors (Vite HMR)
  if (err.message.includes('Failed to fetch dynamically imported module')) return false;
  if (err.message.includes('Loading chunk')) return false;
  // Let other errors fail the test
  return true;
});

// Before each test, clear any stale state
beforeEach(() => {
  // Log fetch/XHR requests to debug timing/empty state issues
  cy.intercept({ resourceType: /xhr|fetch/ }, { log: true }).as('xhrRequests');
});
