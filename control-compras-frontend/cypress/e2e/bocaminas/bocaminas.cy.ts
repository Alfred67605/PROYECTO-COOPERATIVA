/// <reference types="cypress" />

// ============================================================
// Módulo: Gestión de Bocaminas
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Bocaminas - CRUD de Bocaminas', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/bocaminas');
  });

  context('Lista de Bocaminas', () => {
    it('Debe mostrar el título "Bocaminas"', () => {
      cy.contains('h1', 'Bocaminas').should('be.visible');
    });

    it('Debe mostrar la tabla con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Nombre').should('be.visible');
        cy.contains('th', 'Ubicación').should('be.visible');
        cy.contains('th', 'Estado').should('be.visible');
        cy.contains('th', 'Acciones').should('be.visible');
      });
    });

    it('Debe cargar al menos una bocamina en la lista', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('Debe mostrar badges de estado (Operativa/Inactiva)', () => {
      cy.waitForTableLoad();
      cy.get('.badge').should('exist');
    });
  });

  context('Crear Nueva Bocamina', () => {
    it('Debe mostrar el botón "Nueva Bocamina"', () => {
      cy.contains('button', 'Nueva Bocamina').should('be.visible');
    });

    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Nueva Bocamina').click();
      cy.contains('h3', 'Nueva Bocamina').should('be.visible');
    });

    it('Debe crear una bocamina con datos válidos', () => {
      cy.fixture('bocaminas').then((boc) => {
        cy.contains('button', 'Nueva Bocamina').click();

        cy.get('.fixed.inset-0 .glass-panel').within(() => {
          cy.get('input').eq(0).clear().type(boc.nueva.nombre);
          cy.get('input').eq(1).clear().type(boc.nueva.ubicacion);
          cy.contains('button', 'Guardar').click();
        });

        cy.contains('registrada', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Editar Bocamina', () => {
    it('Debe abrir el modal con datos cargados al editar', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Bocamina').should('be.visible');
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('input').first().should('not.have.value', '');
      });
    });

    it('Debe guardar cambios al editar una bocamina', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });

      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('input').eq(1).clear().type('Ubicación actualizada por Cypress');
        cy.contains('button', 'Guardar').click();
      });

      cy.contains('actualizada', { timeout: 10000 }).should('be.visible');
    });
  });

  context('Inhabilitar Bocamina', () => {
    it('Debe mostrar diálogo de confirmación al inhabilitar', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('Inhabilitar').should('be.visible');
    });

    it('Debe poder cancelar la inhabilitación', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('button', 'Cancelar').click();
    });
  });
});
