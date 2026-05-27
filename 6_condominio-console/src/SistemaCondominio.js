const fs        = require('fs');
const path      = require('path');
const db        = require('./Database');
const Condomino = require('./Condomino');
const Unidade   = require('./Unidade');
const Garagem   = require('./Garagem');
const Utensilio = require('./Utensilio');
const Mensagem  = require('./Chat');
const Reserva   = require('./Reserva');

class SistemaCondominio {

  // ── Configuração ───────────────────────────────────────────────────────────

  get nomeCondominio() {
    return 'Condomínio Residencial Bela Vista';
  }

  // ── Condôminos ─────────────────────────────────────────────────────────────

  listarCondominoss()         { return Condomino.listar(); }
  buscarCondomino(id)         { return Condomino.buscarPorId(id); }
  buscarCondominoPorNome(t)   { return Condomino.buscarPorNome(t); }
  cadastrarCondomino(...args) { return Condomino.cadastrar(...args); }

  definirSindico(condominoId) {
    // Remove o síndico anterior
    const ant = Condomino.buscarPorTipo('sindico');
    ant.forEach(c => c.definirTipo('condomino'));

    const c = Condomino.buscarPorId(condominoId);
    if (!c) throw new Error('Condômino não encontrado.');
    c.definirTipo('sindico');

    // Atribui a garagem fixa do síndico a esse condômino
    const garFixa = db.query("SELECT * FROM garagens WHERE tipo = 'fixa_sindico'");
    if (garFixa.length) {
      db.exec('UPDATE garagens SET condomino_id = ? WHERE tipo = ?', [condominoId, 'fixa_sindico']);
    }
    return c;
  }

  definirSubsindico(condominoId) {
    const ant = Condomino.buscarPorTipo('subsindico');
    ant.forEach(c => c.definirTipo('condomino'));

    const c = Condomino.buscarPorId(condominoId);
    if (!c) throw new Error('Condômino não encontrado.');
    c.definirTipo('subsindico');

    const garFixa = db.query("SELECT * FROM garagens WHERE tipo = 'fixa_subsindico'");
    if (garFixa.length) {
      db.exec('UPDATE garagens SET condomino_id = ? WHERE tipo = ?', [condominoId, 'fixa_subsindico']);
    }
    return c;
  }

  estatisticasCondominoss() {
    const total       = db.query('SELECT COUNT(*) AS n FROM condominoss')[0].n;
    const sindico     = db.query("SELECT COUNT(*) AS n FROM condominoss WHERE tipo='sindico'")[0].n;
    const subsindico  = db.query("SELECT COUNT(*) AS n FROM condominoss WHERE tipo='subsindico'")[0].n;
    const comuns      = total - sindico - subsindico;
    const c1Carro     = db.query('SELECT COUNT(*) AS n FROM condominoss WHERE num_automoveis = 1')[0].n;
    const c2maisCarros= db.query('SELECT COUNT(*) AS n FROM condominoss WHERE num_automoveis >= 2')[0].n;
    return { total, sindico, subsindico, comuns, c1Carro, c2maisCarros };
  }

  // ── Unidades ───────────────────────────────────────────────────────────────

  listarUnidades()             { return Unidade.listar(); }
  cadastrarUnidade(...args)    { return Unidade.cadastrar(...args); }
  vincularCondominoUnidade(unidadeId, condominoId) {
    const u = Unidade.buscarPorId(unidadeId);
    if (!u) throw new Error('Unidade não encontrada.');
    u.vincularCondomino(condominoId);
    return u;
  }

  // ── Garagens ───────────────────────────────────────────────────────────────

  listarGaragens()             { return Garagem.listar(); }
  cadastrarGaragem(...args)    { return Garagem.cadastrar(...args); }

  realizarSorteio(observacoes) {
    return Garagem.realizarSorteio(observacoes);
  }

  historicoSorteios()          { return Garagem.historicoSorteios(); }

  resultadoSorteio(sorteioId)  { return Garagem.resultadoSorteio(sorteioId); }

