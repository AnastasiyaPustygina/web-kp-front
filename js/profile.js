API_URL = 'http://localhost:5000/consumers';
function renderUserIngredients(prohibitedIds) {
    const container = document.getElementById('excludedIngredients');
    const noExcludedMessage = document.getElementById('noExcludedMessage');
    container.innerHTML = '';

    fetch('http://localhost:5000/ingredients')
        .then(res => res.json())
        .then(allIngredients => {
            if (prohibitedIds.length === 0) {
                noExcludedMessage.style.display = 'block';
                return;
            }
            noExcludedMessage.style.display = 'none';

            prohibitedIds.forEach(id => {
                const ing = allIngredients.find(i => i.id === id);
                if (ing) {
                    const chip = document.createElement('div');
                    chip.className = 'chip';
                    chip.textContent = ing.name;
                    container.appendChild(chip);
                }
            });
        });
}

function loadUserProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("Пользователь не найден, пожалуйста, войдите");
        window.location.href = 'login.html';
        return;
    }

    fetch(`${API_URL}/${userId}`)
        .then(res => res.json())
        .then(user => {
            localStorage.setItem('user', JSON.stringify(user));
            document.querySelector('header .user-info h1').textContent = user.username;
            document.querySelector('header .user-info p').textContent = user.email;

            document.getElementById('reviewCount').textContent = user.comments.length;
            document.getElementById('createdCount').textContent = user.marks.length || 0;

            renderUserIngredients(user.prohibited_ingredient_ids);
            createAvatar(user.username)
        })
        .catch(error => {
            console.error('Ошибка при загрузке профиля:', error);
        });
}
function goToEdit(){

    window.location.href = 'edit-profile.html';
}

function goToMarks(){

    window.location.href = 'my-marks.html';
}

function goToComments(){

    window.location.href = 'my-comments.html';
}

window.addEventListener('DOMContentLoaded', loadUserProfile);
function getAvatarColor(name) {
    // Преобразуем имя в число и используем его для выбора цвета
    const colors = ['#FFB300', '#E57373', '#64B5F6', '#81C784', '#BA68C8', '#FFD54F', '#4DB6AC', '#F06292'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
}

function createAvatar(name) {
    const avatarEl = document.getElementById('userAvatar');
    const initials = name.slice(0, 2).toUpperCase();
    const bgColor = getAvatarColor(name);

    avatarEl.textContent = initials;
    avatarEl.style.backgroundColor = bgColor;
    avatarEl.style.color = '#fff';
    avatarEl.style.display = 'flex';
    avatarEl.style.alignItems = 'center';
    avatarEl.style.justifyContent = 'center';
    avatarEl.style.fontWeight = 'bold';
    avatarEl.style.fontSize = '20px';
    avatarEl.style.borderRadius = '50%';
}


