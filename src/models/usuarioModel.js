const db = require('../config/database');

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        u.id_usuario,
        u.nome,
        u.email,
        u.login,
        u.status,
        u.id_nivel_acesso,
        n.descricao AS perfil
      FROM usuario u
      INNER JOIN nivel_acesso n
        ON u.id_nivel_acesso = n.id_nivel_acesso
      WHERE u.id_usuario = ?
    `;

    db.query(sql, [id], (erro, resultados) => {
      if (erro) return reject(erro);
      resolve(resultados[0] || null);
    });
  });
}

function verificarLogin(login, idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id_usuario
      FROM usuario
      WHERE login = ?
        AND id_usuario <> ?
    `;

    db.query(sql, [login, idUsuario], (erro, resultados) => {
      if (erro) return reject(erro);
      resolve(resultados.length > 0);
    });
  });
}

function verificarEmail(email, idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id_usuario
      FROM usuario
      WHERE email = ?
        AND id_usuario <> ?
    `;

    db.query(sql, [email, idUsuario], (erro, resultados) => {
      if (erro) return reject(erro);
      resolve(resultados.length > 0);
    });
  });
}

function atualizar(idUsuario, nome, email, login, idNivelAcesso) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE usuario
      SET
        nome = ?,
        email = ?,
        login = ?,
        id_nivel_acesso = ?
      WHERE id_usuario = ?
    `;

    db.query(
      sql,
      [nome, email, login, idNivelAcesso, idUsuario],
      (erro, resultado) => {
        if (erro) return reject(erro);
        resolve(resultado);
      }
    );
  });
}

function listar(filtros = {}) {
  return new Promise((resolve, reject) => {
    const { busca, perfil, status } = filtros;
    const params = [];

    let sql = `
      SELECT
        u.id_usuario,
        u.nome,
        u.email,
        u.login,
        u.status,
        u.id_nivel_acesso,
        n.descricao AS perfil
      FROM usuario u
      INNER JOIN nivel_acesso n
        ON u.id_nivel_acesso = n.id_nivel_acesso
      WHERE 1 = 1
    `;

    if (busca && String(busca).trim() !== '') {
      sql += ` AND (
        u.nome LIKE ?
        OR u.email LIKE ?
        OR u.login LIKE ?
      )`;
      const termo = `%${String(busca).trim()}%`;
      params.push(termo, termo, termo);
    }

    if (perfil !== undefined && perfil !== null && String(perfil).trim() !== '') {
      sql += ` AND u.id_nivel_acesso = ?`;
      params.push(Number(perfil));
    }

    if (status !== undefined && status !== null && String(status).trim() !== '') {
      sql += ` AND u.status = ?`;
      params.push(Number(status));
    }

    sql += ` ORDER BY u.nome ASC`;

    db.query(sql, params, (erro, resultados) => {
      if (erro) return reject(erro);
      resolve(resultados);
    });
  });
}

function excluir(idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM usuario
      WHERE id_usuario = ?
    `;

    db.query(sql, [idUsuario], (erro, resultado) => {
      if (erro) return reject(erro);
      resolve(resultado.affectedRows > 0);
    });
  });
}

function suspender(idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE usuario
      SET status = 0
      WHERE id_usuario = ?
        AND status <> 0
    `;

    db.query(sql, [idUsuario], (erro, resultado) => {
      if (erro) return reject(erro);
      resolve(resultado.affectedRows > 0);
    });
  });
}

module.exports = {
  buscarPorId,
  verificarLogin,
  verificarEmail,
  atualizar,
  listar,
  excluir,
  suspender
};