# 🌤️ Weather App

A beautiful, modern weather application built with Python Flask, HTML, CSS, and JavaScript. Features real-time weather data, dynamic backgrounds, and a responsive design.

## Features

✨ **Modern UI Design**
- Glassmorphism cards with blur effects
- Dynamic backgrounds that change based on weather conditions
- Smooth animations and transitions
- Responsive design for all devices

🌍 **Real-Time Weather Data**
- Current temperature, feels-like, humidity, wind speed, UV index
- 7-day forecast with detailed information
- Weather conditions with emoji icons
- Auto-updating current time and date

🔍 **Smart Search**
- City autocomplete with suggestions
- Multiple location support
- Search from anywhere in the world

🌡️ **Temperature Control**
- Toggle between Fahrenheit and Celsius
- All values update instantly

## Tech Stack

- **Backend:** Python Flask
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Weather API:** Open-Meteo (Free, no API key required)
- **Styling:** Modern CSS with glassmorphism effects

## Installation

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Setup Steps

1. **Navigate to the project directory:**
   ```bash
   cd weather-app
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask app:**
   ```bash
   python app.py
   ```

4. **Open in browser:**
   ```
   http://localhost:5000
   ```

## Project Structure

```
weather-app/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css     # Styling and animations
│   └── js/
│       └── script.js     # Frontend logic and API calls
└── templates/
    └── index.html        # Main HTML template
```

## How It Works

1. **Backend (Flask):**
   - `/api/weather?city=<city>` - Fetches weather data for a city
   - `/api/cities?q=<query>` - Autocomplete city search
   - Uses Open-Meteo API for real weather data

2. **Frontend (JavaScript):**
   - Communicates with Flask backend via fetch API
   - Handles user interactions and dynamic updates
   - Manages temperature unit conversion
   - Stores favorite cities in localStorage

3. **Styling:**
   - CSS Grid and Flexbox for responsive layouts
   - Glassmorphism effects with backdrop-filter
   - CSS animations for weather-specific backgrounds
   - Mobile-first responsive design

## Features Explained

### Dynamic Backgrounds
- **Clear Sky:** Purple-blue gradient
- **Cloudy:** Gray gradient
- **Rainy:** Dark blue-gray gradient with rain animation
- **Night:** Deep purple-blue night gradient

### Search with Autocomplete
- Type any city name
- Get instant suggestions from global database
- Click to select and view weather

### Temperature Unit Toggle
- Switch between Fahrenheit and Celsius
- All values update automatically
- Preference is shown in every temperature display

### 7-Day Forecast
- Shows min/max temperatures
- Weather condition icons
- UV index information
- Smooth hover animations

## API Details

### Weather Endpoint
```
GET /api/weather?city=<city_name>
```
Returns:
- Current temperature, condition, humidity, wind speed, UV index
- 7-day forecast data
- Location information

### Cities Endpoint
```
GET /api/cities?q=<query>
```
Returns:
- List of matching cities with country/region info
- Maximum 10 results

## Customization

### Change Default City
Edit `script.js` line with `loadWeatherForCity()`:
```javascript
loadWeatherForCity('Tokyo'); // Change from 'New York'
```

### Modify Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary-color: #6c5ce7;
    --secondary-color: #74b9ff;
    --accent-color: #ff6b9d;
}
```

### Add More Weather Details
Modify the Python `get_weather()` function to include additional parameters from Open-Meteo API.

## Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers

## Performance

- Lightweight: ~50KB combined assets
- No external CDN dependencies
- Smooth animations at 60fps
- Fast autocomplete with debouncing

## Future Enhancements

- [ ] Weather alerts and warnings
- [ ] Historical weather data
- [ ] Weather maps and radar
- [ ] Air quality index
- [ ] Sunrise/sunset times
- [ ] Pollen count
- [ ] PWA support for offline use
- [ ] Dark/Light theme toggle

## API Provider

Weather data is provided by **Open-Meteo** - a free weather API with no rate limits or API keys required.
- Website: https://open-meteo.com
- Documentation: https://open-meteo.com/en/docs

## License

This project is open source and available for personal and commercial use.

## Support

If you encounter any issues:
1. Ensure Python 3.7+ is installed
2. Check that all dependencies are installed (`pip install -r requirements.txt`)
3. Verify port 5000 is not in use
4. Clear browser cache if styles don't load properly

Enjoy your weather app! 🌦️
