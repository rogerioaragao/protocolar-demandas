// Função para mostrar o formulário de login ou cadastro
function showForm(form) {
  document.getElementById('login-form').style.display = form === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = form === 'register' ? 'block' : 'none';
  document.getElementById('service-form').style.display = 'none';
  document.getElementById('solicitacoes-list').style.display = 'none';
}

// Função para login
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email && password) {
    // Simulação de login (substitua com chamada real de backend)
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = 'Login bem-sucedido!';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('service-form').style.display = 'block'; // Exibe o formulário de solicitação
    return false; // Impede o envio real do formulário
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = 'Por favor, preencha todos os campos.';
  }
  return false;
}

// Função para cadastro de usuário
function register() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email-register').value;
  const password = document.getElementById('password-register').value;

  if (name && email && password) {
    // Simulação de cadastro (substitua com chamada real de backend)
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = 'Cadastro realizado com sucesso!';
    showForm('login'); // Volta para a tela de login
    return false; // Impede o envio real do formulário
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = 'Por favor, preencha todos os campos.';
  }
  return false;
}

// Função para enviar solicitação de serviço
function submitServiceRequest() {
  const descricao = document.getElementById('descricao').value;

  if (descricao) {
    // Simulação de envio de solicitação (substitua com chamada real de backend)
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = 'Solicitação enviada com sucesso!';
    document.getElementById('descricao').value = ''; // Limpa o campo
    showSolicitations(); // Exibe a lista de solicitações
    return false; // Impede o envio real do formulário
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = 'Por favor, descreva o serviço.';
  }
  return false;
}

// Função de login com requisição ao backend
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('token', data.token); // Salva o token no localStorage
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = 'Login bem-sucedido!';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('service-form').style.display = 'block';
  } else {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = data.message;
  }
}

// Função para enviar solicitação de serviço
async function submitServiceRequest() {
  const descricao = document.getElementById('descricao').value;
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/solicitacao', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ descricao })
  });

  const data = await response.json();
  
  if (data.message) {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = data.message;
    showSolicitations();
  }
}

// Função para exibir as solicitações feitas
function showSolicitations() {
  document.getElementById('solicitacoes-list').style.display = 'block';
  const list = document.getElementById('list');

  // Exemplo de lista de solicitações (substitua com dados reais de backend)
  const solicitacoes = ['Serviço 1: Troca de óleo', 'Serviço 2: Limpeza de filtro'];
  list.innerHTML = ''; // Limpa a lista atual

  solicitacoes.forEach((solicitacao) => {
    const li = document.createElement('li');
    li.textContent = solicitacao;
    list.appendChild(li);
  });
}

// Inicializa o formulário de login
showForm('login');
