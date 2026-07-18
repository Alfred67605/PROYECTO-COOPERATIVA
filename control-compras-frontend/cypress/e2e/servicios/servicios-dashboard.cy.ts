/// <reference types="cypress" />

// ============================================================
// Módulo: Dashboard de Servicios y Mantenimiento
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Servicios - Dashboard de Servicios', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.get('nav').contains('Servicios').click();
  });

  context('Dashboard KPIs', () => {
    it('Debe mostrar el título "Servicios y Mantenimiento"', () => {
      cy.contains('h1', 'Servicios y Mantenimiento').should('be.visible');
      cy.contains('Gestión integral de equipos y reparaciones').should('be.visible');
    });

    it('Debe mostrar las 4 tarjetas KPI', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.contains('Equipos Activos').should('be.visible');
      cy.contains('En Reparación').should('be.visible');
      cy.contains('Servicios (Mes)').should('be.visible');
      cy.contains('Costos Acumulados').should('be.visible');
    });

    it('Debe mostrar valores numéricos en los KPIs', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.contains('Equipos Activos').parent().parent()
        .find('.text-2xl').should('exist');
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
