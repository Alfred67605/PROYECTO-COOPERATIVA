/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Login via API — Fast login that bypasses the UI.
     * @param email - User email
     * @param password - User password
     */
    loginByAPI(email: string, password: string): Chainable<void>;

    /**
     * Login via the UI form.
     * @param email - User email
     * @param password - User password
     */
    loginByUI(email: string, password: string): Chainable<void>;

    /**
     * Login via the UI form bypassing session caching.
     * @param email - User email
     * @param password - User password
     */
    loginManually(email: string, password: string): Chainable<void>;

    /**
     * Logout via sidebar button.
     */
    logout(): Chainable<void>;

    /**
     * Smart API interception wrapper.
     * @param method - HTTP method (GET, POST, PUT, DELETE)
     * @param url - API path (without /api prefix)
     * @param fixture - Optional fixture file path
     * @param alias - Optional alias name
     */
    interceptAPI(method: string, url: string, fixture?: string, alias?: string): Chainable<void>;

    /**
     * Find element containing specific text.
     */
    getByText(text: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Open a CRUD modal by clicking a button with the specified text.
     */
    openModal(buttonText: string): Chainable<void>;

    /**
     * Close the currently open modal.
     */
    closeModal(): Chainable<void>;

    /**
     * Confirm a ConfirmDialog.
     */
    confirmDialog(): Chainable<void>;

    /**
     * Cancel a ConfirmDialog.
     */
    cancelDialog(): Chainable<void>;

    /**
     * Wait for skeleton/loading to disappear and table to be rendered.
     */
    waitForTableLoad(): Chainable<void>;

    /**
     * Verify that a toast notification appeared.
     * @param type - Toast type (success, error, warning)
     * @param title - Expected toast title text
     */
    checkToast(type: string, title: string): Chainable<void>;

    /**
     * Fill an input field identified by its label text.
     * @param labelText - The text of the label
     * @param value - The value to type
     */
    fillInput(labelText: string, value: string): Chainable<void>;

    /**
     * Select a dropdown option identified by its label text.
     * @param labelText - The text of the label
     * @param value - The value to select
     */
    selectOption(labelText: string, value: string): Chainable<void>;
  }
}
