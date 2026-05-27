const readline  = require('readline');
const { conectar } = require('./src/Database');
const Biblioteca   = require('./src/Biblioteca');

// ── Cores ANSI ───────────────────────────────────────────────────────────────
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
};
const c  = (txt, cor) => `${cor}${txt}${C.reset}`;
const ok = txt => console.log(c(`\n  ✅ ${txt}`, C.verde));
const er = txt => console.log(c(`\n  ❌ ${txt}`, C.vermelho));

// ── readline ─────────────────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = txt => new Promise(res => rl.question(txt, res));

// ── Helpers visuais ───────────────────────────────────────────────────────────
const clear = () => process.stdout.write('\x1Bc');
const sep   = () => console.log(c('  ─────────────────────────────────────────────', C.cinza));
const pause = () => ask(c('\n  Pressione ENTER para voltar ao menu...', C.cinza));

function cabecalho(sub = '') {
  console.log(c('╔═══════════════════════════════════════════════════╗', C.azul));
  console.log(c('║    📚  SISTEMA DE GERENCIAMENTO DE BIBLIOTECA     ║', C.azul));
  if (sub) {
    const pad = ' '.repeat(Math.max(0, 51 - sub.length - 4));
    console.log(c(`║  ${sub}${pad}║`, C.azul));
  }
  console.log(c('╚═══════════════════════════════════════════════════╝', C.azul));
  console.log();
}

// ── MENU PRINCIPAL ────────────────────────────────────────────────────────────
async function menuPrincipal(bib) {
  clear();
  const stats = bib.estatisticas();
  cabecalho();

  console.log(c('  📊 Situação atual:', C.bold));
  console.log(`     Livros: ${c(stats.total_livros, C.bold)}  |  `
    + `Disponíveis: ${c(stats.disponiveis, C.verde)}  |  `
    + `Emprestados: ${c(stats.emprestados, C.amarelo)}  |  `
    + `Usuários: ${c(stats.total_usuarios, C.ciano)}`);
  console.log();

  console.log(c('  ── LIVROS ─────────────────────────────', C.bold));
  console.log('  [1] Cadastrar livro');
  console.log('  [2] Listar acervo');
  console.log('  [3] Buscar livro por título');
  console.log();
  console.log(c('  ── USUÁRIOS ───────────────────────────', C.bold));
  console.log('  [4] Cadastrar usuário');
  console.log('  [5] Listar usuários');
  console.log();
  console.log(c('  ── EMPRÉSTIMOS ────────────────────────', C.bold));
  console.log('  [6] Realizar empréstimo');
  console.log('  [7] Registrar devolução');
  console.log();
  console.log(c('  ── RELATÓRIOS ─────────────────────────', C.bold));
  console.log('  [8] Livros emprestados agora');
  console.log('  [9] Histórico completo de empréstimos');
  console.log('  [A] Relatório do acervo com status');
  console.log();
  console.log('  [0] Sair');
  sep();

  return (await ask(c('  Opção: ', C.amarelo))).trim().toUpperCase();
}

// ── 1: Cadastrar livro ────────────────────────────────────────────────────────
async function cadastrarLivro(bib) {
  clear(); cabecalho('📗 Cadastrar Livro');
  const titulo = (await ask('  Título:  ')).trim();
  const autor  = (await ask('  Autor:   ')).trim();
  const isbn   = (await ask('  ISBN:    ')).trim();
  const genero = (await ask('  Gênero:  ')).trim();
  try {
    const l = bib.cadastrarLivro(titulo, autor, isbn, genero);
    ok(`"${l.titulo}" salvo no banco com ID #${l.id}.`);
  } catch(e) { er(e.message); }
  await pause();
}

// ── 2: Listar acervo ──────────────────────────────────────────────────────────
async function listarAcervo(bib) {
  clear(); cabecalho('📚 Acervo Completo');
  const livros = bib.listarLivros();
  if (!livros.length) { console.log(c('  Nenhum livro cadastrado.', C.cinza)); }
  else livros.forEach(l => {
    console.log(c(`  [#${l.id}] `, C.bold) + c(l.titulo, C.bold));
    console.log(`        Autor:  ${l.autor}  |  Gênero: ${l.genero}`);
    console.log(`        ISBN:   ${l.isbn}`);
    console.log(`        Status: ${l.status}`);
    sep();
  });
  await pause();
}

