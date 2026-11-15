# RF-19 — Operação de exportação Excel

## Escopo e base

Implementação exclusiva da operação XLSX, em `feature/rf19-operacao-exportacao-excel`, no worktree `C:/Users/alenc/Stock-Master-RF19-Excel`.
Base: referência local `origin/develop`, commit `8d4edbc048813ab31f8901b1a4802b7a39d97438`. A referência remota develop consultada já estava em `5699a2f`; esta entrega não atualiza nem integra branches de outros integrantes.

Requisitos consultados: RF19 e RNF-16.02/16.03 em `docs/02-requisitos/srs.md`, RN-14 em `docs/03-regra-de-negocio/regras-de-negocio .md`.
Não existiam serviços XLSX ou mecanismos de isolamento na base inspecionada.

O Model da colega ainda não foi publicado. Nenhum `relatorioExcelModel.js`, preparação alternativa de registros, Controller, rota, tela ou consulta SQL foi criado. O serviço não importa o banco nem os demais Models. A operação não está disponível na interface.

## Contrato de integração provisório

`gerarRelatorioExcel(dadosPreparados, opcoes?)`, exportada por `src/services/relatorioExcelService.js`, recebe:

```js
{
  cabecalhos: ['Código', 'Produto', 'SKU', 'Tipo de movimentação',
              'Quantidade', 'Data', 'Responsável', 'Justificativa'],
  linhas: [/* arrays de oito valores já preparados pelo Model */],
  totalRegistros: 0 // deve corresponder exatamente a linhas.length
}
```

Os nomes `cabecalhos`, `linhas` e `totalRegistros` são uma convenção provisória desta operação, pois a descrição fornecida não confirma a grafia das propriedades retornadas. Quando o código original chegar, confirmar o formato real e, se necessário, adaptar apenas essa fronteira, sem duplicar `prepararDadosRelatorioExcel()`.

A ordem das células é: id_movimentacao, nome_produto, sku_produto, tipo_movimentacao, quantidade, data_movimentacao, nome_responsavel e justificativa. O serviço recebe essas células já organizadas; não transforma objetos de movimentações em linhas e não substitui nulos. Campos vazios devem chegar como `''`, conforme a responsabilidade do Model da colega.

Quantidades são números inteiros não negativos de até 15 dígitos, respeitando a precisão numérica do Excel. Código pode ser texto ou inteiro seguro; códigos numéricos acima de 15 dígitos são escritos como texto para preservar todos os dígitos. Objetos de célula/fórmula e textos acima de 32.767 caracteres são rejeitados, sem truncar conteúdo.

Datas aceitas: `Date` válido, `AAAA-MM-DD`, ou data/hora ISO (também `AAAA-MM-DD HH:mm:ss`). Datas sem fuso são interpretadas como UTC, e datas com fuso são normalizadas para UTC; a exibição usa `dd/mm/yyyy hh:mm:ss`. Confirmar essa convenção com o Model original para evitar deslocamentos de horário ou dupla formatação.

A origem dos registros permanece responsabilidade do chamador/Model. O serviço não consulta banco, não verifica a existência de uma movimentação e não acrescenta dados de exemplo. RN-14 depende de conectar exclusivamente a fonte oficial de registros; os dados artificiais existem apenas nos testes.

## Uso e recursos temporários

O retorno contém `caminhoArquivo`, `totalRegistros`, `metricas` e `limpar()` assíncrono. O consumidor deve ler/copiar/transmitir o arquivo e aguardar o término desse uso antes de chamar `await resultado.limpar()` em `finally`. Nenhum Buffer com o arquivo inteiro é retornado. A limpeza é idempotente.

Na geração, os dados são validados e gravados por lotes pequenos em JSONL privado, com cessão periódica do event loop. O filho recebe apenas caminhos e limite de linhas por aba, sem cópia integral por IPC. Após o sucesso, a entrada JSONL é removida; o XLSX permanece até `limpar()`. Em falhas e timeout, a área privada é removida após o encerramento do filho.

