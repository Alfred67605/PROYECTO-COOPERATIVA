/// <reference types="cypress" />

// ============================================================
// Módulo: Catálogo de Maquinaria
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Maquinaria - CRUD de Equipos Mineros', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/servicios/maquinaria');
  });

  context('Lista de Maquinaria', () => {
    it('Debe mostrar el título "Catálogo de Maquinaria"', () => {
      cy.contains('h2', 'Catálogo de Maquinaria').should('be.visible');
    });

    it('Debe mostrar la tabla con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Código / Nombre').should('be.visible');
        cy.contains('th', 'Tipo').should('be.visible');
        cy.contains('th', 'Marca / Modelo').should('be.visible');
        cy.contains('th', 'Horómetro').should('be.visible');
        cy.contains('th', 'Estado').should('be.visible');
      });
    });

    it('Debe mostrar badges de estado (OPERATIVA/EN MANTENIMIENTO/INACTIVA)', () => {
      cy.waitForTableLoad();
      cy.get('.badge').should('exist');
    });

    it('Debe mostrar el botón "Registrar Equipo"', () => {
      cy.contains('button', 'Registrar Equipo').should('be.visible');
    });
  });

  context('Crear Maquinaria', () => {
    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Registrar Equipo').click();
      cy.contains('h3', 'Nuevo Equipo').should('be.visible');
    });

    it('Debe mostrar todos los campos del formulario', () => {
      cy.contains('button', 'Registrar Equipo').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Nombre / Código').should('be.visible');
        cy.contains('Tipo').should('be.visible');
        cy.contains('Marca').should('be.visible');
        cy.contains('Modelo').should('be.visible');
        cy.contains('Horómetro').should('be.visible');
        cy.contains('Estado').should('be.visible');
      });
    });

    it('Debe crear una maquinaria con datos válidos', () => {
      cy.fixture('maquinaria').then((maq) => {
        cy.contains('button', 'Registrar Equipo').click();
        cy.get('.fixed.inset-0 .glass-panel').within(() => {
          cy.get('input').eq(0).clear().type(maq.nueva.nombre_codigo);
          cy.get('input').eq(1).clear().type(maq.nueva.tipo);
          cy.get('input').eq(2).clear().type(maq.nueva.marca);
          cy.get('input').eq(3).clear().type(maq.nueva.modelo);
          cy.contains('button', 'Guardar').click();
        });
        cy.contains('registrada', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Editar Maquinaria', () => {
    it('Debe abrir el modal con datos cargados', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Equipo').should('be.visible');
      cy.get('.fixed.inset-0 .glass-panel input').first().should('not.have.value', '');
    });
  });

  context('Eliminar Maquinaria', () => {
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

  context('Estados', () => {
    it('Debe tener las opciones de estado en el select: operativa, en_mantenimiento, inactiva', () => {
      cy.contains('button', 'Registrar Equipo').click();
      cy.get('.fixed.inset-0 .glass-panel select').first().within(() => {
        cy.get('option').should('have.length', 3);
        cy.contains('option', 'Operativa').should('exist');
        cy.contains('option', 'En Mantenimiento').should('exist');
        cy.contains('option', 'Inactiva').should('exist');
      });
    });
  });
});
