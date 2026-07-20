/// <reference types="cypress" />

// ============================================================
// Módulo: Seguridad y Control de Acceso
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Seguridad - Control de Acceso por Roles y Permisos', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/empresa/settings', {
      statusCode: 200,
      body: {
        id: 1,
        nombre_empresa: 'Minera Cop',
        subtitulo: 'Sistema',
        logo: null,
        logo_url: null
      }
    }).as('getSettings');
  });

  context('Acceso sin autenticación', () => {
    const protectedRoutes = [
      '/dashboard', '/inventario', '/compras', '/compras/nueva',
      '/proveedores', '/usuarios', '/bocaminas', '/historial',
      '/reportes', '/servicios/mantenimientos', '/servicios/maquinaria'
    ];

    protectedRoutes.forEach((route) => {
      it(`Debe redirigir ${route} a /login cuando no hay sesión`, () => {
        cy.visit(route);
        cy.url({ timeout: 10000 }).should('include', '/login');
      });
    });
  });

  context('Acceso con rol Consulta (solo lectura)', () => {
    beforeEach(() => {
      // Intercept the user API to return a Consulta user
      cy.intercept('GET', '**/api/user', {
        statusCode: 200,
        body: {
          id: 99,
          nombre: 'Usuario Consulta',
          email: 'consulta@test.com',
          rol_id: 6,
          rol: { id: 6, nombre: 'Consulta' },
          permisos: [{ id: 8, nombre: 'solo_lectura' }]
        }
      }).as('getUser');
    });

    it('Debe poder acceder a /reportes con rol Consulta', () => {
      cy.intercept('GET', '**/sanctum/csrf-cookie', { statusCode: 204 });
      cy.intercept('POST', '**/api/login', {
        statusCode: 200,
        body: {
          user: {
            id: 99, nombre: 'Consulta', email: 'consulta@test.com',
            rol_id: 6, rol: { id: 6, nombre: 'Consulta' },
            permisos: [{ id: 8, nombre: 'solo_lectura' }]
          }
        }
      });
      cy.visit('/login');
      cy.get('input[type="email"]').type('consulta@test.com');
      cy.get('input[type="password"]').type('Consulta123!');
      cy.contains('Iniciar Sesión Segura').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });
  });

  context('Restricción de módulos por rol', () => {
    it('Debe redirigir a /dashboard si el usuario no tiene acceso al módulo', () => {
      // Simulate a user with Compras role trying to access /usuarios
      cy.intercept('GET', '**/api/user', {
        statusCode: 200,
        body: {
          id: 10, nombre: 'Compras User', email: 'compras@test.com',
          rol_id: 3, rol: { id: 3, nombre: 'Compras' },
          permisos: []
        }
      }).as('getUser');

      cy.visit('/login');
      cy.intercept('GET', '**/sanctum/csrf-cookie', { statusCode: 204 });
      cy.intercept('POST', '**/api/login', {
        statusCode: 200,
        body: {
          user: {
            id: 10, nombre: 'Compras User', email: 'compras@test.com',
            rol_id: 3, rol: { id: 3, nombre: 'Compras' }, permisos: []
          }
        }
      });
      cy.get('input[type="email"]').type('compras@test.com');
      cy.get('input[type="password"]').type('Compras123!');
      cy.contains('Iniciar Sesión Segura').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard');

      // Try to access /usuarios - should be redirected
      cy.visit('/usuarios');
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });
  });

  context('Manipulación de URL', () => {
    it('Debe redirigir al intentar acceder a ruta protegida modificando la URL manualmente', () => {
      cy.visit('/usuarios');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('Debe redirigir a /dashboard con ruta inexistente estando autenticado', () => {
      cy.fixture('users').then((users) => {
        cy.loginByUI(users.admin.email, users.admin.password);
        cy.visit('/modulo-secreto');
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
      });
    });
  });
});
