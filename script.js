// DOM Elements
const chatbotContainer = document.querySelector('.chatbot-container');
const chatMessages = document.querySelector('.chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.querySelector('.send-btn');
const minimizeBtn = document.querySelector('.minimize-btn');
const typingIndicator = document.querySelector('.typing-indicator');
const loadingSpinner = document.querySelector('.loading-spinner');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const ctaButton = document.querySelector('.cta-button');
const chatInput = document.getElementById('chat-input');

// API Configuration
const GEMINI_API_KEY = ''; //replace with your Gemini API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
const WEATHER_API_KEY = ''; // Replace with your OpenWeather API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// State
let userPreferences = {
    name: '',
    gender: '',
    style: '',
    occasions: [],
    chatHistory: [],
    location: null,
    weather: null
};

// Initialize chatbot
document.addEventListener('DOMContentLoaded', () => {
    // Add initial message
    addMessage("Hi! I'm your AI Outfit Assistant. I can help you plan your outfits for the week. What's your name?", 'bot');
    
    // Event listeners
    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    minimizeBtn.addEventListener('click', () => {
        const chatContainer = document.querySelector('.chat-container');
        chatContainer.classList.toggle('hidden');
    });

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    ctaButton.addEventListener('click', () => {
        chatbotContainer.style.display = 'block';
        userInput.focus();
    });

    // Get user's location for weather data
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userPreferences.location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                getWeatherData();
            },
            error => {
                console.error('Error getting location:', error);
            }
        );
    }

    addDevelopersSection();
});

// Get weather data
async function getWeatherData() {
    if (!userPreferences.location) return;

    try {
        const response = await fetch(
            `${WEATHER_API_URL}?lat=${userPreferences.location.lat}&lon=${userPreferences.location.lon}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const data = await response.json();
        userPreferences.weather = {
            temp: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Handle user input
async function handleUserInput() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    // Show typing indicator
    typingIndicator.classList.remove('hidden');

    try {
        const response = await getBotResponse(message);
        typingIndicator.classList.add('hidden');
        addMessage(response, 'bot');
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.classList.add('hidden');
        addMessage("Sorry, I'm having trouble right now. Please try again.", 'bot');
    }
}

// Add message to chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    if (sender === 'bot') {
        messageDiv.innerHTML = formatBotResponse(message);
    } else {
        messageDiv.textContent = message;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format bot response
function formatBotResponse(message) {
    if (message.includes('<div') || message.includes('<ul')) {
        return message;
    }

    let formatted = message
        .replace(/\n/g, '<br>')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    return `<div class="bot-response">${formatted}</div>`;
}

// Get bot response
async function getBotResponse(message) {
    if (!userPreferences.name) {
        userPreferences.name = message;
        return `Nice to meet you, ${userPreferences.name}! Before we continue, could you tell me your city? This will help me check the weather and provide suitable outfit suggestions.`;
    }

    if (!userPreferences.location) {
        // Store city name and get weather data
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(message)}&limit=1&appid=${WEATHER_API_KEY}`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                userPreferences.location = {
                    lat: data[0].lat,
                    lon: data[0].lon,
                    city: message
                };
                await getWeatherData();
                return `Thanks! Now, could you tell me your gender? This will help me provide more personalized outfit suggestions.`;
            } else {
                return `I couldn't find that city. Please try entering a different city name.`;
            }
        } catch (error) {
            console.error('Error getting city coordinates:', error);
            return `I'm having trouble finding that city. Please try entering a different city name.`;
        }
    }
    
    if (!userPreferences.gender) {
        userPreferences.gender = message.toLowerCase();
        return `Thanks! What's your preferred style? (Casual, Professional, Ethnic, Indo-Western, etc.)`;
    }

    if (!userPreferences.style) {
        userPreferences.style = message;
        return `Great choice! I'll keep your ${message} style preference in mind. What type of outfits are you looking for? (Work, Wedding, Sangeet, Party, Casual, etc.)`;
    }
    
    if (userPreferences.occasions.length === 0) {
        userPreferences.occasions = message.split(',').map(occ => occ.trim());
        return `Perfect! I'll help you create stylish outfits for: ${userPreferences.occasions.join(', ')}. Just tell me which occasion you'd like an outfit for!`;
    }

    // Analyze the user's request
    const request = analyzeRequest(message);
    
    try {
        // Include weather information in the prompt
        let weatherContext = '';
        if (userPreferences.weather) {
            weatherContext = `Current weather: ${userPreferences.weather.temp}°C, ${userPreferences.weather.description}. `;
        }

        const prompt = {
            contents: [{
                parts: [{
                    text: `You are the AI Outfit Assistant. Create a detailed outfit suggestion for ${userPreferences.name} (${userPreferences.gender}) using this exact format:

WEATHER INFO
${weatherContext}

OCCASION: ${request.occasion}
DAY: ${request.timing}

MAIN OUTFIT
[Provide 3-4 main clothing items appropriate for the current weather and gender. For each item, specify:
- Exact name of the piece
- Color and pattern details
- Fabric type and quality
- Any unique design elements]

ACCESSORIES
[List 3-4 accessories. For each:
- Specific type and style
- Material and finish
- Color coordination with main outfit
- Any special details or embellishments]

FOOTWEAR
[Describe footwear with:
- Style and type
- Color and material
- Comfort and height details]

STYLING TIPS
[2-3 specific tips about:
- How to wear/style the pieces
- Hair and makeup suggestions
- Weather-appropriate styling advice]

Requirements:
1. Gender: ${userPreferences.gender}
2. Style Preference: ${userPreferences.style}
3. Occasion Type: ${request.occasion}
4. Day/Timing: ${request.timing}
5. Weather Conditions: ${weatherContext}
6. Make suggestions elegant and detailed
7. Include specific colors, materials, and styling
8. Consider the occasion's formality
9. Ensure all pieces coordinate well together
10. Adapt outfit for current weather conditions

Create a unique, personalized outfit suggestion that matches ${userPreferences.name}'s ${userPreferences.style} style preference and is appropriate for the current weather.`
                }]
            }]
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prompt)
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid API response format');
        }

        const suggestion = data.candidates[0].content.parts[0].text;
        return formatOutfitSuggestion(suggestion, request);
    } catch (error) {
        console.error('API Error:', error);
        return `I apologize, ${userPreferences.name}, but I'm having trouble generating your outfit suggestion right now. Please try again in a moment.`;
    }
}

