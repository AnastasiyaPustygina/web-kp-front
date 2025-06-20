document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('category-container');

    fetch('http://127.0.0.1:5000/categories/')
        .then(response => {
            if (!response.ok) throw new Error('Ошибка загрузки категорий');
            return response.json();
        })
        .then(categories => {
            container.innerHTML = '';
            categories.forEach(cat => {
                const card = document.createElement('div');
                card.className = 'category-card';

                card.innerHTML = `
          <img src="${cat.image_url}" alt="Категория ${cat.name}" loading="lazy" />
          <div class="category-name">${cat.name}</div>
        `;
                card.addEventListener('click', () => {
                    window.location.href =  `category.html?id=${cat.id}`;
                })
                container.appendChild(card);
            });
        })
        .catch(err => {
            container.innerHTML = `<p>Не удалось загрузить категории.</p>`;
            console.error(err);
        });
});