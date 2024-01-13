import "./style.css";

interface WeatherDataType {
  weather: { description: string; icon: string }[];
  wind: { speed: string };
  main: { temp: number; humidity: string };
  sys: { country: string };
  name: string;
}
type CitiesType = string[];
type QuerySelectorType = (selector: string) => HTMLLIElement | null;
type FormType = HTMLFormElement | null;
type InputType = HTMLInputElement | null;
type UlType = HTMLUListElement | null;
type LiType = HTMLLIElement | null;
type DivType = HTMLDivElement | null;
type ParagraphType = HTMLParagraphElement | null;
type SpanType = HTMLSpanElement | null;

class ApiManager {
  readonly #apiKey: string;
  readonly url: string;

  constructor(_apiKey: string = "", url: string) {
    this.#apiKey = _apiKey;
    this.url = url;
  }

  async makeWeatherApiRequest(cityName: string): Promise<WeatherDataType> {
    const url = `${this.url}?q=${cityName}&appid=${this.#apiKey}&units=metric`;
    try {
      const res = await fetch(url);
      if (!res.ok)
        throw {
          message: `Weather API request failed with status ${res.status}`,
          status: res.status,
        };
      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async makeCountryApiRequest(): Promise<CitiesType> {
    try {
      const res = await fetch(this.url);
      if (!res.ok)
        throw {
          message: `Country API request failed with status ${res.status}`,
          status: res.status,
        };
      const { data } = await res.json();
      return data
        .map(
          (countyWithDetails: { cities: CitiesType }) =>
            countyWithDetails.cities,
        )
        .reduce(
          (cities: CitiesType, array: CitiesType) => cities.concat(array),
          [],
        );
    } catch (error) {
      throw error;
    }
  }
}

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
  }

  initializeApp() {
    //a small f() to add some style.
    this.inputWrapperElement &&
      this.inputWrapperElement.addEventListener("click", function () {
        this.classList.add("active");
      });
    const handleSubmit = (event: SubmitEvent): void => {
      event.preventDefault();
      const cityName = this.formElement?.searchBarInput.value.trim();
      if (!cityName) {
        alert("Please enter a valid city name first");
        return;
      }

      //Make weather request
      const apiManagerForWeather: ApiManager = new ApiManager(
        "6d07dbd973fa3969b78bcb1de1e58f0c",
        "https://api.openweathermap.org/data/2.5/weather",
      );
      apiManagerForWeather
        .makeWeatherApiRequest(cityName)
        .then((weatherData): void => {
          this.updateUiWithWeatherData(weatherData);
          this.formElement && (this.formElement.searchBarInput.value = "");
          this.suggestionsElement && (this.suggestionsElement.innerHTML = "");
          this.inputWrapperElement?.classList.remove("active");
        })
        .catch((error): void => {
          switch (error.status) {
            case 404:
              alert(
                "The city name does not exist.\nPlease try to add a valid city name",
              );
              break;
            default:
              console.log(error.message);
          }
        });
    };
    this.formElement?.addEventListener("submit", handleSubmit);
    const handleTyping = (): void => {
      const cityPrefix: string = this.inputElement?.value.trim()!;
      if (!cityPrefix) this.suggestionsElement?.classList.remove("active");

      const apiManagerForCountry: ApiManager = new ApiManager(
        "",
        "https://countriesnow.space/api/v0.1/countries",
      );
      apiManagerForCountry
        .makeCountryApiRequest()
        .then((cities: CitiesType): void => {
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
    this.inputElement?.addEventListener("input", handleTyping);
  }

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
  const weatherApp: WeatherApp = new WeatherApp();
  weatherApp.initializeApp();
};
type ProductType = { name: string; price: number };
const product: ProductType = {
  name: "Coffee mug",
  price: 33,
};
const products: ProductType[] = [product, product, product];

const totalPrice: number = products.reduce(
  (acc, curVal) => acc + curVal.price,
  0,
);
console.log(totalPrice);
