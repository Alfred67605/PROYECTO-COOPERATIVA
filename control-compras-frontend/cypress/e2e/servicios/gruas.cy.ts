/// <reference types="cypress" />

// ============================================================
// Módulo: Catálogo de Grúas
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Grúas - CRUD de Grúas', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/servicios/gruas');
  });

  context('Lista de Grúas', () => {
    it('Debe mostrar el título "Catálogo de Grúas"', () => {
      cy.contains('h2', 'Catálogo de Grúas').should('be.visible');
    });

    it('Debe mostrar la tabla con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Código').should('be.visible');
        cy.contains('th', 'Tipo').should('be.visible');
        cy.contains('th', 'Capacidad Carga').should('be.visible');
        cy.contains('th', 'Estado').should('be.visible');
        cy.contains('th', 'Acciones').should('be.visible');
      });
    });

    it('Debe mostrar el botón "Registrar Grúa"', () => {
      cy.contains('button', 'Registrar Grúa').should('be.visible');
    });
  });

  context('Crear Grúa', () => {
    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Registrar Grúa').click();
      cy.contains('h3', 'Nueva Grúa').should('be.visible');
    });

    it('Debe mostrar campos del formulario', () => {
      cy.contains('button', 'Registrar Grúa').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Código').should('be.visible');
        cy.contains('Tipo').should('be.visible');
        cy.contains('Capacidad de Carga').should('be.visible');
        cy.contains('Estado').should('be.visible');
      });
    });

    it('Debe crear una grúa con datos válidos', () => {
      cy.fixture('gruas').then((grua) => {
        cy.contains('button', 'Registrar Grúa').click();
        cy.get('.fixed.inset-0 .glass-panel').within(() => {
          cy.get('input').eq(0).clear().type(grua.nueva.codigo);
          cy.get('input').eq(1).clear().type(grua.nueva.tipo);
          cy.get('input[type="number"]').clear().type(grua.nueva.capacidad_carga.toString());
          cy.contains('button', 'Guardar').click();
        });
        cy.contains('registrada', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Editar Grúa', () => {
    it('Debe abrir el modal de edición con datos', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Grúa').should('be.visible');
    });
  });

  context('Eliminar Grúa', () => {
    it('Debe mostrar diálogo de confirmación', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('Eliminar').should('be.visible');
    });
  });

  context('Empty State', () => {
    it('Debe mostrar mensaje cuando no hay grúas registradas (mock)', () => {
      cy.intercept('GET', '**/api/user', {
        body: {
          id: 1,
          nombre: 'Admin Cooperativa',
          email: 'admin@cooperativa.com',
          rol: { nombre: 'Administrador General' }
        }
      });
      cy.intercept('GET', '**/api/gruas', { body: [] }).as('emptyGruas');
      cy.reload();
      cy.wait('@emptyGruas');
      cy.contains('No hay grúas registradas').should('be.visible');
    });
  });
});
