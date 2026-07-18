/// <reference types="cypress" />

// ============================================================
// Módulo: Navegación (Sidebar, Topbar, Rutas)
// Materia: Verificación y Validación de Software (INF780)
// ============================================================

describe('Navegación - Sidebar, Topbar y Rutas', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.loginByUI(users.admin.email, users.admin.password);
    });
  });

  context('Sidebar - Menú Principal', () => {
    it('Debe mostrar el logo y título "MINERA COP"', () => {
      cy.contains('MINERA COP').should('be.visible');
      cy.contains('Sistema Empresarial').should('be.visible');
    });

    it('Debe mostrar todos los enlaces de navegación para Admin', () => {
      const expectedLinks = [
        'Dashboard', 'Bocaminas', 'Proveedores', 'Materiales',
        'Compras', 'Servicios', 'Reportes', 'Usuarios', 'Auditoría'
      ];
      expectedLinks.forEach((link) => {
        cy.get('nav').contains(link).should('exist');
      });
    });

    it('Debe resaltar el enlace activo en el sidebar', () => {
      cy.get('nav').contains('Dashboard').should('have.class', 'text-white');
    });

    it('Debe navegar correctamente al hacer click en cada enlace', () => {
      const routes = [
        { name: 'Proveedores', path: '/proveedores' },
        { name: 'Materiales', path: '/inventario' },
        { name: 'Compras', path: '/compras' },
        { name: 'Reportes', path: '/reportes' },
        { name: 'Usuarios', path: '/usuarios' },
      ];

      routes.forEach((route) => {
        cy.get('nav').contains(route.name).click();
        cy.url().should('include', route.path);
      });
    });
  });

  context('Sidebar - Sub-menú Servicios', () => {
    it('Debe expandir el sub-menú de Servicios al hacer click', () => {
      cy.get('nav').contains('Servicios').click();
      cy.contains('Maquinaria').should('be.visible');
      cy.contains('Vehículos').should('be.visible');
      cy.contains('Mantenimientos').should('be.visible');
      cy.contains('Inspecciones').should('be.visible');
      cy.contains('Alquiler de Grúas').should('be.visible');
    });

    it('Debe colapsar el sub-menú de Servicios al hacer click nuevamente', () => {
      cy.get('nav').contains('Servicios').click();
      cy.contains('Maquinaria').should('be.visible');
      cy.get('nav').contains('Servicios').click();
      // Sub-items should be hidden after collapse animation
      cy.contains('a', 'Maquinaria').should('not.be.visible');
    });

    it('Debe navegar a sub-rutas de servicios', () => {
      cy.get('nav').contains('Servicios').click();
      cy.contains('a', 'Maquinaria').click();
      cy.url().should('include', '/servicios/maquinaria');
    });
  });

  context('Topbar - Breadcrumbs', () => {
    it('Debe mostrar el breadcrumb con el nombre de la sección actual', () => {
      cy.get('header').contains('Minera Cop').should('be.visible');
      cy.get('header').contains('Dashboard').should('be.visible');
    });

    it('Debe actualizar el breadcrumb al navegar a otra sección', () => {
      cy.get('nav').contains('Proveedores').click();
      cy.get('header').contains('Proveedores').should('be.visible');
    });
  });

  context('Rutas Especiales', () => {
    it('Debe redirigir rutas inexistentes a /dashboard', () => {
      cy.visit('/ruta-que-no-existe');
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('Debe mostrar información del usuario en el sidebar', () => {
      // User avatar initial and name
      cy.get('aside').within(() => {
        cy.get('[class*="rounded-xl"]').should('exist');
      });
    });
  });
});
