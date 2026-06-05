# Banco de Dados

Esta pasta contém os artefatos relacionados à modelagem e implementação do banco de dados do sistema Stock Master.

A modelagem foi desenvolvida com base nos requisitos funcionais, regras de negócio, casos de uso e demais documentos do projeto.

## Estrutura

### Modelo Conceitual

Representa a visão de negócio dos dados do sistema, identificando as entidades, atributos e relacionamentos de forma independente de tecnologia.

Objetivos:
- Identificar os elementos do domínio do problema.
- Representar os relacionamentos entre entidades.
- Servir de base para a construção dos modelos lógico e físico.

Status: Em desenvolvimento.

---

### Modelo Lógico

Representa a estrutura lógica do banco de dados, definindo entidades, atributos, chaves primárias, chaves estrangeiras e relacionamentos.

Objetivos:
- Organizar os dados de forma estruturada.
- Garantir a integridade dos relacionamentos.
- Preparar a modelagem para implementação.

Status: Concluído.

---

### Modelo Físico

Representa a implementação do banco de dados em um Sistema Gerenciador de Banco de Dados (SGBD), contendo tipos de dados específicos e scripts de criação.

Objetivos:
- Definir a estrutura física das tabelas.
- Implementar restrições e relacionamentos.
- Disponibilizar scripts para criação do banco de dados.

Status: Em desenvolvimento.

---

## Artefatos

| Documento | Descrição |
|------------|------------|
| Modelo Conceitual | Representação de alto nível das entidades e relacionamentos |
| Modelo Lógico | Estrutura lógica das tabelas e relacionamentos |
| Modelo Físico | Estrutura física e scripts SQL do banco de dados |

---

## Relação com os demais documentos

A modelagem do banco de dados foi elaborada a partir dos documentos presentes nas seguintes pastas:

- 01-dominio
- 02-requisitos
- 03-regras-de-negocio
- 04-modelagem

As alterações realizadas nos requisitos ou regras de negócio podem impactar diretamente os modelos de dados e deverão ser refletidas nesta documentação.