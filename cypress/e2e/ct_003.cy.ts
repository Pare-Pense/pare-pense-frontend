/// <reference types="cypress" />

describe('CT-003 - Cadastro de despesa', () => {

  const userData = {
    email: 'pedrinho@teste.com',
    senha: 'Teste123!'
  };

  const despesaData = {
    nome: 'Conta de energia',
    categoria: 'Contas',
    data: '26/07/2026',
    hora: '14:30',
    valor: '150',
  };

  it('deve cadastrar uma despesa com sucesso', () => {

    cy.intercept('POST', '**/cadastrarDespesa').as('cadastrarDespesa');

    cy.goToLoginUser(userData.email,userData.senha);

    cy.get('[data-cy=btn-modal-transacao]')
      .click();

    cy.get('[data-cy=btn-despesa]').click();

    cy.wait(300);

    cy.get('[data-cy=input-transacao-nome]')
      .type(despesaData.nome);

    cy.get('[data-cy=input-transacao-categoria]')
      .click()

    cy.get('.p-select-option')
      .contains(despesaData.categoria)
      .click();

    cy.get('[data-cy=input-transacao-data]')
    .type(despesaData.data);

    cy.get('[data-cy=input-transacao-hora]')
    .type(despesaData.hora);

    cy.get('[data-cy=input-transacao-valor]')
    .type(despesaData.valor)

    cy.get('[data-cy=btn-transacao-cadastrar]').click();

    cy.wait('@cadastrarDespesa')
      .its('response.statusCode')
      .should('eq', 201);


    cy.contains('Despesa cadastrada com sucesso')
      .should('be.visible');
  });

});
