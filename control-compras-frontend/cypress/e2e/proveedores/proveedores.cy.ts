/// <reference types="cypress" />

// ============================================================
// Módulo: Gestión de Proveedores
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Proveedores - CRUD de Proveedores', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/proveedores');
  });

  context('Lista de Proveedores', () => {
    it('Debe mostrar el título "Gestión de Proveedores"', () => {
      cy.contains('h1', 'Gestión de Proveedores').should('be.visible');
    });

    it('Debe mostrar la tabla con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Proveedor').should('be.visible');
        cy.contains('th', 'NIT').should('be.visible');
        cy.contains('th', 'Contacto').should('be.visible');
        cy.contains('th', 'Estado').should('be.visible');
        cy.contains('th', 'Acciones').should('be.visible');
      });
    });

    it('Debe cargar la lista de proveedores', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('Debe mostrar badges de estado (Activo/Inactivo)', () => {
      cy.waitForTableLoad();
      cy.get('table tbody').within(() => {
        cy.get('.badge').should('exist');
      });
    });
  });

  context('Crear Nuevo Proveedor', () => {
    it('Debe mostrar el botón "Registrar Proveedor"', () => {
      cy.contains('button', 'Registrar Proveedor').should('be.visible');
    });

    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Registrar Proveedor').click();
      cy.contains('h3', 'Nuevo Proveedor').should('be.visible');
    });

    it('Debe mostrar los campos obligatorios del formulario', () => {
      cy.contains('button', 'Registrar Proveedor').click();
      cy.contains('Nombre / Razón Social').should('be.visible');
      cy.contains('NIT / CI').should('be.visible');
      cy.contains('Teléfono').should('be.visible');
      cy.contains('Dirección').should('be.visible');
    });

    it('Debe crear un proveedor con datos válidos', () => {
      cy.fixture('proveedores').then((prov) => {
        cy.contains('button', 'Registrar Proveedor').click();

        cy.get('.fixed.inset-0 .glass-panel').within(() => {
          cy.get('input').eq(0).clear().type(prov.nuevo.nombre);
          cy.get('input').eq(1).clear().type(prov.nuevo.nit);
          cy.get('input').eq(2).clear().type(prov.nuevo.telefono);
          cy.get('input').eq(3).clear().type(prov.nuevo.direccion);
          cy.contains('button', 'Guardar').click();
        });

        cy.contains('registrado', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Editar Proveedor', () => {
    it('Debe abrir el modal de edición al hacer click en el ícono de edición', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Proveedor').should('be.visible');
    });

    it('Debe pre-cargar los datos del proveedor en el formulario', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('input').first().should('not.have.value', '');
      });
    });

    it('Debe guardar los cambios del proveedor editado', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });

      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('input').eq(2).clear().type('+591 70000001');
        cy.contains('button', 'Guardar').click();
      });

      cy.contains('actualizado', { timeout: 10000 }).should('be.visible');
    });
  });

  context('Inhabilitar Proveedor', () => {
    it('Debe mostrar el diálogo de confirmación al inhabilitar', () => {
      cy.waitForTableLoad();
      // Find the toggle/status button
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('Inhabilitar').should('be.visible');
    });
  });

  context('Logo del Proveedor', () => {
    it('Debe mostrar el área de carga de logo en el modal', () => {
      cy.contains('button', 'Registrar Proveedor').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Logo').should('be.visible');
      });
    });
  });

  context('Modal - Acciones', () => {
    it('Debe cerrar el modal con el botón X', () => {
      cy.contains('button', 'Registrar Proveedor').click();
      cy.contains('h3', 'Nuevo Proveedor').should('be.visible');
      cy.get('.fixed.inset-0 .glass-panel').find('button').filter(':has(svg)').first().click();
      cy.contains('h3', 'Nuevo Proveedor').should('not.exist');
    });

    it('Debe cerrar el modal con el botón Cancelar', () => {
      cy.contains('button', 'Registrar Proveedor').click();
      cy.get('.fixed.inset-0 .glass-panel').contains('button', 'Cancelar').click();
      cy.contains('h3', 'Nuevo Proveedor').should('not.exist');
    });
  });
});
