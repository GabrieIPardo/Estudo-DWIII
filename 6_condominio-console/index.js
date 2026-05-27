const readline         = require('readline');
const { conectar }     = require('./src/Database');
const SistemaCondominio = require('./src/SistemaCondominio');
const Garagem          = require('./src/Garagem');
const Unidade          = require('./src/Unidade');
const Utensilio        = require('./src/Utensilio');

// ── Cores ANSI ────────────────────────────────────────────────────────────────
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  azul:    '\x1b[34m',
  verde:   '\x1b[32m',
  amarelo: '\x1b[33m',
  vermelho:'\x1b[31m',
  ciano:   '\x1b[36m',
  cinza:   '\x1b[90m',
  magenta: '\x1b[35m',
  branco:  '\x1b[37m',
};
const c   = (txt, cor) => `${cor}${txt}${C.reset}`;
const ok  = txt => console.log(c(`\n  ✅ ${txt}`, C.verde));
const er  = txt => console.log(c(`\n  ❌ ${txt}`, C.vermelho));
const inf = txt => console.log(c(`\n  ℹ️  ${txt}`, C.ciano));

// ── readline ──────────────────────────────────────────────────────────────────
const rl  = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = txt => new Promise(res => rl.question(txt, res));

// ── Helpers visuais ───────────────────────────────────────────────────────────
const clear  = () => process.stdout.write('\x1Bc');
const sep    = (ch = '─', w = 54) => console.log(c(`  ${''.padEnd(w, ch)}`, C.cinza));
const sep2   = (w = 54) => sep('═', w);
const pause  = () => ask(c('\n  Pressione ENTER para voltar...', C.cinza));

function cabecalho(sub = '') {
  console.log(c('╔══════════════════════════════════════════════════════╗', C.azul));
  console.log(c('║      🏢  SISTEMA DE GERENCIAMENTO DE CONDOMÍNIO      ║', C.azul));
  if (sub) {
    const pad = ' '.repeat(Math.max(0, 54 - sub.length - 2));
    console.log(c(`║  ${sub}${pad}║`, C.azul));
  }
  console.log(c('╚══════════════════════════════════════════════════════╝', C.azul));
  console.log();
}

function escolherDaLista(lista, prompt) {
  if (!lista.length) return null;
  return parseInt((ask(prompt)).toString()) || null;  // wrapper síncrono fake
}

