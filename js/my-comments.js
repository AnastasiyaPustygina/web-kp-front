let userId = localStorage.getItem("userId");
const consumer = JSON.parse(localStorage.getItem("consumer")) || {};
const favoriteIds = consumer.favourite_recipe_ids || [];

const reviewsContainer = document.getElementById('reviews-list');

fetch(`http://127.0.0.1:5000/comments/consumer/${userId}`)
    .then(res => res.json())
    .then(data => {
        if (!data || data.length === 0) {
            reviewsContainer.innerHTML = '<p>У вас пока нет отзывов</p>';
            return;
        }
        data.forEach(review => {
            console.log(review);
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `<p>Загрузка рецепта...</p>`;
            reviewsContainer.appendChild(card);

            fetch(`http://127.0.0.1:5000/recipes/${review.recipe_id}`)
                .then(res => res.json())
                .then(recipe => {
                    const isFavorite = favoriteIds.includes(recipe.id);
                    card.innerHTML = `
            <div class="review-image">
              <img src="${recipe.image_url || 'placeholder.jpg'}" alt="${recipe.title}">
            </div>
            <div class="review-body">
              <div class="review-header">
                <h3>${recipe.title || 'Без названия'}</h3>
                <button class="like-btn" data-recipe-id="${recipe.id}">${isFavorite ? '❤️' : '🤍'}</button>
              </div>
              <div class="brief-info">
                <span>Порции: ${recipe.count_portion || '—'}</span>
                <span>Просмотры: ${recipe.count_views || '—'}</span>
              </div>
              <p class="review-text" id="review-text-${review.id}">${review.text}</p>
              <div class="review-footer">
                <div class="review-actions">
                  <button class="edit-review" data-comment-id="${review.id}" data-mark-id="${review.mark_id}" data-text="${review.text}">✏️</button>
                  <button class="delete-review" data-comment-id="${review.id}" data-mark-id="${review.mark_id}">🗑️</button>
                </div>
              </div>
            </div>
          `;
                    card.addEventListener('click', (e) => {window.location.href=`recipe.html?id=${recipe.id}`})
                    const heartBtn = card.querySelector('.like-btn');
                    heartBtn.addEventListener('click', async () => {
                        const recipeId = parseInt(heartBtn.dataset.recipeId);
                        const isCurrentlyFavorite = favoriteIds.includes(recipeId);
                        const method = isCurrentlyFavorite ? 'DELETE' : 'POST';

                        try {
                            const response = await fetch(`http://127.0.0.1:5000/consumers/${consumer.id}/favorites/${recipeId}`, {
                                method,
                                headers: {'Content-Type': 'application/json'}
                            });

                            const data = await response.json();

                            if (data.success) {
                                consumer.favourite_recipe_ids = data.favourite_recipe_ids;
                                localStorage.setItem('consumer', JSON.stringify(consumer));
                                heartBtn.innerHTML = data.action === 'added' ? '❤️' : '🤍';
                            } else {
                                alert(data.message || 'Ошибка при обновлении избранного');
                            }
                        } catch (error) {
                            console.error('Ошибка при обновлении избранного:', error);
                            alert('Не удалось обновить избранное');
                        }
                    });
                })
                .catch(err => {
                    card.innerHTML = `<p>Ошибка загрузки рецепта: ${err.message}</p>`;
                });
        });
    })
    .catch(err => {
        console.error('Ошибка при загрузке отзывов:', err);
        reviewsContainer.innerHTML = '<p>Ошибка при загрузке отзывов</p>';
    });

document.addEventListener('click', function (event) {
    const editBtn = event.target.closest('.edit-review');
    const deleteBtn = event.target.closest('.delete-review');

    if (editBtn) {
        const commentId = editBtn.dataset.commentId;
        const markId = editBtn.dataset.markId;
        const textElem = document.getElementById(`review-text-${commentId}`);
        const oldText = textElem?.textContent || '';
        const newText = prompt('Изменить отзыв:', oldText);

        if (newText && newText !== oldText) {
            fetch(`http://127.0.0.1:5000/comments/${commentId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: newText})
            })
                .then(res => {
                    if (res.ok) {
                        textElem.textContent = newText;
                    } else {
                        alert('Ошибка при обновлении отзыва');
                    }
                })
                .catch(() => alert('Ошибка сети при обновлении.'));
        }
    }

    if (deleteBtn) {
        const commentId = deleteBtn.dataset.commentId;
        const markId = deleteBtn.dataset.markId;

        if (confirm('Удалить отзыв и оценку?')) {
            fetch(`http://127.0.0.1:5000/comments/${commentId}`, {method: 'DELETE'})
                .then(() => {
                    deleteBtn.closest('.review-card')?.remove();
                })
                .catch(err => {
                    console.error(err);
                    alert('Ошибка при удалении.');
                });
        }
    }
});

