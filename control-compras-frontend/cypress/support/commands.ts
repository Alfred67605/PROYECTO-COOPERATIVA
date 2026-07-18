/// <reference types="cypress" />

// ============================================================
// Custom Commands - Cooperativa Minera E2E Test Suite
// Metodología: Verificación y Validación de Software (INF780)
// ============================================================

const API_URL = Cypress.env('API_URL') || 'http://localhost:8000';

// ─── Authentication Commands ─────────────────────────────────

/**
 * Login via API — Fast login that bypasses the UI.
 * Obtains CSRF cookie then posts credentials directly.
 */
Cypress.Commands.add('loginByAPI', (email: string, password: string) => {
  // 1. Get CSRF cookie
  cy.request({
    method: 'GET',
    url: `${API_URL}/sanctum/csrf-cookie`,
    failOnStatusCode: false,
  });

  // 2. Login
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/login`,
    body: { email, password },
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('user');
  });
});

Cypress.Commands.add('loginByUI', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password);
    cy.contains('Iniciar Sesión Segura').click();
    cy.url().should('include', '/dashboard');
  }, {
    validate() {
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
    }
  });
});

/**
 * Logout via sidebar button.
 */
Cypress.Commands.add('logout', () => {
  cy.contains('Cerrar Sesión').click();
  cy.url().should('include', '/login');
});

// ─── API Interception Commands ───────────────────────────────

/**
 * Smart wrapper over cy.intercept() for API calls.
 * Automatically prepends /api/ and handles aliases.
 */
Cypress.Commands.add(
  'interceptAPI',
  (method: string, url: string, fixture?: string, alias?: string) => {
    const fullUrl = `${API_URL}/api${url}`;
    const interceptAlias = alias || url.replace(/\//g, '-').replace(/^-/, '');

    if (fixture) {
      cy.intercept(method, fullUrl, { fixture }).as(interceptAlias);
    } else {
      cy.intercept(method, fullUrl).as(interceptAlias);
    }
  }
);

// ─── UI Interaction Commands ─────────────────────────────────

/**
 * Find element containing specific text.
 */
Cypress.Commands.add('getByText', (text: string) => {
  return cy.contains(text);
});

/**
 * Open a CRUD modal by clicking a button with the specified text.
 */
Cypress.Commands.add('openModal', (buttonText: string) => {
  cy.contains('button', buttonText).click();
  // Wait for modal animation
  cy.get('.fixed.inset-0 .glass-panel').should('be.visible');
});

/**
 * Close the currently open modal by clicking the X button.
 */
Cypress.Commands.add('closeModal', () => {
  cy.get('.fixed.inset-0 .glass-panel').find('button').filter(':has(svg)').first().click();
  cy.get('.fixed.inset-0 .glass-panel').should('not.exist');
});

/**
 * Confirm a ConfirmDialog by clicking the confirm button.
 */
Cypress.Commands.add('confirmDialog', () => {
  // The ConfirmDialog uses a portal, so we look in the body
  cy.get('body').find('[class*="fixed"]').last()
    .find('button')
    .filter((_, el) => {
      const text = el.textContent || '';
      return text.includes('Inhabilitar') || text.includes('Eliminar') || text.includes('Aceptar');
    })
    .first()
    .click();
});

/**
 * Cancel a ConfirmDialog.
 */
Cypress.Commands.add('cancelDialog', () => {
  cy.get('body').find('[class*="fixed"]').last()
    .contains('button', 'Cancelar')
    .click();
});

/**
 * Wait for skeleton/loading to disappear and table to be rendered.
 */
Cypress.Commands.add('waitForTableLoad', () => {
  // Wait for skeleton pulse animation to be gone
  cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
  // Ensure the table is visible
  cy.get('table', { timeout: 5000 }).should('be.visible');
});

/**
 * Verify that a toast notification appeared.
 */
Cypress.Commands.add('checkToast', (type: string, title: string) => {
  // Toast component renders in a fixed container
  cy.contains(title, { timeout: 5000 }).should('be.visible');
});

/**
 * Fill an input field identified by its label text.
 */
Cypress.Commands.add('fillInput', (labelText: string, value: string) => {
  cy.contains('label', labelText, { matchCase: false })
    .parent()
    .find('input, textarea, select')
    .first()
    .clear()
    .type(value);
});

/**
 * Select a dropdown option identified by its label text.
 */
Cypress.Commands.add('selectOption', (labelText: string, value: string) => {
  cy.contains('label', labelText, { matchCase: false })
    .parent()
    .find('select')
    .first()
    .select(value);
});
