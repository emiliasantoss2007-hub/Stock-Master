# Visão Geral do Sistema Stock Master

## Fonte

Este documento foi elaborado a partir do arquivo `Escopo Sistema/Escopo Sistema de Controle de Estoque.pdf`.

## Sobre o Projeto

O Stock Master é um sistema de gerenciamento de estoque voltado para uma assistência técnica. A solução tem como finalidade controlar, organizar e registrar as operações relacionadas ao estoque, permitindo maior precisão, segurança e eficiência nos processos internos.

O sistema centraliza o gerenciamento de produtos, usuários e movimentações de estoque, oferecendo recursos para cadastro, consulta, edição, exclusão, controle de entradas e saídas, expurgo, histórico de movimentações e alertas de estoque crítico.

## Objetivo do Sistema

O objetivo do sistema é apoiar o controle completo do estoque da assistência técnica, garantindo que as informações de produtos, usuários e movimentações estejam sempre atualizadas, organizadas e protegidas.

## Público-Alvo

O sistema foi projetado para atender diferentes perfis de usuários envolvidos na operação da assistência técnica.

### Administrador

Usuário responsável por gerenciar cadastros, permissões, produtos, movimentações, relatórios e configurações relacionadas ao controle do sistema.

### Técnico

Usuário responsável por executar operações de estoque autorizadas, como consultar produtos, registrar entradas, registrar saídas e acompanhar movimentações.

## Escopo Funcional

O sistema contempla funcionalidades relacionadas à gestão de usuários, autenticação, controle de acesso, gestão de produtos, movimentações de estoque, histórico, alertas e relatórios.

## Módulos do Sistema

### Gerenciamento de Usuários

O sistema permite cadastrar, editar, excluir e consultar usuários. Também controla o acesso por meio de login e definição de permissões, garantindo que cada usuário acesse somente as funcionalidades permitidas para seu perfil.

### Autenticação e Controle de Acesso

O sistema possui login seguro com validação por login e senha. As permissões são aplicadas conforme o perfil do usuário, como Administrador ou Técnico, garantindo segurança e controle nas operações realizadas.

### Cadastro e Gerenciamento de Produtos

O sistema permite o cadastro completo de produtos, incluindo nome, categoria, quantidade e demais informações relevantes. Também permite consultar, editar e excluir produtos, mantendo os dados atualizados e organizados.

### Controle de Estoque

O sistema realiza o controle das operações essenciais de estoque.

As principais operações previstas são:

- Cadastro inicial de estoque.
- Inclusão de produtos no estoque.
- Saída de produtos por venda ou uso.
- Expurgo de produtos por perda, dano ou vencimento.

Essas funcionalidades garantem que o estoque disponível seja atualizado conforme as movimentações realizadas.

### Histórico de Movimentações

Todas as movimentações realizadas no estoque são registradas para permitir acompanhamento e rastreabilidade das operações.

O histórico deve registrar informações como:

- Tipo de movimentação.
- Produto movimentado.
- Quantidade movimentada.
- Data da operação.

### Alerta de Estoque Crítico

O sistema monitora automaticamente os níveis de estoque e gera alertas quando a quantidade disponível de um produto atinge o nível mínimo definido.

O limite de estoque crítico pode ser configurado por produto, podendo ser definido, por exemplo, como 30% da quantidade total.

### Segurança e Criptografia

O sistema protege dados sensíveis por meio de criptografia, especialmente senhas. O controle de acesso por perfil também contribui para que cada usuário execute apenas as operações permitidas.

### Compatibilidade e Usabilidade

O sistema deve funcionar em diferentes navegadores e dispositivos. A interface deve ser intuitiva e responsiva, facilitando o uso por administradores e técnicos.

## Benefícios Esperados

- Maior controle sobre produtos e movimentações de estoque.
- Redução de inconsistências nas informações registradas.
- Melhor rastreabilidade das operações realizadas.
- Mais segurança no acesso às funcionalidades.
- Agilidade na consulta e atualização dos dados.
- Identificação preventiva de estoque crítico.

## Resumo

O Stock Master organiza os principais processos de estoque de uma assistência técnica em uma única solução. O sistema integra cadastro de usuários, controle de acesso, gerenciamento de produtos, movimentações de estoque, histórico operacional e alertas, contribuindo para uma gestão mais segura, eficiente e confiável.

