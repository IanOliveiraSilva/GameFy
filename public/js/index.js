document.addEventListener('DOMContentLoaded', async () => {
    // GAMES TENDENCY
    const response = await fetch(`/api/games/tendency`, {
      method: 'GET'
    });

    const gamesData = await response.json();

    const carouselInner = document.createElement('div');
    carouselInner.classList.add('carousel-inner');

    let isFirstItem = true;

    for (const game of gamesData.games) {

      const carouselItem = document.createElement('div');
      carouselItem.classList.add('carousel-item');

      if (isFirstItem) {
        carouselItem.classList.add('active');
        isFirstItem = false;
      }

      const gameLink = document.createElement('a');
      gameLink.href = `/game/${game.gameid}`;  

      const posterImage = document.createElement('img');
      posterImage.src = game.image;
      posterImage.alt = 'Poster do Jogo';
      posterImage.classList.add('d-block', 'img-poster');

      const gameTitle = document.createElement('h5');
      gameTitle.textContent = game.title;
      gameTitle.classList.add('game-title');

      gameLink.appendChild(posterImage);
      carouselItem.appendChild(gameLink);
      carouselItem.insertAdjacentHTML('beforeend', '&emsp;')
      carouselItem.appendChild(gameTitle);
      carouselInner.appendChild(carouselItem);
    }

    const carouselSection = document.querySelector('#games-tendency .carousel-inner');
    carouselSection.appendChild(carouselInner);

    $('#games-tendency').carousel({
    });
  });