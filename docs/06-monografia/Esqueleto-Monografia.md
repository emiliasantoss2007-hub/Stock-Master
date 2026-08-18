[CAPA]



---

[FOLHA DE ROSTO]



---

# **DEDICATÓRIA**

(Opcional)

---

# **AGRADECIMENTOS**

(Opcional)

---

# **EPÍGRAFE**

(Opcional)

---

# **RESUMO**

**Palavras-chave**: [gerenciamento de estoque; engenharia de software; modelagem de sistemas; banco de dados; UML.]

---

# **ABSTRACT**

**Keywords**: [ inventory management; software engineering; system modeling; database; UML.]

---

# **LISTA DE FIGURAS**

Figura 1 — Diagrama de Casos de Uso

Figura 2 — DER do Sistema

Figura 3 — Fluxo de Entrada de Estoque

Figura 4 — Fluxo de Saída de Estoque

Figura 5 — Fluxo de Expurgo

---

# **LISTA DE TABELAS**

Tabela 1 — Requisitos Funcionais

Tabela 2 — Requisitos Não Funcionais

Tabela 3 — Regras de Negócio

Tabela 4 — Dicionário de Dados

---

# **LISTA DE SIGLAS**

| **Sigla** | **Significado** |
| --- | --- |
| RF | Requisito Funcional |
| RNF | Requisito Não Funcional |
| RN | Regra de Negócio |
| UML | Unified Modeling Language |
| DER | Diagrama Entidade Relacionamento |
| CRUD | Create, Read, Update and Delete |
| SQL | Structured Query Language |

---

**SUMÁRIO**


---

# **1 INTRODUÇÃO**

## **1.1 Contextualização**

Escreva sobre o cenário do problema, explicando a importância do controle de estoque em assistências técnicas e os impactos da falta de organização.

## **1.2 Problema**

Explique qual problema o sistema pretende resolver, como inconsistência de estoque, perdas de produtos e falta de rastreabilidade.

## **1.3 Justificativa**

Explique por que o desenvolvimento do sistema é importante para melhorar controle, segurança, organização e eficiência operacional.

## **1.4 Objetivo Geral**

Descreva, em uma frase, o principal objetivo do trabalho e do sistema desenvolvido.

## **1.5 Objetivos Específicos**

Liste as ações específicas do projeto, como levantamento de requisitos, modelagem do banco de dados, criação do DER e documentação do sistema.

## **1.6 Metodologia**

Explique quais métodos foram utilizados no desenvolvimento do trabalho, como análise de requisitos, modelagem UML e documentação técnica.

## **1.7 Estrutura do Trabalho**

Explique resumidamente o que será apresentado em cada capítulo da monografia

---

# **2 FUNDAMENTAÇÃO TEÓRICA**

## **2.1 Sistemas de Informação**

(Desenvolver fundamentação teórica sobre sistemas de informação.)

## **2.2 Gestão de Estoque**

(Desenvolver fundamentação sobre controle e gerenciamento de estoque.)

## **2.3 Engenharia de Software**

(Desenvolver fundamentação sobre requisitos, modelagem e documentação.)

## **2.4 Banco de Dados**

(Desenvolver conceitos sobre modelagem relacional, entidades e integridade.)

## **2.5 Segurança da Informação**

(Desenvolver conceitos sobre autenticação, criptografia e controle de acesso.)

---

# **3 LEVANTAMENTO E ANÁLISE DE REQUISITOS**

## **3.1 Visão Geral do Sistema**

Apresente uma visão resumida do Stock Master, explicando sua finalidade, público-alvo e principais funcionalidades.

## **3.2 Escopo do Sistema**

Descreva quais funcionalidades fazem parte do sistema e quais operações estão contempladas no projeto.

## **3.3 Perfis de Usuário**

Explique os tipos de usuários do sistema e suas responsabilidades dentro da aplicação.

### **3.3.1 Administrador**

Descreva as permissões e responsabilidades do administrador no gerenciamento do sistema.

### **3.3.2 Técnico**

Descreva as operações que o técnico pode realizar no sistema relacionadas ao estoque.

## **3.4 Requisitos Funcionais**

Explique as funcionalidades que o sistema deve executar para atender às necessidades dos usuários.

## **3.5 Requisitos Não Funcionais**

Explique os requisitos relacionados à qualidade, desempenho, segurança e usabilidade do sistema.

## **3.6 Regras de Negócio**

Descreva as restrições e condições que definem o funcionamento correto das operações do sistema.

