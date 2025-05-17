import "./style.css";
import {
  ApiManager,
  CitiesType,
  WeatherDataType,
} from "./Services/ApiManager.ts";

type QuerySelectorType = (selector: string) => HTMLLIElement | null;
type FormType = HTMLFormElement | null;
type InputType = HTMLInputElement | null;
type UlType = HTMLUListElement | null;
type LiType = HTMLLIElement | null;
type DivType = HTMLDivElement | null;
type ParagraphType = HTMLParagraphElement | null;
type SpanType = HTMLSpanElement | null;

class WeatherApp {
  readonly #qs: QuerySelectorType = document.querySelector.bind(document);
  readonly formElement: FormType;
  readonly inputElement: InputType;
  readonly suggestionsElement: UlType;
  readonly inputWrapperElement: DivType;
  readonly weatherImgElement: DivType;
  readonly weatherDetailsElement: ParagraphType;
  readonly temperatureElement: SpanType;
  readonly cityNameElement: SpanType;
  readonly countryNameElement: SpanType;
  readonly humidityElement: SpanType;
  readonly windSpeedElement: SpanType;

  constructor() {
    this.formElement = this.#qs(".search-bar") as FormType;
    this.inputElement = this.#qs(".search-bar__input") as InputType;
    this.suggestionsElement = this.#qs(".search-bar__suggestions") as UlType;
    this.inputWrapperElement = this.#qs(
      ".search-bar__input-wrapper",
    ) as DivType;
    this.weatherImgElement = this.#qs(
      ".weather-card__weather-image",
    ) as DivType;
    this.weatherDetailsElement = this.#qs(
      ".weather-card__weather-description",
    ) as ParagraphType;
    this.temperatureElement = this.#qs(
      ".weather-card__temperature-value",
    ) as SpanType;
    this.cityNameElement = this.#qs(".weather-card__city") as SpanType;
    this.countryNameElement = this.#qs(".weather-card__country") as SpanType;
    this.humidityElement = this.#qs(
      ".weather-card__humidity-text-value",
    ) as SpanType;
    this.windSpeedElement = this.#qs(".weather-_wind-text-value") as SpanType;

    this.initializeApp();
  }

  initializeApp() {
    //a small f() to add some style.
    this.inputWrapperElement &&
      this.inputWrapperElement.addEventListener("click", function () {
        this.classList.add("active");
      });

    this.inputElement?.addEventListener("input", this.handleTyping);
    this.formElement?.addEventListener("submit", this.handleSubmit);
  }

  handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const cityName = this.formElement?.searchBarInput.value.trim();
    if (!cityName) {
      alert("Please enter a valid city name first");
      return;
    }

    //Make a weather request
    const apiManagerForWeather: ApiManager = new ApiManager(
      "6d07dbd973fa3969b78bcb1de1e58f0c",
      "https://api.openweathermap.org/data/2.5/weather",
    );
    try {
      const weatherData =
        await apiManagerForWeather.makeWeatherApiRequest(cityName);
      this.updateUiWithWeatherData(weatherData);
      this.formElement && (this.formElement.searchBarInput.value = "");
      this.suggestionsElement && (this.suggestionsElement.innerHTML = "");
      this.inputWrapperElement?.classList.remove("active");
    } catch (error: any) {
      switch (error.status) {
        case 404:
          alert(
            "The city name does not exist.\nPlease try to add a valid city name",
          );
          break;
        default:
          console.log(error.message);
      }
    }
  };

  handleTyping = () => {
    const cityPrefix: string = this.inputElement?.value.trim()!;
    if (!cityPrefix) this.suggestionsElement?.classList.remove("active");

    const apiManagerForCountry: ApiManager = new ApiManager(
      "",
      "https://countriesnow.space/api/v0.1/countries",
    );
    apiManagerForCountry.makeCountryApiRequest().then((cities): void => {
      const filteredCities = cities
        .filter((city) =>
          city.toLowerCase().startsWith(cityPrefix.toLowerCase()),
        )
        .slice(0, 5);
      if (filteredCities.length) {
        this.showSuggestedCityNameOnUi(filteredCities);
        this.suggestionsElement?.classList.add("active");
      } else this.suggestionsElement?.classList.remove("active");
    });
  };

  showSuggestedCityNameOnUi(filteredCities: CitiesType) {
    const listElements = filteredCities.map((cityName) =>
      this.generateSuggestionLiTemplate(cityName),
    );
    this.suggestionsElement &&
      (this.suggestionsElement.innerHTML = listElements.join(""));

    const suggestedLiElements: NodeListOf<HTMLLIElement> | undefined =
      this.suggestionsElement?.querySelectorAll(".search-bar__suggestion");
    suggestedLiElements?.forEach((liElement: LiType) => {
      liElement?.addEventListener("click", () => {
        this.inputElement && (this.inputElement.value = liElement?.innerText);
        this.suggestionsElement && (this.suggestionsElement.innerHTML = "");
        this.suggestionsElement?.classList.remove("active");
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
