# Guia de Mapeamento do Front-end — StockMaster

## 1. Objetivo

Este documento tem como objetivo facilitar a localização dos arquivos do Front-end do StockMaster.

O guia apresenta a relação entre cada funcionalidade do sistema e os respectivos arquivos HTML, CSS e JavaScript.

A estrutura física atual do projeto será mantida. Este documento funciona como um mapa para facilitar o desenvolvimento e evitar a procura manual pelos arquivos.

---

## 2. Estrutura atual

O Front-end do StockMaster está localizado dentro da pasta `views`:

```text
views/
├── css/
├── html/
└── js/
```

### HTML

Os arquivos HTML representam a estrutura das páginas e telas do sistema.

```text
views/html/
```

### CSS

Os arquivos CSS representam a aparência e os estilos das páginas.

```text
views/css/
```

### JavaScript

Os arquivos JavaScript representam os comportamentos e as interações das páginas.

```text
views/js/
```

---

## 3. Organização por módulos

O Front-end está dividido logicamente nos seguintes módulos:

```text
STOCKMASTER
│
├── 1. Usuários e Autenticação
│
├── 2. Gestão de Produtos
│
├── 3. Controle de Estoque
│
├── 4. Movimentações e Relatórios
│
└── Dashboard
```

Essa divisão é utilizada apenas para facilitar a localização das funcionalidades.

Os arquivos continuam nas pastas atuais:

```text
views/
├── html/
├── css/
└── js/
```

---

## 4. Módulo 1 — Usuários e Autenticação

Este módulo reúne as funcionalidades relacionadas ao acesso ao sistema, usuários, perfil e recuperação de senha.

### 4.1 Login

Responsável pelo acesso do usuário ao sistema.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/login.html` |
| CSS | `views/css/login.css` |
| JavaScript | `views/js/login.js` |

### 4.2 Cadastrar Usuário

Responsável pela tela de cadastro de novos usuários.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/cadastrar_usuarios.html` |
| CSS | `views/css/usuarios.css` |
| JavaScript | `views/js/cadastrar_usuarios.js` |

### 4.3 Usuários

Responsável pela tela de gerenciamento/listagem dos usuários.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/usuarios.html` |
| CSS | `views/css/usuarios.css` |
| JavaScript | `views/js/usuarios.js` |

### 4.4 Editar Usuário

Responsável pela edição dos dados de um usuário.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/editar_usuario.html` |
| CSS | `views/css/usuarios.css` |
| JavaScript | `views/js/editar_usuario.js` |

### 4.5 Perfil

Responsável pela tela de perfil do usuário.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/perfil.html` |
| CSS | `views/css/perfil.css` |
| JavaScript | `views/js/perfil.js` |

### 4.6 Recuperar Senha

Responsável pela tela inicial do processo de recuperação de senha.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/recuperar_senha.html` |
| CSS | `views/css/recuperar_senha.css` |
| JavaScript | `views/js/recuperar_senha.js` |

### 4.7 Redefinir Senha

Responsável pela tela de definição de uma nova senha.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/redefinir_senha.html` |
| CSS | `views/css/recuperar_senha.css` |
| JavaScript | `views/js/redefinir_senha.js` |

---

## 5. Módulo 2 — Gestão de Produtos

Este módulo reúne as funcionalidades relacionadas ao cadastro, consulta, visualização e edição dos produtos.

### 5.1 Produtos

Responsável pela tela de listagem e gerenciamento dos produtos.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/produtos.html` |
| CSS | `views/css/produtos.css` |
| JavaScript | `views/js/produtos.js` |

### 5.2 Cadastrar Produto

Responsável pela tela de cadastro de produtos.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/cadastrar_produto.html` |
| CSS | `views/css/produtos.css` |
| JavaScript | `views/js/cadastrar_produto.js` |

### 5.3 Editar Produto

Responsável pela edição dos dados de um produto.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/editar_produto.html` |
| CSS | `views/css/produtos.css` |
| JavaScript | `views/js/editar_produto.js` |

### 5.4 Detalhes do Produto

Responsável pela visualização detalhada de um produto.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/produto_detalhes.html` |
| CSS | `views/css/produtos.css` |
| JavaScript | `views/js/produto_detalhes.js` |

---

## 6. Módulo 3 — Controle de Estoque

Este módulo reúne as funcionalidades relacionadas ao controle da quantidade de produtos no estoque.

### 6.1 Entrada de Estoque

Responsável pela tela de registro de entrada de produtos no estoque.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/entrada_estoque.html` |
| CSS | `views/css/entrada_estoque.css` |
| JavaScript | `views/js/entrada_estoque.js` |

### 6.2 Saída de Estoque

Responsável pela tela de registro de saída de produtos do estoque.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/saída_estoque.html` |
| CSS | `views/css/saída_estoque.css` |
| JavaScript | `views/js/saída_estoque.js` |

### 6.3 Expurgo de Estoque

Responsável pela funcionalidade de expurgo de produtos do estoque.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/expurgo_estoque.html` |
| CSS | `views/css/expurgo_estoque.css` |
| JavaScript | `views/js/expurgo_estoque.js` |

