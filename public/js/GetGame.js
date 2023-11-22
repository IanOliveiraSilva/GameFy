document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('#search-form');
    const input = document.querySelector('#search-input');
    const resultsList = document.querySelector('#results');

    const searchGames = async (query) => {
        const rawgApiKey = 'f6b6af75757e4d299ec24dd49163f5af';
        const url = `https://api.rawg.io/api/games?key=${rawgApiKey}&search=${query}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                resultsList.innerHTML = '';
                data.results.forEach(game => {

                    const img = document.createElement('div');
                    img.innerHTML=`<img class="img-poster" src="${game.background_image}"> <p class="game-text">${game.name}</p>`;
                    img.classList.add('game-container')
                    img.addEventListener('click', async () => {
                        window.location.href = `/game/${game.id}`;
                    });
                    
                    resultsList.appendChild(img);
                });
            } else {
                resultsList.innerHTML = 'No results found.';
            }
        } catch (error) {
            console.log(error);
        }
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const query = input.value.trim();
        await searchGames(query);
    });

    await searchGames('');
});