A remoção recursiva verifica previamente que o caminho pertence exclusivamente ao diretório privado criado com `mkdtemp` dentro da pasta temporária do sistema. Em queda abrupta do processo principal ou da máquina podem restar diretórios temporários; não foi acrescentado um coletor global. O consumidor futuro deve garantir o uso de `finally`.

## Geração e padronização — RF-19 / RNF-16.02

Dependência adicionada: `exceljs@4.4.0`, versão publicada consultada no npm, com suporte CommonJS e escrita streaming. Documentação oficial: https://github.com/exceljs/exceljs#streaming-xlsx

`WorkbookWriter` escreve diretamente no arquivo, com compartilhamento global de strings desabilitado e commit de cada linha. Os textos são primitivos e permanecem células textuais, inclusive quando começam com `=`, `+`, `-` ou `@`; não são criados objetos de fórmula ou hyperlinks.

Layout: aba `Movimentações`, cabeçalho azul com texto branco em negrito, primeira linha congelada, filtro, fonte consistente, quebra de texto e larguras fixas proporcionais à função das oito colunas. Quantidades têm formato inteiro e datas têm formato uniforme.

Impressão: A4 paisagem, uma página de largura e altura automática, área de impressão completa, cabeçalho repetido e rodapé com número de página e total. A altura não é forçada a uma página.

Cada aba comporta até 1.048.575 registros mais um cabeçalho, respeitando as 1.048.576 linhas do XLSX. Havendo mais registros, são criadas `Movimentações 2`, `Movimentações 3` etc., sem descartar linhas. Uma entrada vazia gera uma aba com cabeçalhos. O parâmetro `linhasPorAba` permite antecipar essa divisão e testar a mesma lógica com poucos registros; valores superiores ao limite real são rejeitados.

## Isolamento e limites — RNF-16.03

- Processo Node separado criado com `child_process.fork`, com PID e heap próprios.
- Heap antigo V8 limitado por `--max-old-space-size=128` (MiB).
- RSS amostrado no filho a cada 200 ms e a cada 128 registros; o pai encerra o filho ao receber amostra acima de 256 MiB, por padrão.
- Limite de uma geração ativa por processo principal; uma segunda solicitação recebe `EXPORT_BUSY`, sem fila acumulando dados.
- Entrada JSONL limitada a 256 MiB. Prazo total padrão de 120 segundos, incluindo gravação da entrada. Falta de telemetria por 10 segundos também encerra o filho.
- Fluxo de escrita progressivo, sem workbook completo ou Buffer final no processo principal; erros do filho são devolvidos sem encerrar o pai.
- O filho não herda `NODE_OPTIONS` nem credenciais do banco. Não carrega servidor, autenticação ou Models.

Opções internas: `linhasPorAba` de 1 a 1.048.575; `timeoutMs` de 1 a 600.000; `maxRssMB` de 32 a 512. Não são parâmetros HTTP.

Limites da comprovação: `--max-old-space-size` limita o heap antigo, não a memória total. O controle RSS é um watchdog por amostragem, com possível ultrapassagem transitória antes do encerramento; não é um teto rígido de RAM imposto pelo sistema operacional. CPU, compressão e disco ainda são compartilhados com o host. Uma garantia rígida por serviço demandaria limites externos de recursos, por exemplo contêiner/cgroup ou Windows Job Object. Não foi acrescentada essa infraestrutura.

O array de dados preparados continua existindo no chamador. Portanto, a operação não resolve a carga de memória de consultas ou de um Model que materialize todos os registros. A escrita do XLSX fica isolada e o custo adicional no processo principal foi medido abaixo. A concorrência é local a cada processo Node, não global entre múltiplas instâncias.

## Testes e resultados observados

