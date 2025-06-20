function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    let stars = '';

    for(let i=0; i<fullStars; i++) stars += '⭐';
    if (halfStar) stars += '✰';
    while (stars.length < 5) stars += '☆';

    return stars;
}

const params = new URLSearchParams(window.location.search);
const categoryId = params.get('id');
function renderRecipes() {
    const container = document.getElementById('recipes-container');

    fetch(`http://127.0.0.1:5000/recipes/category/${categoryId}?field=count_views`)
        .then(res => {
            if (!res.ok) throw new Error('Ошибка загрузки рецептов');
            return res.json();
        })
        .then(recipes => {
            if (!recipes.length) {
                container.innerHTML = '<p>Рецепты не найдены.</p>';
                return;
            }
            container.innerHTML = '';
            recipes.forEach(recipe => {
                const consumer = JSON.parse(localStorage.getItem("user")) || {};
                const favoriteIds = consumer.favourite_recipe_ids || [];
                let isFavorite = favoriteIds.includes(recipe.id);
                const rating = recipe.rating || 0;

                const card = document.createElement('div');
                card.className = 'recipe-card';

                card.innerHTML = `
    <img src="${recipe.image_url || 'placeholder.jpg'}" alt="${recipe.title || 'Без названия'}" />
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

                const favBtn = card.querySelector('.like-btn');
                favBtn.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    isFavorite = !isFavorite;
                    favBtn.textContent = isFavorite ? '❤️' : '🤍';

                    const method = isFavorite ? 'POST' : 'DELETE';

                    try {
                        const response = await fetch(`http://127.0.0.1:5000/consumers/${consumer.id}/favorites/${recipe.id}`, {
                            method,
                            headers: {'Content-Type': 'application/json'}
                        });

                        const data = await response.json();

                        if (data.success) {
                            consumer.favourite_recipe_ids = data.favourite_recipe_ids;
                            localStorage.setItem('user', JSON.stringify(consumer));
                        } else {
                            alert(data.message || 'Ошибка при обновлении избранного');
                        }
                    } catch (error) {
                        console.error('Ошибка при обновлении избранного:', error);
                        alert('Не удалось обновить избранное');
                    }
                });

                card.addEventListener('click', () => {
                    window.location.href = `recipe.html?id=${recipe.id}`;
                });

                container.appendChild(card);
            });
        })
        .catch(err => {
            console.log(err)
            container.innerHTML = '<p>Ошибка при загрузке рецептов.</p>';
        });
}
renderRecipes()