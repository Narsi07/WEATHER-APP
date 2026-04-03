from flask import Flask, jsonify, request, render_template
import requests
from datetime import datetime
import json

app = Flask(__name__)

# Base URL for Open-Meteo API (free weather API)
BASE_URL = "https://api.open-meteo.com/v1"

def get_coordinates(city_name):
    """Get latitude and longitude from city name"""
    geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": city_name,
        "count": 1,
        "language": "en",
        "format": "json"
    }
    try:
        response = requests.get(geocoding_url, params=params)
        data = response.json()
        if data.get("results"):
            result = data["results"][0]
            return {
                "latitude": result["latitude"],
                "longitude": result["longitude"],
                "name": result.get("name", city_name),
                "country": result.get("country", ""),
                "admin1": result.get("admin1", "")
            }
        return None
    except:
        return None

def get_weather_icon(code, is_night=False):
    """Map WMO weather codes to emoji/icons"""
    icons = {
        0: "☀️",  # Clear sky
        1: "🌤️",  # Mainly clear
        2: "⛅",  # Partly cloudy
        3: "☁️",  # Overcast
        45: "🌫️",  # Foggy
        48: "🌫️",  # Depositing rime fog
        51: "🌧️",  # Light drizzle
        53: "🌧️",  # Moderate drizzle
        55: "🌧️",  # Dense drizzle
        61: "🌧️",  # Slight rain
        63: "🌧️",  # Moderate rain
        65: "⛈️",  # Heavy rain
        71: "🌨️",  # Slight snow
        73: "🌨️",  # Moderate snow
        75: "🌨️",  # Heavy snow
        77: "🌨️",  # Snow grains
        80: "🌧️",  # Slight rain showers
        81: "⛈️",  # Moderate rain showers
        82: "⛈️",  # Violent rain showers
        85: "🌨️",  # Slight snow showers
        86: "🌨️",  # Heavy snow showers
        95: "⛈️",  # Thunderstorm
        96: "⛈️",  # Thunderstorm with slight hail
        97: "⛈️"   # Thunderstorm with heavy hail
    }
    icon = icons.get(code, "🌡️")
    if is_night and code in [0, 1, 2]:
        return "🌙" if code == 0 else "🌙" if code == 1 else "🌙"
    return icon

def get_weather_condition(code):
    """Map WMO weather codes to descriptions"""
    conditions = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing Rime Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",
        61: "Slight Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        71: "Slight Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        77: "Snow Grains",
        80: "Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        97: "Thunderstorm with Heavy Hail"
    }
    return conditions.get(code, "Unknown")

@app.route("/api/weather", methods=["GET"])
def get_weather():
    """Get weather data for a city"""
    city = request.args.get("city", "New York")
    
    # Get coordinates from city name
    coords = get_coordinates(city)
    if not coords:
        return jsonify({"error": "City not found"}), 404
    
    # Get weather data
    weather_url = f"{BASE_URL}/forecast"
    params = {
        "latitude": coords["latitude"],
        "longitude": coords["longitude"],
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index",
        "hourly": "weather_code,temperature_2m,relative_humidity_2m",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max",
        "temperature_unit": "fahrenheit",
        "wind_speed_unit": "mph",
        "timezone": "auto"
    }
    
    try:
        response = requests.get(weather_url, params=params)
        data = response.json()
        
        current = data.get("current", {})
        daily = data.get("daily", {})
        
        # Prepare response
        weather_code = current.get("weather_code", 0)
        is_night = not (6 <= datetime.now().hour < 18)
        
        result = {
            "location": {
                "name": coords["name"],
                "country": coords["country"],
                "admin1": coords["admin1"],
                "latitude": coords["latitude"],
                "longitude": coords["longitude"]
            },
            "current": {
                "temperature": round(current.get("temperature_2m", 0)),
                "feels_like": round(current.get("apparent_temperature", 0)),
                "condition": get_weather_condition(weather_code),
                "icon": get_weather_icon(weather_code, is_night),
                "humidity": current.get("relative_humidity_2m", 0),
                "wind_speed": round(current.get("wind_speed_10m", 0)),
                "uv_index": round(current.get("uv_index", 0), 1),
                "is_night": is_night
            },
            "forecast": []
        }
        
        # Build 7-day forecast
        if daily.get("time"):
            for i in range(min(7, len(daily["time"]))):
                forecast_code = daily["weather_code"][i]
                result["forecast"].append({
                    "date": daily["time"][i],
                    "temp_max": round(daily["temperature_2m_max"][i]),
                    "temp_min": round(daily["temperature_2m_min"][i]),
                    "condition": get_weather_condition(forecast_code),
                    "icon": get_weather_icon(forecast_code),
                    "uv_index": round(daily["uv_index_max"][i], 1)
                })
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/cities", methods=["GET"])
def search_cities():
    """Search for cities - autocomplete"""
    query = request.args.get("q", "")
    
    if len(query) < 2:
        return jsonify([])
    
    geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": query,
        "count": 10,
        "language": "en",
        "format": "json"
    }
    
    try:
        response = requests.get(geocoding_url, params=params)
        data = response.json()
        
        cities = []
        for result in data.get("results", []):
            city_info = {
                "name": result.get("name", ""),
                "country": result.get("country", ""),
                "admin1": result.get("admin1", "")
            }
            display_name = f"{city_info['name']}, {city_info['admin1']}, {city_info['country']}"
            if not city_info['admin1']:
                display_name = f"{city_info['name']}, {city_info['country']}"
            
            cities.append({
                "name": city_info["name"],
                "display": display_name,
                "country": city_info["country"],
                "admin1": city_info["admin1"]
            })
        
        return jsonify(cities)
    except:
        return jsonify([])

@app.route("/")
def index():
    """Serve the main page"""
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
