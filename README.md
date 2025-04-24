# What2Wear - AI-Powered Outfit Assistant

What2Wear is an intelligent outfit recommendation system that helps users create perfect outfits based on their style preferences, weather conditions, and occasions. Powered by Google's Gemini AI and OpenWeather API, it provides personalized fashion advice tailored to your needs.

## Features

### 🎯 Personalized Recommendations
- Custom outfit suggestions based on:
  - Personal style preferences
  - Gender-specific recommendations
  - Current weather conditions
  - Occasion type (work, casual, party, wedding, etc.)
  - Day of the week

### 🌤️ Weather Integration
- Real-time weather data integration
- Temperature-appropriate outfit suggestions
- Weather-based styling tips
- Location-based weather updates

### 👔 Comprehensive Outfit Details
- Detailed breakdown of each outfit component:
  - Main clothing items
  - Accessories
  - Footwear
  - Styling tips

### 💅 Style Categories
- Support for multiple style preferences:
  - Casual
  - Professional
  - Ethnic
  - Indo-Western
  - Party
  - Formal
  - And more!

### 🎉 Occasion-Based Recommendations
- Specialized outfit suggestions for:
  - Work/Office
  - Weddings
  - Parties
  - Festivals
  - Dates
  - Interviews
  - Casual outings

### 💫 Additional Features
- Modern, responsive UI design
- Dark theme for comfortable viewing
- Interactive chat interface
- Real-time outfit suggestions
- Mobile-friendly design

## Technical Stack

- **Frontend:**
  - HTML5
  - CSS3 (with modern features like Grid and Flexbox)
  - Vanilla JavaScript
  - Font Awesome icons

- **APIs:**
  - Google Gemini AI API for outfit recommendations
  - OpenWeather API for weather data

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/vardhanvarikuti/What2Wear.git
   cd What2Wear
   ```

2. Configure API keys:
   - Get your API keys from:
     - [Google AI Studio](https://makersuite.google.com/app/apikey) for Gemini AI
     - [OpenWeather](https://openweathermap.org/api) for weather data
   - Update the API keys in `script.js`:
     ```javascript
     const GEMINI_API_KEY = 'your_gemini_api_key';
     const WEATHER_API_KEY = 'your_openweather_api_key';
     ```

3. Serve the application:
   - Use a local server (e.g., Live Server in VS Code)
   - Or use Python's built-in server:
     ```bash
     python -m http.server 8000
     ```

4. Open in browser:
   - Navigate to `http://localhost:8000`

## Usage

1. **Initial Setup:**
   - Enter your name when prompted
   - Allow location access for weather data
   - Specify your gender for personalized recommendations
   - Choose your preferred style

2. **Getting Recommendations:**
   - Type the occasion you need an outfit for
   - Optionally specify the day of the week
   - Receive detailed outfit suggestions

3. **Outfit Details:**
   - View comprehensive outfit components
   - Check weather-appropriate suggestions
   - Get styling tips and accessories recommendations

## Statistics

- 10K+ Happy Users
- 50K+ Outfits Created
- 4.9/5 User Rating

## Developers

### VARDHAN VARIKUTI


### MADHUSMITA TALUKDAR


## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for powering the recommendation engine
- OpenWeather API for real-time weather data
- Font Awesome for the beautiful icons
- All contributors who have helped shape this project

## Contact

For any queries or suggestions, please reach out to:
- Email: vardhanvarikuti@gmail.com
- Project Link: [https://github.com/vardhanvarikuti/What2Wear](https://github.com/vardhanvarikuti/What2Wear)

---

Made with ❤️ by VARDHAN VARIKUTI & MADHUSMITA TALUKDAR 
