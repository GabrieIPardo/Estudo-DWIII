const db = require('./Database');

class Unidade {
  constructor(row) {
    this.id          = row.id;
    this.bloco       = row.bloco;
    this.numero      = row.numero;
    this.tipo        = row.tipo;  // apartamento | cobertura | comercial
    this.condomino_id = row.condomino_id;
    this.criado_em   = row.criado_em;
  }

  get label() {
    return `Bloco ${this.bloco} / Nº ${this.numero} (${this.tipoLabel})`;
  }

  get tipoLabel() {
    const m = {
      apartamento: 'Apartamento',
      cobertura:   'Cobertura',
      comercial:   'Sala Comercial',
    };
    return m[this.tipo] || this.tipo;
  }

  get condominoNome() {
    if (!this.condomino_id) return 'Sem morador';
    const rows = db.query('SELECT nome FROM condominoss WHERE id = ?', [this.condomino_id]);
    return rows.length ? rows[0].nome : '—';
  }

  // ── Repositório ────────────────────────────────────────────────────────────

  static listar() {
    return db.query('SELECT * FROM unidades ORDER BY bloco, numero')
      .map(r => new Unidade(r));
  }

  static buscarPorId(id) {
    const rows = db.query('SELECT * FROM unidades WHERE id = ?', [id]);
    return rows.length ? new Unidade(rows[0]) : null;
  }

  static listarLivres() {
    return db.query(
      'SELECT * FROM unidades WHERE condomino_id IS NULL ORDER BY bloco, numero'
    ).map(r => new Unidade(r));
  }

  static cadastrar(bloco, numero, tipo) {
    const existe = db.query(
      'SELECT id FROM unidades WHERE bloco = ? AND numero = ?', [bloco, numero]
    );
    if (existe.length) throw new Error(`Unidade Bloco ${bloco} / Nº ${numero} já existe.`);

    db.exec(
      'INSERT INTO unidades (bloco, numero, tipo) VALUES (?,?,?)',
      [bloco.toUpperCase(), numero, tipo || 'apartamento']
    );
    return Unidade.buscarPorId(db.lastInsertId());
  }

  // ── Instância ──────────────────────────────────────────────────────────────

  vincularCondomino(condominoId) {
    // Verifica se condômino já tem unidade
    const jaTemUnidade = db.query(
      'SELECT id FROM unidades WHERE condomino_id = ? AND id != ?',
      [condominoId, this.id]
    );
    if (jaTemUnidade.length) throw new Error('Condômino já possui outra unidade vinculada.');

    db.exec('UPDATE unidades SET condomino_id = ? WHERE id = ?', [condominoId, this.id]);
    this.condomino_id = condominoId;
  }

  desvincularCondomino() {
    db.exec('UPDATE unidades SET condomino_id = NULL WHERE id = ?', [this.id]);
    this.condomino_id = null;
  }
}

module.exports = Unidade;
