/// <reference types="cypress" />

// ============================================================
// Módulo: Servicios de Mantenimiento (con Repuestos)
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Mantenimientos - Historial y Registro de Servicios', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
    cy.visit('/servicios/mantenimientos');
  });

  context('Lista de Mantenimientos', () => {
    it('Debe mostrar el título "Historial de Mantenimientos"', () => {
      cy.contains('h2', 'Historial de Mantenimientos').should('be.visible');
    });

    it('Debe mostrar la tabla con encabezados correctos', () => {
      cy.waitForTableLoad();
      cy.get('table').within(() => {
        cy.contains('th', 'Código').should('be.visible');
        cy.contains('th', 'Fecha').should('be.visible');
        cy.contains('th', 'Equipo').should('be.visible');
        cy.contains('th', 'Responsable').should('be.visible');
        cy.contains('th', 'Estado').should('be.visible');
      });
    });

    it('Debe mostrar el botón "Nuevo Mantenimiento"', () => {
      cy.contains('button', 'Nuevo Mantenimiento').should('be.visible');
    });

    it('Debe mostrar badges de estado (Pendiente/En Proceso/Finalizado/Cancelado)', () => {
      cy.waitForTableLoad();
      cy.get('.badge').should('exist');
    });
  });

  context('Crear Mantenimiento', () => {
    it('Debe abrir el modal de creación', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.contains('h3', 'Nuevo Mantenimiento').should('be.visible');
    });

    it('Debe mostrar todos los campos del formulario', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Código').should('be.visible');
        cy.contains('Estado').should('be.visible');
        cy.contains('Fecha').should('be.visible');
        cy.contains('Hora').should('be.visible');
        cy.contains('Tipo de Equipo').should('be.visible');
        cy.contains('Equipo').should('be.visible');
        cy.contains('Descripción del Trabajo').should('be.visible');
        cy.contains('Observaciones').should('be.visible');
      });
    });

    it('Debe generar código automático al crear', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        // Code should be auto-generated with SRV- prefix
        cy.get('input').first().should('contain.value', 'SRV-');
      });
    });

    it('Debe tener las opciones de estado: Pendiente, En Proceso, Finalizado, Cancelado', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('select').first().within(() => {
          cy.contains('option', 'Pendiente').should('exist');
          cy.contains('option', 'En Proceso').should('exist');
          cy.contains('option', 'Finalizado').should('exist');
          cy.contains('option', 'Cancelado').should('exist');
        });
      });
    });

    it('Debe tener las opciones de Tipo de Equipo: Maquinaria, Vehículo', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('select').eq(1).within(() => {
          cy.contains('option', 'Maquinaria').should('exist');
          cy.contains('option', 'Vehículo').should('exist');
        });
      });
    });

    it('Debe cambiar la lista de equipos al cambiar el tipo de equipo', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        // Default is Maquinaria
        cy.get('select').eq(2).find('option').should('have.length.greaterThan', 0);
        // Switch to Vehículo
        cy.get('select').eq(1).select('App\\Models\\Vehiculo');
        cy.get('select').eq(2).find('option').should('exist');
      });
    });
  });

  context('Repuestos y Materiales', () => {
    it('Debe mostrar la sección "Repuestos y Materiales a Usar"', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('Repuestos y Materiales a Usar').should('be.visible');
      });
    });

    it('Debe mostrar el botón "Añadir Repuesto"', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('button', 'Añadir Repuesto').should('be.visible');
      });
    });

    it('Debe agregar una fila de repuesto al hacer click en "Añadir Repuesto"', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('No se han añadido repuestos').should('be.visible');
        cy.contains('button', 'Añadir Repuesto').click();
        cy.contains('No se han añadido repuestos').should('not.exist');
        cy.contains('Buscar Producto').should('be.visible');
        cy.contains('Cant.').should('be.visible');
        cy.contains('Costo Unit.').should('be.visible');
        cy.contains('Total').should('be.visible');
      });
    });

    it('Debe calcular el total automáticamente al agregar repuesto', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('button', 'Añadir Repuesto').click();
        // Set quantity and unit cost
        cy.get('input[type="number"]').eq(0).type('{selectall}5').blur();
        cy.get('input[type="number"]').eq(1).type('{selectall}100').blur();
        cy.contains('Bs. 500.00', { timeout: 10000 }).should('be.visible');
        cy.contains('Total Repuestos').should('be.visible');
      });
    });

    it('Debe poder eliminar un repuesto agregado', () => {
      cy.contains('button', 'Nuevo Mantenimiento').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.contains('button', 'Añadir Repuesto').click();
        // Delete the added item
        cy.get('button.btn-icon').filter(':has(svg)').last().click();
        cy.contains('No se han añadido repuestos').should('be.visible');
      });
    });
  });

  context('Editar Mantenimiento', () => {
    it('Debe abrir el modal de edición', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').first().click();
      });
      cy.contains('h3', 'Editar Mantenimiento').should('be.visible');
    });
  });

  context('Eliminar Mantenimiento', () => {
    it('Debe mostrar diálogo de confirmación', () => {
      cy.waitForTableLoad();
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').filter(':has(svg)').last().click();
      });
      cy.contains('Eliminar').should('be.visible');
    });
  });
});
