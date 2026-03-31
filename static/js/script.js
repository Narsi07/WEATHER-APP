// Global state
let isFahrenheit = true;
let currentWeatherData = null;
let searchTimeout = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadWeatherForCity('New York');
    updateTime();
    setInterval(updateTime, 1000);
});

// Event Listeners
function initializeEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const unitToggle = document.getElementById('unitToggle');

    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const firstCity = document.querySelector('.autocomplete-item');
            if (firstCity) {
                firstCity.click();
            }
        }
    });

    unitToggle.addEventListener('change', handleUnitToggle);
    document.addEventListener('click', closeAutocomplete);
}

// Search Handler
function handleSearch(event) {
    const query = event.target.value;
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        closeAutocomplete();
        return;
    }

    searchTimeout = setTimeout(() => {
        fetchCities(query);
    }, 300);
}

// Fetch cities from API
async function fetchCities(query) {
    try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
        const cities = await response.json();
        
        const autocompleteList = document.getElementById('autocompleteList');
        autocompleteList.innerHTML = '';

        if (cities.length === 0) {
            autocompleteList.innerHTML = '<div class="autocomplete-item" style="color: #999;">No cities found</div>';
        } else {
            cities.forEach(city => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = city.display;
                item.addEventListener('click', () => {
                    selectCity(city.name);
                });
                autocompleteList.appendChild(item);
            });
        }

        autocompleteList.classList.add('show');
    } catch (error) {
        console.error('Error fetching cities:', error);
    }
}

// Select city from autocomplete
function selectCity(cityName) {
    document.getElementById('searchInput').value = cityName;
    closeAutocomplete();
    loadWeatherForCity(cityName);
}

// Close autocomplete dropdown
function closeAutocomplete() {
    const autocompleteList = document.getElementById('autocompleteList');
    autocompleteList.classList.remove('show');
}

document.getElementById('searchInput').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Load weather for city
async function loadWeatherForCity(city) {
    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            alert('City not found. Please try another search.');
            return;
        }

        const data = await response.json();
        currentWeatherData = data;
        
        updateUI(data);
        updateBackground(data.current);
    } catch (error) {
        console.error('Error loading weather:', error);
        alert('Failed to load weather data');
    }
}

// Update UI with weather data
function updateUI(data) {
    const { location, current, forecast } = data;

    // Update location
    document.getElementById('cityName').textContent = location.name;
    document.getElementById('cityCountry').textContent = `${location.admin1 ? location.admin1 + ', ' : ''}${location.country}`;

    // Update current weather
    updateTemperatureDisplay(current);
    document.getElementById('weatherIconLarge').textContent = current.icon;
    document.getElementById('weatherCondition').textContent = current.condition;
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('windSpeed').textContent = `${current.wind_speed} mph`;
    document.getElementById('uvIndex').textContent = current.uv_index;

    // Update forecast
    updateForecast(forecast);
}

// Update temperature display based on unit toggle
function updateTemperatureDisplay(current) {
    let temp, feelsLike, unit;

    if (isFahrenheit) {
        temp = current.temperature;
        feelsLike = current.feels_like;
        unit = '°F';
    } else {
        temp = Math.round((current.temperature - 32) * 5 / 9);
        feelsLike = Math.round((current.feels_like - 32) * 5 / 9);
        unit = '°C';
    }

    document.getElementById('currentTemp').textContent = temp;
    document.getElementById('feelsLike').textContent = feelsLike;
    document.getElementById('tempUnit').textContent = unit;
    document.getElementById('feelsLikeUnit').textContent = unit;
}

// Update forecast cards
function updateForecast(forecast) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    forecast.forEach((day, index) => {
        const card = document.createElement('div');
        card.className = 'forecast-card';

        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        let tempMax, tempMin;
        if (isFahrenheit) {
            tempMax = day.temp_max;
            tempMin = day.temp_min;
        } else {
            tempMax = Math.round((day.temp_max - 32) * 5 / 9);
            tempMin = Math.round((day.temp_min - 32) * 5 / 9);
        }

        card.innerHTML = `
            <span class="forecast-date">${dayName}</span>
            <div class="forecast-icon">${day.icon}</div>
            <div class="forecast-temps">
                <span class="forecast-temp-max">${tempMax}°</span>
                <span class="forecast-temp-min">${tempMin}°</span>
            </div>
            <div class="forecast-condition">${day.condition}</div>
        `;

        forecastGrid.appendChild(card);
    });
}

// Handle unit toggle
function handleUnitToggle(event) {
    isFahrenheit = event.target.checked;
    
    const unitDisplay = document.querySelectorAll('.unit-label');
    if (isFahrenheit) {
        unitDisplay[0].textContent = '°C';
        unitDisplay[1].textContent = '°F';
    } else {
        unitDisplay[0].textContent = '°F';
        unitDisplay[1].textContent = '°C';
    }

    if (currentWeatherData) {
        updateTemperatureDisplay(currentWeatherData.current);
        updateForecast(currentWeatherData.forecast);
    }
}

// Update background based on weather condition
function updateBackground(current) {
    const background = document.getElementById('background');
    background.className = 'background';

    const condition = current.condition.toLowerCase();
    
    if (current.is_night) {
        background.classList.add('night');
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        background.classList.add('rainy');
    } else if (condition.includes('cloudy') || condition.includes('overcast')) {
        background.classList.add('cloudy');
    } else if (condition.includes('clear') || condition.includes('sunny')) {
        background.classList.add('clear');
    } else if (condition.includes('partly')) {
        background.classList.add('partially-cloudy');
    } else {
        background.classList.add('clear');
    }
}

// Update time display
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    const date = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('weatherTime').textContent = `${date} • ${time}`;
}

// Store favorite cities in localStorage
function saveFavoriteCity(city) {
    let favorites = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favoriteCities', JSON.stringify(favorites));
    }
}

function getFavoriteCities() {
    return JSON.parse(localStorage.getItem('favoriteCities') || '[]');
}
