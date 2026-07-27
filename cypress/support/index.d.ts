/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {

    /**
     * Navega para a tela de cadastro.
     */
    goToUserRegistration(): Chainable<void>;

    /**
     * Realiza o login de um usuário
     */
    goToLoginUser(email: string, password: string): Chainable<void>;
  }


}
