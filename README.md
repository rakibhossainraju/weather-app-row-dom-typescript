# Weather App using OOP and TypeScript

This project is an Object-Oriented Programming (OOP) style implementation of a Weather App using TypeScript. The app allows users to search for weather information in different cities. It leverages the OpenWeatherMap API for weather data and the Countries API for city suggestions.
## [*Live site*](https://rakibhossainraju.github.io/weather-app/)

## Features

- **Object-Oriented Structure**: The project is structured using classes, interfaces, and types for a clean and organized codebase.
- **API Management**: The `ApiManager` class handles API requests for both weather and country data, encapsulating the logic and providing a convenient interface.
- **Interactive UI**: The `WeatherApp` class manages the interaction with the DOM, providing an intuitive interface for users to input city names and receive weather information.
- **Suggestions**: The app suggests city names based on user input, enhancing the user experience.
- **Code Formatting**: The project uses Prettier with customized rules for consistent code formatting, including extended line length for improved readability.

## Code Structure

### `ApiManager` Class

The `ApiManager` class encapsulates API-related functionalities.

- **Properties**:
  - `#apiKey`: Private property storing the API key for authentication.
  - `url`: The base URL for API requests.

- **Methods**:
  - `makeWeatherApiRequest(cityName: string): Promise<WeatherDataType>`: Makes a weather API request for a specific city.
  - `makeCountryApiRequest(): Promise<CitiesType>`: Makes a country API request to get a list of cities.

### `WeatherApp` Class

The `WeatherApp` class manages the interaction with the DOM and user input.

- **Properties**:
  - Various readonly properties for different HTML elements used in the app.

- **Methods**:
  - `initializeApp()`: Initializes the app, setting up event listeners and handling form submissions.
  - `showSuggestedCityNameOnUi(filteredCities: CitiesType)`: Displays suggested city names based on user input.
  - `generateSuggestionLiTemplate(textContent: string): string`: Generates the HTML template for a suggested city name.
  - `updateUiWithWeatherData(weatherData: WeatherDataType)`: Updates the UI with weather data after a successful API request.

## Code Formatting

The project uses Prettier for consistent code formatting with the following configuration:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 140,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
``