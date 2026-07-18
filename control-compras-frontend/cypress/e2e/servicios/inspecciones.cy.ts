/// <reference types="cypress" />

// ============================================================
// Módulo: Inspecciones Pre-Operacionales
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Inspecciones - Registro de Inspecciones Pre-Operacionales', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/servicios/inspecciones');
  });

  context('Lista de Inspecciones', () => {
    it('Debe mostrar el título "Registro de Inspecciones Pre-Operacionales"', () => {
      cy.contains('h2', 'Registro de Inspecciones Pre-Operacionales').should('be.visible');
    });

    it('Debe mostrar la tabla con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Fecha').should('be.visible');
        cy.contains('th', 'Equipo').should('be.visible');
        cy.contains('th', 'Responsable').should('be.visible');
        cy.contains('th', 'Estado Checklist').should('be.visible');
        cy.contains('th', 'Acciones').should('be.visible');
      });
    });

    it('Debe mostrar el botón "Nueva Inspección"', () => {
      cy.contains('button', 'Nueva Inspección').should('be.visible');
    });

    it('Debe mostrar badges de "Aprobado" o "Con Novedades"', () => {
      cy.waitForTableLoad();
      cy.get('.badge').should('exist');
    });
  });

  context('Crear Inspección', () => {
    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Nueva Inspección').click();
      cy.contains('h3', 'Nueva Inspección').should('be.visible');
    });

    it('Debe mostrar el selector de Tipo de Equipo y Equipo', () => {
      cy.contains('button', 'Nueva Inspección').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Tipo de Equipo').should('be.visible');
        cy.contains('Equipo').should('be.visible');
      });
    });

    it('Debe mostrar el checklist de 6 ítems', () => {
      cy.contains('button', 'Nueva Inspección').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Checklist de Revisión').should('be.visible');
        cy.contains('motor OK').should('be.visible');
        cy.contains('frenos OK').should('be.visible');
        cy.contains('aceite OK').should('be.visible');
        cy.contains('Neumáticos OK').should('be.visible');
        cy.contains('luces OK').should('be.visible');
        cy.contains('seguridad OK').should('be.visible');
      });
    });

    it('Debe tener todos los checkboxes marcados por defecto', () => {
      cy.contains('button', 'Nueva Inspección').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('input[type="checkbox"]').each(($cb) => {
          cy.wrap($cb).should('be.checked');
        });
      });
    });

    it('Debe poder desmarcar un checkbox del checklist', () => {
      cy.contains('button', 'Nueva Inspección').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('input[type="checkbox"]').first().uncheck();
        cy.get('input[type="checkbox"]').first().should('not.be.checked');
      });
    });

    it('Debe mostrar el campo de Observaciones', () => {
      cy.contains('button', 'Nueva Inspección').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Observaciones').should('be.visible');
        cy.get('textarea').should('be.visible');
      });
    });

    it('Debe crear una inspección con datos válidos', () => {
      cy.contains('button', 'Nueva Inspección').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        // Select equipo
        cy.get('select').eq(1).select(1);
        // Add observation
        cy.get('textarea').type('Inspección de rutina - Cypress test');
        cy.contains('button', 'Guardar').click();
      });
      cy.contains('registrada', { timeout: 10000 }).should('be.visible');
    });
  });

  context('Editar Inspección', () => {
    it('Debe abrir el modal de edición', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Inspección').should('be.visible');
    });
  });

  context('Eliminar Inspección', () => {
    it('Debe mostrar diálogo de confirmación', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('Eliminar').should('be.visible');
    });
  });

  context('Empty State', () => {
    it('Debe mostrar mensaje cuando no hay inspecciones (mock)', () => {
      cy.intercept('GET', '**/api/user', {
        body: {
          id: 1,
          nombre: 'Admin Cooperativa',
          email: 'admin@cooperativa.com',
          rol: { nombre: 'Administrador General' }
        }
      });
      cy.intercept('GET', '**/api/inspecciones', { body: [] }).as('emptyInsp');
      cy.reload();
      cy.wait('@emptyInsp');
      cy.contains('No hay inspecciones registradas').should('be.visible');
    });
  });
});
