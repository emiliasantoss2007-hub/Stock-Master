const { resumirEstoque } = require('../models/produtoModel');
const { contarUsuariosAtivos } = require('../models/usuarioModel');
const { consultarHistorico, contarMovimentacoesDeHoje } = require('../models/movimentacaoModel');

function formatarRecentes(movimentacoes) {
    return movimentacoes.map(registro => ({
        produto: registro.nome_produto,
        tipo: registro.tipo_movimentacao,
        quantidade: registro.quantidade,
        data: registro.data_movimentacao,
        responsavel: registro.nome_responsavel
    }));
}

async function consultarDashboard(req, res) {
    res.set('Cache-Control', 'no-store');
    try {
        const [estoque, ativos, movimentacoes] = await Promise.all([
            resumirEstoque(),
            contarUsuariosAtivos(),
            consultarHistorico({}, { limite: 5 })
        ]);
        return res.json({
            indicadores: {
                cadastrados: Number(estoque.cadastrados),
                ativos: Number(ativos),
                unidades: Number(estoque.unidades),
                criticos: Number(estoque.criticos)
            },
            recentes: formatarRecentes(movimentacoes)
        });
    } catch {
        return res.status(500).json({ mensagem: 'Não foi possível consultar os dados do painel.' });
    }
}

async function consultarDashboardTecnico(req, res) {
    const idUsuario = Number(req.usuario.id_usuario);
    if (Number(req.usuario.id_nivel_acesso) !== 2 || !Number.isSafeInteger(idUsuario) || idUsuario < 1) {
        return res.status(403).json({ mensagem: 'Acesso restrito ao perfil Técnico.' });
    }
    res.set('Cache-Control', 'no-store');
    try {
        const [estoque, hoje, recentes] = await Promise.all([
            resumirEstoque(),
            contarMovimentacoesDeHoje(idUsuario),
            consultarHistorico({}, { idUsuario, limite: 5 })
        ]);
        return res.json({
            indicadores: {
                disponiveis: Number(estoque.disponiveis),
                entradas: Number(hoje.entradas),
                saidas: Number(hoje.saidas),
                criticos: Number(estoque.criticos)
            },
            recentes: formatarRecentes(recentes)
        });
    } catch {
        return res.status(500).json({ mensagem: 'Não foi possível consultar os dados do painel.' });
    }
}

module.exports = { consultarDashboard, consultarDashboardTecnico };
