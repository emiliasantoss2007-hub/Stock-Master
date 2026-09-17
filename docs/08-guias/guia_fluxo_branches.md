# Guia de Fluxo de Branches — StockMaster

> **Objetivo:** explicar, de forma prática, como cada integrante deve trabalhar com branches no StockMaster, desde o início de uma tarefa até o envio para o `develop`.

---

## 1. Como funciona o nosso fluxo

No StockMaster, cada integrante desenvolve sua tarefa em uma **branch própria**.

Não trabalhamos diretamente no `main` ou no `develop`.

O fluxo principal é:

```text
main
 │
 │ versão estável
 ↓
develop
 │
 │ integração da equipe
 ↓
modulo/nome
 │
 │ desenvolvimento
 ↓
commit → push
 │
 ↓
Pull Request
 │
 ↓
revisão
 │
 ↓
develop
```

### `main`

É a branch que representa a versão principal e mais estável do projeto.

Não devemos desenvolver diretamente nela.

### `develop`

É a branch utilizada para integrar o trabalho da equipe.

As alterações desenvolvidas nas branches dos integrantes passam por revisão antes de serem incorporadas ao `develop`.

### `modulo/nome`

É a branch onde cada integrante desenvolve sua tarefa.

Exemplos:

```text
modulo/emilia
modulo/giovanni
modulo/gabrielle
modulo/luan
```

Cada integrante deve trabalhar em sua própria branch.

---

## 2. Comecei uma tarefa. O que faço?

Antes de começar a programar, siga esta ordem:

```text
1. Verificar a tarefa
        ↓
2. Atualizar o develop
        ↓
3. Entrar na sua branch
        ↓
4. Atualizar sua branch
        ↓
5. Desenvolver
        ↓
6. Testar
        ↓
7. Commit
        ↓
8. Push
        ↓
9. Pull Request
        ↓
10. Revisão
        ↓
11. Merge → develop
```

---

## 3. PASSO 1 — Verifique a tarefa

Antes de abrir o código, confira qual tarefa você recebeu.

Exemplo:

```text
RF-05 — Cadastrar Produto
```

Verifique:

- Qual é o objetivo da tarefa?
- Quais arquivos precisam ser alterados?
- É Front-end, Back-end ou integração?
- Quais regras de negócio estão relacionadas?
- Outra pessoa está trabalhando nos mesmos arquivos?

Não comece alterando arquivos aleatoriamente.

---

## 4. PASSO 2 — Atualize o develop

Antes de começar o trabalho, atualize o `develop` local.

Primeiro:

```bash
git checkout develop
```

Depois:

```bash
git pull origin develop
```

### O que é `git checkout`?

É utilizado para mudar de uma branch para outra.

Neste caso:

```bash
git checkout develop
```

significa:

> "Quero entrar na branch develop."

### O que é `git pull`?

O `git pull` busca as alterações que estão no repositório remoto e atualiza a branch local.

De forma simplificada:

```text
git pull
   =
git fetch + git merge
```

### Saiba mais

