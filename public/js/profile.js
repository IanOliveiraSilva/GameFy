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

  if (profileData.body.familyname != null) {
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
        
                <h1 class="profile-name">${profileData.body.givenname} ${profileData.body.familyname}</h1> 
                <p class="profile-user">@${profileData.body.userprofile}</p>
                <p class="profile-bio">${profileData.body.bio}</p>
                
                </div>
                <div class="profile-info">
                <br>
                       
                <li id="showMoreBtn" class="list-group-item uppercase-text">
                <i class="fas fa-eye"></i> <span>Ver Mais</span>
            </li>
                <ul class="list-group ul-profile text-white">

              <div id="additionalInfo" style="display: none;">

                    <li class="list-group-item li-profile">
                    <strong><i class="fas fa-calendar-alt"></i></strong>  ${profileData.body.birthday}
                    </li>

                    <li class="list-group-item li-profile uppercase-text">
                    <strong><i class="fas fa-map-marker-alt"></i> </strong> ${profileData.body.location}
                    </li>

                    <li class="list-group-item li-profile ">
                    <i class="fab fa-twitter"></i> <strong>
                    <a href="https://www.twitter.com/${profileData.body.socialmediax}" target="_blank">
                    ${profileData.body.socialmediax !== null && profileData.body.socialmediax !== "null" && profileData.body.socialmediax !== "" ? profileData.body.socialmediax : '___'} 
                    </a>
                    </strong>
                     </li>
     
                    <li class="list-group-item li-profile">
                    <i class="fab fa-instagram"></i> <strong>
                    <a href="https://www.instagram.com/${profileData.body.socialmediainstagram}" target="_blank">
                    ${profileData.body.socialmediainstagram !== null && profileData.body.socialmediax !== "null" && profileData.body.socialmediax !== "" ? profileData.body.socialmediainstagram : '___'}
                    </a>
                    </strong>
                    </li>
    
                    <li class="list-group-item li-profile">
                    <i class="fab fa-tiktok"></i> <strong>
                    <a href="https://www.tiktok.com/@${profileData.body.socialmediatiktok}" target="_blank">
                    ${profileData.body.socialmediatiktok !== null && profileData.body.socialmediax !== "null" && profileData.body.socialmediax !== "" ? profileData.body.socialmediatiktok : '___'}
                    </a>
                    </strong>
                    </li><br><br><br>
              </div>
              </ul><br>
                    <div class="text-center">
                    <a href="/profile/reviews" class="btn btn-primary">
                    Reviews:
                    <span class="stat-count">
                    ${profileData.body.contadorreviews !== null ? profileData.body.contadorreviews : 0}
                    </span>
                    </a>&emsp;

                    <a href="/profile/lists" class="btn btn-primary">
                    <i class="fas fa-list-ul"></i> 
                    <span class="stat-count">
                    ${profileData.body.contadorlists !== null ? profileData.body.contadorlists : 0}
                    </span>
                    </a>&emsp;

                    <a href="/create-list" class="btn btn-primary">
                    <span class="stat-count">
                    Criar Lista
                    </span>
                    </a>
                    
                    <a href="/" class="back-link d-block mt-4 text-center">
                    <i class="fa-solid fa-house" style="color: #ffffff; font-size: 30px;"></i> 
                    </div>
            </div>
                </div>
            </div>
    `
    resultProfile.innerHTML = '';
    resultProfile.appendChild(details);
  } else {
    details.innerHTML =
      `
    <div class="profile-container">
           <h2 class="profile-name"> Parece que você ainda não criou o seu perfil, aperte no icone de lapis para criar!</h2>
           <a href="/updateProfile" id="edit-profile-link"><br><br>
           <i class="fas fa-pencil-alt" style="font-size: 30px;"></i>
           </a>
    </div>
    `
    resultProfile.innerHTML = '';
    resultProfile.appendChild(details);
  }

  let isHidden = true;

  const showMoreBtn = document.getElementById("showMoreBtn");
  const additionalInfo = document.getElementById("additionalInfo");

  showMoreBtn.addEventListener("click", () => {
    isHidden = !isHidden;
    additionalInfo.style.display = isHidden ? "none" : "block";

    additionalInfo.classList.toggle("show");
    showMoreBtn.innerHTML = `${isHidden ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>'} <span>${isHidden ? 'Ver Mais' : 'Ver Menos'}</span>`;

  });


  const editProfileLink = document.querySelector('#edit-profile-link');
  editProfileLink.addEventListener('click', () => {
    localStorage.setItem('ProfileName', profileData.body.givenname);
    localStorage.setItem('familyname', profileData.body.familyname);
    localStorage.setItem('bio', profileData.body.bio);
    localStorage.setItem('location', profileData.body.location);
    localStorage.setItem('socialmediainstagram', profileData.body.socialmediainstagram);
    localStorage.setItem('socialmediatiktok', profileData.body.socialmediatiktok);
    localStorage.setItem('socialmediax', profileData.body.socialmediax);
    localStorage.setItem('birthday', profileData.body.birthday);
    localStorage.setItem('userprofile', profileData.body.userprofile);
    localStorage.setItem('icon', profileData.body.icon);
  });


})