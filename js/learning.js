let API_URL = 'http://127.0.0.1:5000/learning/';
let currentIndex = 0;
let steps = [];

async function loadLearningSteps() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const learning = data.find(item => item.id === 1);
        steps = learning?.steps || [];

        if (steps.length === 0) {
            document.getElementById('slide-content').innerHTML = '<p>Нет шагов для отображения</p>';
            return;
        }

        renderStep(currentIndex);
        renderDots();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('slide-content').innerHTML = '<p>Ошибка загрузки данных</p>';
    }
}

function renderStep(index) {
    const container = document.querySelector('.onboarding-container');
    const step = steps[index];
    const slide = document.getElementById('slide-content');
    const imageHtml = step.image_url
        ? `<img src="${step.image_url}" alt="Шаг ${step.number}" class="step-image" />`
        : `<div class="image-placeholder">Нет изображения</div>`;

    slide.innerHTML = `
        <div class="slide-image-container">
            ${imageHtml}
        </div>
        <h2 class="step-title">${step.title}</h2>
        <p class="step-description">${step.description}</p>
    `;

    let bottomControl = '';
    if (index === steps.length - 1) {
        bottomControl = `<button class="finish-btn" onclick="goToLogin()">Начать</button>`;
    } else {
        bottomControl = `<div class="skip-link" onclick="goToLogin()">Пропустить</div>`;
    }

    slide.innerHTML = `
    <div class="slide-image-container">
        ${imageHtml}
    </div>
    <h2 class="step-title">${step.title}</h2>
    <p class="step-description">${step.description}</p>
    <div class="bottom-bar">
        ${index === steps.length - 1
        ? `<div></div><button class="finish-btn" onclick="goToLogin()">Начать</button>`
        : `<div class="skip-link" onclick="goToLogin()">Пропустить</div><div></div>`}
    </div>
`;

    updateDots(index);
    updateNavButtons(index);
}

function goToLogin() {
    window.location.href = 'login.html';
}

function updateNavButtons(index) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === steps.length - 1;
}

function renderDots() {
    const dotsContainer = document.getElementById('dots-container');
    dotsContainer.innerHTML = '';
    steps.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (idx === currentIndex) dot.classList.add('active');
        dotsContainer.appendChild(dot);
    });
}

function updateDots(index) {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index]?.classList.add('active');
}

document.getElementById('nextBtn').addEventListener('click', () => {
    if (steps.length > 0) {
        currentIndex = (currentIndex + 1) % steps.length;
        renderStep(currentIndex);
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (steps.length > 0) {
        currentIndex = (currentIndex - 1 + steps.length) % steps.length;
        renderStep(currentIndex);
    }
});

loadLearningSteps();