// ── MENU PRINCIPAL ────────────────────────────────────────────────────────────
async function menuPrincipal(sis) {
  clear();
  const d = sis.dashboard();
  cabecalho();

  console.log(c(`  🏢  ${sis.nomeCondominio}`, C.bold));
  console.log();

  console.log(c('  📊 Resumo do Condomínio:', C.bold));
  console.log(`     👥 Condôminos: ${c(d.condominoss.total, C.bold)}  |  `
    + `🚗 Garagens: ${c(d.garagens.ocupadas + '/' + d.garagens.todas, C.amarelo)}  |  `
    + `💬 Mensagens: ${c(d.mensagens, C.ciano)}`);
  console.log(`     📅 Reservas pendentes: ${c(d.reservas.pendentes, C.amarelo)}  |  `
    + `✅ Aprovadas: ${c(d.reservas.aprovadas, C.verde)}  |  `
    + `🍽️  Utensílios: ${c(d.utensilios.total, C.branco)}`);
  console.log();

  console.log(c('  ── MÓDULOS ────────────────────────────────', C.bold));
  console.log('  [1] 👥  Condôminos');
  console.log('  [2] 🏠  Unidades');
  console.log('  [3] 🚗  Garagens & Sorteio');
  console.log('  [4] 🎉  Salão de Festas — Reservas');
  console.log('  [5] 🍳  Utensílios da Cozinha');
  console.log('  [6] 💬  Chat do Condomínio');
  console.log();
  console.log('  [0] ❌  Sair');
  sep();

  return (await ask(c('  Opção: ', C.amarelo))).trim().toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 1: CONDÔMINOS
// ═══════════════════════════════════════════════════════════════════════════════
async function menuCondominoss(sis) {
  while (true) {
    clear(); cabecalho('👥 Condôminos');
    console.log('  [1] Cadastrar condômino');
    console.log('  [2] Listar condôminos');
    console.log('  [3] Buscar por nome');
    console.log('  [4] Definir síndico');
    console.log('  [5] Definir subsíndico');
    console.log('  [0] Voltar');
    sep();
    const op = (await ask(c('  Opção: ', C.amarelo))).trim();

    if (op === '1') await cadastrarCondomino(sis);
    else if (op === '2') await listarCondominoss(sis);
    else if (op === '3') await buscarCondomino(sis);
    else if (op === '4') await definirCargo(sis, 'sindico');
    else if (op === '5') await definirCargo(sis, 'subsindico');
    else if (op === '0') break;
    else { er('Opção inválida.'); await pause(); }
  }
}

async function cadastrarCondomino(sis) {
  clear(); cabecalho('➕ Cadastrar Condômino');
  const nome  = (await ask('  Nome completo .: ')).trim();
  const cpf   = (await ask('  CPF ........... : ')).trim();
  const email = (await ask('  E-mail ........ : ')).trim();
  const tel   = (await ask('  Telefone ...... : ')).trim();
  const autos = parseInt(await ask('  Nº automóveis . : ')) || 1;
  try {
    const cond = sis.cadastrarCondomino(nome, cpf, email, tel, 'condomino', autos);
    ok(`Condômino "${cond.nome}" cadastrado com ID #${cond.id}.`);
  } catch (e) { er(e.message); }
  await pause();
}

async function listarCondominoss(sis) {
  clear(); cabecalho('📋 Lista de Condôminos');
  const lista = sis.listarCondominoss();
  if (!lista.length) { inf('Nenhum condômino cadastrado.'); }
  else {
    lista.forEach(c => {
      console.log(c(`  [#${c.id}] `, C.bold) + c(`${c.nome}`, C.bold)
        + '  ' + c.tipoLabel);
      console.log(`       CPF: ${c.cpf}  |  ${c.email}  |  Tel: ${c.telefone}`);
      console.log(`       🏠 ${c.unidadeLabel}  |  🚗 Garagem: ${c.garagemLabel}`
        + `  |  Automóveis: ${c.num_automoveis}`);
      sep();
    });
  }
  await pause();
}

async function buscarCondomino(sis) {
  clear(); cabecalho('🔍 Buscar Condômino');
  const termo = (await ask('  Nome (ou parte): ')).trim();
  const lista = sis.buscarCondominoPorNome(termo);
  if (!lista.length) { inf('Nenhum resultado.'); }
  else lista.forEach(c => {
    console.log(`  ${c(`[#${c.id}]`, C.bold)} ${c.nome}  —  ${c.tipoLabel}`);
    console.log(`       🏠 ${c.unidadeLabel}  🚗 ${c.garagemLabel}`);
    sep();
  });
  await pause();
}

async function definirCargo(sis, cargo) {
  clear();
  const titulo = cargo === 'sindico' ? '🔑 Definir Síndico' : '🔑 Definir Subsíndico';
  cabecalho(titulo);
  const lista = sis.listarCondominoss();
  lista.forEach(c => console.log(`  [#${c.id}] ${c.nome}  ${c.tipoLabel}`));
  console.log();
  const id = parseInt((await ask('  ID do condômino: ')).trim());
  try {
    const fn = cargo === 'sindico' ? sis.definirSindico.bind(sis) : sis.definirSubsindico.bind(sis);
    const c  = fn(id);
    ok(`"${c.nome}" definido como ${cargo === 'sindico' ? 'Síndico' : 'Subsíndico'}.`);
  } catch (e) { er(e.message); }
  await pause();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 2: UNIDADES
// ═══════════════════════════════════════════════════════════════════════════════
async function menuUnidades(sis) {
  while (true) {
    clear(); cabecalho('🏠 Unidades');
    console.log('  [1] Cadastrar unidade');
    console.log('  [2] Listar unidades');
    console.log('  [3] Vincular condômino à unidade');
    console.log('  [0] Voltar');
    sep();
    const op = (await ask(c('  Opção: ', C.amarelo))).trim();

    if (op === '1') await cadastrarUnidade(sis);
    else if (op === '2') await listarUnidades(sis);
    else if (op === '3') await vincularCondominoUnidade(sis);
    else if (op === '0') break;
    else { er('Opção inválida.'); await pause(); }
  }
}

async function cadastrarUnidade(sis) {
  clear(); cabecalho('➕ Cadastrar Unidade');
  const bloco  = (await ask('  Bloco ............: ')).trim().toUpperCase();
  const numero = (await ask('  Número do apto ...: ')).trim();
  console.log('  Tipo: [1] Apartamento  [2] Cobertura  [3] Comercial');
  const tOp = (await ask('  Tipo .............: ')).trim();
  const tipo = tOp === '2' ? 'cobertura' : tOp === '3' ? 'comercial' : 'apartamento';
  try {
    const u = sis.cadastrarUnidade(bloco, numero, tipo);
    ok(`Unidade Bloco ${u.bloco}/Nº ${u.numero} cadastrada com ID #${u.id}.`);
  } catch (e) { er(e.message); }
  await pause();
}

async function listarUnidades(sis) {
  clear(); cabecalho('📋 Unidades do Condomínio');
  const lista = sis.listarUnidades();
  if (!lista.length) { inf('Nenhuma unidade cadastrada.'); }
  else lista.forEach(u => {
    const icone = u.condomino_id ? '👤' : '🔓';
    console.log(`  ${icone} ${c(`[#${u.id}]`, C.bold)} Bloco ${u.bloco} / Nº ${u.numero}  (${u.tipoLabel})`);
    console.log(`       Morador: ${u.condominoNome}`);
    sep();
  });
  await pause();
}

async function vincularCondominoUnidade(sis) {
  clear(); cabecalho('🔗 Vincular Condômino à Unidade');
  const unidades = sis.listarUnidades();
  unidades.forEach(u => console.log(`  [#${u.id}] Bloco ${u.bloco}/Nº ${u.numero} — ${u.condominoNome}`));
  const uId = parseInt((await ask('\n  ID da unidade ...: ')).trim());

  const condominoss = sis.listarCondominoss();
  console.log();
  condominoss.forEach(c => console.log(`  [#${c.id}] ${c.nome}`));
  const cId = parseInt((await ask('\n  ID do condômino .: ')).trim());

  try {
    sis.vincularCondominoUnidade(uId, cId);
    ok('Condômino vinculado à unidade com sucesso.');
  } catch (e) { er(e.message); }
  await pause();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 3: GARAGENS & SORTEIO
// ═══════════════════════════════════════════════════════════════════════════════
async function menuGaragens(sis) {
  while (true) {
    clear(); cabecalho('🚗 Garagens & Sorteio');
    const sit = sis.situacaoGaragens();
    console.log(`  Total: ${c(sit.todas, C.bold)}  Ocupadas: ${c(sit.ocupadas, C.amarelo)}`
      + `  Livres: ${c(sit.livres, C.verde)}  Sorteáveis: ${c(sit.sorteaveis, C.ciano)}`);
    console.log();
    console.log('  [1] Cadastrar garagem');
    console.log('  [2] Listar todas as garagens');
    console.log('  [3] 🎲  Realizar sorteio');
    console.log('  [4] Ver último resultado do sorteio');
    console.log('  [5] Histórico de sorteios');
    console.log('  [0] Voltar');
    sep();
    const op = (await ask(c('  Opção: ', C.amarelo))).trim();

    if (op === '1') await cadastrarGaragem(sis);
    else if (op === '2') await listarGaragens(sis);
    else if (op === '3') await realizarSorteio(sis);
    else if (op === '4') await verResultadoSorteio(sis, null);
    else if (op === '5') await historicoSorteios(sis);
    else if (op === '0') break;
    else { er('Opção inválida.'); await pause(); }
  }
}

async function cadastrarGaragem(sis) {
  clear(); cabecalho('➕ Cadastrar Garagem');
  const numero = (await ask('  Número/Código ...: ')).trim();
  console.log('  Tipos disponíveis:');
  console.log('   [1] 🎲 Sorteável');
  console.log('   [2] 📌 Predeterminada (condômino fixo, 1 carro)');
  console.log('   [3] 🔒 Fixa do Síndico');
  console.log('   [4] 🔒 Fixa do Subsíndico');
  const tOp = (await ask('  Tipo ............: ')).trim();
  const tipos = { '1':'sorteavel','2':'predeterminada','3':'fixa_sindico','4':'fixa_subsindico' };
  const tipo  = tipos[tOp] || 'sorteavel';

  let condominoId = null;
  if (tipo === 'predeterminada' || tipo === 'fixa_sindico' || tipo === 'fixa_subsindico') {
    const lista = sis.listarCondominoss();
    console.log();
    lista.forEach(c => console.log(`  [#${c.id}] ${c.nome}  ${c.tipoLabel}`));
    const resp = (await ask('\n  ID do condômino (ou ENTER para nenhum): ')).trim();
    if (resp) condominoId = parseInt(resp);
  }

  try {
    const g = sis.cadastrarGaragem(numero, tipo, condominoId);
    ok(`Garagem "${g.numero}" cadastrada — ${g.tipoLabel}.`);
  } catch (e) { er(e.message); }
  await pause();
}

async function listarGaragens(sis) {
  clear(); cabecalho('📋 Garagens do Condomínio');
  const lista = sis.listarGaragens();
  if (!lista.length) { inf('Nenhuma garagem cadastrada.'); }
  else lista.forEach(g => {
    const status = g.ocupada ? c('● Ocupada', C.amarelo) : c('○ Livre', C.verde);
    console.log(`  ${c(`[${g.numero}]`, C.bold)}  ${g.tipoLabel.padEnd(26)}  ${status}`);
    if (g.ocupada) console.log(`       Atribuída a: ${g.condominoNome}`);
    sep();
  });
  await pause();
}

async function realizarSorteio(sis) {
  clear(); cabecalho('🎲 Sorteio de Garagens');

  const sorteaveis = Garagem.listarSorteaveis();
  const elegiveis  = sis.listarCondominoss().filter(
    c => c.tipo === 'condomino' && c.num_automoveis >= 2
  );

  console.log(c('  ── Informações do Sorteio ──────────────────', C.bold));
  console.log(`  Garagens sorteáveis: ${c(sorteaveis.length, C.ciano)}`);
  console.log(`  Condôminos elegíveis (2+ carros): ${c(elegiveis.length, C.ciano)}`);
  console.log();
  console.log(c('  Condôminos elegíveis:', C.bold));
  elegiveis.forEach(c => console.log(`    • ${c.nome}  (${c.num_automoveis} automóveis)`));
  console.log();

  if (!sorteaveis.length || !elegiveis.length) {
    er('Sorteio não pode ser realizado. Verifique garagens e condôminos elegíveis.');
    return await pause();
  }

  const conf = (await ask(c('  ⚠️  Confirmar sorteio? (S/N): ', C.amarelo))).trim().toUpperCase();
  if (conf !== 'S') { inf('Sorteio cancelado.'); return await pause(); }

  const obs = (await ask('  Observações (opcional): ')).trim();

  try {
    const { sorteioId, resultados, semGaragem } = sis.realizarSorteio(obs || null);
    console.log();
    console.log(c('  🎉 RESULTADO DO SORTEIO', C.bold));
    sep2();
    resultados.forEach((r, i) => {
      console.log(`  ${String(i+1).padStart(2)}. ${c(r.condomino.padEnd(22), C.bold)}  → Garagem ${c(r.garagem, C.verde)}`);
    });
    if (semGaragem.length) {
      console.log();
      console.log(c('  ⚠️  Sem garagem (número insuficiente):', C.amarelo));
      semGaragem.forEach(n => console.log(`     • ${n}`));
    }
    ok(`Sorteio #${sorteioId} realizado com sucesso!`);
  } catch (e) { er(e.message); }
  await pause();
}

async function verResultadoSorteio(sis, sorteioId) {
  clear(); cabecalho('📊 Resultado do Sorteio');
  const historico = sis.historicoSorteios();
  if (!historico.length) { inf('Nenhum sorteio realizado ainda.'); return await pause(); }

  let id = sorteioId;
  if (!id) {
    // mostra o mais recente por padrão
    id = historico[0].id;
    const s = historico[0];
    console.log(`  Sorteio mais recente: ${c(`#${s.id}`, C.bold)} — ${s.realizado_em}`);
    if (s.observacoes) console.log(`  Obs: ${s.observacoes}`);
    console.log();
  }

  const resultados = sis.resultadoSorteio(id);
  if (!resultados.length) { inf('Sem resultados para este sorteio.'); }
  else {
    console.log(c('  GARAGEM  →  CONDÔMINO', C.bold));
    sep2();
    resultados.forEach(r => {
      console.log(`  ${c(r.garagem.padEnd(8), C.verde)}  →  ${r.condomino}`);
    });
  }
  await pause();
}

async function historicoSorteios(sis) {
  clear(); cabecalho('📜 Histórico de Sorteios');
  const hist = sis.historicoSorteios();
  if (!hist.length) { inf('Nenhum sorteio realizado.'); }
  else hist.forEach(s => {
    console.log(`  ${c(`[#${s.id}]`, C.bold)} Realizado em: ${s.realizado_em}`);
    if (s.observacoes) console.log(`        Obs: ${s.observacoes}`);
    const db2 = require('./src/Database'); const qtd = db2.query(
      'SELECT COUNT(*) AS n FROM sorteio_resultados WHERE sorteio_id = ?', [s.id]
    )[0].n;
    console.log(`        Garagens sorteadas: ${qtd}`);
    sep();
  });
  await pause();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 4: SALÃO DE FESTAS
// ═══════════════════════════════════════════════════════════════════════════════
async function menuSalao(sis) {
  while (true) {
    clear(); cabecalho('🎉 Salão de Festas — Reservas');
    console.log('  [1] Nova reserva');
    console.log('  [2] Listar todas as reservas');
    console.log('  [3] Listar reservas pendentes');
    console.log('  [4] Aprovar reserva');
    console.log('  [5] Cancelar reserva');
    console.log('  [6] Gerar documento de reserva (TXT)');
    console.log('  [0] Voltar');
    sep();
    const op = (await ask(c('  Opção: ', C.amarelo))).trim();

    if (op === '1') await novaReserva(sis);
    else if (op === '2') await listarReservas(sis, null);
    else if (op === '3') await listarReservas(sis, 'pendente');
    else if (op === '4') await gerenciarReserva(sis, 'aprovar');
    else if (op === '5') await gerenciarReserva(sis, 'cancelar');
    else if (op === '6') await gerarDocumentoReserva(sis);
    else if (op === '0') break;
    else { er('Opção inválida.'); await pause(); }
  }
}

async function novaReserva(sis) {
  clear(); cabecalho('📅 Nova Reserva do Salão');
  const lista = sis.listarCondominoss();
  lista.forEach(c => console.log(`  [#${c.id}] ${c.nome}  ${c.unidadeLabel}`));

  const cId    = parseInt((await ask('\n  ID do condômino ...: ')).trim());
  const data   = (await ask('  Data do evento ...: ')).trim();
  const inicio = (await ask('  Hora de início ...: ')).trim();
  const fim    = (await ask('  Hora de término .: ')).trim();
  const motivo = (await ask('  Motivo/Evento ....: ')).trim();
  const conv   = parseInt((await ask('  Nº de convidados .: ')).trim()) || 0;

  try {
    const r = sis.criarReserva(cId, data, inicio, fim, motivo, conv);
    ok(`Reserva #${r.id} criada com status PENDENTE.`);
    inf('Aguardando aprovação do síndico.');
  } catch (e) { er(e.message); }
  await pause();
}

async function listarReservas(sis, status) {
  clear();
  const titulo = status === 'pendente' ? '⏳ Reservas Pendentes' : '📋 Todas as Reservas';
  cabecalho(titulo);
  const lista = sis.listarReservas(status);
  if (!lista.length) { inf('Nenhuma reserva encontrada.'); }
  else lista.forEach(r => {
    const corStatus = {pendente: C.amarelo, aprovada: C.verde, cancelada: C.vermelho}[r.status] || C.branco;
    console.log(`  ${c(`[#${r.id}]`, C.bold)} ${c(r.condominoNome || '—', C.bold)}`
      + `  — ${c(r.statusLabel, corStatus)}`);
    console.log(`       📅 ${r.data_evento}  ⏰ ${r.hora_inicio} às ${r.hora_fim}`);
    console.log(`       🎊 ${r.motivo || 'Sem motivo'}  |  👥 ${r.num_convidados} convidados`);
    console.log(`       🏠 ${r.condominoUnid || '—'}`);
    sep();
  });
  await pause();
}

async function gerenciarReserva(sis, acao) {
  clear();
  const titulo = acao === 'aprovar' ? '✅ Aprovar Reserva' : '❌ Cancelar Reserva';
  cabecalho(titulo);
  const lista = sis.listarReservas();
  if (!lista.length) { inf('Nenhuma reserva cadastrada.'); return await pause(); }
  lista.forEach(r => {
    console.log(`  [#${r.id}] ${r.condominoNome || '—'}  —  ${r.data_evento}  (${r.statusLabel})`);
  });
  const id = parseInt((await ask('\n  ID da reserva: ')).trim());
  try {
    const fn = acao === 'aprovar' ? sis.aprovarReserva.bind(sis) : sis.cancelarReserva.bind(sis);
    const r  = fn(id);
    ok(`Reserva #${r.id} ${acao === 'aprovar' ? 'aprovada' : 'cancelada'} com sucesso.`);
  } catch (e) { er(e.message); }
  await pause();
}

async function gerarDocumentoReserva(sis) {
  clear(); cabecalho('📄 Gerar Documento de Reserva');
  const lista = sis.listarReservas();
  if (!lista.length) { inf('Nenhuma reserva cadastrada.'); return await pause(); }
  lista.forEach(r => console.log(`  [#${r.id}] ${r.condominoNome || '—'}  —  ${r.data_evento}  (${r.statusLabel})`));
  const id = parseInt((await ask('\n  ID da reserva: ')).trim());
  try {
    const { texto, arquivo } = sis.gerarDocumentoReserva(id);
    console.log();
    console.log(texto);
    ok(`Documento salvo em: ${arquivo}`);
  } catch (e) { er(e.message); }
  await pause();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 5: UTENSÍLIOS DA COZINHA
// ═══════════════════════════════════════════════════════════════════════════════
async function menuUtensilios(sis) {
  while (true) {
    clear(); cabecalho('🍳 Utensílios da Cozinha');
    const res = sis.resumoUtensilios();
    console.log(`  Total: ${c(res.total, C.bold)}  ✅ ${res.bom}  ⚠️  ${res.regular}  ❌ ${res.ruim}`);
    console.log();
    console.log('  [1] Cadastrar utensílio');
    console.log('  [2] Listar utensílios');
    console.log('  [3] Atualizar estado de utensílio');
    console.log('  [4] Remover utensílio');
    console.log('  [5] 📄  Gerar relação de utensílios (TXT)');
    console.log('  [0] Voltar');
    sep();
    const op = (await ask(c('  Opção: ', C.amarelo))).trim();

    if (op === '1') await cadastrarUtensilio(sis);
    else if (op === '2') await listarUtensilios(sis);
    else if (op === '3') await atualizarUtensilio(sis);
    else if (op === '4') await removerUtensilio(sis);
    else if (op === '5') await gerarRelacaoUtensilios(sis);
    else if (op === '0') break;
    else { er('Opção inválida.'); await pause(); }
  }
}

async function cadastrarUtensilio(sis) {
  clear(); cabecalho('➕ Cadastrar Utensílio');
  const nome   = (await ask('  Nome do item .....: ')).trim();
  const qtd    = parseInt(await ask('  Quantidade .......: ')) || 1;
  console.log('  Estado: [1] Bom  [2] Regular  [3] Ruim');
  const eOp    = (await ask('  Estado ...........: ')).trim();
  const estado = eOp === '2' ? 'regular' : eOp === '3' ? 'ruim' : 'bom';
  const obs    = (await ask('  Observações ......: ')).trim();
  try {
    const u = sis.cadastrarUtensilio(nome, qtd, estado, obs);
    ok(`Utensílio "${u.nome}" cadastrado com ID #${u.id}.`);
  } catch (e) { er(e.message); }
  await pause();
}

async function listarUtensilios(sis) {
  clear(); cabecalho('📋 Utensílios da Cozinha');
  const lista = sis.listarUtensilios();
  if (!lista.length) { inf('Nenhum utensílio cadastrado.'); }
  else lista.forEach((u, i) => {
    console.log(`  ${String(i+1).padStart(2)}. ${c(u.nome.padEnd(30), C.bold)}`
      + ` ${c(String(u.quantidade).padStart(4), C.ciano)} un.  ${u.estadoLabel}`);
    if (u.observacoes) console.log(`       ℹ️  ${u.observacoes}`);
  });
  await pause();
}

async function atualizarUtensilio(sis) {
  clear(); cabecalho('✏️  Atualizar Utensílio');
  const lista = sis.listarUtensilios();
  lista.forEach(u => console.log(`  [#${u.id}] ${u.nome}  — ${u.estadoLabel}`));
  const id = parseInt((await ask('\n  ID do utensílio: ')).trim());
  const u  = Utensilio.buscarPorId(id);
  if (!u) { er('Utensílio não encontrado.'); return await pause(); }

  console.log();
  console.log(`  Item atual: ${c(u.nome, C.bold)}`);
  const nome   = (await ask(`  Novo nome (ENTER = manter): `)).trim() || u.nome;
  const qtdStr = (await ask(`  Nova quantidade (ENTER = ${u.quantidade}): `)).trim();
  const qtd    = qtdStr ? parseInt(qtdStr) : u.quantidade;
  console.log('  Estado: [1] Bom  [2] Regular  [3] Ruim');
  const eOp    = (await ask(`  Novo estado (ENTER = manter): `)).trim();
  const estado = eOp === '1' ? 'bom' : eOp === '2' ? 'regular' : eOp === '3' ? 'ruim' : u.estado;
  const obs    = (await ask(`  Obs. (ENTER = manter): `)).trim() || u.observacoes;

  try {
    u.atualizar({ nome, quantidade: qtd, estado, observacoes: obs });
    ok(`Utensílio #${u.id} atualizado com sucesso.`);
  } catch (e) { er(e.message); }
  await pause();
}

async function removerUtensilio(sis) {
  clear(); cabecalho('🗑️  Remover Utensílio');
  const lista = sis.listarUtensilios();
  lista.forEach(u => console.log(`  [#${u.id}] ${u.nome}`));
  const id = parseInt((await ask('\n  ID do utensílio: ')).trim());
  const u  = Utensilio.buscarPorId(id);
  if (!u) { er('Utensílio não encontrado.'); return await pause(); }

  const conf = (await ask(c(`  ⚠️  Remover "${u.nome}"? (S/N): `, C.amarelo))).trim().toUpperCase();
  if (conf === 'S') {
    try { u.remover(); ok(`"${u.nome}" removido.`); }
    catch (e) { er(e.message); }
  } else { inf('Operação cancelada.'); }
  await pause();
}

async function gerarRelacaoUtensilios(sis) {
  clear(); cabecalho('📄 Gerar Relação de Utensílios');
  try {
    const { texto, arquivo } = sis.gerarRelacaoUtensilios();
    console.log();
    console.log(texto);
    ok(`Relação salva em: ${arquivo}`);
  } catch (e) { er(e.message); }
  await pause();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 6: CHAT
// ═══════════════════════════════════════════════════════════════════════════════
async function menuChat(sis) {
  while (true) {
    clear(); cabecalho('💬 Chat do Condomínio');
    const total = sis.totalMensagens();
    console.log(`  ${c(total, C.bold)} mensagem(ns) no grupo.`);
    console.log();
    console.log('  [1] Ver mensagens recentes (últimas 30)');
    console.log('  [2] Enviar mensagem');
    console.log('  [3] Ver todas as mensagens');
    console.log('  [0] Voltar');
    sep();
    const op = (await ask(c('  Opção: ', C.amarelo))).trim();

    if (op === '1') await verMensagens(sis, 30);
    else if (op === '2') await enviarMensagem(sis);
    else if (op === '3') await verMensagens(sis, 9999);
    else if (op === '0') break;
    else { er('Opção inválida.'); await pause(); }
  }
}

async function verMensagens(sis, limite) {
  clear(); cabecalho(`💬 Chat — Últimas ${limite < 100 ? limite : 'todas as'} mensagens`);
  const msgs = sis.listarMensagens(limite);
  if (!msgs.length) { inf('Nenhuma mensagem ainda. Seja o primeiro a escrever!'); }
  else {
    msgs.forEach(m => {
      const isDir = m.autorTipo === 'sindico' || m.autorTipo === 'subsindico';
      const corNome = isDir ? C.amarelo : C.ciano;
      console.log(`  ${c(m.autorLabel, corNome)}  ${c(m.enviada_em, C.cinza)}`);
      console.log(`    ${m.mensagem}`);
      sep();
    });
  }
  await pause();
}

async function enviarMensagem(sis) {
  clear(); cabecalho('✉️  Enviar Mensagem no Chat');
  const lista = sis.listarCondominoss();
  lista.forEach(c => console.log(`  [#${c.id}] ${c.nome}  ${c.tipoLabel}`));

  const cId  = parseInt((await ask('\n  ID do condômino .: ')).trim());
  const cond = sis.buscarCondomino(cId);
  if (!cond) { er('Condômino não encontrado.'); return await pause(); }

  console.log(c(`\n  Enviando como: ${cond.nome}`, C.bold));
  const msg  = (await ask('  Mensagem: ')).trim();
  try {
    sis.enviarMensagem(cId, msg);
    ok(`Mensagem de "${cond.nome}" enviada com sucesso!`);
  } catch (e) { er(e.message); }
  await pause();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  process.stdout.write(c('\n  ⏳ Conectando ao banco de dados...', C.cinza));
  await conectar();
  console.log(c(' OK\n', C.verde));

  const sis = new SistemaCondominio();

  while (true) {
    const op = await menuPrincipal(sis);
    switch (op) {
      case '1': await menuCondominoss(sis); break;
      case '2': await menuUnidades(sis);    break;
      case '3': await menuGaragens(sis);    break;
      case '4': await menuSalao(sis);       break;
      case '5': await menuUtensilios(sis);  break;
      case '6': await menuChat(sis);        break;
      case '0':
        clear();
        console.log(c('\n  🏢 Dados salvos. Até logo!\n', C.verde));
        rl.close();
        process.exit(0);
      default:
        er('Opção inválida.');
        await pause();
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
