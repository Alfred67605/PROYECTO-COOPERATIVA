/// <reference types="cypress" />

// ============================================================
// Módulo: Gestión de Usuarios
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Usuarios - Gestión de Usuarios y Roles', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/usuarios');
  });

  context('Lista de Usuarios', () => {
    it('Debe mostrar el título "Gestión de Usuarios"', () => {
      cy.contains('h1', 'Gestión de Usuarios').should('be.visible');
    });

    it('Debe mostrar la tabla de usuarios con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Usuario').should('be.visible');
        cy.contains('th', 'Rol').should('be.visible');
        cy.contains('th', 'Estado').should('be.visible');
        cy.contains('th', 'Acciones').should('be.visible');
      });
    });

    it('Debe mostrar al menos un usuario en la lista', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('Debe mostrar badges de rol para cada usuario', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('.badge').should('exist');
      });
    });

    it('Debe mostrar el estado (Activo/Inactivo) de cada usuario', () => {
      cy.waitForTableLoad();
      cy.get('table tbody').within(() => {
        cy.get('.badge').should('exist');
      });
    });
  });

  context('Crear Nuevo Usuario', () => {
    it('Debe mostrar el botón "Nuevo Usuario"', () => {
      cy.contains('button', 'Nuevo Usuario').should('be.visible');
    });

    it('Debe abrir el modal al hacer click en "Nuevo Usuario"', () => {
      cy.contains('button', 'Nuevo Usuario').click();
      cy.contains('h3', 'Nuevo Usuario').should('be.visible');
    });

    it('Debe mostrar todos los campos del formulario', () => {
      cy.contains('button', 'Nuevo Usuario').click();
      cy.contains('Nombre Completo').should('be.visible');
      cy.contains('Correo Electrónico').should('be.visible');
      cy.contains('Contraseña').should('be.visible');
      cy.contains('Rol del Sistema').should('be.visible');
    });

    it('Debe crear un usuario con datos válidos', () => {
      cy.fixture('users').then((users) => {
        const uniqueEmail = `cypress.test.${Date.now()}@cooperativaminera.com`;
        cy.contains('button', 'Nuevo Usuario').click();

        cy.get('.fixed.inset-0 .glass-panel').within(() => {
          cy.get('input').eq(0).clear().type(users.newUser.nombre);
          cy.get('input[type="email"]').clear().type(uniqueEmail);
          cy.get('input[type="password"]').clear().type(users.newUser.password);
          cy.get('select').first().select(users.newUser.rol);
          cy.contains('button', 'Guardar').click();
        });

        // Should show success toast (title = 'Usuario creado')
        cy.contains('Usuario creado', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Editar Usuario', () => {
    it('Debe abrir el modal de edición al hacer click en el botón editar', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Usuario').should('be.visible');
    });

    it('Debe cargar los datos existentes en el formulario de edición', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('input').first().should('not.have.value', '');
      });
    });
  });

  context('Inhabilitar Usuario', () => {
    it('Debe mostrar diálogo de confirmación al intentar inhabilitar', () => {
      cy.waitForTableLoad();
      // Click the toggle/disable button (second action button)
      cy.get('table tbody tr').eq(1).within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('Inhabilitar').should('be.visible');
    });

    it('Debe poder cancelar la inhabilitación', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').eq(1).within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('button', 'Cancelar').click();
      // Modal should close
      cy.contains('¿Estás seguro').should('not.exist');
    });
  });

  context('Acceso a Módulos y Permisos', () => {
    it('Debe mostrar el panel "Acceso a Módulos" al crear usuario', () => {
      cy.contains('button', 'Nuevo Usuario').click();
      cy.contains('Acceso a Módulos').should('be.visible');
    });

    it('Debe cambiar los permisos según el rol seleccionado', () => {
      cy.contains('button', 'Nuevo Usuario').click();
      // Select a specific role
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('select').first().select('Compras');
      });
      cy.contains('Acceso a Módulos').should('be.visible');
    });

    it('Debe mostrar "Acceso total a todos los módulos" para rol Administrador', () => {
      cy.contains('button', 'Nuevo Usuario').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('select').first().select('Administrador General');
      });
      cy.contains('Acceso total a todos los módulos').should('be.visible');
    });
  });

  context('Cerrar Modal', () => {
    it('Debe cerrar el modal al hacer click en la X', () => {
      cy.contains('button', 'Nuevo Usuario').click();
      cy.contains('h3', 'Nuevo Usuario').should('be.visible');
      cy.get('.fixed.inset-0 .glass-panel').find('button').filter(':has(svg)').first().click();
      cy.contains('h3', 'Nuevo Usuario').should('not.exist');
    });

    it('Debe cerrar el modal al hacer click en "Cancelar"', () => {
      cy.contains('button', 'Nuevo Usuario').click();
      cy.contains('h3', 'Nuevo Usuario').should('be.visible');
      cy.get('.fixed.inset-0 .glass-panel').contains('button', 'Cancelar').click();
      cy.contains('h3', 'Nuevo Usuario').should('not.exist');
    });
  });
});
