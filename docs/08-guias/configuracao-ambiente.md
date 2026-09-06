# Configuração do ambiente

Este guia apresenta os passos necessários para configurar o ambiente de desenvolvimento do StockMaster após clonar o repositório.

A configuração deve ser realizada por cada integrante da equipe em seu próprio computador.

---

## 1. Pré-requisitos

Antes de iniciar, verifique se os seguintes programas estão instalados:

- Node.js
- npm
- MySQL
- MySQL Workbench
- Git
- Visual Studio Code

Links para download:

- [Node.js](https://nodejs.org/en/download) — ambiente necessário para executar o back-end e o npm.
- [MySQL](https://dev.mysql.com/downloads/mysql/) — banco de dados utilizado pelo StockMaster.
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) — ferramenta utilizada para acessar e administrar o banco de dados.
- [Git](https://git-scm.com/install/windows) — utilizado para versionamento e integração com o GitHub.
- [Visual Studio Code](https://code.visualstudio.com/) — editor utilizado para desenvolvimento do projeto.

> Os links acima direcionam para as páginas oficiais de download das respectivas ferramentas.

---

## 2. Verificar o Node.js e o npm

O StockMaster utiliza o **Node.js** para executar o back-end da aplicação.

Para verificar se está instalado, execute no terminal (VScode):

```bash
node -v

Também verifique o npm:

npm -v

OBS: Se os dois comandos apresentarem uma versão, o Node.js e o npm estão disponíveis. O npm será utilizado para instalar as dependências do projeto.

3. Abrir a pasta do projeto

Após clonar o repositório, entre na pasta do StockMaster:

cd Stock-Master

Abra o projeto no VS Code:

code .

4. Instalar as dependências do projeto

Dentro da pasta Stock-Master, execute:

npm install

Esse comando lê o arquivo package.json e instala as dependências necessárias para o funcionamento do projeto.

Entre as dependências utilizadas pelo StockMaster estão:

Express.js — utilizado para estruturar o servidor e as rotas;
mysql2 — utilizado para realizar a conexão com o MySQL;
dotenv — utilizado para carregar as configurações do arquivo .env.
O que acontece depois do npm install?

Após a instalação, o npm cria a pasta:

node_modules/

Essa pasta contém as dependências instaladas para o projeto.

Também é utilizado o arquivo:

package-lock.json

Ele registra as versões específicas das dependências instaladas.

A pasta node_modules/ não deve ser enviada para o GitHub. Ela está configurada no .gitignore e pode ser recriada novamente executando npm install.

5. Configurar o banco de dados

O StockMaster utiliza o MySQL como banco de dados.

O banco utilizado pelo projeto é:

stockmaster

O script responsável pela criação do banco e das tabelas está localizado em:

database/script.sql

6. Criar o banco de dados

Abra o MySQL Workbench e conecte-se ao seu servidor MySQL local.

Depois, abra o arquivo:

database/script.sql

Execute o script no MySQL Workbench.

O script irá criar o banco:

stockmaster

e as tabelas necessárias para o funcionamento do sistema.

Após a execução, verifique se o banco stockmaster aparece no MySQL Workbench.

Cada integrante possui seu próprio banco de dados local. O script SQL permite que a mesma estrutura seja criada em cada computador.

7. Configurar o arquivo .env

O StockMaster utiliza o arquivo .env para armazenar as informações necessárias para conectar a aplicação ao banco de dados.

Na raiz do projeto existe o arquivo:

.env.example

Esse arquivo serve como modelo.

Crie um novo arquivo chamado:

.env

na raiz do projeto.

A configuração deverá seguir este modelo:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA
DB_NAME=stockmaster
DB_PORT=3306
O que significa cada configuração?
Variável	Função
DB_HOST	Endereço do servidor MySQL local
DB_USER	Usuário utilizado para acessar o MySQL
DB_PASSWORD	Senha do usuário do MySQL
DB_NAME	Nome do banco utilizado pelo projeto
DB_PORT	Porta utilizada pelo MySQL

Substitua:

SUA_SENHA

pela senha configurada no seu MySQL.

Por que o .env é necessário?

O arquivo .env permite que cada integrante configure suas próprias informações de acesso ao MySQL sem alterar o código do projeto.

Por exemplo, cada computador pode possuir uma senha diferente para o usuário root.

O código da aplicação utiliza essas informações por meio das variáveis de ambiente.

Importante

O arquivo:

.env

não deve ser enviado para o GitHub.

Ele está listado no .gitignore para permanecer apenas no ambiente local.

Já o arquivo:

.env.example

pode ser mantido no GitHub, pois serve como modelo para os integrantes configurarem seus próprios arquivos .env.

8. Iniciar o projeto

Depois de instalar as dependências, criar o banco e configurar o .env, execute:

npm start

O comando inicia o servidor definido no arquivo:

server.js

Se a configuração estiver correta, o terminal deverá apresentar mensagens semelhantes a:

Servidor rodando em http://localhost:3001
Conectado ao MySQL com sucesso!

Isso indica que:

o servidor Node.js foi iniciado;
o Express está funcionando;
a aplicação conseguiu estabelecer conexão com o MySQL.
9. Acessar o sistema

Com o servidor em execução, abra o navegador e acesse:

http://localhost:3001

A aplicação deverá apresentar a tela inicial do StockMaster.

10. Se ocorrer algum erro
Erro ao executar npm install

Verifique se o Node.js e o npm estão instalados:

node -v
npm -v

Depois, tente novamente:

npm install
Erro de conexão com o MySQL

Verifique:

se o MySQL está em execução;
se o banco stockmaster foi criado;
se o usuário está correto;
se a senha está correta;
se a porta está correta;
se o arquivo .env está configurado corretamente.
Erro relacionado ao .env

Verifique se o arquivo está na raiz do projeto:

Stock-Master/
├── .env
├── package.json
├── server.js
└── ...

Também confirme se as informações do arquivo estão preenchidas corretamente.

O sistema não abre em localhost:3001

Verifique se o servidor foi iniciado com:

npm start

E confira se o terminal apresenta:

Servidor rodando em http://localhost:3001
11. Configuração concluída

O ambiente estará configurado quando:

 Node.js instalado;

 npm funcionando;

 MySQL instalado e em execução;

 MySQL Workbench configurado;

 projeto clonado;

 npm install executado;

 pasta node_modules/ criada;

 banco stockmaster criado;

 database/script.sql executado;

 arquivo .env configurado;

 npm start executado;

 sistema acessível em http://localhost:3001.

## Fluxo da configuração

Instalar ferramentas
        ↓
Clonar o repositório
        ↓
Entrar na pasta Stock-Master
        ↓
Executar npm install
        ↓
node_modules/ é criado
        ↓
Configurar MySQL
        ↓
Executar database/script.sql
        ↓
Criar e configurar .env
        ↓
Executar npm start
        ↓
Servidor Node.js + Express
        ↓
Conexão com MySQL
        ↓
Acessar http://localhost:3001