| **Código** | **Regra** |
| --- | --- |
| RN01 | Controle de acesso por login e senha |
| RN02 | Cadastro de usuários por administradores |
| RN03 | Exclusão de usuários mediante confirmação |
| RN04 | Cadastro de produtos com campos obrigatórios |
| RN05 | Edição de produtos por administradores |
| RN06 | Exclusão de produtos mediante confirmação |
| RN07 | Entrada de estoque com quantidade válida |
| RN08 | Saída limitada ao estoque disponível |
| RN09 | Expurgo mediante justificativa |
| RN10 | Registro obrigatório de movimentações |
| RN11 | Alerta de estoque crítico |
| RN12 | Relatórios administrativos |

---

# **4 MODELAGEM DO SISTEMA**

## **4.1 Diagrama de Casos de Uso**

(Inserir diagrama de casos de uso.)

## **4.2 Descrição dos Casos de Uso**

(Inserir descrição dos casos de uso.)

## **4.3 Modelo Conceitual**

(Inserir descrição do modelo conceitual.)

## **4.4 DER - Diagrama Entidade Relacionamento**

(Inserir DER do sistema.)

## **4.5 Dicionário de Dados**

## **4.6 Modelo Lógico**

(Inserir modelo lógico do banco de dados.)

## **4.7 Fluxo de Movimentação de Estoque**

### **Entrada de Estoque**

(Inserir fluxo.)

### **Saída de Estoque**

(Inserir fluxo.)

### **Expurgo**

(Inserir fluxo.)

## **4.8 Regras de Integridade**

- O estoque não pode ficar negativo;

- O login deve ser único;

- As senhas devem ser armazenadas de forma criptografada;

- Toda movimentação deve ser registrada.

---

# **5 PROPOSTA DA SOLUÇÃO**

## **5.1 Arquitetura Geral do Sistema**

(Inserir arquitetura conceitual do sistema.)

## **5.2 Segurança**

O sistema utiliza autenticação baseada em login e senha criptografada, além de controle de permissões por perfil de acesso.

## **5.3 Controle de Estoque**

O sistema realiza operações de entrada, saída e expurgo de produtos, mantendo rastreabilidade completa das movimentações.

## **5.4 Benefícios Esperados**

- Melhor organização do estoque;

- Redução de inconsistências;

- Maior rastreabilidade;

- Segurança no acesso às informações;

- Controle operacional mais eficiente.

---

# **6 CONSIDERAÇÕES FINAIS**

## **6.1 Retomada do Problema**

Explique novamente o problema identificado no controle de estoque e as dificuldades que motivaram o desenvolvimento do sistema.

## **6.2 Objetivos Alcançados**

Descreva como a documentação, modelagem e proposta do sistema atenderam aos objetivos definidos no trabalho.

## **6.3 Resultados Esperados**

Explique os benefícios esperados com a utilização do sistema, como organização, rastreabilidade e melhoria no controle operacional.

## **6.4 Importância da Modelagem**

Descreva a importância da engenharia de requisitos, diagramas UML e DER para o planejamento e estruturação do sistema.

## **6.5 Limitações do Trabalho**

Explique o que não foi desenvolvido ou aprofundado no projeto, como implementação completa, integração externa ou módulos adicionais.

## **6.6 Trabalhos Futuros**

Apresente possíveis melhorias futuras para o sistema, como dashboards, relatórios avançados, integração com vendas ou notificações automatizadas.

## **6.7 Encerramento**

Finalize destacando a importância do sistema para apoiar a gestão de estoque em assistências técnicas e a contribuição da documentação para futuras implementações e manutenções.

---

# **REFERÊNCIAS**

(Adicionar referências conforme ABNT NBR 6023:2018.)

---

# **GLOSSÁRIO**

| **Termo** | **Definição** |
| --- | --- |
| DER | Diagrama Entidade Relacionamento |
| Hash | Resultado criptográfico utilizado para proteger senhas |
| CRUD | Operações de criação, leitura, atualização e exclusão |
| Estoque crítico | Nível mínimo de estoque configurado |

---

# **APÊNDICES**

## **APÊNDICE A - Requisitos Funcionais Completos**

(Inserir requisitos completos.)

## **APÊNDICE B - Regras de Negócio Completas**

(Inserir regras de negócio completas.)

## **APÊNDICE C - Casos de Uso Completos**

(Inserir casos de uso completos.)

---

# **ANEXOS**

## **ANEXO A - Diagrama de Casos de Uso**

(Inserir imagem do diagrama UML.)

## **ANEXO B - DER Completo**

(Inserir imagem do DER.)

## **ANEXO C - Diagrama de Classes**

(Inserir diagrama UML.)

## **ANEXO D - Diagrama de Sequência**

(Inserir diagrama UML.)

## **ANEXO E - Diagrama de Atividades**

(Inserir diagrama UML.)

## **ANEXO F - Fluxogramas do Sistema**

(Inserir fluxogramas.)
