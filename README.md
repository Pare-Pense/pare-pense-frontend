# Pare&Pense

## 📋 Introdução

O projeto Pare&Pense foi desenvolvido para a disciplina de Projeto 1 do curso de Ciências da Computação da Universidade Federal de Campina Grande. Trata de um sistema de controle financeiro para pessoas que possuem hábitos de gastos compulsivos, podendo organizar suas finanças e receber alertas sobre possíveis gastos compulsivos.

## 🛠️ Funcionalidades até o momento

Para a primeira versão do MVP foram desenvolvidas as seguintes funcionalidades: 

- CRUD (Create, Read, Update, Delete) de despesas
- CRUD de usuários
- CRUD de receitas
- Análise de despesas para alerta de gasto compulsivo e estouro de orçamento*

Obs: O estouro de orçamento trata-se de uma previsão de quando o limite de gasto definido será atingido/ultrapassado, assim caso a previsão indique que o limite será atingido antes do fim do mês um alerta será disparado para o usuário indicando o possível dia de estouro caso o padrão de gasto registrado se mantenha.

## ✅ Execução local

Para a execução local do projeto é necessário primeiro clonar o repositório da [API](https://github.com/Pare-Pense/pare-pense-backend) e seguir os passos lá descritos para realizar sua execução. Após a configuração correta da API, siga os passos abaixo:

### 1. Instalação de dependências

```
pnpm install
```

### 2. Configuração do environment

Siga o exemplo do [`environment.example.ts`](src/environments/environment.example.ts) e crie o `environment.development.ts` (ver se precisa adicionar o de prod)

### 3. Execução

```
pnpm start
```

## ✒️ Autores

<table>
    <tr>
      <td align="center" width="190px" height="160px">
         <img src="https://avatars.githubusercontent.com/u/128195146?v=4" alt="Aline Profile Image" width="60"></img>
         </br>
         <a href="https://github.com/alinebmr">@alinebmr</a>
         <br>Aline Brito</br>
      </td>
      <td align="center" width="190px" height="160px">
         <img src="https://avatars.githubusercontent.com/u/64997111?v=4" alt="Filipe Luiz Profile Image" width="60"></img>
         </br>
         <a href="https://github.com/FLuiz22">@FLuiz22</a>
         <br>Filipe Luiz</br>
      </td>
      <td align="center" width="190px" height="160px">
         <img src="https://avatars.githubusercontent.com/u/130506942?v=4" alt="Mateus Faria Profile Image" width="60"></img>
         </br>
         <a href="https://github.com/mateusmf4">@mateusmf4</a>
         <br>Mateus Faria</br>
      </td>
      <td align="center" width="190px" height="160px">
         <img src="https://avatars.githubusercontent.com/u/127061916?v=4" alt="Paulo Lunguinho Profile Image" width="60"></img>
         </br>
         <a href="https://github.com/Paulo-Lunguinho">@Paulo-Lunguinho</a>
         <br>Paulo Lunguinho</br>
      </td>
   </tr>
</table>
