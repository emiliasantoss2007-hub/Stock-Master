# Casos de Uso do Sistema

## UC01 - Realizar Login com Validação por Hash

### Objetivo

Permitir que o usuário acesse o sistema de forma segura, validando sua senha através de hash criptográfico, sem armazenar ou comparar senhas em texto puro

### Atores

- Usuário (Administrador, Funcionário, etc.)

### Pré-condições

- O usuário já deve estar cadastrado no sistema
- A senha do usuário deve estar armazenada no banco de dados em formato hash
- O sistema deve possuir um algoritmo de hash configurado

### Pós-condições

Em caso de sucesso:

- Usuário autenticado no sistema
- Sessão iniciada com seu nível de acesso

Em caso de falha:

- Acesso negado
- Mensagem de erro exibida

### Fluxo Principal

1. O usuário acessa a tela de login.
2. O usuário informa:
   - login
   - senha
3. O sistema busca o usuário pelo login.
4. O sistema recupera o hash da senha armazenada.
5. O sistema aplica o algoritmo de hash na senha informada.
6. O sistema compara:
   - hash gerado vs hash armazenado
7. Se forem iguais:
   - acesso liberado
   - sistema redireciona para o painel
8. O sistema carrega o nível de acesso do usuário

### Fluxos Alternativos

#### FA01 - Usuário não encontrado

O sistema não localiza o login informado.

Exibe mensagem: "Usuário ou senha inválidos"

#### FA02 - Senha incorreta

O hash da senha não corresponde.

Exibe mensagem: "Usuário ou senha inválidos"

#### FA03 - Erro no sistema

Falha ao acessar banco ou processar hash.

Exibe mensagem: "Erro interno. Tente novamente mais tarde"

## UC02 - Controle de Tentativas de Login

### Atores

- Usuário (Administrador ou Técnico)

### Objetivo

Garantir a integridade do sistema de gestão de estoque, bloqueando tentativas de acesso de pessoas não autorizadas e prevenindo ataques de força bruta.

### Descrição

O controle de tentativas será aplicado na tela de login. O sistema deve monitorar erros consecutivos e, ao atingir o limite, impedir o acesso temporariamente através de uma tela de bloqueio.

### Exigências de Validação

Para o controle de segurança, o sistema deve:

- Contabilizar cada tentativa falha de login.
- Exibir o número de tentativas restantes em tempo real.
- Bloquear o acesso após a 5ª tentativa incorreta.
- Impor um tempo de espera de 30 minutos antes de permitir um novo login.

### Comportamento do Sistema

#### Tentativa de Login Incorreta

1. O usuário acessa a tela de login.
2. O usuário insere o "Usuário" e a "Senha".
3. O sistema valida as credenciais.
4. Se os dados estiverem incorretos, o sistema exibe um alerta em vermelho no topo do formulário.
5. O sistema informa o motivo do erro e quantas tentativas o usuário ainda possui.
6. O usuário deve corrigir os dados para tentar novamente.

#### Bloqueio de Acesso

1. O usuário atinge o limite de 5 tentativas falhas.
2. O sistema redireciona o usuário para a tela de "Bloqueado".
3. O sistema exibe o modal informando que o limite foi ultrapassado.
4. O sistema informa que o acesso está suspenso por 30 minutos por motivos de segurança.
5. O usuário clica no botão "Entendo" para fechar o aviso, mas o acesso permanece restrito.

### Mensagens de Erros

O sistema deve exibir mensagens claras, conforme o design:

- Erro inicial: “Usuário inexistente ou senha incorreta.”
- Contador: “Você tem [X] tentativas restantes antes do bloqueio.”
- Tela de Bloqueio: “Você ultrapassou o limite de 5 tentativas de login, para sua segurança bloqueamos seu acesso ao sistema. Tente novamente após 30 minutos.”

### Textos das Telas de Apoio

#### Tela de Login

- LOGIN
- Usuário inexistente ou senha incorreta.
- Você tem 4 tentativas restantes antes do bloqueio.
- Usuário
- Digite seu usuário
- Senha
- Digite sua senha
- Mostrar Senha
- ENTRAR

