const API_URL = 'http://localhost:5000/consumers';
const INGREDIENTS_URL = 'http://localhost:5000/ingredients/';

let allIngredients = [];
let selectedIngredients = new Set();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
            alert('Пользователь не найден. Выполните вход.');
            window.location.href = 'login.html';
            return;
        }

        const user = JSON.parse(userJson);
        createAvatar(user.username)
        initUserForm(user);
        await loadInitialData(user);
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('Не удалось загрузить данные');
    }
});

function initUserForm(user) {
    document.querySelector('input[name="name"]').value = user.username || '';
    document.querySelector('input[name="email"]').value = user.email || '';

    console.log(user);
    if (user.prohibited_ingredient_ids) {
        selectedIngredients = new Set(user.prohibited_ingredient_ids);
    }
}

async function loadInitialData(user) {
    try {

        const response = await fetch(INGREDIENTS_URL);
        if (!response.ok) throw new Error('Ошибка загрузки ингредиентов');

        allIngredients = await response.json();

        renderSelectedIngredients();

        setupSearch();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Не удалось загрузить список ингредиентов');
    }
}

function renderSelectedIngredients() {
    const container = document.getElementById('ingredient-list');
    container.innerHTML = '';
    selectedIngredients.forEach(id => {
        const ingredient = allIngredients.find(i => i.id === id);
        if (!ingredient) return;

        const card = document.createElement('div');
        card.className = 'ingredient-card';
        card.innerHTML = `
            <button class="remove-btn" data-id="${ingredient.id}">&times;</button>
            <img src="${ingredient.image_url}" alt="${ingredient.name}">
            <span>${ingredient.name}</span>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(e.target.dataset.id);
            selectedIngredients.delete(id);
            renderSelectedIngredients();
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('ingredient-input');
    const suggestionsContainer = document.getElementById('suggestions');

    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (!query) return;

        const matched = allIngredients
            .filter(i =>
                i.name.toLowerCase().includes(query) &&
                !selectedIngredients.has(i.id)
            )
            .slice(0, 6);

        matched.forEach(ingredient => {
            const suggestion = document.createElement('li');
            suggestion.textContent = ingredient.name;
            suggestion.addEventListener('click', () => {
                selectedIngredients.add(ingredient.id);
                renderSelectedIngredients();
                searchInput.value = '';
                suggestionsContainer.innerHTML = '';
            });
            suggestionsContainer.appendChild(suggestion);
        });
    }, 300));
}

async function submitPreferences() {
    const userJson = localStorage.getItem('user');
    const user = JSON.parse(userJson);
    const userId = user.id;

    const nameInput = document.querySelector('input[name="name"]').value.trim();
    const emailInput = document.querySelector('input[name="email"]').value.trim();

    if (!userId) {
        alert('Ошибка: пользователь не идентифицирован');
        return;
    }

    try {
        const updateUserRes = await fetch(`${API_URL}/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: nameInput,
                email: emailInput
            })
        });

        if (!updateUserRes.ok) {
            const err = await updateUserRes.json();
            throw new Error(err.message || 'Ошибка обновления данных пользователя');
        }

        const updateIngrRes = await fetch(`${API_URL}/ingr/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prohibited_ingredients: Array.from(selectedIngredients)
            })
        });

        if (!updateIngrRes.ok) {
            const err = await updateIngrRes.json();
            throw new Error(err.message || 'Ошибка обновления ингредиентов');
        }

        const updatedUser = await updateUserRes.json();
        updatedUser.prohibited_ingredient_ids = Array.from(selectedIngredients);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        window.location.href = 'profile.html';
    } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert(`Ошибка: ${error.message}`);
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitPreferences();
});

document.getElementById('save-bt').addEventListener('click', submitPreferences);
function getAvatarColor(name) {
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
