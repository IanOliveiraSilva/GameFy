document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('gameTitle');
    const gameTitle = localStorage.getItem('gameTitle');
    const titleElement = document.getElementById('gameTitle');

    const posterInput = document.getElementById('gamePoster');
    const gamePoster = localStorage.getItem('gamePoster');

    if(gamePoster){
      posterInput.src=`${gamePoster}`
    }

    const createReviewButton = document.getElementById('create-review-button');
    
    if (gameTitle) {
      titleInput.value = gameTitle;
      titleElement.textContent = gameTitle;
    }
  
    const reviewForm = document.getElementById('review-form');
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const rating = document.getElementById('rating').value;
      const comment = document.getElementById('comment').value;
      const isPublic = document.getElementById('isPublic').checked;
  
      const token = localStorage.getItem('token');
  
      const parts = window.location.pathname.split('/');
      const gameId = parts.pop();
  
      createReviewButton.disabled = true;
  
      const response = await fetch(`/api/create-review/${gameId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId: gameId,
          title: gameTitle,
          image: gamePoster,
          rating,
          comment,
          isPublic
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        window.location.href = '/';
      } else {
        alert(data.message);
      }
    });
  });
  
  document.querySelectorAll('#stars1 .star').forEach(star => {
    star.addEventListener('click', function () {
      var value = this.dataset.value;
  
      document.getElementById('rating').value = value;
  
      let currentStar = this;
      let starValue = 1;
  
      while (currentStar) {
        currentStar.textContent = '★';
        currentStar.classList.add('selected');
        currentStar.style.textShadow = `0 0 ${10 * starValue}px #e70fdc`;
        currentStar = currentStar.previousElementSibling;
        starValue++;
      }
  
      currentStar = this.nextElementSibling;
      starValue = 1;
  
      while (currentStar) {
        currentStar.textContent = '☆';
        currentStar.classList.remove('selected');
        currentStar.style.textShadow = 'none';
        currentStar = currentStar.nextElementSibling;
        starValue++;
      }
    });
  });
  
