const db = require('./Database');

class Mensagem {
  constructor(row) {
    this.id          = row.id;
    this.condomino_id = row.condomino_id;
    this.mensagem    = row.mensagem;
    this.enviada_em  = row.enviada_em;
    // Campos opcionais vindos de JOIN
    this.autorNome   = row.autor_nome   || null;
    this.autorTipo   = row.autor_tipo   || null;
  }

  get autorLabel() {
    const prefixo = { sindico: '[Síndico]', subsindico: '[Subsíndico]' }[this.autorTipo] || '';
    return prefixo ? `${prefixo} ${this.autorNome}` : this.autorNome || `#${this.condomino_id}`;
  }

  // ── Repositório ────────────────────────────────────────────────────────────

  /**
   * Retorna as últimas N mensagens do chat (default 30), da mais antiga à mais nova
   */
  static listar(limite = 30) {
    return db.query(
      `SELECT m.*, c.nome AS autor_nome, c.tipo AS autor_tipo
       FROM mensagens m
       LEFT JOIN condominoss c ON c.id = m.condomino_id
       ORDER BY m.enviada_em DESC
       LIMIT ?`,
      [limite]
    )
      .reverse()                            // exibe da mais antiga para a mais nova
      .map(r => new Mensagem(r));
  }

  static contarTotal() {
    return db.query('SELECT COUNT(*) AS n FROM mensagens')[0].n;
  }

  static enviar(condominoId, texto) {
    if (!texto || texto.trim().length === 0) throw new Error('Mensagem vazia.');
    if (texto.length > 500) throw new Error('Mensagem muito longa (máx. 500 caracteres).');

    db.exec(
      'INSERT INTO mensagens (condomino_id, mensagem) VALUES (?,?)',
      [condominoId, texto.trim()]
    );
    return db.query(
      `SELECT m.*, c.nome AS autor_nome, c.tipo AS autor_tipo
       FROM mensagens m
       LEFT JOIN condominoss c ON c.id = m.condomino_id
       WHERE m.id = last_insert_rowid()`
    ).map(r => new Mensagem(r))[0];
  }

  static remover(id) {
    db.exec('DELETE FROM mensagens WHERE id = ?', [id]);
  }
}

module.exports = Mensagem;