// Analyze user request
function analyzeRequest(message) {
    const messageLower = message.toLowerCase();
    
    // Define occasion patterns
    const occasions = {

        wedding: ['wedding', 'marriage', 'bride', 'groom', 'bridal'],
        sangeet: ['sangeet', 'sangeeth', 'dance', 'mehendi', 'mehndi'],
        party: ['reception', 'party', 'celebration', 'club', 'night out', 'dinner'],
        work: ['work', 'office', 'business', 'professional', 'meeting'],
        casual: ['casual', 'daily', 'regular', 'everyday'],
        festival: ['festival', 'puja', 'diwali', 'holi', 'navratri'],
        date: ['date', 'dinner date', 'romantic'],
        interview: ['interview', 'job', 'formal meeting']
    };
        

    // Find the occasion
    let occasion = 'general';
    for (const [key, keywords] of Object.entries(occasions)) {
        if (keywords.some(keyword => messageLower.includes(keyword))) {
            occasion = key;
            break;
        }
    }

    // Determine request type
    let type = 'specific';
    if (messageLower.includes('week') || messageLower.includes('all')) {
        type = 'weekly';
    }

    // Check for timing
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let timing = 'any';
    for (const day of days) {
        if (messageLower.includes(day)) {
            timing = day;
            break;
        }
    }

    return { type, occasion, timing };
}

