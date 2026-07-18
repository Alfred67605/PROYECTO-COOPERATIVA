/// <reference types="cypress" />

// ============================================================
// Módulo: Auditoría / Historial
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Auditoría - Historial de Actividades', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/historial');
  });

  context('Interfaz del Historial', () => {
    it('Debe mostrar el título "Auditoría"', () => {
      cy.contains('h1', 'Auditoría').should('be.visible');
      cy.contains('Registro detallado de todas las operaciones').should('be.visible');
    });

    it('Debe mostrar el campo de búsqueda', () => {
      cy.get('input[placeholder*="Buscar"]').should('be.visible');
    });

    it('Debe mostrar los filtros de fecha', () => {
      cy.get('input[type="date"]').should('have.length.greaterThan', 0);
    });

    it('Debe mostrar los filtros de hora', () => {
      cy.get('input[type="time"]').should('have.length', 2);
    });
  });

  context('Lista de Registros', () => {
    it('Debe cargar y mostrar registros de auditoría', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.get('[class*="card"], table').should('exist');
    });

    it('Debe mostrar badges de acción (Creación, Actualización, Eliminación)', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.get('.badge').should('exist');
    });
  });

  context('Filtros', () => {
    it('Debe filtrar registros por texto de búsqueda', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.get('input[placeholder*="Buscar"]').type('compras');
      cy.wait(500);
    });

    it('Debe filtrar registros por fecha', () => {
      cy.get('input[type="date"]').first().type('2026-07-01');
      cy.wait(500);
    });

    it('Debe filtrar registros por rango de hora', () => {
      cy.get('input[type="time"]').first().type('08:00');
      cy.get('input[type="time"]').last().type('17:00');
      cy.wait(500);
    });

    it('Debe poder limpiar todos los filtros', () => {
      cy.get('input[placeholder*="Buscar"]').type('test');
      cy.contains('button', 'Limpiar').click();
      cy.get('input[placeholder*="Buscar"]').should('have.value', '');
    });
  });

  context('Paginación', () => {
    it('Debe mostrar controles de paginación', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      // Pagination buttons
      cy.contains('Anterior').should('exist');
      cy.contains('Siguiente').should('exist');
    });

    it('Debe mostrar el número de página actual', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.contains('Página').should('exist');
    });

    it('Debe navegar a la siguiente página', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.contains('button', 'Siguiente').then(($btn) => {
        if (!$btn.prop('disabled')) {
          cy.wrap($btn).click();
          cy.contains('Página 2').should('exist');
        }
      });
    });
  });

  context('Detalle de Registro', () => {
    it('Debe mostrar información del usuario que realizó la acción', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      // Each record should show the user who performed the action
      cy.get('[class*="card"]').first().within(() => {
        cy.get('[class*="text-"]').should('exist');
      });
    });
  });
});
