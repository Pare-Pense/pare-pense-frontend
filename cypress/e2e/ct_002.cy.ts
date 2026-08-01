/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('CT-002 - Login de Usuário', () => {
  const userData = {
    email: 'pedrinho@teste.com',
    senha: 'Teste123!',
  };

  it('deve realizar login com sucesso', () => {
    cy.goToLoginUser(userData.email, userData.senha);
  });
});
