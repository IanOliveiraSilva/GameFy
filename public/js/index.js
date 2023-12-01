document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch(`/api/games/tendency`, {
      method: 'GET'
  });

  const gamesData = await response.json();
  const carouselInner = document.querySelector('#games-tendency .carousel-inner');

  for (const [index, game] of gamesData.games.entries()) {
      const carouselItem = document.createElement('div');
      carouselItem.classList.add('carousel-item');
      if (index === 0) {
          carouselItem.classList.add('active');
      }

      const gameLink = document.createElement('a');
      gameLink.href = `/game/${game.gameid}`;

      const posterImage = document.createElement('img');
      posterImage.src = game.image;
      posterImage.alt = 'Poster do Jogo';
      posterImage.classList.add('d-block', 'img-fluid');

      const gameTitle = document.createElement('h5');
      gameTitle.textContent = game.title;
      gameTitle.classList.add('game-title');

      gameLink.appendChild(posterImage);
      carouselItem.appendChild(gameLink);
      carouselItem.appendChild(gameTitle);
      carouselInner.appendChild(carouselItem);
  }

  $('#games-tendency').carousel();
});