#### Tela de Bloqueio

- Bloqueado
- Você ultrapassou o limite de 5 tentativas de login, para sua segurança bloqueamos seu acesso ao sistema. Tente novamente após 30 minutos.
- Entendo

### Exemplos de Fluxo Válido

- Inserir Usuário/Senha corretos na 1ª tentativa: Acesso liberado.
- Errar 2 vezes e acertar na 3ª: Contador resetado e acesso liberado.

### Exemplos de Fluxo de Bloqueio

Errar 5 vezes seguidas $\rightarrow$ Sistema exibe tela de bloqueio e trava o login por 30 min.

### Requisitos Relacionados

- RF-01 (Cadastro de Perfil / Login).
- RNF-01.03 (Usabilidade).
- RNF-06.01 (Segurança).

## UC03 - Campo de Cadastro de Usuário

### Atores

- Administrador (primário)
- Usuário (secundário)

### Objetivo

Garantir que novos usuários possam ser registrados no sistema com informações válidas e seguras, possibilitando o controle de acesso conforme o perfil

### Descrição

Criação e validação de campos obrigatórios no formulário de cadastro, contendo nome, e-mail, login, senha e tipo de perfil

### Pré-condições

- O administrador deve estar autenticado no sistema
- O sistema deve estar em funcionamento

### Pós-condições

- Usuário cadastrado com sucesso no banco de dados
- Usuário apto a acessar o sistema conforme seu perfil
- Em caso de erro, os dados inválidos não devem ser salvos no sistema

### Fluxo Principal

- O administrador acessa o sistema
- O administrador seleciona o ícone “Gerenciamento De Usuários”
- O administrador seleciona o ícone “Novo Usuário”
- O sistema exibi o formulário de cadastro
- O administrador preenche os seguintes campos:
  - Nome
  - Login
  - E-mail
  - Senha
  - Tipo De Perfil
- O administrador seleciona o ícone “Salvar”
- O sistema valida os dados informados
- O sistema armazena o novo usuário no banco de dados
- O sistema exibi uma mensagem de confirmação de cadastro

### Fluxo Alternativo

#### Dados inválidos ou incompleto

Caso algum campo obrigatório não for preenchido ou ser preenchido de forma incorreta

- O sistema destaca os campos inválidos em vermelho
- Exibi mensagem de erro
- Solicita correção dos dados do usuário

#### Senha fora do padrão

Caso a senha tenha menos que 8 caracteres

- O sistema bloqueia o cadastro
- O sistema exibi mensagem informando o requisito mínimo

### Regras de Negócio

- A senha deve conter no mínimo 8 caracteres
- O login deve ser único no sistema
- O e-mail deve possuir um formato válido
- O perfil deve ser obrigatoriamente definido

### Regras de Segurança

- Senhas devem ser armazenadas de forma criptografada
- Apenas os administradores podem cadastrar usuários
- Dados sensíveis devem ser protegidos

### Requisitos Relacionados

- Requisitos Funcionais: RF-01 - Cadastro de Perfil (login)
- RF-02 - Cadastro de Usuários
- RF-06 - Controle de Acesso
- Requisitos Não Funcionais: RNF-02.01 (segurança) - Senha mínima de 8 caracteres
- RNF-02.02 (desempenho) - Indicação visual de erros no campo
- RNF-02.03 (usabilidade) - Garantia de armazenamento correto

## UC04 - Consultar/Listar Usuários do Sistema

### Objetivos

- Permitir a busca e visualização de usuários cadastrados no sistema por meio de filtros como nome, e-mail ou tipo de perfil, exibindo os resultados em lista para facilitar a localização.
- Permitir que usuários autorizados visualizem a relação de todos os usuários cadastrados, facilitando o gerenciamento de perfis e o acesso rápido a ferramentas de controle.

### Atores

- Usuário do sistema
- Administrador
- Funcionário autorizado
- Funcionário
- Estagiário (apenas visualização)

### Pré-condições

- O usuário deve estar autenticado no sistema.
- Devem existir usuários cadastrados no sistema.
- O ator deve possuir permissão de "Visualizar Usuários" (UC02).

