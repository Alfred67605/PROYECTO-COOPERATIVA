/// <reference types="cypress" />

// ============================================================
// Módulo: Dashboard Principal
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Dashboard - Resumen Ejecutivo', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
  });

  context('Encabezado y Estructura', () => {
    it('Debe mostrar el título "Resumen Ejecutivo"', () => {
      cy.contains('h1', 'Resumen Ejecutivo').should('be.visible');
      cy.contains('Métricas y KPIs del año').should('be.visible');
    });
  });

  context('KPI Cards', () => {
    it('Debe mostrar las 3 tarjetas de KPI', () => {
      cy.contains('Inversión Total').should('be.visible');
      cy.contains('Operaciones').should('be.visible');
      cy.contains('Proveedores Activos').should('be.visible');
    });

    it('Debe mostrar valores numéricos en las KPI cards', () => {
      // Wait for data to load (skeletons disappear)
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      // Check that the KPI values are displayed (numbers)
      cy.contains('Inversión Total').parent().parent()
        .find('h3').should('exist');
    });

    it('Debe mostrar indicadores de tendencia', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.contains('vs mes anterior').should('be.visible');
    });
  });

  context('Gráficos', () => {
    it('Debe mostrar el gráfico de Tendencia de Gastos', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.contains('Tendencia de Gastos').should('be.visible');
      cy.contains('Histórico').should('be.visible');
      // Recharts renders SVG
      cy.get('.recharts-wrapper').should('exist');
    });

    it('Debe mostrar la sección de Compras Recientes', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.contains('Compras Recientes').should('be.visible');
      cy.contains('Ver todas').should('be.visible');
    });

    it('Debe mostrar el gráfico de Distribución por Bocamina', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.contains('Distribución de Gastos por Bocamina').should('be.visible');
    });

    it('Debe tener selectores de granularidad y año', () => {
      cy.contains('button', 'Mensual').should('exist');
      cy.contains('button', 'Diario').should('exist');
      cy.get('select').should('exist');
    });
  });

  context('Loading States', () => {
    it('Debe mostrar skeletons durante la carga', () => {
      cy.intercept('GET', '**/api/reportes/dashboard*', (req) => {
        req.on('response', (res) => {
          res.setDelay(2000);
        });
      }).as('slowDashboard');

      cy.visit('/dashboard');
      // Should show skeleton KPI cards while loading
      cy.get('.animate-pulse').should('exist');
    });
  });
});
