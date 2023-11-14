document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('gameTitle');
    const gameTitle = localStorage.getItem('gameTitle');
    const titleElement = document.getElementById('gameTitle');
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
  
      const gameId = localStorage.getItem('gameId');
  
      createReviewButton.disabled = true;
  
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId: gameId,
          rating,
          comment,
          isPublic
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        window.location.href = '/getAllReviews';
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
  
      while (currentStar) {
        currentStar.textContent = '★';
        currentStar.classList.add('selected');
        currentStar = currentStar.previousElementSibling;
      }
  
      currentStar = this.nextElementSibling;
  
      while (currentStar) {
        currentStar.textContent = '☆';
        currentStar.classList.remove('selected');
        currentStar = currentStar.nextElementSibling;
      }
    });
  });