### Pós-condições

- O sistema exibe uma lista de usuários conforme os filtros aplicados.
- Nenhuma alteração é realizada nos dados (somente leitura).
- A lista é exibida de forma organizada, paginada e atualizada.
- O usuário pode prosseguir para a edição (UC008) ou desativação de um perfil.

### Fluxo Principal

#### Consulta de Usuários

1. O usuário acessa a tela de consulta de usuários.
2. O sistema exibe os campos de filtro:
   - nome
   - e-mail
   - tipo de perfil
3. O usuário informa um ou mais filtros (opcional).
4. O usuário aciona a opção de busca.
5. O sistema consulta os dados cadastrados.
6. O sistema aplica os filtros informados.
7. O sistema exibe uma lista com os resultados contendo:
   - nome
   - e-mail
   - tipo de perfil
8. O usuário pode visualizar os registros encontrados.

#### Listagem de Usuários

1. O usuário terá acesso ao menu lateral e clica na opção "Gestão de Usuários".
2. O sistema realiza uma consulta no banco de dados para buscar os registros de usuários.
3. O sistema exibe uma tabela contendo as colunas: ID, Nome, E-mail, Perfil de Acesso e Status, ocultando informações sensíveis que só devem ser vistas na edição (como o Hash da senha)
4. O sistema aplica um destaque visual no campo Status (ex: Verde para "Ativo" e Cinza para "Inativo").
5. Para cada linha, o sistema disponibiliza ícones de ação (Visualizar, Editar, Desativar) de acordo com o perfil do ator.
6. O usuário pode utilizar a barra de busca para filtrar por Nome ou E-mail.
7. O sistema organiza os dados em páginas (paginação), garantindo que o carregamento respeite o tempo de resposta (RNF-01.02).

### Fluxos Alternativos

#### FA01 - Nenhum resultado encontrado

Nenhum usuário corresponde aos filtros informados.

O sistema exibe mensagem: "Nenhum usuário encontrado".

#### FA02 - Usuário sem permissão

O usuário não possui permissão para consultar usuários.

O sistema bloqueia o acesso.

Exibe mensagem: "Acesso negado".

#### FA03 - Falha na consulta

Erro ao acessar o banco de dados.

O sistema exibe mensagem: "Erro ao realizar consulta. Tente novamente".

#### FA04 - Aplicar Filtro de Busca

O usuário digita um termo no campo de busca.

O sistema filtra a lista em tempo real. Se não houver correspondência, exibe: "Nenhum usuário localizado para este critério".

#### FA05 - Ordenação de Colunas

O usuário clica no cabeçalho de uma coluna (ex: Nome).

O sistema reordena a lista automaticamente (A-Z ou Z-A).

#### FA06 - Restrição de Hierarquia (Segurança)

O sistema identifica o nível de acesso do usuário conectado.

O sistema oculta os ícones de "Editar" e "Desativar" em registros de usuários com cargo superior ao do ator atual (conforme UC02).

### Fluxo de Exceções

#### FE01 - Falha na Recuperação de Dados

Ocorre uma falha de comunicação com o banco de dados.

O sistema exibe: "Não foi possível carregar a lista de usuários. Tente atualizar a página".

### Requisitos e Regras Relacionadas

- RF-02: Listar Usuários.
- RNF-01.02: Desempenho (A consulta deve retornar os dados em até 3 segundos).
- RNF-19: Compatibilidade (A tabela deve manter o funcionamento adequado em diferentes resoluções de tela).
- Regras de Negócio: Preenchimento de filtros; exibição de status visual para facilitar a identificação rápida.

## UC05 - Alterar Senha com Validação de Segurança

### Objetivo

Permitir que o usuário autenticado altere sua senha de acesso ao sistema de estoque da assistência técnica, garantindo a integridade dos dados através de criptografia e requisitos de complexidade.

### Atores

- Usuário (Administrador, Técnico, Estagiário).

### Pré-condições

- O usuário deve estar autenticado no sistema (UC01).
- O sistema deve possuir um algoritmo de hash configurado (RNF-01.01).
- O usuário deve ter permissão de acesso ao seu próprio perfil (UC02).

