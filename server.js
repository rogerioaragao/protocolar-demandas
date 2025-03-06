const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Inicializa o servidor Express
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Substitua com seu usuário do MySQL
  password: '', // Substitua com sua senha do MySQL
  database: 'cadastro_solicitacao' // Banco de dados a ser usado
});

// Conecta ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, 'secretKey', { expiresIn: '1h' });
};

// Rota de cadastro de usuário
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  // Verifica se o e-mail já existe
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar o e-mail.' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    // Criptografa a senha
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao criptografar a senha.' });
      }

      // Insere o novo usuário no banco de dados
      db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Erro ao cadastrar o usuário.' });
        }
        return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
      });
    });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  // Verifica se o e-mail existe no banco de dados
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar o e-mail.' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'E-mail ou senha incorretos.' });
    }

    // Compara a senha
    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao verificar a senha.' });
      }
      if (!isMatch) {
        return res.status(400).json({ message: 'E-mail ou senha incorretos.' });
      }

      // Gera o token de autenticação
      const token = generateToken(results[0].id);

      return res.status(200).json({ message: 'Login bem-sucedido!', token });
    });
  });
});

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido.' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Rota para enviar solicitação de serviço
app.post('/solicitacao', authenticateToken, (req, res) => {
  const { descricao } = req.body;

  if (!descricao) {
    return res.status(400).json({ message: 'Descrição é obrigatória.' });
  }

  // Insere a solicitação no banco de dados
  db.query('INSERT INTO solicitacoes (user_id, descricao) VALUES (?, ?)', [req.userId, descricao], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao enviar a solicitação.' });
    }
    return res.status(201).json({ message: 'Solicitação enviada com sucesso!' });
  });
});

// Rota para listar solicitações do usuário
app.get('/solicitacoes', authenticateToken, (req, res) => {
  db.query('SELECT * FROM solicitacoes WHERE user_id = ?', [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao obter as solicitações.' });
    }
    res.status(200).json(results);
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
