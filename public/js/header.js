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

function confirmLogout() {
  localStorage.clear();
  window.location.href = '/';
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

document.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('username');
  const icon = localStorage.getItem('icon');

  //POP UP
  var openButton = document.getElementById('openPopup');
  var popup = document.getElementById('popup');
  var closeButton = document.getElementById('closePopup');

  openButton.addEventListener('click', function () {
    document.getElementById('popup').classList.add('active');
  });

  closeButton.addEventListener('click', function () {
    document.getElementById('popup').classList.remove('active');
  });

  window.addEventListener('click', function (event) {
    if (event.target == popup) {
      popup.style.display = 'none';
    }
  });

  if (username) {
    document.getElementById('get-profile').innerHTML =
      `
        <img src="${icon}" class="profile-image-header"
          href="/profile">&emsp;
        <p>${username}</p>
      `;
    document.getElementById('openPopup').textContent = `Logout`;
    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'none';
  } else {
    document.getElementById('register').textContent = `Crie sua conta`;
    document.getElementById('login').textContent = `Entre na sua conta`;
    document.getElementById('openPopup').style.display = 'none';
  }

  const getProfile = document.getElementById('get-profile');
  getProfile.addEventListener('click', function (event) {
    window.location.href = '/profile';
  });
})  