### Fluxo Principal

1. O usuário terá acesso a área de "Meu Perfil" ou "Configurações" no sistema de estoque.
2. O usuário seleciona a opção "Alterar Senha".
3. O sistema exibe campos para: Senha Atual, Nova Senha e Confirmação da Nova Senha.
4. O usuário preenche os dados e solicita o salvamento.
5. O sistema busca o hash da senha atual no banco de dados e valida se coincide com a senha digitada.
6. O sistema valida se a "Nova Senha" cumpre os requisitos de força (8 caracteres, maiúsculas, minúsculas, números e símbolos).
7. O sistema verifica se a "Nova Senha" e a "Confirmação" são idênticas.
8. O sistema gera um novo hash para a nova senha e atualiza o banco de dados (RNF-18).
9. O sistema exibe mensagem de sucesso, encerra a sessão atual e solicita novo login.

### Fluxos Alternativos

#### FA01 - Senha Atual Inválida

O sistema identifica que o hash da senha digitada não corresponde ao armazenado.

Exibe mensagem: "Senha atual incorreta".

O processo é reiniciado no Passo 3.

#### FA02 - Senha Fraca (Não atende aos requisitos)

O sistema detecta falta de caracteres especiais, números ou tamanho insuficiente.

O sistema destaca os campos com erro e exibe a mensagem correspondente:

- "A senha deve conter no mínimo 8 caracteres".
- "A senha deve conter pelo menos uma letra maiúscula e minúscula".
- "A senha deve conter pelo menos um número".
- "A senha deve conter pelo menos um caractere especial".

#### FA03 - Nova Senha igual à Anterior

O sistema compara o novo hash com o antigo e identifica que são iguais.

O sistema exibirá a mensagem: "A nova senha não pode ser igual à senha atual".

O usuário permanece na tela para informar uma nova senha.

#### FA04 - Divergência na Confirmação

Os campos "Nova Senha" e "Confirmação" possuem valores diferentes.

Exibe mensagem: "A confirmação de senha não coincide".

### Fluxo de Exceções

#### FE01 - Erro de Conexão com Banco de Dados

Falha ao acessar o banco ou processar o hash.

O sistema exibe: "Erro interno. Tente novamente mais tarde".

Nenhuma alteração é gravada.

### Pós-condições

- A senha é armazenada exclusivamente em formato hash (criptografada).
- O acesso anterior é invalidado, exigindo nova autenticação.

### Requisitos e Regras Relacionadas

- RF06 / RF-03: Realizar login e Editar Usuários.
- RNF-01.01: Armazenamento de senhas de forma criptografada.
- RNF-18 (Criptografia): Proteção de dados sensíveis no tráfego e armazenamento.
- Regras de Negócio: Preenchimento obrigatório de todos os campos antes do salvamento.

## UC06 - Alteração de Senha através do E-mail

### Descrição

O caso deve detalhar o processo de de alteração de senha através do e-mail

### Ator

- Usuário

### Pré-condições

O usuário deve estar previamente cadastrado no sistema.

### Fluxo Básico

1. Usuário acessa tela de login
2. O usuário tenta a senha 5 vezes e bloqueia
3. O usuário clica em “esqueci minha senha”
4. O Usuário solicita recuperação de senha
5. o sistema pede para que o usuário informe o e-mail cadastrado
6. o sistema valida o e-mail do usuário, mandado código no e-mail
7. Após a validação o e-mail envia um link que leva o usuário até a tela de redefinição de senha
8. o usuário altera a senha
9. o sistema direciona o usuário a tela de início para iniciar o processo de login com a nova senha

### Pós-condições

Um e-mail é enviado para o usuário para o confirmação da troca de senha feita com sucesso.

### Fluxo Alternativo

#### Reenvio de Link de Recuperação

1. No passo 7, o usuário percebe que não recebeu o e-mail com o link (ou o e-mail caiu na caixa de spam).
2. O usuário retorna à tela do sistema e clica em "Reenviar e-mail de recuperação".
3. O sistema invalida o link anterior e envia um novo e-mail com um link atualizado.
4. O caso de uso retorna ao passo 7.

