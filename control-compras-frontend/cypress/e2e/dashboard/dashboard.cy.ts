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
    cy.url().should('include', '/dashboard');
  });

  context('Encabezado y Estructura', () => {
    it('Debe mostrar el título "Resumen Ejecutivo"', () => {
      cy.contains('h1', 'Resumen Ejecutivo').should('be.visible');
      cy.contains('Métricas y KPIs del mes actual').should('be.visible');
    });

    it('Debe mostrar los botones de exportar PDF y Excel', () => {
      cy.contains('button', 'PDF').should('be.visible');
      cy.contains('button', 'Excel').should('be.visible');
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
      cy.contains('Histórico de los últimos 7 meses').should('be.visible');
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

    it('Debe tener un selector de periodo (Este año / Año pasado)', () => {
      cy.get('select').contains('Este año').should('exist');
    });
  });

  context('Exportar Reportes desde Dashboard', () => {
    it('Debe poder hacer click en el botón PDF sin errores', () => {
      cy.intercept('GET', '**/api/reportes/exportar/pdf*', {
        statusCode: 200,
        headers: { 'content-type': 'application/pdf' },
        body: new Blob(['PDF content'], { type: 'application/pdf' })
      }).as('exportPdf');

      cy.contains('button', 'PDF').click();
      // Button should show loading state
      cy.get('.animate-spin').should('be.visible');
    });

    it('Debe poder hacer click en el botón Excel sin errores', () => {
      cy.intercept('GET', '**/api/reportes/exportar/excel*', {
        statusCode: 200,
        headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        body: new Blob(['Excel content'])
      }).as('exportExcel');

      cy.contains('button', 'Excel').click();
      cy.get('.animate-spin').should('be.visible');
    });
  });

  context('Loading States', () => {
    it('Debe mostrar skeletons durante la carga', () => {
      cy.intercept('GET', '**/api/reportes/dashboard', (req) => {
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
