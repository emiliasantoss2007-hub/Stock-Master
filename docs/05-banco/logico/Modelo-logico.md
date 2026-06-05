# Modelo Lógico - Stock Master

## Visão Geral

O modelo lógico do sistema Stock Master foi elaborado com base nos requisitos funcionais, regras de negócio, casos de uso e no DER definido para o projeto. O objetivo é representar as estruturas de dados que serão persistidas no banco de dados e seus respectivos relacionamentos.

---

# Tabela: NIVEL_ACESSO

Armazena os perfis de acesso existentes no sistema.

| Campo           | Tipo        | Restrições |
| --------------- | ----------- | ---------- |
| id_nivel_acesso | INT         | PK         |
| descricao       | VARCHAR(50) | NOT NULL   |

### Relacionamentos

* Um nível de acesso pode estar associado a vários usuários.
* Relacionamento: **1:N com USUARIO**

---

# Tabela: USUARIO

Armazena os usuários cadastrados no sistema.

| Campo           | Tipo         | Restrições                         |
| --------------- | ------------ | ---------------------------------- |
| id_usuario      | INT          | PK                                 |
| nome            | VARCHAR(100) | NOT NULL                           |
| email           | VARCHAR(100) | UNIQUE                             |
| login           | VARCHAR(50)  | UNIQUE                             |
| senha_hash      | VARCHAR(255) | NOT NULL                           |
| status          | BOOLEAN      | NOT NULL                           |
| id_nivel_acesso | INT          | FK → NIVEL_ACESSO(id_nivel_acesso) |

### Relacionamentos

* Pertence a um único nível de acesso.
* Pode possuir várias solicitações de recuperação de senha.
* Pode realizar diversas movimentações de estoque.
* Pode gerar diversos relatórios.

---

# Tabela: RECUPERACAO_SENHA

Armazena as solicitações de recuperação de senha realizadas pelos usuários.

| Campo          | Tipo         | Restrições               |
| -------------- | ------------ | ------------------------ |
| id_recuperacao | INT          | PK                       |
| token          | VARCHAR(255) | NOT NULL                 |
| data_expiracao | DATETIME     | NOT NULL                 |
| utilizado      | BOOLEAN      | NOT NULL                 |
| id_usuario     | INT          | FK → USUARIO(id_usuario) |

### Relacionamentos

* Cada solicitação pertence a um único usuário.
* Relacionamento: **N:1 com USUARIO**

---

# Tabela: PRODUTO

Armazena os produtos cadastrados no sistema.

| Campo              | Tipo          | Restrições |
| ------------------ | ------------- | ---------- |
| id_produto         | INT           | PK         |
| sku                | VARCHAR(50)   | UNIQUE     |
| codigo_barras      | VARCHAR(50)   | NULL       |
| nome               | VARCHAR(100)  | NOT NULL   |
| categoria          | VARCHAR(100)  | NOT NULL   |
| descricao          | TEXT          | NULL       |
| quantidade_estoque | INT           | NOT NULL   |
| valor              | DECIMAL(10,2) | NULL       |

### Relacionamentos

* Um produto pode possuir diversas movimentações de estoque.
* Relacionamento: **1:N com MOVIMENTACAO**

---

# Tabela: MOVIMENTACAO

Registra todas as movimentações realizadas no estoque.

| Campo             | Tipo         | Restrições               |
| ----------------- | ------------ | ------------------------ |
| id_movimentacao   | INT          | PK                       |
| id_produto        | INT          | FK → PRODUTO(id_produto) |
| id_usuario        | INT          | FK → USUARIO(id_usuario) |
| tipo_movimentacao | VARCHAR(50)  | NOT NULL                 |
| quantidade        | INT          | NOT NULL                 |
| justificativa     | VARCHAR(255) | NULL                     |
| data_movimentacao | DATETIME     | NOT NULL                 |

### Valores possíveis para tipo_movimentacao

* ENTRADA
* SAIDA
* EXPURGO

### Relacionamentos

* Cada movimentação pertence a um produto.
* Cada movimentação é realizada por um usuário.

---

# Tabela: RELATORIO

Armazena os registros relacionados à geração de relatórios do sistema.

| Campo           | Tipo     | Restrições               |
| --------------- | -------- | ------------------------ |
| id_relatorio    | INT      | PK                       |
| data_inicio     | DATE     | NULL                     |
| usuario_afetado | DATE     | NULL                     |
| data_geracao    | DATETIME | NOT NULL                 |
| id_usuario      | INT      | FK → USUARIO(id_usuario) |

### Relacionamentos

* Cada relatório está vinculado a um usuário.
* Relacionamento: **N:1 com USUARIO**

---

# Relacionamentos do Modelo

```text
NIVEL_ACESSO (1)
        │
        └──────< USUARIO (N)
                      │
                      ├──────< RECUPERACAO_SENHA (N)
                      │
                      ├──────< MOVIMENTACAO (N)
                      │
                      └──────< RELATORIO (N)

PRODUTO (1)
      │
      └──────< MOVIMENTACAO (N)
```

---

# Resumo das Entidades

| Entidade          | Finalidade                                    |
| ----------------- | --------------------------------------------- |
| NIVEL_ACESSO      | Define os perfis de acesso do sistema         |
| USUARIO           | Armazena os usuários cadastrados              |
| RECUPERACAO_SENHA | Controla solicitações de redefinição de senha |
| PRODUTO           | Armazena os produtos do estoque               |
| MOVIMENTACAO      | Registra entradas, saídas e expurgos          |
| RELATORIO         | Registra informações sobre relatórios gerados |
|                   |                                               |

---