### Fluxo de Exceção

- E-mail inválido: Sistema identifica formato incorreto (ex: sem "@") e solicita nova digitação.
- E-mail não cadastrado: Sistema informa que o e-mail não foi encontrado ou exibe mensagem de segurança e encerra o envio.
- Link expirado: Usuário clica no link após o tempo limite; sistema exibe erro e solicita nova requisição.
- Divergência de senha: Usuário digita senhas diferentes nos campos de confirmação; sistema solicita correção.
- Senha fraca: Senha não atende aos requisitos de segurança; sistema exige nova senha com caracteres especiais/mínimos.

## UC07 - Exclusão de Usuário

### Descrição

Permite que um usuário encerre sua conta no sistema ou que um administrador remova um usuário específico, resultando na remoção dos dados pessoais e revogação de todos os acessos.

### Atores

- usuário
- Administrador

### Pré-condições

- O usuário deve estar previamente cadastrado no sistema.
- Ter uma conta ativa

### Fluxo Básico

1. O usuário faz login e acessa sua conta ativa
2. O usuário acessa as configurações do sistema
3. O Usuário seleciona a opção de exclusão de conta
4. O sistema manda uma mensagem na tela se o usuário tem certeza de que vai excluir a conta
5. O usuário seleciona que sim
6. O sistema solicita que o usuário insira o login e senha
7. O sistema valida a credencial
8. O sistema inicia o processo de exclusão da conta, removendo dados.
9. O sistema encerra a sessão atual do usuário.
10. O sistema exibe uma mensagem confirmando que a operação foi concluída com sucesso.

### Fluxo Alternativo

1. No passo 2 administrador seleciona um usuário em uma lista.
2. O sistema pode pular a exigência de senha do usuário alvo, exigindo apenas a senha do próprio administrador.

### Fluxo de Exceção

1. No passo 8, o sistema verifica se o usuário possui pendências financeiras ou processos em aberto que impedem a exclusão.
2. O sistema exibe o erro: "Não é possível excluir a conta enquanto houver assinaturas ativas ou débitos pendentes."
3. O processo é encerrado.

### Pós-condições

Notificação: Um e-mail de confirmação é enviado ao endereço vinculado à conta informando sobre o encerramento.

## UC08 - Cadastro de Produtos

### Ator

- Usuário

### Objetivo

Permitir o registro de novos produtos no sistema com validação de dados obrigatórios.

### Descrição

Organizar as informações dos produtos, possibilitando que sejam utilizados nas operações de estoque, como entrada e saída, controle e quantidade. Registrar novos produtos, manter as informações atualizadas, permitir controle e navegação de estoque, movimentação de produtos.

### Funcionalidade do Cadastro de Produtos

#### Cadastro de Produtos

Permite adicionar um novo produto no sistema, sendo as informações cadastrais:

- Nome do produto
- Categoria
- Quantidade inicial
- Código de barras ou código SKU

### Fluxo Básico

1. O usuário acessa o sistema
2. O usuário acessa o gerenciamento de produtos
3. O usuário seleciona o ícone “Novo Produto” no sistema
4. O usuário preenche os dados do produto
5. O usuário salva o cadastro
6. O sistema valida as informações no armazenamento

### Funcionalidades Relacionadas

#### Edição de Produto

Permite alterar informações de um produto já cadastrado

#### Exclusão de Produto

Permite remover produtos do sistema

#### Consulta de Produtos

Permite visualizar e buscar produtos cadastrados

### Regras de Negócio

- Todos os campos obrigatórios do cadastro de produtos devem estar preenchidos, caso algum campo obrigatório esteja vazio o cadastro de produto não pode ser finalizado
- Os dados do produto devem esgar preenchidos corretamente antes do salvamento
- Permitir edição de dados do produto apenas para usuários autorizados
- Evitar inconsistências nas informações do produto

### Requisitos Utilizados

- Requisitos Funcionais: RF07 – Cadastro De Produtos
- Requisitos Não Funcionais: RNF07.1 – Usabilidade
