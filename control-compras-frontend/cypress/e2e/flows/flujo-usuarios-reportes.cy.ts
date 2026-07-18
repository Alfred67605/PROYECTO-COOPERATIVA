/// <reference types="cypress" />

// ============================================================
// Flujo E2E Completo: Administración de Seguridad y Auditoría
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Flujo E2E - Gestión de Seguridad, Roles, Reportes y Auditoría', () => {
  it('Debe crear un usuario con rol específico, validar accesos, consultar reportes e inspeccionar auditoría', () => {
    cy.fixture('users').then((users) => {
      // 1. Iniciar sesión como Administrador General
      cy.loginByUI(users.admin.email, users.admin.password);

      // 2. Ir a gestión de usuarios y crear uno nuevo con rol de "Compras"
      cy.visit('/usuarios');
      cy.waitForTableLoad();
      cy.contains('button', 'Nuevo Usuario').click();
      cy.get('.fixed.inset-0 .glass-panel').within(() => {
        cy.get('input').eq(0).type(users.newUser.nombre);
        cy.get('input[type="email"]').type(users.newUser.email);
        cy.get('input[type="password"]').type(users.newUser.password);
        cy.get('select').first().select(users.newUser.rol); // Rol Compras
        cy.contains('button', 'Guardar').click();
      });
      cy.contains('registrado').should('be.visible');

      // 3. Cerrar sesión de Administrador
      cy.logout();

      // 4. Iniciar sesión con el nuevo usuario de Compras
      cy.loginByUI(users.newUser.email, users.newUser.password);

      // 5. Verificar que tiene acceso a Compras pero NO a Gestión de Usuarios ni Auditoría
      cy.visit('/compras');
      cy.url().should('include', '/compras');
      
      cy.visit('/usuarios');
      cy.url().should('include', '/dashboard'); // Redirección por seguridad

      cy.visit('/historial');
      cy.url().should('include', '/dashboard'); // Redirección por seguridad

      // 6. Cerrar sesión de Compras
      cy.logout();

      // 7. Volver a iniciar sesión como Administrador General
      cy.loginByUI(users.admin.email, users.admin.password);

      // 8. Consultar reportes del mes actual
      cy.visit('/reportes');
      cy.get('.animate-pulse').should('not.exist');
      cy.contains('button', 'Mensual').click();
      cy.get('.recharts-wrapper').should('exist');

      // 9. Verificar en Auditoría la creación del usuario realizada al inicio
      cy.visit('/historial');
      cy.waitForTableLoad();
      cy.get('input[placeholder*="Buscar"]').type(users.newUser.nombre);
      cy.contains('crear').should('be.visible');
      cy.contains('usuarios').should('be.visible');

      // 10. Limpiar sesión
      cy.logout();
    });
  });
});
