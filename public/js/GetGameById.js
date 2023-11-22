// function generateStarRating(rating) {
//     const maxRating = 5;
//     const roundedRating = Math.round(rating * 2) / 2;
//     const fullStars = Math.floor(roundedRating);
//     const halfStar = roundedRating % 1 !== 0;
//     const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

//     const ratingContainer = document.createElement('div');
//     ratingContainer.classList.add('star');

//     for (let i = 0; i < fullStars; i++) {
//         const star = document.createElement('span');
//         star.textContent = '★';
//         ratingContainer.appendChild(star);
//     }

//     if (halfStar) {
//         const halfStar = document.createElement('span');
//         halfStar.textContent = '★';
//         ratingContainer.appendChild(halfStar);
//     }

//     for (let i = 0; i < emptyStars; i++) {
//         const star = document.createElement('span');
//         star.textContent = '☆';
//         ratingContainer.appendChild(star);
//     }

//     return ratingContainer;
// }

function generateStarRating(rating) {
    const maxRating = 5;
    const roundedRating = Math.round(rating * 2) / 2;
    const fullStars = Math.floor(roundedRating);
    const halfStar = roundedRating % 1 !== 0;
    const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);
  
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '<span class="star">★</span>';
    }
    if (halfStar) {
      stars += '<span class="star">½</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '<span class="star">☆</span>';
    }
  
    return stars;
}


document.addEventListener('DOMContentLoaded', async () => {
    // FUNCTIONS

    const resultsList = document.querySelector('#results');
    const parts = window.location.pathname.split('/');
    const gameId = parts.pop();

    const detailsResponse = await fetch(`/api/game/${encodeURIComponent(gameId)}`, {
        method: 'GET'
    });

    const detailsData = await detailsResponse.json();
    const details = document.createElement('div');
    details.innerHTML =
        `
    <div class="profile-container">
    <div class="row">
        <div class="col-md-4 text-center">
            <img class="img-poster img-fluid img-poster-hover" src="${detailsData.body.gameData.image}" alt="${detailsData.body.gameData.name} poster">
            <strong><button id="add-favorite-button" draggable="true" class="btn-unstyled-eye"><i id="played-icon" class="fa fa-gamepad"></i></button></strong>&emsp;
            <strong><button id="add-favorite-button" draggable="true" class="btn-unstyled"><i id="favorite-icon" class="far fa-heart"></i></button></strong>&emsp;
            <strong><button id="add-watchlist-button" draggable="true" class="btn-unstyled-clock"><i id="watchlist-icon" class="far fa-clock"></i></button></strong>
        </div>
        <div class="col-md-8">
            <div class="plot-container">
                <h3 class="movie-title">${detailsData.body.gameData.name}</h3>
                ${detailsData.body.mediagames.medianotas !== 0 ? generateStarRating(detailsData.body.mediagames.medianotas) : ''}
                ${detailsData.body.gameData.description}
            </div><br>
            <div class="info-container">
            <ul class="list-unstyled profile-list">
            <li><strong>Lançamento:</strong> ${detailsData.body.gameData.released}</li>
            <li><strong>Gêneros:</strong> ${detailsData.body.gameData.genres}</li>
            <li><strong>Duração:</strong> ${detailsData.body.gameData.playtime} Horas</li>
            <li><strong>Plataformas:</strong> ${detailsData.body.gameData.platforms}</li>
            <li><strong>Site:</strong> <a href="${detailsData.body.gameData.website}" target="_blank">${detailsData.body.gameData.website}</a></li>
          </ul>
        </div><br>
            <li style="list-style-type: none;" id="create-review-button" class="create-review-button">
                    <i class="fas fa-pencil-alt "></i> <strong>Criar uma review</strong>
            </li>
            <button id="get-review-button" class="btn btn-primary mt-3">Ver Reviews</button>&emsp;
            <button id="get-list-button" class="btn btn-primary mt-3">Ver Listas</button><br> <br> 
            &emsp;<a class="text-white" href="/">Voltar para a página inicial</a>
        </div>
    </div>
    </div>        
    `
    resultsList.innerHTML = '';
    resultsList.appendChild(details);

    const reviewButton = document.getElementById('create-review-button');
    reviewButton.addEventListener('click', () => {
        localStorage.setItem('gameTitle', detailsData.body.gameData.name);
        localStorage.setItem('gamePoster', detailsData.body.gameData.image);
        window.location.href = `/create-review/${detailsData.body.gameData.gameId}`;
    });

    const getReviewButton = document.getElementById('get-review-button');
    getReviewButton.addEventListener('click', () => {
        window.location.href = `/game-reviews/${detailsData.body.gameData.gameId}`;
    });
})
