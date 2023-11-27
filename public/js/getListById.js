document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
  
    const listContainer = document.getElementById('lists');
    const titleContainer = document.getElementById('pageTitle')
    const movieContainer = document.createElement('div');
  
    const username = localStorage.getItem('username');
  
    const parts = window.location.pathname.split('/');
    const id = parts.pop();
  
    try {
      // Requests
      const listResponse = await fetch(`/api/list/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const listsData = await listResponse.json();
  
      // Title
      const listName = document.createElement('p');
      listName.textContent = listsData[0].list_name;
      listName.classList.add('title', 'uppercase-text');
  
      const hr = document.createElement('hr');
  
      // Body
      const movieCount = document.createElement('p');
      movieCount.textContent = 'Jogos: ' + listsData[0].games_count;
      movieCount.classList.add('title', 'uppercase-text');
  
      const listDescription = document.createElement('p');
      listDescription.textContent = `${listsData[0].list_description}`;
      listDescription.classList.add('title');
  
      const randomMovieButton = document.createElement('a');
  
      titleContainer.appendChild(listName);
      titleContainer.appendChild(hr);
      titleContainer.appendChild(movieCount);
      titleContainer.appendChild(listDescription);
  
      let randomMovie
      if (listsData && listsData[0] && listsData[0].gameids && listsData[0].gameids.length > 0) {
        const movieIndex = listsData[0].gameids;
        const randomIndex = Math.floor(Math.random() * movieIndex.length);
        randomMovie = movieIndex[randomIndex];
      }
  
      for (const list of listsData) {
        if (list.gameids && list.gameids.length > 0) {
          for (let i = 0; i < list.gameids.length; i++) {
            const movieResponse = await fetch(`/api/game/${encodeURIComponent(list.gameids[i])}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const gameData = await movieResponse.json();
  
            const movieLink = document.createElement('a');
            movieLink.href = `/game/${gameData.body.gameData.gameId}`;
  
            const posterImg = document.createElement('img');
            posterImg.src = gameData.body.gameData.image;
            posterImg.alt = gameData.body.gameData.name;
            posterImg.classList.add('img-poster');
 
            movieLink.appendChild(posterImg);
            movieContainer.appendChild(movieLink);
            listContainer.appendChild(movieContainer);
  
            randomMovieButton.innerHTML = '<i class="fa-solid fa-dice" style="color: #FFFFFF; font-size:30px"></i>';
            randomMovieButton.href = `/game/${randomMovie}`
            randomMovieButton.addEventListener('click', function (event) {
              event.preventDefault();
              window.location.href = randomMovieButton.href;
            });
          }
        } else {
          const noMoviesCell = document.createElement('p');
          noMoviesCell.textContent = 'Esta lista não possui jogos.';
          listContainer.appendChild(noMoviesCell);
        }
  
        titleContainer.appendChild(randomMovieButton);
  
        const listName = list.list_name;
        const buttonContainer = document.getElementById('button');
  
        if (username == listsData[0].user) {
          if (listName !== 'Watchlist' && listName !== 'Meus filmes favoritos') {
  
            const editButton = document.createElement('a');
            editButton.innerHTML = '<i class="fas fa-pencil-alt" style="color: #FFFFFF; font-size:20px"></i>';
            editButton.classList.add('edit-button');
            editButton.href = '/updateList';
            editButton.addEventListener('click', () => {
              localStorage.setItem('gameIds', listsData[0].gameids);
              localStorage.setItem('listId', list.id);
              localStorage.setItem('name', list.list_name);
              localStorage.setItem('description', list.list_description);
            });
  
            const deleteButton = document.createElement('a');
            deleteButton.innerHTML = '<i class="fas fa-trash" style="color: #FFFFFF; font-size:20px"></i>';
            deleteButton.classList.add('delete-button');
            deleteButton.href = '/getAllLists'
            deleteButton.addEventListener('click', () => {
              const confirmDelete = confirm('Tem certeza que deseja excluir a lista?');
              if (confirmDelete) {
                const response = fetch(`/api/list/?id=${encodeURIComponent(list.id)}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
              }
            });
  
            buttonContainer.appendChild(editButton);
            buttonContainer.insertAdjacentHTML('beforeend', '&emsp;');
            buttonContainer.appendChild(deleteButton);
          }
        }
      };
    } catch (error) {
      console.error('Erro ao buscar revisões do usuário:', error);
    }
  });
  