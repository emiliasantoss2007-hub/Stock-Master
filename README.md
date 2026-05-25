# Stock Master
---

### Sistema de gerenciamento de estoque desenvolvido para assistência técnica, com foco em controle operacional, rastreabilidade de movimentações, segurança de acesso e monitoramento de estoque crítico.

---
## Status do Projeto
>Em desenvolvimento

## Sobre o Projeto

O Stock Master foi projetado para centralizar e organizar as operações de estoque de uma assistência técnica, permitindo o gerenciamento de:

- Usuários e permissões
- Produtos
- Entradas e saídas de estoque
- Expurgo de produtos
- Histórico de movimentações
- Alertas de estoque crítico
- Relatórios operacionais

O sistema busca reduzir inconsistências, aumentar a segurança das operações e melhorar o controle sobre os itens armazenados.

--- 

## Objetivos do Sistema

- Controlar o estoque de forma centralizada
- Garantir rastreabilidade das movimentações
- Restringir acessos conforme perfil do usuário
- Reduzir erros operacionais
- Facilitar consultas e auditorias
- Monitorar níveis críticos de estoque

--- 
## Perfis de Usuário

### Administrador

Responsável por:

- Gerenciar usuários
- Gerenciar produtos
- Controlar permissões
- Gerar relatórios
- Executar operações críticas
- Realizar expurgo de estoque
- Técnico

Responsável por:

- Consultar produtos
- Registrar entradas de estoque
- Registrar saídas de estoque
- Consultar movimentações

---

## Funcionalidades Principais

### Autenticação e Controle de Acesso
- Login com validação segura
- Controle de permissões por perfil
- Restrição de funcionalidades conforme usuário
- Criptografia de senhas
- Controle de tentativas de login

### Gestão de Usuários

- Cadastro de usuários
- Edição de usuários
- Exclusão de usuários
- Consulta de usuários
- Alteração de senha
- Recuperação de senha por e-mail

### Gestão de Produtos

- Cadastro de produtos
- Consulta de produtos
- Edição de produtos
- Exclusão de produtos

### Controle de Estoque

- Cadastro inicial de estoque
- Entrada de produtos
- Saída de produtos
- Expurgo de produtos
- Atualização automática do estoque

### Histórico e Auditoria

- Registro de movimentações
- Rastreabilidade completa das operações
- Histórico com:
  - Tipo de movimentação
  - Produto
  - Quantidade
  - Data da operação

### Alertas e Relatórios

- Monitoramento de estoque crítico
- Alertas automáticos
- Relatórios operacionais

---
## Regras de Negócio
### Controle de Acesso
- Apenas usuários autenticados podem acessar o sistema
- Permissões são aplicadas conforme perfil

### Cadastro de Usuários
- Apenas administradores podem cadastrar usuários
- Login deve ser único
- Senha mínima de 8 caracteres

### Controle de Estoque
- Entradas devem possuir quantidade maior que zero
- Saídas não podem ultrapassar o estoque disponível
- Expurgo exige justificativa

### Auditoria
- Toda movimentação deve ser registrada

## Requisitos Não Funcionais

### Segurança
- Senhas criptografadas
- Controle de permissões
- Proteção de dados sensíveis

### Desempenho
- Operações principais devem responder em até 3 segundos

### Compatibilidade
- Compatível com:
  - Google Chrome
  - Microsoft Edge
  - Mozilla Firefox

### Usabilidade
- Interface responsiva
- Navegação intuitiva
- Feedback visual para erros e validações

## Estrutura do Projeto
```
stock-master/
│
├── docs/
│   ├── 01-visao-geral.md
│   ├── 02-requisitos.md
│   ├── 03-regras-de-negocios.md
│   ├── 04-modelagem.md
│   └── 05-banco.md
│
├── frontend/
│
├── MONOGRAFIA-entrega.md
│
└── README.md
```
## Fluxo Geral do Sistema
