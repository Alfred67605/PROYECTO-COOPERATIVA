/// <reference types="cypress" />

// ============================================================
// Módulo: Alquiler de Grúas
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Alquiler de Grúas - CRUD de Servicios de Alquiler', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/servicios/alquiler-gruas');
  });

  context('Lista de Alquileres', () => {
    it('Debe mostrar el título "Servicios de Alquiler de Grúas"', () => {
      cy.contains('h2', 'Servicios de Alquiler de Grúas').should('be.visible');
    });

    it('Debe mostrar la tabla con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Grúa (Placa / Capacidad)').should('be.visible');
        cy.contains('th', 'Chófer Asignado').should('be.visible');
        cy.contains('th', 'Bocamina Destino').should('be.visible');
        cy.contains('th', 'Tiempo Trabajo').should('be.visible');
        cy.contains('th', 'Costo Estimado').should('be.visible');
        cy.contains('th', 'Acciones').should('be.visible');
      });
    });

    it('Debe mostrar el botón "Registrar Alquiler"', () => {
      cy.contains('button', 'Registrar Alquiler').should('be.visible');
    });
  });

  context('Crear Alquiler', () => {
    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Registrar Alquiler').click();
      cy.contains('h3', 'Nuevo Alquiler de Grúa').should('be.visible');
    });

    it('Debe mostrar todos los campos del formulario', () => {
      cy.contains('button', 'Registrar Alquiler').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Placa de la Grúa').should('be.visible');
        cy.contains('Capacidad de Carga').should('be.visible');
        cy.contains('Nombre del Chófer').should('be.visible');
        cy.contains('Bocamina Destino').should('be.visible');
        cy.contains('Tiempo de Trabajo').should('be.visible');
        cy.contains('Costo (Bs.)').should('be.visible');
      });
    });

    it('Debe tener un selector de bocamina con opciones', () => {
      cy.contains('button', 'Registrar Alquiler').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('select').find('option').should('have.length.greaterThan', 1);
      });
    });

    it('Debe crear un alquiler con datos válidos', () => {
      cy.fixture('alquileres').then((alq) => {
        cy.contains('button', 'Registrar Alquiler').click();
        cy.get('.fixed.inset-0 .glass-panel').within(() => {
          cy.get('input').eq(0).clear().type(alq.nuevo.placa_grua);
          cy.get('input').eq(1).clear().type(alq.nuevo.capacidad_carga);
          cy.get('input').eq(2).clear().type(alq.nuevo.nombre_chofer);
          cy.get('select').select(1); // First bocamina
          cy.get('input').eq(3).clear().type(alq.nuevo.tiempo_trabajo);
          cy.get('input[type="number"]').clear().type(alq.nuevo.costo);
          cy.contains('button', 'Guardar').click();
        });
        cy.contains('registrado', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Editar Alquiler', () => {
    it('Debe abrir el modal de edición con datos cargados', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Alquiler de Grúa').should('be.visible');
      cy.get('.fixed.inset-0 .glass-panel input').first().should('not.have.value', '');
    });
  });

  context('Eliminar Alquiler', () => {
    it('Debe mostrar diálogo de confirmación', () => {
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
    it('Debe mostrar mensaje cuando no hay alquileres (mock)', () => {
      cy.intercept('GET', '**/api/user', {
        body: {
          id: 1,
          nombre: 'Admin Cooperativa',
          email: 'admin@cooperativa.com',
          rol: { nombre: 'Administrador General' }
        }
      });
      cy.intercept('GET', '**/api/alquiler-gruas', { body: [] }).as('emptyAlq');
      cy.reload();
      cy.wait('@emptyAlq');
      cy.contains('No hay registros de alquiler de grúas').should('be.visible');
    });
  });
});
