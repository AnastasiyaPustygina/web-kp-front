
API_URL = 'http://localhost:5000/consumers';


function validateEmail(email) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,}$/;
    return emailRegex.test(email) || phoneRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

function showError(elementId, messageId, show) {
    const element = document.getElementById(elementId);
    const message = document.getElementById(messageId);

    if (show) {
        element.classList.add('error');
        message.style.display = 'block';
    } else {
        element.classList.remove('error');
        message.style.display = 'none';
    }
}

function register() {
    const email = document.getElementById('reg-email').value.trim();
    const name = document.getElementById('reg-name').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    let isValid = true;

    if (!email) {
        showError('reg-email', 'email-error', true);
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('email-error').textContent = 'Пожалуйста, введите корректный email или номер телефона';
        showError('reg-email', 'email-error', true);
        isValid = false;
    } else {
        showError('reg-email', 'email-error', false);
    }

    if (!name) {
        showError('reg-name', 'name-error', true);
        isValid = false;
    } else {
        showError('reg-name', 'name-error', false);
    }

    if (!password) {
        showError('reg-password', 'password-error', true);
        isValid = false;
    } else if (!validatePassword(password)) {
        document.getElementById('password-error').textContent = 'Пароль должен содержать минимум 6 символов, включая буквы и цифры';
        showError('reg-password', 'password-error', true);
        isValid = false;
    } else {
        showError('reg-password', 'password-error', false);
    }

    if (!confirm) {
        showError('reg-confirm', 'confirm-error', true);
        isValid = false;
    } else if (password !== confirm) {
        document.getElementById('confirm-error').textContent = 'Пароли не совпадают';
        showError('reg-confirm', 'confirm-error', true);
        isValid = false;
    } else {
        showError('reg-confirm', 'confirm-error', false);
    }

    if (!isValid) {
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            username: name,
            phone: email,
            password,
            role_id: 2
        })
    })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Ошибка регистрации");
            }
            return data;
        })
        .then(data => {
            console.log(data.user.id);
            localStorage.setItem('userId', data.user.id);
            window.location.href = 'preferences.html';
        })
        .catch(err => {
            alert(`Ошибка: ${err.message}`);
        });
}

document.getElementById('reg-email').addEventListener('input', function() {
    showError('reg-email', 'email-error', false);
});

document.getElementById('reg-name').addEventListener('input', function() {
    showError('reg-name', 'name-error', false);
});

document.getElementById('reg-password').addEventListener('input', function() {
    showError('reg-password', 'password-error', false);
});

document.getElementById('reg-confirm').addEventListener('input', function() {
    showError('reg-confirm', 'confirm-error', false);
});
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
    })
        .then(res => {
            if (!res.ok) throw new Error("Ошибка входа");
            return res.json();
        })
        .then(data => {
            localStorage.setItem('userId', data.id);
            window.location.href = 'profile.html';

        })
        .catch(() => alert("Неверный логин или пароль"));
}

let INGREDIENTS_URL = 'http://localhost:5000/ingredients/';

let ingredients = [];
let filtered = [];
let selected = new Set();

document.getElementById('ingredient-input').addEventListener('input', filterIngredients);
document.getElementById('save-bt').addEventListener('click', submitPreferences);

function fetchIngredients() {
    fetch(INGREDIENTS_URL)
        .then(res => res.json())
        .then(data => {
            ingredients = data;
            filtered = [...ingredients];
            renderList();
        })
        .catch(() => alert("Не удалось загрузить ингредиенты"));
}

function renderList() {
    const list = document.getElementById('ingredient-list');
    list.innerHTML = '';
    filtered.forEach(ingredient => {
        const card = document.createElement('div');
        card.className = 'ingredient-card';
        if (selected.has(ingredient.id)) {
            card.classList.add('selected');
        }

        card.onclick = () => toggleIngredient(ingredient.id);

        card.innerHTML = `
      <img src="${ingredient.image_url}" alt="${ingredient.name}" />
      <span>${ingredient.name}</span>
    `;
        list.appendChild(card);
    });
}

function toggleIngredient(id) {
    if (selected.has(id)) {
        selected.delete(id);
    } else {
        selected.add(id);
    }
    renderList();
}

function filterIngredients() {
    const query = document.getElementById('ingredient-input').value.toLowerCase();
    filtered = ingredients.filter(i => i.name.toLowerCase().includes(query));
    renderList();
}

fetchIngredients();
let tempId = -1;

window.addEventListener('DOMContentLoaded', () => {
    fetch(INGREDIENTS_URL)
        .then(res => res.json())
        .then(data => {
            ingredients = data;
        })
        .catch(() => alert("Не удалось загрузить ингредиенты"));
});

function showSuggestions() {
    const input = document.getElementById('ingredient-input');
    const query = input.value.toLowerCase().trim();
    const suggestionBox = document.getElementById('suggestions');
    suggestionBox.innerHTML = '';

    if (!query) return;

    const matched = ingredients
        .filter(i => i.name.toLowerCase().startsWith(query))
        .filter(i => !selected.has(i.id)) // исключить уже выбранные
        .slice(0, 6); // не больше 6 подсказок

    matched.forEach(i => {
        const li = document.createElement('li');
        li.textContent = i.name;
        li.onclick = () => {
            selected.add(i.id);
            renderList();
            input.value = '';
            suggestionBox.innerHTML = '';
        };
        suggestionBox.appendChild(li);
    });
}

function renderList() {
    const list = document.getElementById('ingredient-list');
    list.innerHTML = '';
    selected.forEach(id => {
        const ingredient = ingredients.find(i => i.id === id);
        if (!ingredient) return;

        const card = document.createElement('div');
        card.className = 'ingredient-card';

        card.innerHTML = `
            <button class="remove-btn" onclick="removeIngredient(${ingredient.id})">&times;</button>
            <img src="${ingredient.image_url}" alt="${ingredient.name}" />
            <span>${ingredient.name}</span>
        `;

        list.appendChild(card);
    });
}
function removeIngredient(id) {
    selected.delete(id);
    renderList();
}

function toggleIngredient(id) {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    renderList();
}

function submitPreferences() {
    const selectedIds = Array.from(selected);

    console.log('Выбранные ингредиенты:', selectedIds);

    const userId = localStorage.getItem('userId');

    fetch(`${API_URL}/ingr/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prohibited_ingredients: selectedIds
        })
    })
        .then(async res => {
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Ошибка при обновлении профиля');
            }
            return res.json();
        })
        .then(data => {
            console.log('Профиль обновлен:', data);
            window.location.href = 'profile.html';
        })
        .catch(err => {
            console.error('Ошибка:', err);
            alert(`Ошибка: ${err.message}`);
        });
}