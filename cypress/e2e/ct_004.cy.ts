/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('CT-004 - Cadastro de receita', () => {
  const userData = {
    email: 'pedrinho@teste.com',
    senha: 'Teste123!',
  };

  const receitaData = {
    nome: 'Salário',
    data: '26/07/2026',
    valor: '5000',
  };

  it('deve cadastrar uma receita com sucesso', () => {
    cy.intercept('POST', '**/cadastrarReceita').as('cadastrarReceita');

    cy.goToLoginUser(userData.email, userData.senha);

    cy.get('[data-cy=btn-modal-transacao]').click();

    cy.get('[data-cy=btn-receita]').click();

    cy.wait(1000);

    cy.get('[data-cy=input-transacao-nome]').type(receitaData.nome);

    cy.get('[data-cy=input-transacao-data] input').type(receitaData.data, { force: true });
    cy.get('.p-datepicker-input-icon-container').click();

    cy.get('[data-cy=input-transacao-valor]').type(receitaData.valor);

    cy.get('[data-cy=btn-transacao-cadastrar]').click();

    cy.wait('@cadastrarReceita').its('response.statusCode').should('eq', 201);

    cy.contains('Receita cadastrada com sucesso').should('be.visible');
  });
});
