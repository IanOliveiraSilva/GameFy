const token = localStorage.getItem('token')

document.addEventListener('DOMContentLoaded', async () => {
  const resultProfile = document.querySelector('#results');
  const parts = window.location.pathname.split('/');
  const userProfile = parts.pop();

  const response = await fetch(`/api/user/${userProfile}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const profileData = await response.json();

  const details = document.createElement('div');

  if (profileData.body.profile.familyname != null) {
    details.innerHTML =
      `
    <div class="profile-container">
            <div class="profile-details">
            <div class="ul-profile">
                <img class="profile-image" src="${profileData.body.profile.icon ? profileData.body.profile.icon : 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp'}" alt="Ícone do perfil do usuário"/><br>
                <h1 class="profile-name">${profileData.body.profile.givenname} ${profileData.body.profile.familyname}</h1> 
                <p class="profile-user">@${profileData.body.profile.userprofile}</p>
                <p class="profile-bio">${profileData.body.profile.bio}</p>
                
                </div>
                <div class="profile-info">
                <br>
                       
                <li id="showMoreBtn" class="list-group-item uppercase-text">
                <i class="fas fa-eye"></i> <span>Ver Mais</span>
            </li>
                <ul class="list-group ul-profile text-white">

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
                    </li><br><br><br>
              </div>
              </ul><br>
                    <div class="text-center">
                    <a href="/reviews/${profileData.body.profile.userprofile}" class="btn btn-primary">
                    Reviews:
                    <span class="stat-count">
                    ${profileData.body.profile.contadorreviews !== null ? profileData.body.profile.contadorreviews : 0}
                    </span>
                    </a>&emsp;

                    <a href="/getAllLists" class="btn btn-primary">
                    <i class="fas fa-list-ul"></i> 
                    <span class="stat-count">
                    ${profileData.body.profile.contadorlists !== null ? profileData.body.profile.contadorlists : 0}
                    </span>
                    </a>&emsp;
                    
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