/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('CT-999 - Excluir conta', () => {
  const userData = {
    email: 'pedrinho@teste.com',
    senha: 'Teste123!',
  };

  it('deve excluir a conta com sucesso', () => {
    cy.intercept('DELETE', '**/usuarios/**').as('deletarUsuario');

    cy.goToLoginUser(userData.email, userData.senha);

    cy.get('[data-cy=btn-header-perfil]').click();

    cy.get('p-progressspinner', { timeout: 5000 }).should('not.exist');

    cy.wait(300);

    cy.get('[data-cy=btn-excluir-conta]').click();

    cy.wait(300);

    cy.get('[data-pc-name=pcacceptbutton]').click();

    cy.wait('@deletarUsuario').its('response.statusCode').should('eq', 200);

    cy.contains('Conta excluida com sucesso').should('be.visible');
  });

  it('deve falhar ao fazer login', () => {
    cy.intercept('POST', '**/login').as('login');

    cy.goToUrl('/login');

    cy.get('[data-cy=input-email]').type(userData.email);

    cy.get('[data-cy=input-senha]').type(userData.senha);

    cy.get('[data-cy=btn-login]').click();

    cy.wait('@login').its('response.statusCode').should('eq', 400);

    cy.contains('Email ou senha inválido').should('be.visible');
  });
});
