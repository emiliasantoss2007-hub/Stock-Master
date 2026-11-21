const { prepararDadosRelatorioPdf } = require('../models/relatorioPdfModel');

const FILTROS = new Set(['data_inicio', 'data_fim']);
const NOME_ARQUIVO = 'relatorio-movimentacoes.pdf';

function responderErro(res, status, mensagem) {
    return res.status(status).json({ sucesso: false, mensagem });
}

/**
 * consultarHistorico(filtros) retorna os registros do Model de histórico.
 * gerarRelatorioPdf({ colunas, linhas }, { signal }) retorna uma Promise de
 * { caminhoArquivo: string absoluto, limpar: () => Promise<void> }.
 * O serviço limpa seus temporários se falhar antes de retornar. Após o
 * retorno, o Controller chama limpar() quando o envio termina ou é interrompido.
 * O handler deve ser montado após a autenticação e a autorização administrativas.
 */
function criarRelatorioPdfController({ consultarHistorico, gerarRelatorioPdf }) {
    if (typeof consultarHistorico !== 'function' || typeof gerarRelatorioPdf !== 'function') {
        throw new TypeError('O Controller PDF exige a consulta de histórico e o serviço gerador.');
    }

    return async function exportarPdf(req, res) {
        if (res.destroyed) return;

        const query = req.query ?? {};
        if (Object.entries(query).some(([chave, valor]) => !FILTROS.has(chave) || typeof valor !== 'string')) {
            return responderErro(res, 400, 'Informe apenas data_inicio e data_fim, sem repetir os filtros.');
        }

        res.set('Cache-Control', 'no-store');
        const geracao = new AbortController();
        const cancelarGeracao = () => geracao.abort();
        res.once('close', cancelarGeracao);
        let etapa = 'consulta';
        let arquivo;
        try {
            const registros = await consultarHistorico({
                data_inicio: query.data_inicio,
                data_fim: query.data_fim
            });
            if (res.destroyed) return;

            etapa = 'preparação';
            const dados = prepararDadosRelatorioPdf(registros);
            etapa = 'geração';
            arquivo = await gerarRelatorioPdf(dados, { signal: geracao.signal });
            if (res.destroyed) return;

            etapa = 'envio';
            await new Promise((resolve, reject) => {
                res.download(arquivo.caminhoArquivo, NOME_ARQUIVO, {
                    headers: { 'Content-Type': 'application/pdf' }
                }, erro => erro ? reject(erro) : resolve());
            });
        } catch (erro) {
            if (res.destroyed || res.writableEnded) return;
            if (res.headersSent) {
                res.destroy();
                return;
            }
            if (etapa === 'consulta' && erro?.code === 'INVALID_FILTER') {
                return responderErro(res, 400, 'Informe um período válido no formato AAAA-MM-DD.');
            }
            if (etapa === 'geração' && erro?.code === 'EXPORT_BUSY') {
                return responderErro(res, 409, 'Já existe uma geração PDF em andamento. Tente novamente.');
            }
            if (etapa === 'geração' && erro?.code === 'EXPORT_TIMEOUT') {
                return responderErro(res, 504, 'A geração do PDF excedeu o tempo limite. Tente novamente.');
            }
            if (etapa === 'envio') {
                res.removeHeader('Content-Disposition');
                res.removeHeader('Content-Type');
                res.removeHeader('Content-Length');
            }

            console.error('Falha na exportação PDF. Etapa:', etapa);
            return responderErro(res, 500, 'Não foi possível exportar o PDF. Tente novamente.');
        } finally {
            res.removeListener('close', cancelarGeracao);
            if (arquivo) {
                try {
                    await arquivo.limpar();
                } catch {
                    console.error('Falha ao limpar os arquivos temporários da exportação PDF.');
                }
            }
        }
    };
}

module.exports = { criarRelatorioPdfController };
