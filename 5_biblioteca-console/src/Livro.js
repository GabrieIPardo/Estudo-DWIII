const db = require('./Database');

class Livro {
  constructor(row) {
    this.id        = row.id;
    this.titulo    = row.titulo;
    this.autor     = row.autor;
    this.isbn      = row.isbn;
    this.genero    = row.genero;
    this.disponivel = row.disponivel === 1 || row.disponivel === true;
    this.criado_em = row.criado_em;
  }

  get status() {
    return this.disponivel ? '✅ Disponível' : '📤 Emprestado';
  }

  // ── Métodos estáticos (repositório) ────────────────────────────────────────

  static listar() {
    return db.query('SELECT * FROM livros ORDER BY titulo').map(r => new Livro(r));
  }

  static buscarPorId(id) {
    const rows = db.query('SELECT * FROM livros WHERE id = ?', [id]);
    return rows.length ? new Livro(rows[0]) : null;
  }

  static buscarPorTitulo(termo) {
    return db.query(
      "SELECT * FROM livros WHERE titulo LIKE ? ORDER BY titulo",
      [`%${termo}%`]
    ).map(r => new Livro(r));
  }

  static cadastrar(titulo, autor, isbn, genero) {
    // Valida ISBN único
    const existe = db.query('SELECT id FROM livros WHERE isbn = ?', [isbn]);
    if (existe.length) throw new Error(`ISBN "${isbn}" já cadastrado.`);

    db.exec(
      'INSERT INTO livros (titulo, autor, isbn, genero) VALUES (?,?,?,?)',
      [titulo, autor, isbn, genero || 'Não informado']
    );
    
    // ✅ Busca o livro pelo ISBN (que é UNIQUE)
    const livros = db.query('SELECT * FROM livros WHERE isbn = ?', [isbn]);
    
    if (!livros.length) throw new Error('Erro ao inserir livro no banco.');
    
    return new Livro(livros[0]);
  }

  // ── Métodos de instância (domínio) ─────────────────────────────────────────

  emprestar() {
    if (!this.disponivel) throw new Error(`"${this.titulo}" já está emprestado.`);
    db.exec('UPDATE livros SET disponivel = 0 WHERE id = ?', [this.id]);
    this.disponivel = false;
  }

  devolver() {
    if (this.disponivel) throw new Error(`"${this.titulo}" não está emprestado.`);
    db.exec('UPDATE livros SET disponivel = 1 WHERE id = ?', [this.id]);
    this.disponivel = true;
  }
}

module.exports = Livro;
