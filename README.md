# StockMaster

Sistema web de gerenciamento de estoque desenvolvido para uma assistência técnica, com foco na organização dos produtos e no controle das movimentações de estoque.

>  **Status:** Em desenvolvimento

---

## 1. Sobre o projeto

O **StockMaster** tem como objetivo centralizar e organizar as operações relacionadas ao controle de estoque de uma assistência técnica.

O sistema contempla o gerenciamento de:

- Usuários;
- Produtos;
- Entradas e saídas de estoque;
- Histórico de movimentações;
- Relatórios;
- Controle de estoque crítico.

---

## 2. Objetivo

Desenvolver uma aplicação web que facilite o controle e o acompanhamento do estoque, proporcionando maior organização das informações e rastreabilidade das movimentações realizadas.

---

## 3. Demonstração

O projeto possui protótipos das interfaces desenvolvidas durante a etapa de definição e validação das telas.

-  **Protótipo:** adicionar link do protótipo

> A aplicação encontra-se em desenvolvimento.

---

## 4. Para começar a desenvolver

Para configurar o projeto em uma nova máquina, siga os guias na ordem:

1. [Como clonar o repositório](docs/07-guias/clonagem.md)
2. [Como configurar o ambiente](docs/07-guias/configuracao-ambiente.md)

Após configurar o ambiente, o projeto poderá ser executado localmente.

---

## 5. Estado atual do projeto

### Concluído

- Estrutura inicial do projeto;
- Organização da documentação;
- Definição da arquitetura MVC;
- Configuração inicial do Node.js;
- Configuração do Express.js;
- Configuração do MySQL;
- Estrutura inicial do banco de dados;
- Script SQL para criação do banco;
- Configuração do ambiente por meio do `.env`;
- Organização das branches do projeto.


### Em desenvolvimento

- Implementação das funcionalidades;
- Desenvolvimento dos módulos do sistema;
- Integração entre front-end, back-end e banco de dados;
- Testes das funcionalidades.

OBS:podendo ter alterações ao decorrer do ciclo do desenvolvimeto.
---

## 6. Tecnologias utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript

### Back-end

- Node.js
- Express.js

### Banco de dados

- MySQL

### Versionamento

- Git
- GitHub

---

## 7. Arquitetura

O StockMaster utiliza o padrão arquitetural **MVC (Model-View-Controller)**, separando as responsabilidades da aplicação.

```text
Browser
   ↓
View
   ↓
Route
   ↓
Controller
   ↓
Model
   ↓
MySQL
```

### Responsabilidades

**View**

Responsável pela interface e interação com o usuário.

**Route**

Define os endpoints da aplicação e direciona as requisições para os controllers.

**Controller**

Controla as requisições e o fluxo da aplicação.

**Model**

Responsável pela comunicação com o banco de dados e pelas operações relacionadas aos dados.

---

## 8. Estrutura do projeto

```text
StockMaster/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   └── routes/
│
├── views/
│   ├── assets/
│   ├── css/
│   ├── js/
│   └── html/
│
├── database/
│   └── script.sql
│
├── docs/
│   ├── 01-dominio/
│   ├── 02-requisitos/
│   ├── 03-regra-de-negocio/
│   ├── 04-modelagem/
│   ├── 05-banco/
│   ├── 06-monografia/
│   └── 07-guias/
│
├── tests/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

---

## 9. Banco de dados

O StockMaster utiliza **MySQL**.

O script de criação do banco está disponível em:

[`database/script.sql`](database/script.sql)

Banco utilizado:

```text
stockmaster
```

As configurações de acesso ao banco são realizadas localmente por meio do arquivo `.env`.

> ⚠️ O arquivo `.env` não deve ser enviado para o GitHub.

---

## 10. Execução rápida

Após realizar a configuração do ambiente:

```bash
npm install
```

Para iniciar o servidor:

```bash
npm start
```

A aplicação estará disponível em:

```text
http://localhost:3001
```

Para informações detalhadas sobre a configuração, consulte:

[Configuração do ambiente](docs/07-guias/configuracao-ambiente.md)

---

## 11. Organização do desenvolvimento

O desenvolvimento do projeto utiliza branches para separar o trabalho dos integrantes.

```text
main
  ↑
develop
  ↑
branches individuais
```

### Branches principais

- `main` — versão estável e principal do projeto;
- `develop` — integração das funcionalidades desenvolvidas pela equipe.

### Branches individuais

As branches individuais seguem o padrão:

```text
modulo/nome
```

Atualmente:

```text
modulo/emilia
modulo/geovani
modulo/sandra
modulo/gabrielle
modulo/luan
modulo/otavio
```

O fluxo de desenvolvimento segue:

```text
Branch individual
       ↓
Desenvolvimento
       ↓
Testes locais
       ↓
Commit
       ↓
Push
       ↓
Pull Request
       ↓
develop
       ↓
Validação
       ↓
main
```

---

## 12. Regras de desenvolvimento

- Não trabalhar diretamente na `main`;
- Cada integrante deve trabalhar em sua branch individual;
- Testar a funcionalidade localmente antes de realizar o push;
- Utilizar commits que descrevam a alteração realizada;
- Pull Requests das branches individuais devem ter a `develop` como destino;
- Alterações no banco de dados devem ser alinhadas com a equipe;
- Não enviar arquivos `.env` para o repositório.

---

## 13. Documentação

A documentação do StockMaster está organizada na pasta [`docs`](docs/).

| Assunto | Local |
|---|---|
| Domínio | [`docs/01-dominio`](docs/01-dominio) |
| Requisitos | [`docs/02-requisitos`](docs/02-requisitos) |
| Regras de negócio | [`docs/03-regra-de-negocio`](docs/03-regra-de-negocio) |
| Modelagem | [`docs/04-modelagem`](docs/04-modelagem) |
| Banco de dados | [`docs/05-banco`](docs/05-banco) |
| Monografia | [`docs/06-monografia`](docs/06-monografia) |
| Guias | [`docs/07-guias`](docs/07-guias) |

### Guias

- 📥 [Como clonar o repositório](docs/07-guias/clonagem.md)
- 🔧 [Como configurar o ambiente](docs/07-guias/configuracao-ambiente.md)

A documentação, arquitetura, banco de dados e ambiente de desenvolvimento estão estruturados. A próxima etapa consiste na implementação e integração das funcionalidades do sistema.