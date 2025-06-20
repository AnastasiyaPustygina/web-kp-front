const consumer = JSON.parse(localStorage.getItem("user")) || {};

async function getRecipeRating(recipeId, consumerId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/marks/recipe/${recipeId}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.value || null;
    } catch (error) {
        console.error('Ошибка получения оценки:', error);
        return null;
    }
}

async function renderRecipeList(containerId, recipeIds, searchTerm = '') {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (!recipeIds || recipeIds.length === 0) {
        container.innerHTML = '<p>Нет данных для отображения</p>';
        return;
    }

    for (const id of recipeIds) {
        try {
            const recipeResponse = await fetch(`http://127.0.0.1:5000/recipes/${id}`);
            if (!recipeResponse.ok) continue;
            const recipe = await recipeResponse.json();

            if (searchTerm && !recipe.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                continue;
            }

            const rating = recipe.rating;

            const card = document.createElement('div');
            card.className = 'recipe-card';
            const favoriteIds = consumer.favourite_recipe_ids || [];
            let isFavorite = favoriteIds.includes(recipe.id);

            card.innerHTML = `
                    <img src="${recipe.image_url || 'placeholder.jpg'}" alt="${recipe.title}">
                    <div class="recipe-info">
                        <div class="top-row">
                            <h3>${recipe.title || 'Без названия'}</h3>
                            <button class="like-btn" data-recipe-id="${recipe.id}">${isFavorite ? '❤️' : '🤍'}</button>
                        </div>
                        <div class="recipe-meta">
                            <span>Порции: ${recipe.count_portion || '—'}</span>
                            <span>Просмотры: ${recipe.count_views || '—'}</span>
                            ${recipe.cooking_time ? `<span>Время: ${recipe.cooking_time} мин</span>` : ''}
                            ${rating ? `<span class="recipe-rating">${renderStars(rating)} <small>${rating.toFixed(1)}</small></span>` : ''}
                        </div>
                        ${recipe.description ? `<p>${recipe.description.substring(0, 60)}...</p>` : ''}
                    </div>
                `;
            card.addEventListener('click', (e) => {window.location.href=`recipe.html?id=${recipe.id}`})
            const heartBtn = card.querySelector('.like-btn');
            heartBtn.addEventListener('click', async () => {
                isFavorite = !isFavorite;
                heartBtn.textContent = isFavorite ? '❤️' : '🤍';
                event.stopPropagation();
                event.preventDefault();
                const method = isFavorite ? 'POST' : 'DELETE';

                try {
                    const response = await fetch(`http://127.0.0.1:5000/consumers/${consumer.id}/favorites/${recipe.id}`, {
                        method,
                        headers: { 'Content-Type': 'application/json' }
                    });

                    const data = await response.json();

                    if (data.success) {
                        consumer.favourite_recipe_ids = data.favourite_recipe_ids;
                        localStorage.setItem('user', JSON.stringify(consumer));
                        renderRecipeList('history-container', consumer.history || [], document.getElementById('search-history').value);
                    }  else {
                        console.error('Ошибка при обновлении избранного:', data);
                        alert(data.message || 'Ошибка при обновлении избранного');
                    }
                } catch (error) {
                    console.error('Ошибка при обновлении избранного:', error);
                    alert('Не удалось обновить избранное');
                }
            });
            container.appendChild(card);
        } catch (error) {
            console.error(`Ошибка загрузки рецепта ${id}:`, error);
        }
    }
}

function searchHistory() {
    const term = document.getElementById('search-history').value;
    renderRecipeList('history-container', consumer.history || [], term);
}
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) +
        (hasHalfStar ? '½' : '') +
        '☆'.repeat(emptyStars);
}

document.addEventListener('DOMContentLoaded', () => {
    renderRecipeList('history-container', consumer.history || []);
});
