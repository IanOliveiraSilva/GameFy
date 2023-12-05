const token = localStorage.getItem('token')


document.addEventListener('DOMContentLoaded', async () => {
    const input = document.querySelector('#search-input');
    const suggestionsContainer = document.querySelector('#suggestions-container');
    let query = '';
    

    input.addEventListener('input', async () => {
        query = input.value.trim();
        suggestionsContainer.innerHTML = '';
    
        if (query.length >= 3) {
            try {
                const response = await fetch(`/api/searchUsers/${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
    
                if (response.ok) {
                    const responseBody = await response.json();
                    const users = responseBody.users;
    
                    users.forEach(user => {
                        const suggestion = document.createElement('div');
                        suggestion.classList.add('suggestion')
                        suggestion.innerHTML = `
                        <div class="profile-container">
                            <img src="${user.icon}" class="profile-image"> &emsp; <h2 class="text-white">${user.userProfile}</h2>
                        </div><br>
                        `;
                        suggestion.addEventListener('click', async () => {
                            input.value = user.userProfile;
                            query = user.userProfile
                            suggestionsContainer.innerHTML = '';
                            window.location.href = `/user/${encodeURIComponent(user.userProfile)}`;
                        });
    
                        suggestionsContainer.appendChild(suggestion);
                    });
                } else {
                    console.error('Erro ao obter sugestões de usuários:', response.statusText);
                }
            } catch (error) {
                console.error('Erro ao buscar sugestões de usuários:', error);
            }
        }
    
    });
});
