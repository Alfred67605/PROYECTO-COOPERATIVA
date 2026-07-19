/// <reference types="cypress" />

// ============================================================
// Módulo: Reportes
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Reportes - Generación y Exportación de Reportes', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/reportes');
  });

  context('Interfaz de Reportes', () => {
    it('Debe mostrar el título "Reporte de Compras"', () => {
      cy.contains('h1', 'Reporte de Compras').should('be.visible');
    });

    it('Debe mostrar los filtros de fecha inicio y fin', () => {
      cy.get('input[type="date"]').should('have.length', 2);
    });

    it('Debe mostrar el selector de bocamina', () => {
      cy.get('select').should('exist');
    });

    it('Debe mostrar los botones de rango rápido', () => {
      cy.contains('button', 'Diario').should('be.visible');
      cy.contains('button', 'Semanal').should('be.visible');
      cy.contains('button', 'Mensual').should('be.visible');
    });

    it('Debe tener fechas iniciales del mes actual', () => {
      const now = new Date();
      const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      cy.get('input[type="date"]').first().should('have.value', firstDay);
    });
  });

  context('Filtros de Fecha', () => {
    it('Debe actualizar las fechas al hacer click en "Diario"', () => {
      cy.contains('button', 'Diario').click();
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input[type="date"]').first().should('have.value', todayStr);
      cy.get('input[type="date"]').last().should('have.value', todayStr);
    });

    it('Debe actualizar las fechas al hacer click en "Semanal"', () => {
      cy.contains('button', 'Semanal').click();
      cy.get('input[type="date"]').first().invoke('val').should('not.be.empty');
      cy.get('input[type="date"]').last().invoke('val').should('not.be.empty');
    });

    it('Debe actualizar las fechas al hacer click en "Mensual"', () => {
      cy.contains('button', 'Mensual').click();
      cy.get('input[type="date"]').first().invoke('val').should('not.be.empty');
    });

    it('Debe poder seleccionar una bocamina del filtro', () => {
      cy.get('select').first().find('option').should('have.length.greaterThan', 0);
    });

    it('Debe poder seleccionar el tipo de reporte (Solo Servicios, Solo Compras, Todos)', () => {
      cy.get('select').last().select('servicios');
      cy.contains('h1', 'Reporte de Servicios').should('be.visible');

      cy.get('select').last().select('compras');
      cy.contains('h1', 'Reporte de Compras').should('be.visible');

      cy.get('select').last().select('todos');
      cy.contains('h1', 'Reporte de Compras y Servicios').should('be.visible');
    });
  });

  context('Datos del Reporte', () => {
    it('Debe mostrar KPI cards con datos del reporte', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.get('[class*="card"]').should('have.length.greaterThan', 0);
    });

    it('Debe mostrar un gráfico de barras', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.get('.recharts-wrapper', { timeout: 10000 }).should('exist');
    });
  });

  context('Exportar Reportes', () => {
    it('Debe mostrar botones de exportar PDF y Excel', () => {
      cy.contains('button', 'PDF').should('be.visible');
      cy.contains('button', 'Excel').should('be.visible');
    });

    it('Debe iniciar la descarga de PDF al hacer click', () => {
      cy.intercept('GET', '**/api/reportes/exportar/pdf*', {
        statusCode: 200,
        headers: { 'content-type': 'application/pdf' },
        body: 'PDF binary content'
      }).as('downloadPdf');

      cy.contains('button', 'PDF').click();
      cy.wait('@downloadPdf');
    });

    it('Debe iniciar la descarga de Excel al hacer click', () => {
      cy.intercept('GET', '**/api/reportes/exportar/excel*', {
        statusCode: 200,
        headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        body: 'Excel binary content'
      }).as('downloadExcel');

      cy.contains('button', 'Excel').click();
      cy.wait('@downloadExcel');
    });
  });

  context('Error Handling', () => {
    it('Debe manejar errores del API correctamente', () => {
      cy.intercept('GET', '**/api/reportes/generar*', {
        statusCode: 500,
        body: { message: 'Error interno del servidor' }
      }).as('errorReporte');

      cy.visit('/reportes');
      cy.wait('@errorReporte');
      // Should show error UI or retry button
      cy.contains('Reintentar').should('be.visible');
    });
  });
});
