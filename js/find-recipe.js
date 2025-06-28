const INGREDIENTS_URL = 'http://localhost:5000/ingredients/';
let allIngredients = [];
let userExcluded = [];
let filteredIngredients = [];
let selectedIds = new Set();

document.addEventListener('DOMContentLoaded', async () => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        alert('Пользователь не найден. Войдите в систему.');
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userJson);
    userExcluded = user.prohibited_ingredient_ids || [];

    await loadIngredients();
    setupSearch();
});

async function loadIngredients() {
    try {
        const res = await fetch(INGREDIENTS_URL);
        if (!res.ok) throw new Error('Ошибка загрузки ингредиентов');
        const all = await res.json();
        allIngredients = all.filter(i => !userExcluded.includes(i.id));
        filteredIngredients = allIngredients;
        renderIngredients(filteredIngredients);
    } catch (err) {
        alert('Ошибка при загрузке ингредиентов');
        console.error(err);
    }
}

function renderIngredients(list = null) {
    const container = document.getElementById('ingredient-list');
    container.innerHTML = '';

    const listToRender = list || allIngredients;

    const selected = listToRender.filter(i => selectedIds.has(i.id));
    const unselected = listToRender.filter(i => !selectedIds.has(i.id));

    [...selected, ...unselected].forEach(ingredient => {
        const item = document.createElement('div');
        item.className = 'ingredient-card';
        item.innerHTML = `
            <img src="${ingredient.image_url}" alt="${ingredient.name}">
            <span>${ingredient.name}</span>
        `;
        if (selectedIds.has(ingredient.id)){
            item.classList.add('selected');
            console.log(item.classList)
        }
        item.addEventListener('click', () => toggleIngredient(ingredient.id));
        container.appendChild(item);
    });
}

function toggleIngredient(id) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
    renderIngredients(); // обновим порядок и визуал
}

function setupSearch() {
    const input = document.getElementById('ingredient-search');
    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const filtered = allIngredients.filter(i =>
            i.name.toLowerCase().includes(query)
        );
        renderIngredients(filtered);
    });
}

async function submitRecipe() {
    if (selectedIds.size === 0) {
        alert('Выберите хотя бы один ингредиент');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/recipes/similar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ingredient_ids: Array.from(selectedIds),
                field: 'count_views'
            })
        });

        if (!response.ok) throw new Error('Ошибка при получении рецептов');

        const recipes = await response.json();
        localStorage.setItem('similar_recipes', JSON.stringify(recipes));
        console.log(selectedIds, recipes);

        window.location.href = 'ready-recipes.html';
    } catch (error) {
        console.error('Ошибка поиска рецептов:', error);
        alert('Не удалось загрузить похожие рецепты');
    }
}