// Format outfit suggestion
function formatOutfitSuggestion(suggestion, request) {
    // Clean up markdown symbols and normalize text
    let cleanedSuggestion = suggestion
        .replace(/\*\*/g, '')  // Remove bold markdown
        .replace(/\*/g, '')    // Remove any remaining asterisks
        .replace(/\[|\]/g, '') // Remove square brackets
        .trim();

    const sections = cleanedSuggestion.split('\n\n');
    let formattedHtml = '<div class="outfit-suggestion">';
    
    // Add weather information if available
    if (userPreferences.weather) {
        formattedHtml += `
            <div class="weather-info">
                <i class="fas fa-cloud weather-icon"></i>
                <div class="weather-details">
                    <div class="weather-temp">${userPreferences.weather.temp}°C</div>
                    <div class="weather-desc">${userPreferences.weather.description}</div>
                </div>
            </div>`;
    }

    // Format header section
    const headerSection = sections.find(section => 
        section.includes('OCCASION:') || section.includes('DAY:')
    );
    
    if (headerSection) {
        const headerLines = headerSection.split('\n');
        formattedHtml += '<div class="outfit-header">';
        headerLines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':').map(part => part.trim());
                formattedHtml += `
                    <div class="header-item">
                        <span class="header-label">${key}</span>
                        <span class="header-value">${value}</span>
                    </div>`;
            }
        });
        formattedHtml += '</div>';
    }
    
    // Process main sections
    const mainSections = sections.filter(section => 
        !section.includes('OCCASION:') && !section.includes('DAY:')
    );
    
    mainSections.forEach(section => {
        if (!section.trim()) return;
        
        const lines = section.trim().split('\n');
        const sectionTitle = lines[0].trim().replace(/:/g, '');
        
        formattedHtml += `
            <div class="outfit-section">
                <div class="section-header">
                    <h4 class="section-title">
                        <i class="${getSectionIcon(sectionTitle)}"></i>
                        <span>${sectionTitle}</span>
                    </h4>
                </div>
                <div class="section-content">`;
        
        let items = lines.slice(1)
            .map(line => line.trim())
            .filter(line => line && !line.endsWith(':'));

        // Group items by main piece
        let currentItem = '';
        let currentDetails = [];
        let processedItems = [];

        items.forEach(item => {
            if (!item.startsWith('-')) {
                if (currentItem) {
                    processedItems.push({
                        title: currentItem,
                        details: currentDetails
                    });
                }
                currentItem = item;
                currentDetails = [];
            } else {
                currentDetails.push(item.substring(1).trim());
            }
        });

        // Add the last item
        if (currentItem) {
            processedItems.push({
                title: currentItem,
                details: currentDetails
            });
        }

        if (processedItems.length > 0) {
            formattedHtml += '<ul class="item-list">';
            processedItems.forEach(item => {
                if (sectionTitle === 'STYLING TIPS') {
                    formattedHtml += `
                        <li class="style-tip">
                            <i class="fas fa-sparkles"></i>
                            <span class="tip-text">${item.title}</span>
                        </li>`;
                } else {
                    formattedHtml += `
                        <li class="outfit-item">
                            <i class="fas fa-circle-check"></i>
                            <div class="item-content">
                                <div class="item-title">${item.title}</div>
                                ${item.details.length > 0 ? '<ul class="item-details">' + 
                                    item.details.map(detail => `<li>${detail}</li>`).join('') + 
                                    '</ul>' : ''}
                            </div>
                        </li>`;
                }
            });
            formattedHtml += '</ul>';
        }
        
        formattedHtml += '</div></div>';
    });
    
    formattedHtml += '</div>';
    return formattedHtml;
}

function getSectionIcon(sectionTitle) {
    const icons = {
        'MAIN OUTFIT': 'fas fa-tshirt',
        'ACCESSORIES': 'fas fa-gem',
        'FOOTWEAR': 'fas fa-shoe-prints',
        'STYLING TIPS': 'fas fa-magic',
        'WEATHER INFO': 'fas fa-cloud'
    };
    return icons[sectionTitle] || 'fas fa-circle';
}

