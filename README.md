# StockMaster

Sistema web de gerenciamento de estoque desenvolvido para uma assistência técnica, com foco na organização dos produtos e no controle das movimentações de estoque.

## Status do Projeto

🚧 Em desenvolvimento

## Sobre o Projeto

O **StockMaster** tem como proposta centralizar e organizar as operações relacionadas ao estoque de uma assistência técnica.

A aplicação será voltada para o gerenciamento de:
- Usuários;
- Produtos;
- Movimentações de estoque;
- Histórico de movimentações;
- Relatórios;
- Controle de estoque crítico.

O projeto busca proporcionar maior organização e controle das informações relacionadas ao estoque.

## Principais Funcionalidades

- 🔐 **Autenticação e controle de acesso**
- 👥 **Gerenciamento de usuários**
- 📦 **Gerenciamento de produtos**
- 📥 **Entrada de estoque**
- 📤 **Saída de estoque**
- 🗑️ **Expurgo de estoque**
- 📋 **Histórico de movimentações**
- ⚠️ **Monitoramento de estoque crítico**
- 📊 **Relatórios**

## Arquitetura

O projeto será desenvolvido utilizando o padrão **MVC (Model-View-Controller)**, organizando a aplicação em diferentes responsabilidades:

- **View:** interface e interação com o usuário;
- **Controller:** controle das requisições e fluxo da aplicação;
- **Model:** gerenciamento dos dados e comunicação com o banco.

### Fluxo da Arquitetura

Usuário
↓
View
↓
Controller
↓
Model
↓
Banco de Dados


## Tecnologias

### Front-end
- HTML5
- CSS3
- JavaScript

### Back-end
- Node.js
- Express.js

### Banco de Dados
- MySQL

## Estrutura do Projeto

```
StockMaster/
│
├── Backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── middlewares/
│
├── frontend/
│   ├── views/
│   ├── css/
│   ├── js/
│   └── assets/
│       ├── images/
│       └── icons/
│
├── database/
│   └── schema.sql
│
├── docs/
│   ├── 01-visao-geral.md
│   ├── 02-requisitos.md
│   ├── 03-regras-de-negocios.md
│   ├── 04-modelagem.md
│   └── 05-banco.md
│
├── tests/
│
├── .gitignore
├── package.json
├── MONOGRAFIA.V1- com declaração da empresa.pdf
├── Monografia_StockMaster-V2.pdf
└── README.md
```

## Documentação

A documentação detalhada do projeto, incluindo requisitos, regras de negócio, modelagem e demais definições, está disponível nos arquivos correspondentes do projeto.