// ── 3: Buscar por título ───────────────────────────────────────────────────────
async function buscarLivro(bib) {
  clear(); cabecalho('🔍 Buscar Livro');
  const termo = (await ask('  Título (ou parte): ')).trim();
  const res   = bib.buscarLivroPorTitulo(termo);
  console.log();
  if (!res.length) { console.log(c('  Nenhum resultado encontrado.', C.cinza)); }
  else res.forEach(l => {
    console.log(`  ${c(`[#${l.id}]`, C.bold)} ${c(l.titulo, C.bold)} — ${l.autor}`);
    console.log(`         Status: ${l.status}`);
  });
  await pause();
}

// ── 4: Cadastrar usuário ──────────────────────────────────────────────────────
async function cadastrarUsuario(bib) {
  clear(); cabecalho('👤 Cadastrar Usuário');
  const nome  = (await ask('  Nome:    ')).trim();
  const email = (await ask('  E-mail:  ')).trim();
  try {
    const u = bib.cadastrarUsuario(nome, email);
    ok(`Usuário "${u.nome}" salvo no banco com ID #${u.id}.`);
  } catch(e) { er(e.message); }
  await pause();
}

// ── 5: Listar usuários ────────────────────────────────────────────────────────
async function listarUsuarios(bib) {
  clear(); cabecalho('👥 Usuários Cadastrados');
  const lista = bib.listarUsuarios();
  if (!lista.length) { console.log(c('  Nenhum usuário cadastrado.', C.cinza)); }
  else lista.forEach(u => {
    console.log(c(`  [#${u.id}] `, C.bold) + c(u.nome, C.bold) + `  <${u.email}>`);
    console.log(`        ${u.resumo}`);
    sep();
  });
  await pause();
}

// ── 6: Realizar empréstimo ────────────────────────────────────────────────────
async function realizarEmprestimo(bib) {
  clear(); cabecalho('📤 Realizar Empréstimo');

  const livrosDisp = bib.listarLivros().filter(l => l.disponivel);
  if (!livrosDisp.length) { er('Nenhum livro disponível.'); return await pause(); }

  console.log(c('  Livros disponíveis:\n', C.bold));
  livrosDisp.forEach(l => console.log(`  [#${l.id}] ${l.titulo} — ${l.autor}`));

  console.log();
  const idLivro = parseInt((await ask('  ID do livro: ')).trim());

  const usuarios = bib.listarUsuarios();
  if (!usuarios.length) { er('Nenhum usuário cadastrado.'); return await pause(); }

  console.log(c('\n  Usuários cadastrados:\n', C.bold));
  usuarios.forEach(u => console.log(`  [#${u.id}] ${u.nome}  <${u.email}>`));

  console.log();
  const idUsuario = parseInt((await ask('  ID do usuário: ')).trim());

  try {
    const res = bib.realizarEmprestimo(idLivro, idUsuario);
    ok(`"${res.livro.titulo}" emprestado para ${res.usuario.nome}!`);
    console.log(c(`     Devolução prevista: ${res.devolucao_prevista}`, C.cinza));
  } catch(e) { er(e.message); }

  await pause();
}

// ── 7: Registrar devolução ────────────────────────────────────────────────────
async function registrarDevolucao(bib) {
  clear(); cabecalho('📥 Registrar Devolução');

  const ativos = bib.livrosEmprestadosAgora();
  if (!ativos.length) { console.log(c('  Nenhum livro emprestado.', C.cinza)); return await pause(); }

  console.log(c('  Empréstimos ativos:\n', C.bold));
  ativos.forEach(e => {
    console.log(`  [Emp #${e.emprestimo_id}] ${c(e.titulo, C.bold)}`);
    console.log(`            Usuário:   ${e.usuario}`);
    console.log(`            Emprestado: ${e.data_emprestimo}  |  Previsto: ${e.data_devolucao_prevista}`);
    sep();
  });

  const idEmp = parseInt((await ask('  ID do empréstimo a devolver: ')).trim());

  try {
    const res = bib.realizarDevolucao(idEmp);
    ok(`"${res.livro.titulo}" devolvido e disponível novamente!`);
  } catch(e) { er(e.message); }

  await pause();
}

// ── 8: Livros emprestados agora ───────────────────────────────────────────────
async function emprestadosAgora(bib) {
  clear(); cabecalho('📊 Emprestados Agora');
  const lista = bib.livrosEmprestadosAgora();
  if (!lista.length) { console.log(c('  Nenhum livro emprestado no momento.', C.cinza)); }
  else {
    console.log(c(`  Total: ${lista.length} empréstimo(s) ativo(s)\n`, C.bold));
    lista.forEach((e, i) => {
      console.log(`  ${i+1}. ${c(e.titulo, C.bold)}`);
      console.log(`     ${c('→ Emprestado para:', C.amarelo)} ${e.usuario}`);
      console.log(`     Emprestado em: ${e.data_emprestimo}  |  Previsto: ${e.data_devolucao_prevista}`);
      sep();
    });
  }
  await pause();
}

// ── 9: Histórico completo ─────────────────────────────────────────────────────
async function historicoEmprestimos(bib) {
  clear(); cabecalho('📜 Histórico de Empréstimos');
  const hist = bib.historicoEmprestimos();
  if (!hist.length) { console.log(c('  Nenhum empréstimo registrado.', C.cinza)); }
  else hist.forEach(e => {
    const cor_status = e.status === 'ativo' ? C.amarelo : C.verde;
    console.log(`  [#${e.id}] ${c(e.titulo, C.bold)}  →  ${e.usuario}`);
    console.log(`        Emprestado: ${e.data_emprestimo}`);
    console.log(`        Previsto:   ${e.data_devolucao_prevista}`);
    if (e.data_devolucao_real) console.log(`        Devolvido:  ${e.data_devolucao_real}`);
    console.log(`        Status:     ${c(e.status.toUpperCase(), cor_status)}`);
    sep();
  });
  await pause();
}

// ── A: Relatório do acervo ────────────────────────────────────────────────────
async function relatorioAcervo(bib) {
  clear(); cabecalho('📋 Relatório do Acervo');
  const rows = bib.relatorioCompleto();
  const disp = rows.filter(r => r.disponivel).length;
  const emp  = rows.length - disp;

  console.log(`  Total: ${c(rows.length, C.bold)}  |  `
    + `Disponíveis: ${c(disp, C.verde)}  |  `
    + `Emprestados: ${c(emp, C.amarelo)}\n`);
  sep();

  rows.forEach(r => {
    const icone  = r.disponivel ? c('✅', C.verde) : c('📤', C.amarelo);
    const status = r.disponivel
      ? c('Disponível', C.verde)
      : c(`Emprestado → ${r.emprestado_para} (dev. ${r.data_devolucao_prevista})`, C.amarelo);
    console.log(`  ${icone} ${c(r.titulo, C.bold)}`);
    console.log(`      Autor:  ${r.autor}  |  Gênero: ${r.genero}`);
    console.log(`      Status: ${status}`);
    sep();
  });
  await pause();
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  // Conecta ao banco antes de qualquer coisa
  process.stdout.write(c('  ⏳ Conectando ao banco de dados...', C.cinza));
  await conectar();
  console.log(c(' OK\n', C.verde));

  const bib = new Biblioteca();

  while (true) {
    const op = await menuPrincipal(bib);
    switch (op) {
      case '1': await cadastrarLivro(bib);       break;
      case '2': await listarAcervo(bib);          break;
      case '3': await buscarLivro(bib);           break;
      case '4': await cadastrarUsuario(bib);      break;
      case '5': await listarUsuarios(bib);        break;
      case '6': await realizarEmprestimo(bib);    break;
      case '7': await registrarDevolucao(bib);    break;
      case '8': await emprestadosAgora(bib);      break;
      case '9': await historicoEmprestimos(bib);  break;
      case 'A': await relatorioAcervo(bib);       break;
      case '0':
        clear();
        console.log(c('\n  📚 Dados salvos. Até logo!\n', C.verde));
        rl.close();
        process.exit(0);
      default:
        er('Opção inválida.');
        await pause();
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
