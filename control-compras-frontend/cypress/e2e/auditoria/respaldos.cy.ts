/// <reference types="cypress" />

describe('Respaldos - Gestión de Copias de Seguridad', () => {
  beforeEach(() => {
    // Reset database to ensure clean state
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/api/logout',
      failOnStderr: false,
      failOnStatusCode: false
    });
  });

  context('Acceso Administrador General', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        cy.loginManually(users.admin.email, users.admin.password);
      });
      cy.visit('/admin/respaldos');
    });

    it('Debe cargar y mostrar la interfaz de respaldos con sus tarjetas de estado', () => {
      cy.contains('h1', 'Copias de Seguridad (Backups)').should('be.visible');
      cy.contains('Espacio en Backups').should('be.visible');
      cy.contains('Política de Retención GFS').should('be.visible');
      cy.contains('Programación Periódica').should('be.visible');
    });

    it('Debe generar un respaldo manual correctamente al hacer clic en el botón', () => {
      cy.contains('button', 'Generar Respaldo Ahora').click();
      cy.contains('Copia de seguridad generada con éxito', { timeout: 25000 }).should('be.visible');
      cy.waitForTableLoad();
      cy.get('table tbody').within(() => {
        cy.contains('Manual').should('be.visible');
        cy.contains('Completado').should('be.visible');
        cy.contains('Admin Cooperativa').should('be.visible');
      });
    });
  });

  context('Acceso Restringido para otros roles', () => {
    it('Debe denegar acceso a usuarios con rol Compras', () => {
      cy.loginManually('juantorrez@cooperativa.com', 'Password123!');
      cy.visit('/admin/respaldos');
      cy.url().should('include', '/dashboard');
    });
  });
});
