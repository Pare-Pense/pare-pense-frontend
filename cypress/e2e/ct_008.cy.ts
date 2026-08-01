/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('CT-008 - Cadastro de receita inválida', () => {
  const userData = {
    email: 'pedrinho@teste.com',
    senha: 'Teste123!',
  };

  const receitaData = {
    nome: 'Salário',
    data: '26/07/2026',
  };

  it('deve falhar o cadastro de uma receita', () => {
    cy.intercept('POST', '**/cadastrarReceita').as('cadastrarReceita');

    cy.goToLoginUser(userData.email, userData.senha);

    cy.get('[data-cy=btn-modal-transacao]').click();

    cy.get('[data-cy=btn-receita]').click();

    cy.wait(500);

    cy.get('[data-cy=input-transacao-nome]').click().type(receitaData.nome);

    cy.get('[data-cy=input-transacao-data] input').type(receitaData.data, { force: true });
    cy.get('.p-datepicker-input-icon-container').click();

    cy.get('[data-cy=btn-transacao-cadastrar]').click();

    cy.contains('Valor é obrigatório').should('be.visible');
  });
});
