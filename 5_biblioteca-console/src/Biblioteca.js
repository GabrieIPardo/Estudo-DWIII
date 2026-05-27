const db      = require('./Database');
const Livro   = require('./Livro');
const Usuario = require('./Usuario');

class Biblioteca {

  // ── Livros ─────────────────────────────────────────────────────────────────

  listarLivros() {
    return Livro.listar();
  }

  buscarLivroPorTitulo(termo) {
    return Livro.buscarPorTitulo(termo);
  }

  cadastrarLivro(titulo, autor, isbn, genero) {
    return Livro.cadastrar(titulo, autor, isbn, genero);
  }

  // ── Usuários ───────────────────────────────────────────────────────────────

  listarUsuarios() {
    return Usuario.listar();
  }

  cadastrarUsuario(nome, email) {
    return Usuario.cadastrar(nome, email);
  }

  // ── Empréstimos ────────────────────────────────────────────────────────────

  realizarEmprestimo(livroId, usuarioId) {
    const livro   = Livro.buscarPorId(livroId);
    const usuario = Usuario.buscarPorId(usuarioId);

    if (!livro)   throw new Error('Livro não encontrado.');
    if (!usuario) throw new Error('Usuário não encontrado.');

    livro.emprestar(); // valida disponibilidade e atualiza no banco

    // Calcula data prevista de devolução (+14 dias)
    const prevista = new Date();
    prevista.setDate(prevista.getDate() + 14);
    const dataStr = prevista.toLocaleDateString('pt-BR');

    db.exec(
      `INSERT INTO emprestimos (livro_id, usuario_id, data_devolucao_prevista)
       VALUES (?, ?, ?)`,
      [livroId, usuarioId, dataStr]
    );

    return { livro, usuario, devolucao_prevista: dataStr };
  }

  realizarDevolucao(emprestimoId) {
    const rows = db.query(
      "SELECT * FROM emprestimos WHERE id = ? AND status = 'ativo'",
      [emprestimoId]
    );
    if (!rows.length) throw new Error('Empréstimo ativo não encontrado.');

    const emp   = rows[0];
    const livro = Livro.buscarPorId(emp.livro_id);

    livro.devolver(); // atualiza disponivel=1 no banco

    db.exec(
      `UPDATE emprestimos
       SET status = 'devolvido', data_devolucao_real = datetime('now','localtime')
       WHERE id = ?`,
      [emprestimoId]
    );

    return { livro };
  }

  // ── Relatórios ─────────────────────────────────────────────────────────────

  livrosEmprestadosAgora() {
    return db.query(`
      SELECT
        e.id       AS emprestimo_id,
        l.titulo,
        l.autor,
        u.nome     AS usuario,
        e.data_emprestimo,
        e.data_devolucao_prevista
      FROM emprestimos e
      JOIN livros   l ON l.id = e.livro_id
      JOIN usuarios u ON u.id = e.usuario_id
      WHERE e.status = 'ativo'
      ORDER BY e.data_emprestimo DESC
    `);
  }

  historicoEmprestimos() {
    return db.query(`
      SELECT
        e.id,
        l.titulo,
        u.nome           AS usuario,
        e.data_emprestimo,
        e.data_devolucao_prevista,
        e.data_devolucao_real,
        e.status
      FROM emprestimos e
      JOIN livros   l ON l.id = e.livro_id
      JOIN usuarios u ON u.id = e.usuario_id
      ORDER BY e.data_emprestimo DESC
    `);
  }

  relatorioCompleto() {
    return db.query(`
      SELECT
        l.id,
        l.titulo,
        l.autor,
        l.genero,
        l.isbn,
        l.disponivel,
        u.nome AS emprestado_para,
        e.data_devolucao_prevista
      FROM livros l
      LEFT JOIN emprestimos e ON e.livro_id = l.id AND e.status = 'ativo'
      LEFT JOIN usuarios    u ON u.id = e.usuario_id
      ORDER BY l.titulo
    `);
  }

  estatisticas() {
    const total      = db.query('SELECT COUNT(*) AS n FROM livros')[0].n;
    const emprest    = db.query("SELECT COUNT(*) AS n FROM livros WHERE disponivel = 0")[0].n;
    const usuarios   = db.query('SELECT COUNT(*) AS n FROM usuarios')[0].n;
    const historico  = db.query('SELECT COUNT(*) AS n FROM emprestimos')[0].n;
    return { total_livros: total, emprestados: emprest, disponiveis: total - emprest, total_usuarios: usuarios, total_historico: historico };
  }
}

module.exports = Biblioteca;
