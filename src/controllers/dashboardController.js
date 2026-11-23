const { resumirEstoque } = require('../models/produtoModel');
const { contarUsuariosAtivos } = require('../models/usuarioModel');
const { consultarHistorico } = require('../models/movimentacaoModel');

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
            recentes: movimentacoes.map(registro => ({
                produto: registro.nome_produto,
                tipo: registro.tipo_movimentacao,
                quantidade: registro.quantidade,
                data: registro.data_movimentacao,
                responsavel: registro.nome_responsavel
            }))
        });
    } catch {
        return res.status(500).json({ mensagem: 'Não foi possível consultar os dados do painel.' });
    }
}

module.exports = { consultarDashboard };
