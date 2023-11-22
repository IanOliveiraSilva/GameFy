const token = localStorage.getItem('token')

document.addEventListener('DOMContentLoaded', async () => {
    const resultProfile = document.querySelector('#results');

    const response = await fetch('api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

    const profileData = await response.json();

    const details = document.createElement('div');
    details.innerHTML =
    `
    <div class="profile-container">
            <div class="profile-details">
            <div class="ul-profile">
            <div class="dropdown">
            <i class="fas fa-gear" id="gear-icon"></i>
            <div class="dropdown-content" id="dropdown-options">
            <a href="/changePassword">Trocar senha</a>
            </div>
            </div>
           
            <a href="/updateProfile" id="edit-profile-link"><br><br>
            <i class="fas fa-pencil-alt" style="font-size: 30px;"></i>
            </a>
        
                <h1 class="profile-name">${profileData.body.profile.givenname} ${profileData.body.profile.familyname}</h1> 
                <p class="profile-user">@${profileData.body.profile.userprofile}</p>
                <p class="profile-bio">${profileData.body.profile.bio}</p>
                
                </div>
                <div class="profile-info">
                <br>
                       
                <li id="showMoreBtn" class="list-group-item li-profile uppercase-text">
                <i class="fas fa-eye"></i> <span>Ver Mais</span>
            </li>
                <ul class="list-group ul-profile">

              <div id="additionalInfo" style="display: none;">

                    <li class="list-group-item li-profile">
                    <strong><i class="fas fa-calendar-alt"></i></strong>  ${profileData.body.profile.birthday}
                    </li>

                    <li class="list-group-item li-profile uppercase-text">
                    <strong><i class="fas fa-map-marker-alt"></i> </strong> ${profileData.body.profile.location}
                    </li>

                    <li class="list-group-item li-profile ">
                    <i class="fab fa-twitter"></i> <strong>
                    <a href="https://www.twitter.com/${profileData.body.profile.socialmediax}" target="_blank">
                    ${profileData.body.profile.socialmediax !== null && profileData.body.profile.socialmediax !== "null" && profileData.body.profile.socialmediax !== "" ? profileData.body.profile.socialmediax : '___'} 
                    </a>
                    </strong>
                     </li>
     
                    <li class="list-group-item li-profile">
                    <i class="fab fa-instagram"></i> <strong>
                    <a href="https://www.instagram.com/${profileData.body.profile.socialmediainstagram}" target="_blank">
                    ${profileData.body.profile.socialmediainstagram !== null && profileData.body.profile.socialmediax !== "null" && profileData.body.profile.socialmediax !== "" ? profileData.body.profile.socialmediainstagram : '___'}
                    </a>
                    </strong>
                    </li>
    
                    <li class="list-group-item li-profile">
                    <i class="fab fa-tiktok"></i> <strong>
                    <a href="https://www.tiktok.com/@${profileData.body.profile.socialmediatiktok}" target="_blank">
                    ${profileData.body.profile.socialmediatiktok !== null && profileData.body.profile.socialmediax !== "null" && profileData.body.profile.socialmediax !== "" ? profileData.body.profile.socialmediatiktok : '___'}
                    </a>
                    </strong>
                    </li><br>
              </div>
              
              </ul> <hr>
                    <ul id="filmes-favoritos">
                    </ul><hr><br>

                    <a href="/getAllReviews" class="btn btn-primary text-warning btn-link profile-stat">
                    Reviews:
                    <span class="stat-count">${profileData.body.profile.contadorreviews !== null ? profileData.body.profile.contadorreviews : 0}
                    </span>
                    </a>
                    <canvas id="myChart"></canvas><br>
                    </ul>
            <hr class="hr-bottom">
                    <div class="text-center">
                    
                    <a href="/getAllLists" class="btn btn-primary text-warning btn-link profile-stat"><i class="fas fa-list-ul"></i> <span class="stat-count">${profileData.body.profile.contadorlists !== null ? profileData.body.profile.contadorlists : 0}</span></a>
                    <a href="/createList" class="btn btn-primary text-warning btn-link profile-stat"><span class="stat-count">Criar Lista</span></a>
                    <a href="/" class="back-link d-block mt-4 text-center">
                    <i class="fa-solid fa-house" style="color: #000000; font-size: 30px;"></i> 
                    
                    </div>
            </div>
                </div>
            </div>
    `
    resultProfile.innerHTML = '';
    resultProfile.appendChild(details);

    const editProfileLink = document.querySelector('#edit-profile-link');
    editProfileLink.addEventListener('click', () => {
      localStorage.setItem('ProfileName', profileData.body.profile.givenname);
      localStorage.setItem('familyname', profileData.body.profile.familyname);
      localStorage.setItem('bio', profileData.body.profile.bio);
      localStorage.setItem('location', profileData.body.profile.location);
      localStorage.setItem('socialmediainstagram', profileData.body.profile.socialmediainstagram);
      localStorage.setItem('socialmediatiktok', profileData.body.profile.socialmediatiktok);
      localStorage.setItem('socialmediax', profileData.body.profile.socialmediax);
      localStorage.setItem('birthday', profileData.body.profile.birthday);
      localStorage.setItem('userprofile', profileData.body.profile.userprofile);
      localStorage.setItem('icon', profileData.body.profile.icon);
    });

    
})