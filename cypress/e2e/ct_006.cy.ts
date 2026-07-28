/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('CT-006 - Editar receita', () => {
  const userData = {
    email: 'pedrinho@teste.com',
    senha: 'Teste123!',
  };

  const novaReceita = {
    nome: 'Sálario Editado',
    valor: '5401',
  };

  it('deve editar uma receita com sucesso', () => {
    cy.intercept('PATCH', '**/receitas/**').as('atualizarReceita');

    cy.goToLoginUser(userData.email, userData.senha);

    cy.get('[data-cy=btn-nav-receitas]').click();

    cy.get('[data-cy=btn-edit-item]').first().click();

    cy.wait(300);

    cy.get('[data-cy=input-transacao-nome]').clear().type(novaReceita.nome);
    cy.get('[data-cy=input-transacao-valor]').clear().type(novaReceita.valor);

    cy.get('[data-cy=btn-transacao-cadastrar]').click();

    cy.wait('@atualizarReceita').its('response.statusCode').should('eq', 200);

    cy.contains('Receita atualizada com sucesso').should('be.visible');

    cy.contains(novaReceita.nome);
    cy.contains(`R$ 5.401,00`);
  });
});