---

## 7. Módulo 4 — Movimentações e Relatórios

Este módulo reúne as funcionalidades relacionadas ao histórico das movimentações e à geração e visualização de relatórios.

### 7.1 Histórico de Movimentações

Responsável pela consulta do histórico das movimentações realizadas no estoque.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/historico_movimentacao.html` |
| CSS | `views/css/historico_movimentacao.css` |
| JavaScript | `views/js/historico_movimentacao.js` |

### 7.2 Relatórios

Responsável pela tela de geração e gerenciamento dos relatórios.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/relatorios.html` |
| CSS | `views/css/relatorios.css` |
| JavaScript | `views/js/relatorios.js` |

### 7.3 Visualizar Relatório

Responsável pela visualização de um relatório.

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/visualizar_relatorios.html` |
| CSS | `views/css/relatorios.css` |
| JavaScript | `views/js/visualizar_relatorios.js` |

---

## 8. Dashboard

O Dashboard funciona como uma área inicial de visualização e acesso às funcionalidades do sistema.

Existem duas versões:

### 8.1 Dashboard do Administrador

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/dashboard_adm.html` |
| CSS | `views/css/dashboard.css` |
| JavaScript | Não possui arquivo JavaScript específico identificado |

### 8.2 Dashboard do Técnico

| Tipo | Arquivo |
|---|---|
| HTML | `views/html/dashboard_tec.html` |
| CSS | `views/css/dashboard.css` |
| JavaScript | Não possui arquivo JavaScript específico identificado |

O arquivo:

```text
views/css/dashboard.css
```

é compartilhado pelos dois dashboards.

---

## 10. Arquivos CSS compartilhados

Alguns arquivos CSS são utilizados por mais de uma funcionalidade.

### `usuarios.css`

Utilizado por:

```text
cadastrar_usuarios.html
usuarios.html
editar_usuario.html
```

### `produtos.css`

Utilizado por:

```text
produtos.html
cadastrar_produto.html
editar_produto.html
produto_detalhes.html
```

### `recuperar_senha.css`

Utilizado por:

```text
recuperar_senha.html
redefinir_senha.html
```

### `relatorios.css`

Utilizado por:

```text
relatorios.html
visualizar_relatorios.html
```

### `dashboard.css`

Utilizado por:

```text
dashboard_adm.html
dashboard_tec.html
```

Por serem arquivos compartilhados, alterações nesses CSS podem afetar mais de uma tela.

Antes de realizar alterações, verifique quais funcionalidades utilizam o arquivo.

---

## 11. Como localizar uma tarefa

Quando uma tarefa for recebida, primeiro identifique a funcionalidade.

Por exemplo:

> "Implementar a tela de Editar Produto."

Consultar o mapa:

```text
Módulo:
Gestão de Produtos

HTML:
views/html/editar_produto.html

CSS:
views/css/produtos.css

JavaScript:
views/js/editar_produto.js
```

Outro exemplo:

> "Implementar o cadastro de usuário."

Consultar o mapa:

```text
Módulo:
Usuários e Autenticação

HTML:
views/html/cadastrar_usuarios.html

CSS:
views/css/usuarios.css

JavaScript:
views/js/cadastrar_usuarios.js
```

Dessa forma, o integrante sabe imediatamente quais arquivos deve analisar.

---

## 12. Cuidados ao alterar arquivos

Antes de realizar uma alteração:

1. Consulte este guia.
2. Identifique os arquivos relacionados à funcionalidade.
3. Verifique se o CSS é compartilhado com outras telas.
4. Verifique se o HTML possui referências para arquivos CSS e JavaScript.
5. Evite alterar arquivos que não sejam necessários para a tarefa.
6. Não renomeie ou mova arquivos sem consultar a equipe.
7. Teste a funcionalidade após a alteração.

---

## 13. Importante sobre a estrutura

Este documento é um mapa da estrutura do Front-end.

Ele não determina que os arquivos devem ser movidos ou reorganizados.

A estrutura física atual deve permanecer:

```text
views/
├── html/
├── css/
└── js/
```

Os integrantes devem utilizar o mapa para localizar os arquivos necessários dentro dessa estrutura.

---

## 14. Relação com o fluxo de Git

Este guia deve ser utilizado em conjunto com:

```text
guia_fluxo_branches.md
```

A função de cada guia é diferente.

**Guia de Mapeamento do Front-end**

Responde:

> Quais arquivos estão relacionados à minha tarefa?

**Guia de Fluxo de Desenvolvimento Git**

Responde:

> Como devo desenvolver e enviar minha alteração?

Fluxo:

```text
Receber tarefa
      ↓
Consultar o mapa do Front-end
      ↓
Identificar os arquivos
      ↓
Trabalhar na própria branch
      ↓
Desenvolver
      ↓
Testar
      ↓
Commit
      ↓
Push
      ↓
Pull Request
      ↓
Revisão
      ↓
Merge para develop
```