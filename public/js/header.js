function showLoginForm() {
  let loginForm = document.getElementById("login-form");
  loginForm.style.display = "flex";
}

function showRegisterForm() {
  let registerForm = document.getElementById("register-form");
  registerForm.style.display = "flex";
}

function closeRegisterForm() {
  let registerForm = document.getElementById("register-form");
  let navbarNav = document.getElementById("navbarNav");

  registerForm.style.display = "none";
  navbarNav.style.display = "block";
}

function closeLoginForm() {
  let loginForm = document.getElementById("login-form");
  let navbarNav = document.getElementById("navbarNav");

  loginForm.style.display = "none";
  navbarNav.style.display = "block";
}

async function login() {
  const email_or_username = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email_or_username, password })
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('icon', data.user.icon)
    localStorage.setItem('username', data.user.username);
    window.location.href = '/';
  } else {
    alert(data.message);
  }
}

async function register() {
  const email = document.getElementById('email2').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password2').value;

  const response = await fetch('/api/user/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);
    window.location.href = '/';
  } else {
    alert(data.message);
  }
}

document.getElementById('logout').addEventListener('click', function () {
  const confirmLogout = confirm('Tem certeza que deseja sair da conta?');
  if (confirmLogout) {
      localStorage.clear();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('username')
  if (username) {
      document.getElementById('profile-display').textContent = `Olá, ${username}`;
  } else {
      document.getElementById('profile-display').style.display = 'none';
  }
})  
