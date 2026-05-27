const db = require('./Database');

class Garagem {
  constructor(row) {
    this.id          = row.id;
    this.numero      = row.numero;
    this.tipo        = row.tipo;  // fixa_sindico | fixa_subsindico | predeterminada | sorteavel
    this.condomino_id = row.condomino_id;
    this.criado_em   = row.criado_em;
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  get tipoLabel() {
    const m = {
      fixa_sindico:    '🔒 Fixa — Síndico',
      fixa_subsindico: '🔒 Fixa — Subsíndico',
      predeterminada:  '📌 Predeterminada',
      sorteavel:       '🎲 Sorteável',
    };
    return m[this.tipo] || this.tipo;
  }

  get ocupada() { return this.condomino_id !== null && this.condomino_id !== undefined; }

  get condominoNome() {
    if (!this.ocupada) return '—';
    const rows = db.query('SELECT nome FROM condominoss WHERE id = ?', [this.condomino_id]);
    return rows.length ? rows[0].nome : '—';
  }

  // ── Repositório ────────────────────────────────────────────────────────────

  static listar() {
    return db.query('SELECT * FROM garagens ORDER BY numero')
      .map(r => new Garagem(r));
  }

  static buscarPorId(id) {
    const rows = db.query('SELECT * FROM garagens WHERE id = ?', [id]);
    return rows.length ? new Garagem(rows[0]) : null;
  }

  static listarSorteaveis() {
    return db.query("SELECT * FROM garagens WHERE tipo = 'sorteavel' ORDER BY numero")
      .map(r => new Garagem(r));
  }

  static listarDisponiveis() {
    return db.query(
      "SELECT * FROM garagens WHERE tipo = 'sorteavel' AND condomino_id IS NULL ORDER BY numero"
    ).map(r => new Garagem(r));
  }

  static cadastrar(numero, tipo, condominoId) {
    const existe = db.query('SELECT id FROM garagens WHERE numero = ?', [numero]);
    if (existe.length) throw new Error(`Garagem "${numero}" já cadastrada.`);

    // Valida tipo e se já existe fixa para síndico/subsíndico
    if (tipo === 'fixa_sindico') {
      const jaExiste = db.query("SELECT id FROM garagens WHERE tipo = 'fixa_sindico'");
      if (jaExiste.length) throw new Error('Já existe uma garagem fixa do síndico cadastrada.');
    }
    if (tipo === 'fixa_subsindico') {
      const jaExiste = db.query("SELECT id FROM garagens WHERE tipo = 'fixa_subsindico'");
      if (jaExiste.length) throw new Error('Já existe uma garagem fixa do subsíndico cadastrada.');
    }

    db.exec(
      'INSERT INTO garagens (numero, tipo, condomino_id) VALUES (?,?,?)',
      [numero, tipo || 'sorteavel', condominoId || null]
    );
    return Garagem.buscarPorId(db.lastInsertId());
  }

  // ── Lógica de sorteio ──────────────────────────────────────────────────────

  /**
   * Realiza o sorteio das garagens sorteáveis.
   *
   * Elegíveis: condôminos do tipo 'condomino' com num_automoveis >= 2
   *            (síndico e subsíndico já têm garagens fixas;
   *             condôminos com 1 carro têm garagem predeterminada)
   *
   * Retorna objeto com { sorteioId, resultados, semGaragem }
   */
  static realizarSorteio(observacoes) {
    const garagens = Garagem.listarSorteaveis();
    if (!garagens.length) throw new Error('Não há garagens sorteáveis cadastradas.');

    // Condôminos elegíveis
    const elegiveis = db.query(
      "SELECT * FROM condominoss WHERE tipo = 'condomino' AND num_automoveis >= 2 ORDER BY nome"
    );
    if (!elegiveis.length) throw new Error('Nenhum condômino elegível para sorteio (2+ automóveis).');

    // Embaralha as garagens (Fisher-Yates)
    const pool = [...garagens];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Libera atribuições anteriores das sorteáveis
    db.exec("UPDATE garagens SET condomino_id = NULL WHERE tipo = 'sorteavel'");

    // Registra sorteio
    db.exec('INSERT INTO sorteios (observacoes) VALUES (?)', [observacoes || '']);
    const sorteioId = db.lastInsertId();

    // Atribui garagens
    const resultados = [];
    const semGaragem = [];

    elegiveis.forEach((cond, idx) => {
      if (idx < pool.length) {
        const garagem = pool[idx];
        db.exec('UPDATE garagens SET condomino_id = ? WHERE id = ?', [cond.id, garagem.id]);
        db.exec(
          'INSERT INTO sorteio_resultados (sorteio_id, garagem_id, condomino_id) VALUES (?,?,?)',
          [sorteioId, garagem.id, cond.id]
        );
        resultados.push({ condomino: cond.nome, garagem: garagem.numero });
      } else {
        semGaragem.push(cond.nome);
      }
    });

    return { sorteioId, resultados, semGaragem };
  }

  static historicoSorteios() {
    return db.query('SELECT * FROM sorteios ORDER BY realizado_em DESC');
  }

  static resultadoSorteio(sorteioId) {
    return db.query(
      `SELECT sr.id, g.numero AS garagem, c.nome AS condomino, c.unidade_label
       FROM sorteio_resultados sr
       JOIN garagens     g ON g.id = sr.garagem_id
       JOIN condominoss  c ON c.id = sr.condomino_id
       WHERE sr.sorteio_id = ?
       ORDER BY g.numero`,
      [sorteioId]
    );
  }

  // ── Instância ──────────────────────────────────────────────────────────────

  atribuir(condominoId) {
    if (this.tipo === 'fixa_sindico' || this.tipo === 'fixa_subsindico') {
      throw new Error('Garagens fixas não podem ser reatribuídas manualmente.');
    }
    db.exec('UPDATE garagens SET condomino_id = ? WHERE id = ?', [condominoId, this.id]);
    this.condomino_id = condominoId;
  }

  liberar() {
    if (this.tipo === 'fixa_sindico' || this.tipo === 'fixa_subsindico') {
      throw new Error('Garagens fixas não podem ser liberadas.');
    }
    db.exec('UPDATE garagens SET condomino_id = NULL WHERE id = ?', [this.id]);
    this.condomino_id = null;
  }
}

module.exports = Garagem;