  situacaoGaragens() {
    const todas      = db.query('SELECT COUNT(*) AS n FROM garagens')[0].n;
    const ocupadas   = db.query('SELECT COUNT(*) AS n FROM garagens WHERE condomino_id IS NOT NULL')[0].n;
    const livres     = todas - ocupadas;
    const sorteaveis = db.query("SELECT COUNT(*) AS n FROM garagens WHERE tipo='sorteavel'")[0].n;
    return { todas, ocupadas, livres, sorteaveis };
  }

  // ── Utensílios ─────────────────────────────────────────────────────────────

  listarUtensilios()           { return Utensilio.listar(); }
  cadastrarUtensilio(...args)  { return Utensilio.cadastrar(...args); }
  resumoUtensilios()           { return Utensilio.resumo(); }

  gerarRelacaoUtensilios() {
    const utensilios = Utensilio.listar();
    const linha  = '═'.repeat(65);
    const linha2 = '─'.repeat(65);
    const agora  = new Date().toLocaleString('pt-BR');
    const res    = Utensilio.resumo();

    const linhasItens = utensilios.map((u, i) => {
      const num  = String(i + 1).padStart(3, ' ');
      const nome = u.nome.padEnd(32, ' ').substring(0, 32);
      const qtd  = String(u.quantidade).padStart(4, ' ');
      const obs  = u.observacoes ? ` | ${u.observacoes}` : '';
      return `  ${num}. ${nome} ${qtd} un.  ${u.estadoEmoji}${obs}`;
    });

    const doc = [
      linha,
      `  ${this.nomeCondominio.toUpperCase()}`,
      '  RELAÇÃO DE UTENSÍLIOS — COZINHA DO SALÃO DE FESTAS',
      linha,
      `  Gerado em: ${agora}`,
      '',
      `  Total de itens: ${res.total}   `,
      `  ✅ Bom: ${res.bom}   ⚠️  Regular: ${res.regular}   ❌ Ruim: ${res.ruim}`,
      '',
      linha2,
      `  ${'Nº'.padEnd(4)} ${'ITEM'.padEnd(33)} ${'QTDE'.padStart(5)}  ESTADO`,
      linha2,
      ...linhasItens,
      '',
      linha2,
      '  Observações:',
      '  ___________________________________________________________',
      '  ___________________________________________________________',
      '',
      linha,
      '',
      '  Responsável: ______________________  Data: ___/___/______',
      '',
      linha,
    ].join('\n');

    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);

    const fname = `utensilios_${Date.now()}.txt`;
    const fpath = path.join(docsDir, fname);
    fs.writeFileSync(fpath, doc, 'utf8');

    return { texto: doc, arquivo: fpath };
  }

  // ── Chat ───────────────────────────────────────────────────────────────────

  listarMensagens(limite)      { return Mensagem.listar(limite); }
  enviarMensagem(cid, texto)   { return Mensagem.enviar(cid, texto); }
  totalMensagens()             { return Mensagem.contarTotal(); }

  // ── Reservas do Salão ──────────────────────────────────────────────────────

  listarReservas(status)       { return Reserva.listar(status); }
  criarReserva(...args)        { return Reserva.criar(...args); }

  aprovarReserva(id) {
    const r = Reserva.buscarPorId(id);
    if (!r) throw new Error('Reserva não encontrada.');
    r.aprovar();
    return r;
  }

  cancelarReserva(id) {
    const r = Reserva.buscarPorId(id);
    if (!r) throw new Error('Reserva não encontrada.');
    r.cancelar();
    return r;
  }

  gerarDocumentoReserva(id) {
    const r = Reserva.buscarPorId(id);
    if (!r) throw new Error('Reserva não encontrada.');
    return r.gerarDocumento(this.nomeCondominio);
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────

  dashboard() {
    return {
      condominoss:   this.estatisticasCondominoss(),
      garagens:  this.situacaoGaragens(),
      utensilios: this.resumoUtensilios(),
      reservas: {
        pendentes: db.query("SELECT COUNT(*) AS n FROM reservas WHERE status='pendente'")[0].n,
        aprovadas: db.query("SELECT COUNT(*) AS n FROM reservas WHERE status='aprovada'")[0].n,
      },
      mensagens: this.totalMensagens(),
      sorteios:  this.historicoSorteios().length,
    };
  }
}

module.exports = SistemaCondominio;
