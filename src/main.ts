import './style.css';
import {
  ApiManager,
  type CitiesType,
  type WeatherDataType,
} from './Services/ApiManager.ts';

class WeatherApp {
  private readonly qs = <T extends HTMLElement>(selector: string): T | null =>
    document.querySelector<T>(selector);
  private readonly formElement = this.qs<HTMLFormElement>('.search-bar');
  private readonly inputElement =
    this.qs<HTMLInputElement>('.search-bar__input');
  private readonly suggestionsElement = this.qs<HTMLUListElement>(
    '.search-bar__suggestions'
  );
  private readonly inputWrapperElement = this.qs<HTMLDivElement>(
    '.search-bar__input-wrapper'
  );
  private readonly weatherImgElement = this.qs<HTMLDivElement>(
    '.weather-card__weather-image'
  );
  private readonly weatherDetailsElement = this.qs<HTMLParagraphElement>(
    '.weather-card__weather-description'
  );
  private readonly temperatureElement = this.qs<HTMLSpanElement>(
    '.weather-card__temperature-value'
  );
  private readonly cityNameElement = this.qs<HTMLSpanElement>(
    '.weather-card__city'
  );
  private readonly countryNameElement = this.qs<HTMLSpanElement>(
    '.weather-card__country'
  );
  private readonly humidityElement = this.qs<HTMLSpanElement>(
    '.weather-card__humidity-text-value'
  );
  private readonly windSpeedElement = this.qs<HTMLSpanElement>(
    '.weather-card__wind-text-value'
  );

  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    this.inputWrapperElement &&
      this.inputWrapperElement.addEventListener('click', function () {
        this.classList.add('active');
      });

    this.inputElement?.addEventListener('input', this.handleTyping);
    this.formElement?.addEventListener('submit', this.handleSubmit);
  }

  handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const cityName = this.formElement?.searchBarInput.value.trim();
    if (!cityName) return alert('Please enter a valid city name first');

    //Make a weather request
    const apiManagerForWeather: ApiManager = new ApiManager(
      '6d07dbd973fa3969b78bcb1de1e58f0c',
      'https://api.openweathermap.org/data/2.5/weather'
    );
    try {
      const weatherData =
        await apiManagerForWeather.makeWeatherApiRequest(cityName);
      this.updateUiWithWeatherData(weatherData);
      this.formElement && (this.formElement.searchBarInput.value = '');
      this.suggestionsElement && (this.suggestionsElement.innerHTML = '');
      this.inputWrapperElement?.classList.remove('active');
    } catch (error: any) {
      switch (error.status) {
        case 404:
          alert(
            'The city name does not exist.\nPlease try to add a valid city name'
          );
          break;
        default:
          console.log(error.message);
      }
    }
  };

  handleTyping = () => {
    const cityPrefix: string = this.inputElement?.value.trim()!;
    if (!cityPrefix) this.suggestionsElement?.classList.remove('active');

    const apiManagerForCountry: ApiManager = new ApiManager(
      '',
      'https://countriesnow.space/api/v0.1/countries'
    );
    apiManagerForCountry.makeCountryApiRequest().then((cities): void => {
      const filteredCities = cities
        .filter(city => city.toLowerCase().startsWith(cityPrefix.toLowerCase()))
        .slice(0, 5);
      if (filteredCities.length) {
        this.showSuggestedCityNameOnUi(filteredCities);
        this.suggestionsElement?.classList.add('active');
      } else this.suggestionsElement?.classList.remove('active');
    });
  };

  showSuggestedCityNameOnUi(filteredCities: CitiesType) {
    const listElements = filteredCities.map(cityName =>
      this.generateSuggestionLiTemplate(cityName)
    );
    this.suggestionsElement &&
      (this.suggestionsElement.innerHTML = listElements.join(''));

    const suggestedLiElements: NodeListOf<HTMLLIElement> | undefined =
      this.suggestionsElement?.querySelectorAll('.search-bar__suggestion');
    suggestedLiElements?.forEach((liElement: HTMLLIElement) => {
      liElement?.addEventListener('click', () => {
        this.inputElement && (this.inputElement.value = liElement?.innerText);
        this.suggestionsElement && (this.suggestionsElement.innerHTML = '');
        this.suggestionsElement?.classList.remove('active');
      });
    });
  }

  generateSuggestionLiTemplate(textContent: string): string {
    return `<li class="search-bar__suggestion">${textContent}</li>`;
  }

  updateUiWithWeatherData(weatherData: WeatherDataType) {
    const {
      weather,
      main: { temp, humidity },
      wind: { speed },
      sys: { country },
      name,
    } = weatherData;

    const { description, icon } = weather[0];
    const imageUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;
    this.weatherDetailsElement &&
      (this.weatherDetailsElement.textContent = description);
    this.weatherImgElement &&
      (this.weatherImgElement.style.backgroundImage = `url(${imageUrl})`);
    this.cityNameElement && (this.cityNameElement.textContent = name);
    this.countryNameElement && (this.countryNameElement.textContent = country);
    this.temperatureElement &&
      (this.temperatureElement.textContent = Math.round(temp).toString());
    this.humidityElement && (this.humidityElement.textContent = humidity);
    this.windSpeedElement && (this.windSpeedElement.textContent = speed);
  }
}

// window.onload = initializeApp;
window.onload = (): void => {
  new WeatherApp();
};
