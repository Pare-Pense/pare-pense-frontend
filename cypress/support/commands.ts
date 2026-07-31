/// <reference types="cypress" />

const BASE_URL = 'localhost:4200';

Cypress.Commands.add('goToUserRegistration', () => {
  cy.visit(BASE_URL);
  cy.get('[data-cy=btn-criar-conta').click();
});

Cypress.Commands.add('goToLoginUser', (email, password) => {
  cy.intercept('POST', '**/login').as('login');

  cy.visit(`${BASE_URL}/login`);

  cy.get('[data-cy=input-email]').type(email);

  cy.get('[data-cy=input-senha]').type(password);

  cy.get('[data-cy=btn-login]').click();

  cy.wait('@login').its('response.statusCode').should('eq', 200);
});

Cypress.Commands.add('goToUrl', (url) => {
  cy.visit(`${BASE_URL}/${url}`);
});
