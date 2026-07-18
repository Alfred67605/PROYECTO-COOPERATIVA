/// <reference types="cypress" />

// ============================================================
// Módulo: Autenticación (Login / Logout / Sesión)
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Autenticación - Login y Sesión', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  context('Interfaz del Login', () => {
    it('Debe mostrar el formulario de login correctamente', () => {
      cy.contains('Cooperativa Minera').should('be.visible');
      cy.contains('Sistema de Control de Productos').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.contains('Iniciar Sesión Segura').should('be.visible');
      cy.contains('Correo Electrónico').should('be.visible');
      cy.contains('Contraseña').should('be.visible');
    });

    it('Debe mostrar el placeholder del email correctamente', () => {
      cy.get('input[type="email"]')
        .should('have.attr', 'placeholder', 'admin@cooperativaminera.com');
    });
  });

  context('Validaciones del formulario (Zod)', () => {
    it('Debe mostrar error con email vacío', () => {
      cy.get('input[type="password"]').type('password123');
      cy.contains('Iniciar Sesión Segura').click();
      // Zod validation message for empty email
      cy.contains('Email inválido').should('be.visible');
    });

    it('Debe mostrar error con email inválido', () => {
      cy.get('input[type="email"]').type('correo-invalido');
      cy.get('input[type="password"]').type('password123');
      cy.contains('Iniciar Sesión Segura').click();
      cy.contains('Email inválido').should('be.visible');
    });

    it('Debe mostrar error con contraseña menor a 6 caracteres', () => {
      cy.get('input[type="email"]').type('admin@cooperativa.com');
      cy.get('input[type="password"]').type('12345');
      cy.contains('Iniciar Sesión Segura').click();
      cy.contains('Mínimo 6 caracteres').should('be.visible');
    });

    it('Debe mostrar error con contraseña vacía', () => {
      cy.get('input[type="email"]').type('admin@cooperativa.com');
      cy.contains('Iniciar Sesión Segura').click();
      cy.contains('Mínimo 6 caracteres').should('be.visible');
    });
  });

  context('Login incorrecto', () => {
    it('Debe mostrar error con credenciales incorrectas', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.admin.email);
        cy.get('input[type="password"]').type('ContraseñaIncorrecta123');
        cy.contains('Iniciar Sesión Segura').click();
        cy.contains('Credenciales incorrectas', { timeout: 10000 }).should('be.visible');
      });
    });

    it('Debe mostrar error con usuario inexistente', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.invalid.email);
        cy.get('input[type="password"]').type(users.invalid.password);
        cy.contains('Iniciar Sesión Segura').click();
        cy.contains('Credenciales incorrectas', { timeout: 10000 }).should('be.visible');
      });
    });
  });

  context('Login correcto', () => {
    it('Debe redirigir al dashboard tras login exitoso', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.admin.email);
        cy.get('input[type="password"]').type(users.admin.password);
        cy.contains('Iniciar Sesión Segura').click();
        cy.url({ timeout: 15000 }).should('include', '/dashboard');
        cy.contains('Resumen Ejecutivo').should('be.visible');
      });
    });

    it('Debe mostrar el spinner de carga mientras procesa el login', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.admin.email);
        cy.get('input[type="password"]').type(users.admin.password);
        cy.contains('Iniciar Sesión Segura').click();
        // The button should show loading state briefly
        cy.get('button[type="submit"]').should('be.disabled');
      });
    });
  });

  context('Sesión y Redirecciones', () => {
    it('Debe redirigir a /login cuando se accede sin autenticación', () => {
      cy.visit('/dashboard');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('Debe persistir la sesión al recargar la página', () => {
      cy.fixture('users').then((users) => {
        cy.loginByUI(users.admin.email, users.admin.password);
        cy.url().should('include', '/dashboard');
        cy.reload();
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        cy.contains('Resumen Ejecutivo').should('be.visible');
      });
    });

    it('Debe poder cerrar sesión desde el sidebar', () => {
      cy.fixture('users').then((users) => {
        cy.loginByUI(users.admin.email, users.admin.password);
        cy.url().should('include', '/dashboard');
        cy.contains('Cerrar Sesión').click();
        cy.url({ timeout: 10000 }).should('include', '/login');
      });
    });

    it('Debe redirigir / a /dashboard cuando está autenticado', () => {
      cy.fixture('users').then((users) => {
        cy.loginByUI(users.admin.email, users.admin.password);
        cy.visit('/');
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
      });
    });
  });
});
