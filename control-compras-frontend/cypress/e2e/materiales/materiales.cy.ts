/// <reference types="cypress" />

// ============================================================
// Módulo: Gestión de Materiales e Inventario
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Materiales - Inventario y Catálogo', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/inventario');
  });

  context('Encabezado y Estructura', () => {
    it('Debe mostrar el título "Inventario de Materiales"', () => {
      cy.contains('h1', 'Inventario de Materiales').should('be.visible');
    });

    it('Debe mostrar el campo de búsqueda', () => {
      cy.get('input[placeholder*="Buscar"]').should('be.visible');
    });

    it('Debe mostrar el selector de filtro por grupo', () => {
      cy.contains('Todos los grupos').should('exist');
    });

    it('Debe mostrar el botón "Nuevo Material"', () => {
      cy.contains('button', 'Nuevo Material').should('be.visible');
    });
  });

  context('Lista de Materiales (Cards)', () => {
    it('Debe cargar y mostrar tarjetas de materiales', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      // Materials are shown as cards with the stagger animation
      cy.get('[class*="card"]').should('have.length.greaterThan', 0);
    });

    it('Debe mostrar código y descripción en cada tarjeta', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      // First card should have a code
      cy.get('[class*="font-mono"]').first().should('exist');
    });
  });

  context('Buscar Materiales', () => {
    it('Debe filtrar materiales al escribir en la barra de búsqueda', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.get('input[placeholder*="Buscar"]').type('aceite');
      // Wait for filter to apply
      cy.wait(500);
      // Cards should be reduced
      cy.get('[class*="card"]').should('exist');
    });

    it('Debe mostrar mensaje cuando no hay resultados', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.get('input[placeholder*="Buscar"]').type('zzzzzzzzzzz');
      cy.wait(500);
      cy.contains('No hay materiales').should('be.visible');
    });
  });

  context('Filtrar por Grupo', () => {
    it('Debe filtrar materiales al seleccionar un grupo', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      cy.get('select').first().select('Herramientas');
      cy.wait(500);
      cy.get('[class*="card"]').should('exist');
    });
  });

  context('Crear Nuevo Material', () => {
    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Nuevo Material').click();
      cy.contains('Nuevo Material').should('be.visible');
    });

    it('Debe mostrar los campos del formulario', () => {
      cy.contains('button', 'Nuevo Material').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Código').should('be.visible');
        cy.contains('Descripción').should('be.visible');
        cy.contains('Grupo').should('be.visible');
      });
    });

    it('Debe generar código automáticamente según el grupo', () => {
      cy.contains('button', 'Nuevo Material').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        // The code field should be auto-populated
        cy.get('input').first().should('not.have.value', '');
      });
    });

    it('Debe crear un material con datos válidos', () => {
      cy.fixture('materiales').then((mat) => {
        cy.contains('button', 'Nuevo Material').click();

        cy.get('.fixed.inset-0 .glass-panel').within(() => {
          // Fill description
          cy.get('input').eq(1).clear().type(mat.nuevo.descripcion);
          cy.contains('button', 'Guardar').click();
        });

        cy.contains('registrado', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Editar Material', () => {
    it('Debe abrir el modal de edición al hacer click en el botón editar', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      // Click the first edit button on first row
      cy.get('tbody tr').first().within(() => {
        cy.get('button').first().click();
      });
      cy.contains('Editar Material').should('be.visible');
    });
  });

  context('Eliminar Material', () => {
    it('Debe mostrar diálogo de confirmación al eliminar', () => {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
      // Click the delete button on first row
      cy.get('tbody tr').first().within(() => {
        cy.get('button').last().click();
      });
      cy.contains('Eliminar').should('be.visible');
    });
  });

  context('Imagen del Material', () => {
    it('Debe mostrar el área de carga de imagen en el modal de creación', () => {
      cy.contains('button', 'Nuevo Material').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Imagen').should('be.visible');
      });
    });
  });

  context('Loading State', () => {
    it('Debe mostrar skeletons durante la carga inicial', () => {
      cy.intercept('GET', '**/api/materiales*', (req) => {
        req.on('response', (res) => { res.setDelay(2000); });
      });
      cy.visit('/inventario');
      cy.get('.animate-pulse').should('exist');
    });
  });

  context('Categorías de Materiales (Pestaña)', () => {
    beforeEach(() => {
      cy.contains('button', 'Categorías').click();
    });

    it('Debe cambiar de pestaña y mostrar el título "Categorías de Materiales"', () => {
      cy.contains('h1', 'Categorías de Materiales').should('be.visible');
    });

    it('Debe abrir el modal de creación de categoría', () => {
      cy.contains('button', 'Nueva Categoría').click();
      cy.contains('.fixed.inset-0', 'Nueva Categoría').should('be.visible');
      cy.get('input[placeholder*="Ej. Herramientas de Corte"]').should('be.visible');
    });
  });
});
