document.addEventListener('DOMContentLoaded', () => {
  const createListForm = document.getElementById('create-list-form');
  const input = document.querySelector('#search-input');
  const resultsList = document.querySelector('#results');
  const apiKey = 'f6b6af75757e4d299ec24dd49163f5af';

  const selectedGames = [];
  const selectedGamesHtml = document.getElementById('selected-movies');
  const gameIdsArray = [];

  const createListButton = document.getElementById('create-list-button');

  createListForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const isPublic = document.getElementById('isPublic').checked;
    const token = localStorage.getItem('token');

    createListButton.disabled = true;

    try {
      const response = await fetch('/api/list/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          gameIds: gameIdsArray,
          isPublic,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = '/profile/lists/';
      } else {
        const data = await response.json();
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Um erro aconteceu ao criar a lista');
    }
  });

  function formatYear(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    return year;
  }

  input.addEventListener('input', async () => {
    const query = input.value.trim();
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${query}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        resultsList.innerHTML = '';

        data.results.forEach(game => {
          const li = document.createElement('li');
          li.innerHTML = `
                        ${game.name} (${formatYear(game.released)})
                    `;
          li.addEventListener('click', async () => {
            resultsList.innerHTML = '';
            selectedGames.push(game.name);
            gameIdsArray.push(game.id);
            updateSelectedGames();
            input.value = '';
          });
          resultsList.appendChild(li);
        });
      } else {
        resultsList.innerHTML = 'Nenhum resultado encontrado.';
      }
    } catch (error) {
      console.log(error);
    }
  });

  function updateSelectedGames() {
    selectedGamesHtml.innerHTML = '';
    selectedGames.forEach((movie, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
          ${movie}
          <button class="remove-button btn-primary" data-index="${index}">Remover</button>
        `;
      selectedGamesHtml.appendChild(li);
    });
  }

  selectedGamesHtml.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-button')) {
      const index = event.target.getAttribute('data-index');
      selectedGames.splice(index, 1);
      gameIdsArray.splice(index, 1);
      updateSelectedGames();
    }
  });
});
