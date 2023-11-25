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
                <div class="game-header">
                    <h3 class="game-title text-white bold">${detailsData.body.gameData.name}</h3>
                    ${detailsData.body.mediagames.medianotas !== 0 ? generateStarRating(detailsData.body.mediagames.medianotas) : ''}
                </div>
                <img class="img-poster img-fluid img-poster-hover" src="${detailsData.body.gameData.image}" alt="${detailsData.body.gameData.name} poster">
                <div class="game-actions">
                    <button id="add-favorite-button" draggable="true" class="btn-unstyled-eye"><i id="played-icon" class="fa fa-gamepad"></i></button> 
                    <button id="add-favorite-button" draggable="true" class="btn-unstyled"><i id="favorite-icon" class="far fa-heart"></i></button> 
                    <button id="add-watchlist-button" draggable="true" class="btn-unstyled-clock"><i id="watchlist-icon" class="far fa-clock"></i></button>
                </div>
                <div class="game-info text-white">
                    <h4 class="bold">Game Info</h4>
                    <p><strong>Developers:</strong> ${detailsData.body.gameData.developers.join(', ')}</p>
                    <p><strong>Publishers:</strong> ${detailsData.body.gameData.publishers.join(', ')}</p>
                    <p><strong>Tags:</strong> ${detailsData.body.gameData.tags.join(', ')}</p>
                </div>
            </div>
            <div class="col-md-8">
                <div class="plot-container list-unstyled">
                    <h4 class="bold">Description</h4>
                    <p>${detailsData.body.gameData.description}</p>
                    <h4 class="bold">Additional info</h4>
                    <ul style="list-style-type: none;">
                        <li><strong>Release Date:</strong> ${detailsData.body.gameData.released}</li>
                        <li><strong>Genres:</strong> ${detailsData.body.gameData.genres.join(', ')}</li>
                        <li><strong>Platforms:</strong> ${detailsData.body.gameData.platforms.join(', ')}</li>
                        <li><strong>Website:</strong> <a href="${detailsData.body.gameData.website}" target="_blank">${detailsData.body.gameData.website}</a></li>
                    </ul><br>
                </div>
                <div class="user-actions">
                    <button id="create-review-button" class="btn btn-primary mt-3">
                        <i class="fas fa-pencil-alt "></i> <strong>Create a review</strong>
                    </button>
                    <button id="get-review-button" class="btn btn-primary mt-3">View Reviews</button>
                    <button id="get-list-button" class="btn btn-primary mt-3">View Lists</button>
                </div>
                <a class="text-white" href="/">Back to home page</a>
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
