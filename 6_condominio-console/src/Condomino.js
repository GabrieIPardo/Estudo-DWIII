const db = require('./Database');

class Condomino {
  constructor(row) {
    this.id             = row.id;
    this.nome           = row.nome;
    this.cpf            = row.cpf;
    this.email          = row.email;
    this.telefone       = row.telefone || '—';
    this.tipo           = row.tipo;          // sindico | subsindico | condomino
    this.num_automoveis = row.num_automoveis;
    this.criado_em      = row.criado_em;
  }

  // ── Getters de apresentação ────────────────────────────────────────────────

  get tipoLabel() {
    const m = {
      sindico:    '🔑 Síndico',
      subsindico: '🔑 Subsíndico',
      condomino:  '👤 Condômino',
    };
    return m[this.tipo] || this.tipo;
  }

  get unidade() {
    const rows = db.query(
      'SELECT * FROM unidades WHERE condomino_id = ?', [this.id]
    );
    return rows[0] || null;
  }

  get unidadeLabel() {
    const u = this.unidade;
    return u ? `Bloco ${u.bloco} / Ap ${u.numero}` : '—';
  }

  get garagem() {
    const rows = db.query(
      'SELECT * FROM garagens WHERE condomino_id = ?', [this.id]
    );
    return rows[0] || null;
  }

  get garagemLabel() {
    const g = this.garagem;
    return g ? g.numero : '—';
  }

  // ── Repositório (static) ───────────────────────────────────────────────────

  static listar() {
    return db.query('SELECT * FROM condominoss ORDER BY nome')
      .map(r => new Condomino(r));
  }

  static buscarPorId(id) {
    const rows = db.query('SELECT * FROM condominoss WHERE id = ?', [id]);
    return rows.length ? new Condomino(rows[0]) : null;
  }

  static buscarPorNome(termo) {
    return db.query(
      "SELECT * FROM condominoss WHERE nome LIKE ? ORDER BY nome",
      [`%${termo}%`]
    ).map(r => new Condomino(r));
  }

  static buscarPorTipo(tipo) {
    return db.query(
      'SELECT * FROM condominoss WHERE tipo = ? ORDER BY nome', [tipo]
    ).map(r => new Condomino(r));
  }

  static cadastrar(nome, cpf, email, telefone, tipo, numAutomoveis) {
    const existe = db.query(
      'SELECT id FROM condominoss WHERE cpf = ? OR email = ?', [cpf, email]
    );
    if (existe.length) throw new Error('CPF ou e-mail já cadastrado.');

    db.exec(
      `INSERT INTO condominoss (nome, cpf, email, telefone, tipo, num_automoveis)
       VALUES (?,?,?,?,?,?)`,
      [nome, cpf, email, telefone || '', tipo || 'condomino', numAutomoveis || 1]
    );
    return Condomino.buscarPorId(db.lastInsertId());
  }

  // ── Instância ──────────────────────────────────────────────────────────────

  definirTipo(novoTipo) {
    db.exec('UPDATE condominoss SET tipo = ? WHERE id = ?', [novoTipo, this.id]);
    this.tipo = novoTipo;
  }

  atualizar({ nome, email, telefone, num_automoveis }) {
    db.exec(
      `UPDATE condominoss SET nome=?, email=?, telefone=?, num_automoveis=?
       WHERE id = ?`,
      [
        nome           ?? this.nome,
        email          ?? this.email,
        telefone       ?? this.telefone,
        num_automoveis ?? this.num_automoveis,
        this.id,
      ]
    );
  }
}

module.exports = Condomino;
