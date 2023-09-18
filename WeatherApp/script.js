const apiKey = "f640eab122354f39be692227232108";
const url = "https://api.weatherapi.com/v1/";
const link =
  "http://api.weatherapi.com/v1/forecast.json?key=f640eab122354f39be692227232108&days=5&lang=ru";

const root = document.getElementById("root");
const textInput = document.getElementById("text-input");
const formSumbit = document.getElementById("form");

let nextFiveHours = [];
let tommorow = [];
let mappedNextHour = [];
let mappedNextDays = [];
let NextDay = [];
let store = {
  city: "хабаровск",
  temp: 0,
  feelsLike: 0,
  hour: 0,
  isDay: 0,
  maxtemp: 0,
  mintemp: 0,
  condition: "Sunny",
  properties: {
    wind: {},
    uv: {},
    humidity: {},
    pressure: {},
  },
};

const fetchData = async () => {
  const result = await fetch(`${link}&q=${store.city}`);
  const data = await result.json();
  let {
    current: { cloud, feelslike_c: feelsLike, humidity, temp_c: temp, is_day: isDay, uv, wind_kph: wind, pressure_in: pressure },
    current: { condition: { text: discription } },
    current: { condition: { icon } },
    forecast: { forecastday: [{ day: { maxtemp_c: maxtemp, mintemp_c: mintemp } }] },
    forecast: { forecastday: [{ astro: { sunrise, sunset } }] },
    forecast: { forecastday: [{ hour }] },
    location: { name: city }
} = data;
  const localTime = data.location.localtime;
  const now = new Date(localTime);
  const currentHour = now.getHours();
  const nextDays = data.forecast.forecastday;
  console.log(nextDays);

  store = {
    ...store,
    city,
    temp,
    feelsLike,
    hour,
    localTime,
    isDay,
    maxtemp,
    mintemp,
    condition: discription,
    properties: {
      wind: {
        title: "скорость ветра",
        value: `${wind} км/ч`,
        icon: "wind.svg",
      },
      uv: {
        title: "УФ Индекс",
        value: `${uv}`,
        icon: "sun.svg",
      },
      humidity: {
        title: "Влажность",
        value: `${humidity}%`,
        icon: "rain.svg",
      },
      pressure: {
        title: "Давление",
        value: `${pressure} Hpm`,
        icon: "pressure.svg",
      },
    },
  };

  const forecastEveryHour = hour.map((hour) => {
    return {
      time: formatTime(hour.time),
      temp: Math.round(hour.temp_c),
      chanceOfRain: hour.chance_of_rain,
      description: hour.condition.text,
    };
  });

  mappedNextDays = nextDays.map((day) => {
    return {
      date: formatDate(day.date),
      sunrise: day.astro.sunrise,
      sunset: day.astro.sunset,
      mintemp: Math.round(day.day.mintemp_c),
      maxtemp: Math.round(day.day.maxtemp_c),
      wind: day.day.avgvis_km,
      uv: day.day.uv,
      humidity: day.day.avghumidity,
      description: day.day.condition.text,
      horlyForecast: day.hour.map((hour) => {
        return {
          time: formatTime(hour.time),
          temp: Math.round(hour.temp_c),
          chanceOfRain: hour.chance_of_rain,
          description: hour.condition.text,
        };
      }),
    };
  });
  tommorow = mappedNextDays[1];
  tommorowHorlyForecast = tommorow.horlyForecast;

  console.log(tommorow.uv);

  nextFiveHours = forecastEveryHour.slice(currentHour, currentHour + 6);
  if (nextFiveHours.length < 6) {
    for (let i of tommorowHorlyForecast) nextFiveHours.push(i);
  }

  formatTime();
  formatDate();
  console.log(formatDate(localTime));
  renderComponent();
};
function formatTime(timeString) {
  const time = new Date(timeString);
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const formattedTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  return formattedTime;
}
function formatDate(timeString) {
  const months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];
  const time = new Date(timeString);
  const date = time.getDate();
  const month = time.getMonth();
  const formattedDate = `${date}, ${months[month]}`;
  return formattedDate;
}
const renderHourlyForecast = (nextFiveHours) => {
  let markup = "";
  for (let i = 0; i < 6; i++) {
    markup += ` <li>
    <div class="hour">${nextFiveHours[i].time}</div>
        <div class="forecsat-icon"><img src="img/icon/day/${getImage(
          nextFiveHours[i].description,
        )}" alt=""></div>
        <div class="hourly-temp">${nextFiveHours[i].temp}°C</div>
    </li>`;
  }
  return markup;
};
const renderTomorrowForecast = (tommorowHorlyForecast, tommorow) => {
  let markup = "";
  let property = "";
  let sunriseSunset = "";
  for (let i = 0; i < tommorowHorlyForecast.length; i++) {
    markup += ` <li>
    <div class="hour">${tommorowHorlyForecast[i].time}</div>
        <div class="forecsat-icon"><img src="img/icon/day/${getImage(
          tommorowHorlyForecast[i].description,
        )}" alt=""></div>
        <div class="hourly-temp">${tommorowHorlyForecast[i].temp}°C</div>
    </li>`;
  }
  property = `<div class="uv">  
    <div class="properties-tomorrow-icon"><img src="img/icon/uv.png" alt=""></div>
    <div class="uv-title">УФ-индекс</div>
    <div class="uv-value">${tommorow.uv}</div>
    </div>
    <div class="humidity">  
    <div class="properties-tomorrow-icon"><img src="img/icon/water.png" alt=""></div>
    <div class="uv-title">Влажность</div>
    <div class="uv-value">${tommorow.humidity}%</div>
    </div>
    <div class="uv">  
    <div class="properties-tomorrow-icon"><img src="img/icon/wind.png" alt=""></div>
    <div class="uv-title">Ветер</div>
    <div class="uv-value">${tommorow.wind} км/ч</div>
    </div>
    `;
  sunriseSunset = ` 
    <div class="sunrise-sunset">
   
        <div class="sunrise">
        <div class="sunrise-icon"><img src="img/icon/sunrise.png" alt=""></div>
        <div class="sunrise-title">восход</div> ${tommorow.sunrise}</div>
        <div class="sunset">
        <div class="sunset-icon"><img src="img/icon/sunset.png" alt=""></div>
        <div class="sunset-title">закат</div> ${tommorow.sunrise}</div>
        
    </div>
    `;
  return `<div class="hourly-forecast-info">
    <ul>${markup}</ul>
        </div>
        <div class="properties-tomorrow" id="properties-tomorrow">
        ${property}
        </div>
        ${sunriseSunset}

        `;
};

