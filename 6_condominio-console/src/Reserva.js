const fs   = require('fs');
const path = require('path');
const db   = require('./Database');

class Reserva {
  constructor(row) {
    this.id             = row.id;
    this.condomino_id   = row.condomino_id;
    this.data_evento    = row.data_evento;
    this.hora_inicio    = row.hora_inicio;
    this.hora_fim       = row.hora_fim;
    this.motivo         = row.motivo         || '';
    this.num_convidados = row.num_convidados  || 0;
    this.status         = row.status;        // pendente | aprovada | cancelada
    this.criado_em      = row.criado_em;
    // Campo de JOIN opcional
    this.condominoNome  = row.condomino_nome || null;
    this.condominoUnid  = row.condomino_unid || null;
  }

  get statusLabel() {
    return {
      pendente:  '⏳ Pendente',
      aprovada:  '✅ Aprovada',
      cancelada: '❌ Cancelada',
    }[this.status] || this.status;
  }

  // ── Repositório ────────────────────────────────────────────────────────────

  static listar(filtroStatus) {
    const where  = filtroStatus ? `WHERE r.status = '${filtroStatus}'` : '';
    return db.query(
      `SELECT r.*,
              c.nome AS condomino_nome,
              (u.bloco || '/' || u.numero) AS condomino_unid
       FROM reservas r
       LEFT JOIN condominoss c ON c.id = r.condomino_id
       LEFT JOIN unidades    u ON u.condomino_id = c.id
       ${where}
       ORDER BY r.data_evento DESC`
    ).map(r => new Reserva(r));
  }

  static buscarPorId(id) {
    const rows = db.query(
      `SELECT r.*,
              c.nome AS condomino_nome,
              (u.bloco || '/' || u.numero) AS condomino_unid
       FROM reservas r
       LEFT JOIN condominoss c ON c.id = r.condomino_id
       LEFT JOIN unidades    u ON u.condomino_id = c.id
       WHERE r.id = ?`,
      [id]
    );
    return rows.length ? new Reserva(rows[0]) : null;
  }

  static verificarConflito(dataEvento, horaInicio, horaFim, excluirId = null) {
    const rows = db.query(
      `SELECT id FROM reservas
       WHERE status != 'cancelada'
         AND data_evento = ?
         AND hora_inicio < ?
         AND hora_fim    > ?
         AND id != ?`,
      [dataEvento, horaFim, horaInicio, excluirId || 0]
    );
    return rows.length > 0;
  }

  static criar(condominoId, dataEvento, horaInicio, horaFim, motivo, numConvidados) {
    if (Reserva.verificarConflito(dataEvento, horaInicio, horaFim)) {
      throw new Error('Já existe uma reserva aprovada ou pendente nesse horário.');
    }
    db.exec(
      `INSERT INTO reservas
         (condomino_id, data_evento, hora_inicio, hora_fim, motivo, num_convidados)
       VALUES (?,?,?,?,?,?)`,
      [condominoId, dataEvento, horaInicio, horaFim, motivo || '', numConvidados || 0]
    );
    return Reserva.buscarPorId(db.lastInsertId());
  }

  // ── Instância ──────────────────────────────────────────────────────────────

  aprovar() {
    if (this.status === 'aprovada') throw new Error('Reserva já aprovada.');
    if (this.status === 'cancelada') throw new Error('Não é possível aprovar uma reserva cancelada.');
    db.exec("UPDATE reservas SET status = 'aprovada' WHERE id = ?", [this.id]);
    this.status = 'aprovada';
  }

  cancelar() {
    if (this.status === 'cancelada') throw new Error('Reserva já cancelada.');
    db.exec("UPDATE reservas SET status = 'cancelada' WHERE id = ?", [this.id]);
    this.status = 'cancelada';
  }

  // ── Geração de documento ───────────────────────────────────────────────────

  gerarDocumento(nomeCondominio = 'Condomínio') {
    const linha  = '═'.repeat(58);
    const linha2 = '─'.repeat(58);
    const agora  = new Date().toLocaleString('pt-BR');

    const doc = [
      linha,
      `  ${nomeCondominio.toUpperCase()}`,
      `  CONFIRMAÇÃO DE RESERVA DO SALÃO DE FESTAS`,
      linha,
      '',
      `  Nº da Reserva .: #${String(this.id).padStart(4, '0')}`,
      `  Status ........: ${this.statusLabel}`,
      `  Emitido em ....: ${agora}`,
      '',
      linha2,
      '  DADOS DO SOLICITANTE',
      linha2,
      `  Condômino .....: ${this.condominoNome || '—'}`,
      `  Unidade .......: ${this.condominoUnid  || '—'}`,
      '',
      linha2,
      '  DADOS DO EVENTO',
      linha2,
      `  Data do Evento : ${this.data_evento}`,
      `  Horário .......: ${this.hora_inicio} às ${this.hora_fim}`,
      `  Motivo/Evento .: ${this.motivo || 'Não informado'}`,
      `  Nº de Convidados: ${this.num_convidados}`,
      '',
      linha2,
      '  TERMOS E CONDIÇÕES',
      linha2,
      '  1. O salão deve ser devolvido limpo e em ordem.',
      '  2. O horário deve ser rigorosamente respeitado.',
      '  3. Volumes de música respeitarão o regulamento.',
      '  4. Danos ao patrimônio serão cobrados ao condômino.',
      '  5. Cancelamentos com menos de 48h não serão reembolsados.',
      '',
      linha,
      '',
      '  Assinatura do Condômino: _______________________________',
      '',
      '  Assinatura do Síndico:   _______________________________',
      '',
      linha,
    ].join('\n');

    // Salva em arquivo
    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);

    const fname = `reserva_${String(this.id).padStart(4, '0')}_${this.data_evento.replace(/\//g, '-')}.txt`;
    const fpath = path.join(docsDir, fname);
    fs.writeFileSync(fpath, doc, 'utf8');

    return { texto: doc, arquivo: fpath };
  }
}

module.exports = Reserva;
