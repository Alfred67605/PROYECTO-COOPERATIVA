/// <reference types="cypress" />

// ============================================================
// Flujo E2E Completo: Proceso de Compra e Inventario
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Flujo E2E - Adquisición de Materiales y Registro de Compra', () => {
  it('Debe completar el flujo desde el login hasta el registro de la compra y exportación de reportes', () => {
    cy.fixture('users').then((users) => {
      cy.fixture('proveedores').then((prov) => {
        cy.fixture('materiales').then((mat) => {
          cy.fixture('compras').then((compra) => {
            // 1. Iniciar sesión segura en el sistema
            cy.loginByUI(users.admin.email, users.admin.password);

            // 2. Crear y validar un nuevo proveedor
            cy.visit('/proveedores');
            cy.waitForTableLoad();
            cy.contains('button', 'Registrar Proveedor').click();
            cy.get('.fixed.inset-0 .glass-panel').within(() => {
              cy.get('input').eq(0).type(prov.nuevo.nombre);
              cy.get('input').eq(1).type(prov.nuevo.nit);
              cy.get('input').eq(2).type(prov.nuevo.telefono);
              cy.get('input').eq(3).type(prov.nuevo.direccion);
              cy.contains('button', 'Guardar').click();
            });
            cy.contains('registrado').should('be.visible');

            // 3. Crear y validar un nuevo material en inventario
            cy.visit('/inventario');
            cy.get('.animate-pulse').should('not.exist');
            cy.contains('button', 'Nuevo Material').click();
            cy.get('.fixed.inset-0 .glass-panel').within(() => {
              cy.get('input').eq(1).type(mat.nuevo.descripcion);
              cy.contains('button', 'Guardar').click();
            });
            cy.contains('registrado').should('be.visible');

            // 4. Iniciar el Wizard de compra (Paso 1)
            cy.visit('/compras/nueva');
            cy.contains('Datos Generales').should('be.visible');
            cy.get('select').first().select(1); // Selecciona primer proveedor (el creado)
            cy.get('select').eq(1).select(1);    // Selecciona primer bocamina
            cy.get('input[type="text"]').first().clear().type(compra.nueva.numero_factura);
            cy.contains('button', 'Siguiente').click();

            // 5. Agregar el repuesto/material en la compra (Paso 2)
            cy.contains('Detalle de Materiales').should('be.visible');
            cy.get('input[placeholder*="Buscar"]').type(mat.busqueda);
            cy.wait(500);
            cy.get('button').filter(':contains("Agregar"), :has(svg)').first().click({ force: true });
            
            // Completar cantidad y precio
            cy.get('table tbody tr').first().within(() => {
              cy.get('input[type="number"]').eq(0).clear().type('10'); // Cantidad
              cy.get('input[type="number"]').eq(1).clear().type('150'); // Precio
            });
            cy.contains('button', 'Siguiente').click();

            // 6. Confirmación de compra (Paso 3)
            cy.contains('Resumen de la Compra').should('be.visible');
            cy.contains('button', 'Confirmar y Guardar').click();
            cy.contains('Compra registrada').should('be.visible');

            // 7. Verificar auditoría del registro
            cy.visit('/historial');
            cy.waitForTableLoad();
            cy.get('input[placeholder*="Buscar"]').type(compra.nueva.numero_factura);
            cy.contains('crear').should('be.visible');
            cy.contains('compras').should('be.visible');

            // 8. Visualizar en Reportes
            cy.visit('/reportes');
            cy.get('.animate-pulse').should('not.exist');
            cy.contains('button', 'PDF').should('be.visible');

            // 9. Cerrar Sesión
            cy.logout();
          });
        });
      });
    });
  });
});
