document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('recipe-list');
    const recipes = JSON.parse(localStorage.getItem('similar_recipes')) || [];

    if (recipes.length === 0) {
        container.innerHTML = '<p>Ничего не найдено</p>';
        return;
    }

    for (const recipe of recipes) {
        const card = document.createElement('div');
        card.className = 'recipe-card';

        card.innerHTML = `
            <img src="${recipe.image_url || 'placeholder.jpg'}" alt="${recipe.title}">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <p>${recipe.description ? recipe.description.substring(0, 80) + '...' : ''}</p>
                <p>Просмотры: ${recipe.count_views}</p>
                <p>Время: ${recipe.cooking_time || '—'} мин</p>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `recipe.html?id=${recipe.id}`;
        });

        container.appendChild(card);
    }
});
