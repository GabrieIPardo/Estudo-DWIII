const db = require('./Database');

class Utensilio {
  constructor(row) {
    this.id          = row.id;
    this.nome        = row.nome;
    this.quantidade  = row.quantidade;
    this.estado      = row.estado;   // bom | regular | ruim
    this.observacoes = row.observacoes || '';
    this.criado_em   = row.criado_em;
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  get estadoLabel() {
    const m = {
      bom:     '✅ Bom',
      regular: '⚠️  Regular',
      ruim:    '❌ Ruim',
    };
    return m[this.estado] || this.estado;
  }

  get estadoEmoji() {
    return { bom: '✅', regular: '⚠️ ', ruim: '❌' }[this.estado] || '?';
  }

  // ── Repositório ────────────────────────────────────────────────────────────

  static listar() {
    return db.query('SELECT * FROM utensilios ORDER BY nome')
      .map(r => new Utensilio(r));
  }

  static buscarPorId(id) {
    const rows = db.query('SELECT * FROM utensilios WHERE id = ?', [id]);
    return rows.length ? new Utensilio(rows[0]) : null;
  }

  static buscarPorNome(termo) {
    return db.query(
      "SELECT * FROM utensilios WHERE nome LIKE ? ORDER BY nome",
      [`%${termo}%`]
    ).map(r => new Utensilio(r));
  }

  static cadastrar(nome, quantidade, estado, observacoes) {
    db.exec(
      'INSERT INTO utensilios (nome, quantidade, estado, observacoes) VALUES (?,?,?,?)',
      [nome, quantidade || 1, estado || 'bom', observacoes || '']
    );
    return Utensilio.buscarPorId(db.lastInsertId());
  }

  static resumo() {
    const total   = db.query('SELECT COUNT(*) AS n FROM utensilios')[0].n;
    const bom     = db.query("SELECT COUNT(*) AS n FROM utensilios WHERE estado='bom'")[0].n;
    const regular = db.query("SELECT COUNT(*) AS n FROM utensilios WHERE estado='regular'")[0].n;
    const ruim    = db.query("SELECT COUNT(*) AS n FROM utensilios WHERE estado='ruim'")[0].n;
    return { total, bom, regular, ruim };
  }

  // ── Instância ──────────────────────────────────────────────────────────────

  atualizar({ nome, quantidade, estado, observacoes }) {
    db.exec(
      'UPDATE utensilios SET nome=?, quantidade=?, estado=?, observacoes=? WHERE id=?',
      [
        nome        ?? this.nome,
        quantidade  ?? this.quantidade,
        estado      ?? this.estado,
        observacoes ?? this.observacoes,
        this.id,
      ]
    );
  }

  remover() {
    db.exec('DELETE FROM utensilios WHERE id = ?', [this.id]);
  }
}

module.exports = Utensilio;