Ambiente: Windows x64, Node v24.19.0. Comando: `npm test -- --runInBand --silent=false`.
Resultado final: **5 suítes e 44 testes aprovados**, em **49,961 segundos**. Inclui os testes preexistentes de cadastro de usuários.

Testes RF-19: leitura posterior com ExcelJS, integridade, oito cabeçalhos e ordem, dados, tipos numéricos, datas Date/ISO/SQL, lista vazia, campos vazios, entradas inválidas, fórmula como texto, layout, impressão e divisão em múltiplas abas. A leitura streaming validou um a um os 100.000 códigos e quantidades do teste volumoso.

Testes de isolamento: PID diferente do pai, limite de concorrência, falha/erro de inicialização/timeout simulados, encerramento real do filho com RSS reduzido para 32 MiB, limpeza dos temporários e nova execução após falha. Não houve acesso ao banco real.

Medição do teste com 100.000 registros controlados:

| Medida | Resultado |
| --- | --- |
| Tempo total de exportação do serviço | 10.225 ms |
| Tempo do trecho de geração no filho | 7.864 ms |
| Pico RSS do filho | 154.537.984 bytes (147,38 MiB) |
| Pico de heap observado do filho | 53.153.448 bytes (50,69 MiB) |
| RSS inicial do principal, já com dados de teste | 186.728.448 bytes (178,08 MiB) |
| Pico RSS amostrado do principal durante exportação | 256.729.088 bytes (244,84 MiB) |
| Variação RSS do principal | 70.000.640 bytes (66,76 MiB) |
| Tamanho do XLSX | 4.819.818 bytes |
| Respostas HTTP durante exportação | 362 |
| Latência HTTP P95 / máxima | 3,22 ms / 25,88 ms |
| Falhas HTTP | 0 |

O teste abre um servidor HTTP mínimo no próprio processo de teste, em `127.0.0.1` com porta efêmera. Isso mede a responsividade desse processo durante a exportação, não o desempenho da aplicação Express completa em produção. As medições de RSS incluem alocações e GC do Node/Jest; não equivalem a memória retida ou vazamento. Pico do filho usa o maior valor entre amostras e `resourceUsage().maxRSS` disponível no sistema.

Para capturar o JSON de métricas em nova execução, definir `RF19_METRICS_FILE` com um caminho temporário antes do comando de teste. Sem essa variável, o teste apenas emite `RF19_METRICAS` no console. Os XLSX de teste são removidos automaticamente.

A divisão em abas foi comprovada com limite reduzido de dois registros por aba. Não se gerou um arquivo de mais de 1.048.575 registros nesta máquina, nem se abriu o aplicativo Microsoft Excel; a reabertura foi programática. Não foram testadas todas as combinações de largura, volume, hardware ou esgotamento real do disco.

## Dependências e pendências

A inclusão do ExcelJS atualizou package.json e package-lock.json. A comparação com a base não encontrou alterações de versões das dependências que já existiam.

`npm audit --omit=dev` apontou cinco entradas: `exceljs`/`uuid` (moderadas, alerta transitivo em UUID), `qs` (moderada), `body-parser` (alta) e `proxy-addr` (crítica). O aviso UUID trata de funções de UUID que não fazem parte do contrato desta operação. Não foram aplicados downgrade do ExcelJS, overrides nem correções automáticas dos módulos alheios. A escolha de versão deve ser reavaliada ao integrar, junto da política de dependências da equipe.

Pendências: receber o Model original, confirmar os nomes das propriedades e tipos/formato de data, ligar sua saída ao serviço e validar o conjunto com registros reais em ambiente autorizado. Download HTTP e autorização do usuário ficam fora deste cartão.

Arquivos adicionados: serviço, worker, três arquivos de teste e este guia. Arquivos modificados: apenas package.json e package-lock.json. RF-14, RF-16, RF-18, banco, autenticação, rotas e telas foram preservados. Não houve merge, commit, push ou criação de PR.
