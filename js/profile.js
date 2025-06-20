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


