/// <reference types="cypress" />

// ============================================================
// Flujo E2E Completo: Ciclo de Servicios e Inspección
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Flujo E2E - Mantenimiento, Equipos e Inspección Pre-Operacional', () => {
  it('Debe registrar maquinaria, vehículo, y asociarlos a mantenimientos e inspecciones', () => {
    cy.fixture('users').then((users) => {
      cy.fixture('maquinaria').then((maq) => {
        cy.fixture('vehiculos').then((veh) => {
          cy.fixture('servicios').then((srv) => {
            cy.fixture('inspecciones').then((insp) => {
              // 1. Login
              cy.loginByUI(users.admin.email, users.admin.password);

              // 2. Registrar Maquinaria
              cy.visit('/servicios/maquinaria');
              cy.waitForTableLoad();
              cy.contains('button', 'Registrar Equipo').click();
              cy.get('.fixed.inset-0 .glass-panel').within(() => {
                cy.get('input').eq(0).type(maq.nueva.nombre_codigo);
                cy.get('input').eq(1).type(maq.nueva.tipo);
                cy.get('input').eq(2).type(maq.nueva.marca);
                cy.get('input').eq(3).type(maq.nueva.modelo);
                cy.get('input[type="number"]').eq(0).type(maq.nueva.horometro.toString());
                cy.contains('button', 'Guardar').click();
              });
              cy.contains('registrada').should('be.visible');

              // 3. Registrar Vehículo
              cy.visit('/servicios/vehiculos');
              cy.waitForTableLoad();
              cy.contains('button', 'Registrar Vehículo').click();
              cy.get('.fixed.inset-0 .glass-panel').within(() => {
                cy.get('input').eq(0).type(veh.nuevo.placa);
                cy.get('input').eq(1).type(veh.nuevo.tipo);
                cy.get('input').eq(2).type(veh.nuevo.marca);
                cy.get('input').eq(3).type(veh.nuevo.modelo);
                cy.contains('button', 'Guardar').click();
              });
              cy.contains('registrado').should('be.visible');

              // 4. Crear Mantenimiento para la maquinaria creada
              cy.visit('/servicios/mantenimientos');
              cy.waitForTableLoad();
              cy.contains('button', 'Nuevo Mantenimiento').click();
              cy.get('.fixed.inset-0 .glass-panel').within(() => {
                cy.get('select').eq(1).select('App\\Models\\Maquinaria'); // Tipo Maquinaria
                cy.get('select').eq(2).select(1); // Selecciona la maquinaria registrada
                cy.get('textarea').eq(0).type(srv.nuevo.descripcion);
                cy.contains('button', 'Añadir Repuesto').click();
                cy.get('input[list="materiales-list"]').type('HERR', { force: true });
                cy.get('input[type="number"]').eq(0).clear().type('2'); // Cantidad
                cy.get('input[type="number"]').eq(1).clear().type('150'); // Costo Unitario
                cy.contains('button', 'Guardar').click();
              });
              cy.contains('registrado').should('be.visible');

              // 5. Crear Inspección pre-operacional
              cy.visit('/servicios/inspecciones');
              cy.waitForTableLoad();
              cy.contains('button', 'Nueva Inspección').click();
              cy.get('.fixed.inset-0 .glass-panel').within(() => {
                cy.get('select').eq(0).select('App\\Models\\Vehiculo'); // Tipo Vehículo
                cy.get('select').eq(1).select(1); // Selecciona el vehículo registrado
                // Desmarcar frenos y seguridad
                cy.get('input[type="checkbox"]').eq(1).uncheck();
                cy.get('input[type="checkbox"]').eq(5).uncheck();
                cy.get('textarea').type(insp.conNovedades.observaciones);
                cy.contains('button', 'Guardar').click();
              });
              cy.contains('registrada').should('be.visible');

              // 6. Verificar KPI en Dashboard Servicios
              cy.visit('/servicios/dashboard');
              cy.get('.animate-pulse').should('not.exist');
              cy.contains('Equipos Activos').should('be.visible');

              // 7. Logout
              cy.logout();
            });
          });
        });
      });
    });
  });
});
