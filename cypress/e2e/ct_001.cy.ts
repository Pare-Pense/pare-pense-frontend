/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('CT-001 - Cadastro de usuário', () => {
  const userData = {
    nome: 'Pedrinho Sousa',
    dataNascimento: '2000-05-10',
    email: `pedrinho@teste.com`,
    senha: 'Teste123!',
    rendaMensal: '5000',
    limiteMensal: '2000',
  };

  it('deve cadastrar um usuário com sucesso', () => {
    cy.intercept('POST', '**/criarUsuario').as('criarUsuario');

    cy.goToUserRegistration();

    cy.get('[data-cy=input-nome]').type(userData.nome);
    cy.get('[data-cy=input-data-nascimento]').type(userData.dataNascimento);
    cy.get('[data-cy=input-renda-mensal]').type(userData.rendaMensal);
    cy.get('[data-cy=input-limite-mensal]').type(userData.limiteMensal);
    cy.get('[data-cy=input-email]').type(userData.email);
    cy.get('[data-cy=input-senha]').type(userData.senha);
    cy.get('[data-cy=input-confirmar-senha]').type(userData.senha);

    cy.get('[data-cy=btn-cadastrar]').click();

    cy.wait('@criarUsuario').its('response.statusCode').should('eq', 201);

    cy.contains('Usuário cadastrado com sucesso');
  });
});