[Saiba mais sobre git pull — GitHub Docs](https://docs.github.com/pt/get-started/using-git/getting-changes-from-a-remote-repository)

[Saiba mais sobre git fetch — GitHub Docs](https://docs.github.com/pt/get-started/using-git/getting-changes-from-a-remote-repository)

---

## 5. PASSO 3 — Entre na sua branch

Depois de atualizar o `develop`, entre na sua branch de trabalho.

Exemplo:

```bash
git checkout modulo/emilia
```

Para conferir em qual branch você está:

```bash
git branch
```

A branch atual aparecerá com `*`:

```text
* modulo/emilia
  develop
  main
```

### Atenção

Antes de editar qualquer arquivo, confirme que você está em:

```text
modulo/seu-nome
```

e não em:

```text
main
develop
```

---

## 6. PASSO 4 — Atualize sua branch com o develop

Se o `develop` recebeu alterações enquanto você estava trabalhando, sua branch pode ficar desatualizada.

Para trazer essas alterações para sua branch:

```bash
git checkout modulo/seu-nome
```

Depois:

```bash
git merge develop
```

### O que é merge?

`merge` significa mesclar.

Ele combina alterações de duas branches.

Neste caso:

```text
develop
   │
   │ alterações novas
   ↓
sua branch
```

O objetivo é manter sua branch atualizada com o que já foi integrado ao `develop`.

### Saiba mais

[Saiba mais sobre git merge — GitHub Docs](https://docs.github.com/pt/get-started/using-git/getting-changes-from-a-remote-repository)

---

## 7. PASSO 5 — Desenvolva

Agora você pode começar a trabalhar na tarefa.

Exemplo:

```text
Tarefa:
RF-05 — Cadastrar Produto
```

Consulte o Guia de Front-end — StockMaster para descobrir exatamente quais arquivos estão relacionados à tarefa.

Durante o desenvolvimento:

```text
HTML
↓
estrutura da tela

CSS
↓
aparência e estilos

JavaScript
↓
comportamento e interações
```

Para Back-end, consulte os arquivos correspondentes ao módulo:

- Controller
- Model
- Routes

### Regra importante

Evite alterar arquivos que não fazem parte da sua tarefa.

Isso ajuda a evitar:

- conflitos;
- alterações acidentais;
- dificuldade na revisão;
- commits muito grandes;
- problemas com o trabalho de outro integrante.

---

## 8. PASSO 6 — Teste

Antes de fazer o commit, teste aquilo que você desenvolveu.

Confira:

- A aplicação inicia normalmente?
- A funcionalidade funciona?
- Existem erros no navegador?
- Existem erros no terminal?
- Os arquivos relacionados continuam funcionando?
- Você alterou alguma coisa que não fazia parte da tarefa?

Depois confira:

```bash
git status
```

Esse comando mostra quais arquivos foram modificados.

### Saiba mais

[Saiba mais sobre Git — GitHub Docs](https://docs.github.com/pt/get-started/using-git/about-git)

---

## 9. PASSO 7 — Prepare o commit

Depois de testar, execute:

```bash
git status
```

Confira quais arquivos foram modificados.

Depois adicione somente os arquivos relacionados à sua tarefa.

Exemplo:

```bash
git add views/html/cadastrar_produto.html
git add views/css/produtos.css
git add views/js/cadastrar_produto.js
```

### O que é `git add`?

O `git add` coloca os arquivos escolhidos na área de preparação, chamada de staging area.

Esses arquivos poderão fazer parte do próximo commit.

### Saiba mais

[Saiba mais sobre git add — GitHub Docs](https://docs.github.com/pt/get-started/using-git/about-git)

---

## 10. PASSO 8 — Faça o commit

Depois:

```bash
git commit -m "Implementa cadastro de produto"
```

### O que é commit?

Um commit registra uma alteração no histórico do projeto.

É como criar um ponto de registro:

```text
Projeto
   ↓
Alterações
   ↓
Commit
   ↓
Histórico
```

### Saiba mais

[Saiba mais sobre git commit — GitHub Docs](https://docs.github.com/pt/get-started/using-git/about-git)

### Mensagens de commit

Prefira mensagens objetivas:

```text
Adiciona tela de cadastro de produto
Corrige validação do cadastro de usuário
Implementa Controller de usuário
```

Evite mensagens genéricas:

```text
mudanças
teste
coisas
```

---

## 11. PASSO 9 — Envie sua branch para o GitHub

Depois do commit:

```bash
git push origin modulo/seu-nome
```

Exemplo:

```bash
git push origin modulo/emilia
```

### O que é `git push`?

O push envia os commits que estão na sua máquina para o repositório remoto no GitHub.

```text
Seu computador
      │
      │ git push
      ↓
GitHub
```

### Saiba mais

[Saiba mais sobre git push — GitHub Docs](https://docs.github.com/pt/get-started/using-git/pushing-commits-to-a-remote-repository)

---

## 12. PASSO 10 — Abra um Pull Request

Depois do push, sua branch estará atualizada no GitHub.

Agora abra um:

```text
Pull Request (PR)
```

### O que é um Pull Request?

É uma solicitação para que suas alterações sejam revisadas e, depois, integradas a outra branch.

No nosso projeto:

```text
modulo/seu-nome
       ↓
Pull Request
       ↓
    develop
```

Não envie diretamente para `main`.

O Pull Request permite que as alterações sejam revisadas antes de serem incorporadas ao `develop`.

### Saiba mais

[Saiba mais sobre Pull Requests — GitHub Docs](https://docs.github.com/pt/pull-requests/get-started/about-pull-requests)

---

## 13. PASSO 11 — Revisão

Depois que o Pull Request for aberto, a equipe poderá revisar:

- arquivos alterados;
- código;
- funcionalidade;
- possíveis problemas;
- testes;
- conflitos.

Se forem solicitadas alterações, volte para sua branch e faça as correções.

Depois:

```bash
git add arquivo
git commit -m "Corrige ajustes solicitados na revisão"
git push
```

O Pull Request será atualizado automaticamente.

### Saiba mais

[Saiba mais sobre revisão de Pull Requests — GitHub Docs](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests)

---

## 14. PASSO 12 — Merge para o develop

Quando o Pull Request estiver revisado e aprovado, ele poderá ser integrado ao:

```text
develop
```

O fluxo será:

```text
sua branch
     ↓
Pull Request
     ↓
revisão
     ↓
aprovação
     ↓
merge
     ↓
develop
```

### O que é merge?

É o processo de combinar alterações de uma branch com outra.

No nosso fluxo:

```text
modulo/seu-nome
       ↓
    develop
```

### Saiba mais

[Saiba mais sobre como incorporar um Pull Request — GitHub Docs](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request)

---

## 15. Depois que minha tarefa entrou no develop

Depois que seu trabalho foi integrado ao `develop`, o ciclo daquela tarefa terminou.

Quando receber uma nova tarefa, repita o fluxo:

```text
1. Atualizar develop
2. Atualizar sua branch
3. Desenvolver
4. Testar
5. Commit
6. Push
7. Pull Request
8. Revisão
9. Merge → develop
```

---

## 16. O que NÃO fazer

### Não desenvolver diretamente no `main`

```text
main
```

O `main` deve receber somente alterações que passaram pelo fluxo definido pela equipe.

### Não desenvolver diretamente no `develop`

O `develop` é utilizado para integração.

O desenvolvimento deve acontecer na branch correspondente ao integrante.

### Não fazer push direto para `main`

Não utilize:

```bash
git push origin main
```

para enviar uma tarefa individual.

### Não usar `git add .` sem conferir os arquivos

Antes de adicionar arquivos, use:

```bash
git status
```

Confira o que será enviado.

### Não alterar arquivos de outra tarefa sem necessidade

Isso pode gerar conflitos e dificultar a revisão.

### Não apagar ou renomear arquivos sem verificar com a equipe

Principalmente arquivos utilizados por outras telas ou funcionalidades.

---

## 17. Deu conflito. E agora?

Se aparecer:

```text
CONFLICT
```

pare e não execute comandos aleatoriamente.

Um conflito significa que o Git encontrou alterações que não conseguiu combinar automaticamente.

Se você não souber resolver:

```text
CONFLITO
   ↓
PARAR
   ↓
não apagar arquivos
   ↓
não usar comandos destrutivos
   ↓
avisar a equipe
```

### Saiba mais

[Saiba mais sobre conflitos de merge — GitHub Docs](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)

---

## 18. Glossário rápido

| Termo | Significado |
|---|---|
| Repository / Repositório | Projeto controlado pelo Git |
| Branch | Linha separada de desenvolvimento |
| main | Branch principal |
| develop | Branch de integração da equipe |
| Commit | Registro de uma alteração no histórico |
| Push | Envia commits para o GitHub |
| Pull | Busca e integra alterações do repositório remoto |
| Fetch | Busca informações do repositório remoto sem integrar automaticamente |
| Merge | Combina alterações de branches |
| Pull Request | Solicitação para revisar e integrar alterações |
| Conflict | Situação em que o Git não consegue combinar alterações automaticamente |
| Staging Area | Área onde ficam os arquivos preparados para o commit |

---

## 19. Resumo visual

```text
              COMEÇOU UMA TAREFA
                      │
                      ↓
              Verifique a tarefa
                      │
                      ↓
              Atualize o develop
                      │
                      ↓
               Entre na branch
                      │
                      ↓
                  Desenvolva
                      │
                      ↓
                    Teste
                      │
                      ↓
                 git status
                      │
                      ↓
                   git add
                      │
                      ↓
                 git commit
                      │
                      ↓
                  git push
                      │
                      ↓
               Pull Request
                      │
                      ↓
                   Revisão
                      │
                      ↓
                    Merge
                      │
                      ↓
                   develop
                      │
                      ↓
                  TAREFA OK
```

---

## 20. Documentação oficial do GitHub

Para quem quiser entender os conceitos com mais detalhes:

- [Sobre o Git — GitHub Docs](https://docs.github.com/pt/get-started/using-git/about-git)
- [Obter alterações de um repositório remoto — GitHub Docs](https://docs.github.com/pt/get-started/using-git/getting-changes-from-a-remote-repository)
- [Enviar commits para um repositório remoto — GitHub Docs](https://docs.github.com/pt/get-started/using-git/pushing-commits-to-a-remote-repository)
- [Sobre Pull Requests — GitHub Docs](https://docs.github.com/pt/pull-requests/get-started/about-pull-requests)
- [Revisar alterações em Pull Requests — GitHub Docs](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests)
- [Incorporar alterações de um Pull Request — GitHub Docs](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request)
- [Resolver conflitos de merge — GitHub Docs](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)

> **Dica:** este guia apresenta o fluxo utilizado pela equipe do StockMaster de maneira simplificada. Para informações mais técnicas sobre Git e GitHub, consulte a documentação oficial.