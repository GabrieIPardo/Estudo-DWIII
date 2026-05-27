const db = require('./Database');

class Usuario {
  constructor(row) {
    this.id        = row.id;
    this.nome      = row.nome;
    this.email     = row.email;
    this.criado_em = row.criado_em;
  }

  get emprestimosAtivos() {
    return db.query(
      `SELECT e.id, l.titulo, e.data_emprestimo, e.data_devolucao_prevista
       FROM emprestimos e
       JOIN livros l ON l.id = e.livro_id
       WHERE e.usuario_id = ? AND e.status = 'ativo'`,
      [this.id]
    );
  }

  get resumo() {
    const lista = this.emprestimosAtivos;
    return lista.length === 0
      ? 'Nenhum livro emprestado'
      : `${lista.length} livro(s): ${lista.map(e => e.titulo).join(', ')}`;
  }

  // ── Métodos estáticos (repositório) ────────────────────────────────────────

  static listar() {
    return db.query('SELECT * FROM usuarios ORDER BY nome').map(r => new Usuario(r));
  }

  static buscarPorId(id) {
    const rows = db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    return rows.length ? new Usuario(rows[0]) : null;
  }

  static cadastrar(nome, email) {
    const existe = db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length) throw new Error(`E-mail "${email}" já cadastrado.`);

    db.exec('INSERT INTO usuarios (nome, email) VALUES (?,?)', [nome, email]);
    return Usuario.buscarPorId(db.lastInsertId());
  }
}

module.exports = Usuario;
