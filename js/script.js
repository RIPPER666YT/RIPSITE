// Настройки YouTube API
const API_KEY = 'AIzaSyCMz-LXRMw7EzNj38HngCCMTDZ0qmDB4bs'; // Ваш ключ API
const CHANNEL_ID = 'UC_4ToPjYHaspxVahi12ib2w'; // ID канала

// Основная функция загрузки статистики
async function loadYouTubeStats() {
    try {
        // 1. Загрузка данных канала
        const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CHANNEL_ID}&key=${API_KEY}`);
        if (!channelResponse.ok) throw new Error('Ошибка загрузки данных канала');
        const channelData = await channelResponse.json();

        // Проверка на пустые данные
        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('Канал не найден');
        }

        const stats = channelData.items[0].statistics;
        const snippet = channelData.items[0].snippet;

        // 2. Обновление статистики
        document.getElementById('total-views').textContent = parseInt(stats.viewCount).toLocaleString();
        document.getElementById('subscribers').textContent = parseInt(stats.subscriberCount).toLocaleString();

        // 3. Расчет времени с начала канала
        const startDate = new Date(snippet.publishedAt);
        const currentDate = new Date();
        const diffMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - startDate.getMonth());
        
        const years = Math.floor(diffMonths / 12);
        const months = diffMonths % 12;
        
        document.getElementById('years-months').textContent = 
            `${years} ${getRussianYearsText(years)}, ${months} ${getRussianMonthsText(months)}`;

        // 4. Загрузка видео
        await Promise.all([
            loadLatestVideo(),
            loadTopVideos()
        ]);

    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось загрузить данные YouTube. Попробуйте позже.');
    }
}

// Функция загрузки последнего видео
async function loadLatestVideo() {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=1&order=date&type=video&key=${API_KEY}`);
        if (!response.ok) throw new Error('Ошибка загрузки видео');
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) return;

        const videoId = data.items[0].id.videoId;
        document.getElementById('latest-video').innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
        `;
    } catch (error) {
        console.error('Ошибка загрузки последнего видео:', error);
        document.getElementById('latest-video').innerHTML = '<p>Не удалось загрузить последнее видео</p>';
    }
}

// Функция загрузки топ-5 видео
async function loadTopVideos() {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=5&order=viewCount&type=video&key=${API_KEY}`);
        if (!response.ok) throw new Error('Ошибка загрузки топ видео');
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) return;

        const videosHTML = data.items.map(item => `
            <div class="video-item">
                <h4>${item.snippet.title}</h4>
                <iframe src="https://www.youtube.com/embed/${item.id.videoId}" 
                        frameborder="0" 
                        allowfullscreen></iframe>
            </div>
        `).join('');

        document.getElementById('top-videos').innerHTML = videosHTML;
    } catch (error) {
        console.error('Ошибка загрузки топ видео:', error);
        document.getElementById('top-videos').innerHTML = '<p>Не удалось загрузить список видео</p>';
    }
}

// Вспомогательные функции для правильного склонения
function getRussianYearsText(years) {
    if (years % 100 >= 11 && years % 100 <= 14) return 'лет';
    switch(years % 10) {
        case 1: return 'год';
        case 2:
        case 3:
        case 4: return 'года';
        default: return 'лет';
    }
}

function getRussianMonthsText(months) {
    if (months % 100 >= 11 && months % 100 <= 14) return 'месяцев';
    switch(months % 10) {
        case 1: return 'месяц';
        case 2:
        case 3:
        case 4: return 'месяца';
        default: return 'месяцев';
    }
}

// Функция показа ошибки
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.querySelector('main').prepend(errorElement);
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadYouTubeStats);