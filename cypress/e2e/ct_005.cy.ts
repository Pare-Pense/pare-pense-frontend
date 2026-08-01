/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('CT-005 - Editar despesa', () => {
  const userData = {
    email: 'pedrinho@teste.com',
    senha: 'Teste123!',
  };

  const novaDespesa = {
    nome: 'Conta de luz',
    valor: '123',
  };

  it('deve editar uma despesa com sucesso', () => {
    cy.intercept('PATCH', '**/despesas/**').as('atualizarDespesa');

    cy.goToLoginUser(userData.email, userData.senha);

    cy.get('[data-cy=btn-nav-despesas]').click();

    cy.get('[data-cy=btn-edit-item]').first().click();

    cy.wait(300);

    cy.get('[data-cy=input-transacao-nome]').clear().type(novaDespesa.nome);
    cy.get('[data-cy=input-transacao-valor]').clear().type(novaDespesa.valor);

    cy.get('[data-cy=btn-transacao-cadastrar]').click();

    cy.wait('@atualizarDespesa').its('response.statusCode').should('eq', 200);

    cy.contains('Despesa atualizada com sucesso').should('be.visible');

    cy.contains(novaDespesa.nome);
    cy.contains(`R$ ${novaDespesa.valor}`);
  });
});