// Update the CSS styles with dark theme
const styleElement = document.createElement('style');
styleElement.textContent = `
    .outfit-suggestion {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: #1a1a1a;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        border-radius: 12px;
        color: #e5e7eb;
    }
    
    .outfit-header {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
        color: #e5e7eb;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.4);
    }
    
    .header-item {
        display: flex;
        align-items: center;
        margin: 8px 0;
    }
    
    .header-label {
        font-weight: 600;
        font-size: 1.1em;
        margin-right: 10px;
        min-width: 100px;
        color: #9ca3af;
    }
    
    .header-value {
        font-size: 1.1em;
        color: #e5e7eb;
    }
    
    .outfit-section {
        background: #262626;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 1px solid #404040;
        transition: transform 0.2s ease;
    }
    
    .outfit-section:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .section-header {
        padding: 15px 20px;
        background: #333333;
        border-bottom: 1px solid #404040;
        border-radius: 10px 10px 0 0;
    }
    
    .section-title {
        margin: 0;
        color: #a5b4fc;
        font-size: 1.2em;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .section-title i {
        font-size: 1.1em;
        color: #818cf8;
    }
    
    .section-content {
        padding: 20px;
        background: #262626;
        border-radius: 0 0 10px 10px;
    }
    
    .item-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .outfit-item, .style-tip {
        display: flex;
        align-items: flex-start;
        padding: 10px 0;
        transition: all 0.2s ease;
        border-bottom: 1px solid #404040;
    }
    
    .outfit-item:last-child, .style-tip:last-child {
        border-bottom: none;
    }
    
    .outfit-item:hover, .style-tip:hover {
        transform: translateX(5px);
        background: #333333;
        padding: 10px;
        border-radius: 6px;
    }
    
    .outfit-item i {
        color: #818cf8;
        margin-right: 12px;
        margin-top: 4px;
        font-size: 0.9em;
    }
    
    .style-tip i {
        color: #fbbf24;
        margin-right: 12px;
        margin-top: 4px;
        font-size: 0.9em;
    }
    
    .item-text, .tip-text {
        flex: 1;
        line-height: 1.5;
        color: #e5e7eb;
    }
    
    .tip-text {
        font-style: italic;
        color: #9ca3af;
    }
    
    @media (max-width: 640px) {
        .outfit-suggestion {
            padding: 15px;
            margin: 10px;
        }
        
        .header-item {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .header-label {
            margin-bottom: 4px;
        }
    }
`;
document.head.appendChild(styleElement);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add developers section to the page
function addDevelopersSection() {
    const developersSection = document.createElement('section');
    developersSection.className = 'developers-section';
    developersSection.innerHTML = `
        <div class="developers-container">
            <h2 class="developers-title">Meet the Developers</h2>
            <div class="developers-grid">
                <div class="developer-card">
                    <div class="developer-image">
                        <img src="path/to/developer1-image.jpg" alt="Developer 1" onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                    <div class="developer-info">
                        <h3 class="developer-name">Developer Name 1</h3>
                        <p class="developer-details">Registration: REG12345</p>
                        <p class="developer-details">Roll: ROLL12345</p>
                    </div>
                </div>
                <div class="developer-card">
                    <div class="developer-image">
                        <img src="path/to/developer2-image.jpg" alt="Developer 2" onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                    <div class="developer-info">
                        <h3 class="developer-name">Developer Name 2</h3>
                        <p class="developer-details">Registration: REG67890</p>
                        <p class="developer-details">Roll: ROLL67890</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add the developers section after the chatbot container
    const chatbotContainer = document.querySelector('.chatbot-container');
    chatbotContainer.parentNode.insertBefore(developersSection, chatbotContainer.nextSibling);
}

// Add developers section styles
const developerStyles = document.createElement('style');
developerStyles.textContent = `
    .developers-section {
        padding: 40px 20px;
        background: #1a1a1a;
        margin-top: 40px;
    }

    .developers-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .developers-title {
        text-align: center;
        color: #e5e7eb;
        font-size: 2em;
        margin-bottom: 40px;
        font-weight: 600;
        position: relative;
        padding-bottom: 15px;
    }

    .developers-title:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        border-radius: 3px;
    }

    .developers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 30px;
        justify-items: center;
    }

    .developer-card {
        background: #262626;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        width: 100%;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .developer-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    }

    .developer-image {
        width: 150px;
        height: 150px;
        margin: 0 auto 20px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid #818cf8;
        box-shadow: 0 0 20px rgba(129, 140, 248, 0.3);
    }

    .developer-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .developer-card:hover .developer-image img {
        transform: scale(1.1);
    }

    .developer-info {
        color: #e5e7eb;
    }

    .developer-name {
        font-size: 1.4em;
        margin: 0 0 10px;
        color: #a5b4fc;
    }

    .developer-details {
        margin: 5px 0;
        color: #9ca3af;
        font-size: 0.95em;
    }

    @media (max-width: 640px) {
        .developers-grid {
            grid-template-columns: 1fr;
        }

        .developer-card {
            max-width: 100%;
        }

        .developers-section {
            padding: 30px 15px;
        }
    }
`;

document.head.appendChild(developerStyles); 