const renderNextDays = (mappedNextDays) => {
  let markup = "";
  for (let i = 0; i < mappedNextDays.length; i++) {
    markup += ` <li>
    <div class="hour">${mappedNextDays[i].date}

    </div>
    <div class="description">
    <div class="description-text">${mappedNextDays[i].maxtemp}°C</div>
    <div class="description-text">${mappedNextDays[i].mintemp}°C</div>
    </div>
    <div class="create-line"></div>
    <div class="forecsat-icon"><img src="img/icon/day/${getImage(
      mappedNextDays[i].description,
    )}" alt=""></div>
    </li>`;
  }
  return markup;
};

const getImage = (description) => {
  const value = description;

  switch (value) {
    case "Солнечно":
      return "Солнечно.png";
    case "Переменная облачность":
      return "Переменная облачность.png";
    case "Облачно":
      return "Облачно.png";
    case "Дымка":
      return "Дымка.png";
    case "Местами снег":
      return "Местами снег.png";
    case "Местами дождь":
      return "Местами дождь.png";
    case "Местами дождь со снегом":
      return "Местами дождь со снегом.png";
    case "Местами грозы":
      return "Местами грозы.png";
    case "Поземок":
      return "Поземок.png";
    case "Метель":
      return "Метель.png";
    case "Туман":
      return "Туман.png";
    case "Переохлажденный туман":
      return "Переохлажденный туман.png";
    case "Небольшой ливневый дождь":
      return "Небольшой ливневый дождь.png";
    case "Местами слабая морось":
      return "Местами слабая морось.png";
    case "Замерзающая морось":
      return "Замерзающая морось.png";
    case "Сильная замерзающая морось":
      return "Сильная замерзающая морось.png";
    case "Небольшой дождь":
      return "Небольшой дождь.png";
    case "Временами умеренный дождь":
      return "Временами умеренный дождь.png";
    case "Умеренный дождь":
      return "Умеренный дождь.png";
    case "Временами сильный дождь":
      return "Временами сильный дождь.png";
    case "Слабый переохлажденный дождь":
      return "Слабый переохлажденный дождь.png";
    case "Умеренный или сильный переохлажденный дождь":
      return "Умеренный или сильный переохлажденный дождь.png";
    case "Небольшой дождь со снегом":
      return "Небольшой дождь со снегом.png";
    case "Небольшой снег":
      return "Небольшой снег.png";
    case "Местами умеренный снег":
      return "Местами умеренный снег.png";
    case "Умеренный или сильный ливневый дождь":
      return "Умеренный или сильный ливневый дождь.png";
    case "Умеренные или сильные ливневые дожди со снегом":
      return "Умеренные или сильные ливневые дожди со снегом.png";
    case "Умеренный или сильный снег":
      return "Умеренный или сильный снег.png";
    case "Небольшой ледяной дождь":
      return "Небольшой ледяной дождь.png";
    case "Умеренный или сильный ледяной дождь":
      return "Умеренный или сильный ледяной дождь.png";
    case "В отдельных районах местами небольшой дождь с грозой":
      return "В отдельных районах местами небольшой дождь с грозой.png";
    case "В отдельных районах местами небольшой снег с грозой":
      return "В отдельных районах местами небольшой снег с грозой.png";
    default:
      return "Облачно.png";
  }
};
const renderProperty = (properties) => {
  return Object.values(properties)
    .map((data) => {
      const { title, value, icon } = data;
      return `
            <li>
                <img src="img/icon/${icon}" alt="wind"  class="property-icon">
                <div class="property-info">
                    <div class="property-info-desc">${title}</div>
                    <div class="property-value">${value}</div> 
                </div>
            </li>`;
    })
    .join("");
};

