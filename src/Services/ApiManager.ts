export interface WeatherDataType {
  weather: { description: string; icon: string }[];
  wind: { speed: string };
  main: { temp: number; humidity: string };
  sys: { country: string };
  name: string;
}

export type CitiesType = string[];

export class ApiManager {
  readonly #apiKey: string;
  readonly url: string;

  constructor(_apiKey: string = '', url: string) {
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
            countyWithDetails.cities
        )
        .reduce(
          (cities: CitiesType, array: CitiesType) => cities.concat(array),
          []
        );
    } catch (error) {
      throw error;
    }
  }
}
