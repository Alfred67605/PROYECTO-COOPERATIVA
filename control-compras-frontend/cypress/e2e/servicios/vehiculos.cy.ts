/// <reference types="cypress" />

// ============================================================
// Módulo: Catálogo de Vehículos
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Vehículos - CRUD de Vehículos', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/servicios/vehiculos');
  });

  context('Lista de Vehículos', () => {
    it('Debe mostrar el título "Catálogo de Vehículos"', () => {
      cy.contains('h2', 'Catálogo de Vehículos').should('be.visible');
    });

    it('Debe mostrar la tabla con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Placa').should('be.visible');
        cy.contains('th', 'Tipo').should('be.visible');
        cy.contains('th', 'Marca / Modelo').should('be.visible');
        cy.contains('th', 'Estado').should('be.visible');
        cy.contains('th', 'Acciones').should('be.visible');
      });
    });

    it('Debe mostrar el botón "Registrar Vehículo"', () => {
      cy.contains('button', 'Registrar Vehículo').should('be.visible');
    });

    it('Debe mostrar badges de estado (OPERATIVO/EN MANTENIMIENTO/INACTIVO)', () => {
      cy.waitForTableLoad();
      cy.get('.badge').should('exist');
    });
  });

  context('Crear Vehículo', () => {
    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Registrar Vehículo').click();
      cy.contains('h3', 'Nuevo Vehículo').should('be.visible');
    });

    it('Debe crear un vehículo con datos válidos', () => {
      cy.fixture('vehiculos').then((veh) => {
        cy.contains('button', 'Registrar Vehículo').click();
        cy.get('.fixed.inset-0 .glass-panel').within(() => {
          cy.get('input').eq(0).clear().type(veh.nuevo.placa);
          cy.get('input').eq(1).clear().type(veh.nuevo.tipo);
          cy.get('input').eq(2).clear().type(veh.nuevo.marca);
          cy.get('input').eq(3).clear().type(veh.nuevo.modelo);
          cy.contains('button', 'Guardar').click();
        });
        cy.contains('registrado', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Editar Vehículo', () => {
    it('Debe abrir el modal de edición con datos cargados', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Vehículo').should('be.visible');
      cy.get('.fixed.inset-0 .glass-panel input').first().should('not.have.value', '');
    });
  });

  context('Eliminar Vehículo', () => {
    it('Debe mostrar diálogo de confirmación al eliminar', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('Eliminar').should('be.visible');
    });

    it('Debe poder cancelar la eliminación', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('button', 'Cancelar').click();
    });
  });

  context('Empty State', () => {
    it('Debe mostrar mensaje cuando no hay vehículos (mock)', () => {
      cy.intercept('GET', '**/api/user', {
        body: {
          id: 1,
          nombre: 'Admin Cooperativa',
          email: 'admin@cooperativa.com',
          rol: { nombre: 'Administrador General' }
        }
      });
      cy.intercept('GET', '**/api/vehiculos', { body: [] }).as('emptyVehiculos');
      cy.reload();
      cy.wait('@emptyVehiculos');
      cy.contains('No hay vehículos registrados').should('be.visible');
    });
  });
});