const renderChanceRain = (nextFiveHours) => {
  let markup = "";
  for (let i = 0; i < 4; i++) {
    markup += `<li>
        <div class="rain-time">${nextFiveHours[i].time}</div>
        <div class="rain-level" >
            <div class="rain-percent" style="width:${nextFiveHours[i].chanceOfRain}%;"></div>
        </div>
        <div class="rain-percent-number">${nextFiveHours[i].chanceOfRain}%</div>
    </li>
        `;
  }
  return markup;
};

const markup = () => {
  const {
    properties,
    maxtemp,
    mintemp,
    temp,
    city,
    feelsLike,
    discription,
    condition,
    formattedTime,
    localTime,
  } = store;
  return `
    <head>
    <div class="top">
    <div class="city">
        <div class="city-subtitle">Weather Today in</div>
            <div class="city-title" id="city">
                <span>${city}</span>
            </div>
    </div>
<div class="temp-info">
    <div class="degree">
        <div class="temp-now"><h1>${Math.round(store.temp)}</h1></div>
        <div class="feels-like"><p>Ощущается как ${Math.round(
          store.feelsLike,
        )} </p></div>
    </div>
    <div class="desc">
        <div class="desc-icon"><img src="img/icon/day/${getImage(
          condition,
        )}" alt=""></div>
        <div class="desc-info">${condition}</div>
    </div>    
</div>

<div class="bottom">
    <div class="location-time">
        <div class="data">Местное время,</div>
        <div class="time">${formatTime(localTime)}</div>
    </div>
    <div class="max-min-temp">
        <div class="max-temp"> Днем ${maxtemp}</div>
        <div class="min-temp"> Ночью ${mintemp}</div>
    </div>
</div>
</div>
    </head>
    <div class="select-day">
    <a><button class="today">Сегодня</button></a>
   <a><button class="tommorow-btn">Завтра</button></a>
    <a><button class="next-day-btn">5 Дней</button></a>
    </div> 
    <main id="main" class="main">
        <div class="properties" id="properties">
        <ul>${renderProperty(properties)}
        </ul>
        </div> 
        <div class="hourly-forecast">
            <div class="title">
               <img src="img/icon/hourly.svg" alt="" class="title-icon">
                <div class="title-info">Прогноз по часам</div>
            </div>
            <div class="hourly-forecast-info">
            <ul>${renderHourlyForecast(nextFiveHours)}</ul>
        </div>
    </div>
           
        <div class="chance-of-rain"> 
            <div class="title">
                <img src="img/icon/rain.svg" alt="" class="title-icon">
                 <div class="title-info">Вероятность осадков</div>
             </div>
             <div class="chance-rain-level"> 
                <ul>${renderChanceRain(nextFiveHours)}</ul>
             </div>
        </div>
        <div class="sunrise-sunset">
            <div class="sunrise"></div>
            <div class="sunset"></div>
        </div>
    </main><div class="render-next"> 
    <div class="forecat-tommorow" id="forecat-tommorow">
    <div class="title">
        <img src="img/icon/rain.svg" alt="" class="title-icon">
        <div class="title-info">Прогноз на ${mappedNextDays.length}  дней</div>
    </div>
    <div class="tommorow-forecast-info">
                <ul>${renderNextDays(mappedNextDays)}</ul>
            </div>
    </div>
</div><div class="render-tommorow">
<div class="hourly-forecast">
<div class="title">
   <img src="img/icon/hourly.svg" alt="" class="title-icon">
    <div class="title-info">Прогноз на завтра</div>
</div>${renderTomorrowForecast(tommorowHorlyForecast, tommorow)}</div>

</div>


`;
};

const toggleClass = () => {
  popup.classList.toggle("active");
};

const renderComponent = () => {
  root.innerHTML = markup();
  const main = document.getElementById("main");
  const renderDaysBtn = document.querySelector(".next-day-btn");
  const renderDays = document.querySelector(".render-next");
  const tomorrowMarkup = document.querySelector(".render-tommorow");
  const city = document.getElementById("city");
  const today = document.querySelector(".today");
  const tomorrowBtn = document.querySelector(".tommorow-btn");
  city.addEventListener("click", toggleClass);
  tomorrowBtn.addEventListener("click", () => {
    main.style.display = "none";
    tomorrowMarkup.style.display = "block";
    renderDays.style.display = "none";
  });
  today.addEventListener("click", () => {
    main.style.display = "block";
    tomorrowMarkup.style.display = "none";
  });
  renderDaysBtn.addEventListener("click", () => {
    renderDays.style.display = "block";
    main.style.display = "none";
    tomorrowMarkup.style.display = "none";
  });
};

const handleInput = (e) => {
  store = {
    ...store,
    city: e.target.value,
  };
};

const handleSumbit = (e) => {
  e.preventDefault();
  fetchData();
  toggleClass();
};

formSumbit.addEventListener("submit", handleSumbit);
textInput.addEventListener("input", handleInput);
fetchData();
