/// <reference types="cypress" />

// ============================================================
// Módulo: Servicios y Mantenimiento
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Servicios - Mantenimiento de Servicios', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/servicios/mantenimientos');
    cy.url({ timeout: 10000 }).should('include', '/servicios');
  });

  context('Navegación de Servicios', () => {
    it('Debe mostrar el título "Servicios y Mantenimiento"', () => {
      cy.contains('h1', 'Servicios y Mantenimiento').should('be.visible');
      cy.contains('Gestión integral de equipos y reparaciones').should('be.visible');
    });
  });

  context('Navegación Sub-rutas', () => {
    it('Debe navegar a la sección Maquinaria', () => {
      cy.contains('a', 'Maquinaria').click();
      cy.url().should('include', '/servicios/maquinaria');
      cy.contains('Catálogo de Maquinaria').should('be.visible');
    });

    it('Debe navegar a la sección Vehículos', () => {
      cy.contains('a', 'Vehículos').click();
      cy.url().should('include', '/servicios/vehiculos');
      cy.contains('Catálogo de Vehículos').should('be.visible');
    });

    it('Debe navegar a la sección Mantenimientos', () => {
      cy.contains('a', 'Mantenimientos').click();
      cy.url().should('include', '/servicios/mantenimientos');
      cy.contains('Historial de Mantenimientos').should('be.visible');
    });

    it('Debe navegar a la sección Inspecciones', () => {
      cy.contains('a', 'Inspecciones').click();
      cy.url().should('include', '/servicios/inspecciones');
      cy.contains('Registro de Inspecciones').should('be.visible');
    });
  });
});
