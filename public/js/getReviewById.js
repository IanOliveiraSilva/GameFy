let token = localStorage.getItem('token');
let parts = window.location.pathname.split('/');
let reviewId = parts.pop();

function generateStarRating(rating) {
    const maxRating = 5;
    const roundedRating = Math.round(rating * 2) / 2;
    const fullStars = Math.floor(roundedRating);
    const halfStar = roundedRating % 1 !== 0;
    const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('star');

    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        ratingContainer.appendChild(star);
    }

    if (halfStar) {
        const halfStar = document.createElement('span');
        halfStar.textContent = '★';
        ratingContainer.appendChild(halfStar);
    }

    for (let i = 0; i < emptyStars; i++) {
        const star = document.createElement('span');
        star.textContent = '☆';
        ratingContainer.appendChild(star);
    }

    return ratingContainer;
}

function confirmDelete() {
    const parts = window.location.pathname.split('/');
    const reviewId = parts.pop();

    const response = fetch(`/api/review/${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    response.then(() => {
        document.getElementById('deletePopup').style.display = 'none';
        window.location.href = `/game-reviews/${reviewId}`;
    });
}

async function confirmCommentDelete() {
    const commentResponse = await fetch(`/api/review/comment/${encodeURIComponent(reviewId)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const commentsData = await commentResponse.json();

    const response = await fetch(`/api/comment/${encodeURIComponent(commentsData[0].id)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        document.getElementById('deleteCommentPopup').style.display = 'none';
        window.location.href = `/review/${reviewId}`;
    }

}

document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('username');

    const reviewsContainer = document.getElementById('reviews');
    const titleContainer = document.getElementById('pageTitle')
    const gameContainer = document.createElement('div');

    try {

        // Requests
        const response = await fetch(`/api/review/${encodeURIComponent(reviewId)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const reviewsData = await response.json();
        const gameResponse = await fetch(`/api/game/${encodeURIComponent(reviewsData[0].gameid)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const gameData = await gameResponse.json();

        // Title
        const reviewTitle = document.createElement('p');
        reviewTitle.textContent = reviewsData[0].title;
        reviewTitle.classList.add('uppercase-text', 'title');

        const hr = document.createElement('hr');

        titleContainer.appendChild(reviewTitle);
        titleContainer.appendChild(hr);

        // Body
        const posterContainer = document.createElement('div');
        posterContainer.id = 'poster-centralize';

        const movieLink = document.createElement('a');
        movieLink.href = `/game/${gameData.body.gameData.gameId}`;

        const posterImg = document.createElement('img');
        posterImg.src = gameData.body.gameData.image;
        posterImg.alt = gameData.body.gameData.name;
        posterImg.classList.add('img-poster');

        posterContainer.appendChild(posterImg)
        movieLink.appendChild(posterContainer);
        gameContainer.appendChild(movieLink);
        reviewsContainer.appendChild(gameContainer);

        console.log(reviewsData[0])
        if (reviewsData[0]) {
            
            const commentCell = document.createElement('div');
            commentCell.classList.add('profile-image-header-review-container')
            if (reviewsData[0].icon != null) {
                commentCell.innerHTML = `
                  <a href='/profile' class="profile-link">
                    <img class="profile-image-header-review" src="${reviewsData[0].icon}">
                    <div class="user-info">
                      <p class="username">${reviewsData[0].username}</p>
                      
                      <div class="star-rating-container">
                        ${generateStarRating(reviewsData[0].rating).outerHTML}
                      </div>
                      <span class="span-text">${reviewsData[0].review}</span>
                    </div>
                  </a>
                `;
            } else {
                commentCell.innerHTML = `
                  <a href='/profile' class="profile-link">
                    <img class="profile-image-header-review" src="https://media.tenor.com/U282vYfv7xAAAAAd/gato-barril.gif">
                    <div class="user-info">
                      <p class="username">${reviewsData[0].username}</p>
                      
                      <div class="star-rating-container">
                        ${generateStarRating(reviewsData[0].rating).outerHTML}
                      </div>
                      <span class="span-text">${reviewsData[0].review}</span>
                    </div>
                  </a>
                `;
            }

            commentCell.classList.add('span-text-border');
            reviewsContainer.appendChild(commentCell);
        }

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('text-center');

        if (username == reviewsData[0].username) {

            const editButton = document.createElement('a');
            editButton.innerHTML = `<i class="fas fa-pencil-alt action-cell"></i>`;
            editButton.classList.add('edit-button');
            editButton.href = '/updateReview';
            editButton.addEventListener('click', () => {
                localStorage.setItem('reviewId', reviewsData[0].id);
                localStorage.setItem('rating', reviewsData[0].rating);
                localStorage.setItem('review', reviewsData[0].review);
            });


            let popup = document.getElementById('deletePopup');
            let closeButtonDelete = document.getElementById('closePopupDelete');

            const deleteButton = document.createElement('span');
            deleteButton.innerHTML = '<i class="fas fa-trash action-cell"></i> ';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                document.getElementById('deletePopup').classList.add('active');
            });

            closeButtonDelete.addEventListener('click', function () {
                document.getElementById('deletePopup').classList.remove('active');
            });

            window.addEventListener('click', function (event) {
                if (event.target == popup) {
                    popup.classList.remove('active');
                }
            });

            buttonsContainer.appendChild(editButton);
            buttonsContainer.insertAdjacentHTML('beforeend', '&emsp;');
            buttonsContainer.appendChild(deleteButton);
            reviewsContainer.appendChild(buttonsContainer);
        }

        const commentDiv = document.createElement('div');
        const form = document.createElement('form');

        const commentTitle = document.createElement('span');
        commentTitle.textContent = 'Comentarios';
        commentTitle.classList.add('span-text');

        commentDiv.insertAdjacentHTML('beforeend', '<hr>');
        commentDiv.appendChild(commentTitle);
        commentDiv.insertAdjacentHTML('beforeend', '<br>');

        if (username != reviewsData[0].username) {
            // POST COMMENT

            const comentarioLabel = document.createElement('label');
            comentarioLabel.classList.add('comment-label')
            const comentarioInput = document.createElement('input');
            comentarioInput.classList.add('comment-input');
            comentarioInput.placeholder = 'Escreva aqui seu comentario...';
            comentarioInput.type = 'text';
            comentarioInput.name = 'comment';
            comentarioLabel.appendChild(comentarioInput);

            form.appendChild(comentarioLabel);

            form.addEventListener('submit', async function (event) {
                event.preventDefault();
                const comment = comentarioInput.value;
                const token = localStorage.getItem('token');

                try {
                    const response = await fetch('/api/comment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            reviewId: reviewId,
                            comment: comment
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        window.location.href = `/review/${reviewId}`;
                    } else {
                        const data = await response.json();
                        alert(`Erro: ${data.message}`);
                    }
                } catch (error) {
                    console.error(error);
                    alert('Um erro aconteceu ao criar o comentário');
                }
            });

            const commentButton = document.createElement('button');
            commentButton.id = 'get-review-id';
            commentButton.textContent = 'Comentar';
            commentButton.classList.add('comment-button');
            commentButton.addEventListener('click', function (event) {
                form.dispatchEvent(new Event('submit'));
            });


            commentDiv.appendChild(form);
            commentDiv.appendChild(commentButton);
            commentDiv.insertAdjacentHTML('beforeend', '<br>');
            commentDiv.insertAdjacentHTML('beforeend', '<br>');
            commentDiv.insertAdjacentHTML('beforeend', '<br>');
            reviewsContainer.appendChild(commentDiv);
        }
        reviewsContainer.appendChild(commentDiv);

        // GET COMMENTS
        const commentResponse = await fetch(`/api/review/comment/${encodeURIComponent(reviewId)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao obter comentários');
        }

        const commentsData = await commentResponse.json();

        commentsData.forEach((comment) => {
            const table = document.createElement('table');

            const tbody = document.createElement('tbody');

            const userRow = document.createElement('tr');
            const userCell = document.createElement('td');

            const userText = document.createElement('p');
            userText.textContent = `${comment.username}`;

            const commentTextCell = document.createElement('span');
            commentTextCell.textContent = `${comment.comment}`;

            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('button-container', 'text-right');

            if (comment.username == username) {
                const editButton = document.createElement('a');
                editButton.innerHTML = `<i class="fas fa-pencil-alt" style="color: #ffffff; font-size: 25px;"></i>`;
                editButton.classList.add('edit-button');
                editButton.href = '/updateComment';
                editButton.addEventListener('click', () => {
                    localStorage.setItem('reviewId', comment.reviewid);
                    localStorage.setItem('comment', comment.comment);
                    localStorage.setItem('commentId', comment.id);
                });

                let popup = document.getElementById('deleteCommentPopup');
                let closeButtonDelete = document.getElementById('closePopupDeleteComment');

                const deleteButton = document.createElement('span');
                deleteButton.innerHTML = '<i class="fas fa-trash" style="color: #ffffff; font-size: 25px;"></i> ';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', async () => {
                    document.getElementById('deleteCommentPopup').classList.add('active');
                });

                closeButtonDelete.addEventListener('click', function () {
                    document.getElementById('deleteCommentPopup').classList.remove('active');
                });

                window.addEventListener('click', function (event) {
                    if (event.target == popup) {
                        popup.classList.remove('active');
                    }
                });

                buttonsContainer.appendChild(editButton);
                buttonsContainer.insertAdjacentHTML('beforeend', '&emsp;');
                buttonsContainer.appendChild(deleteButton);
            }

            userCell.appendChild(userText);
            userCell.appendChild(commentTextCell);
            userRow.appendChild(userCell);
            userRow.appendChild(buttonsContainer);
            tbody.appendChild(userRow);

            table.appendChild(tbody);
            table.insertAdjacentHTML('beforeend', '<br>');
            reviewsContainer.appendChild(table);
        });

    } catch (error) {
        console.error('Erro ao buscar revisões:', error);
    }
});
