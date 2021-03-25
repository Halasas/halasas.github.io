let APIKey="6759acba74d5a9f3fed19e25654c7484"

function toggleLoading(element, mode) {
    let loading=element.querySelector("#loading")
    let information=element.querySelector("#information")
    let detailed=element.querySelector("#detailed-information")

    if(mode == "show") {
        loading.classList.add("hidden")
        information.classList.remove("hidden")
        detailed.classList.remove("hidden")
    }
    else if(mode == "hide") {
        loading.classList.remove("hidden")
        information.classList.add("hidden")
        detailed.classList.add("hidden")
    }
}

function getRequestURLbyCityname(name) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${APIKey}&units=metric`
}

function getRequestURLbyCoords(position) {
    console.log(position)
    let latitude = position.coords.latitude
    let longitude = position.coords.longitude
    return `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKey}&units=metric`
}

function requestWeather(requestUrl, processWeather, processError) {
    fetch(requestUrl)
        .then(response => {
            if(!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`)
            }
            return response.json()
        })
        .then( response => {
            processWeather(response)
        })
        .catch(error => {
            processError(error) 
            return error;
        })
}


function processWeather(data, weatherContainer) {
    weatherContainer.querySelector("#name").innerHTML = data.name 
    weatherContainer.querySelector("#weather-icon").src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`
    weatherContainer.querySelector("#temperature").innerHTML = Math.round(data.main.temp) + "°C"
    
    weatherContainer.querySelector("#wind").innerHTML = `${data.wind.deg}deg ${data.wind.speed} m/s`
    weatherContainer.querySelector("#sky-condition").innerHTML = data.weather[0].description
    weatherContainer.querySelector("#pressure").innerHTML = `${data.main.pressure} hpa`
    weatherContainer.querySelector("#humidity").innerHTML = `${data.main.humidity} %`
    weatherContainer.querySelector("#coordinates").innerHTML = `[${data.coord.lon}, ${data.coord.lat}]`
    toggleLoading(weatherContainer, "show")
}

function processError(error, weatherContainer) {
    toggleLoading(weatherContainer, "hide")
    weatherContainer.querySelector("#loading-text").innerHTML = `Something wrong... Uh... ${error}`
}

function updateWeatherByGeoloc(weatherContainer) {
    navigator.geolocation.getCurrentPosition(
        position => {
        let url = getRequestURLbyCoords(position)
        requestWeather(url, 
            data => { 
                processWeather(data, weatherContainer)
            },
            error => {
                processError(error, weatherContainer)
            })
        return true;
    },
    error => {
        updateWeatherByName("Why", weatherContainer)
        return false;
    })
}

document.querySelector("#geoloc-button").addEventListener("click", 
    evt => {updateWeatherByGeoloc(document.querySelector("#main-block"))})

function updateWeatherByName(name, weatherContainer) {
    requestWeather(getRequestURLbyCityname(name), 
    data => { 
        processWeather(data, weatherContainer)
        return true;
    },
    error => {
        processError(error, weatherContainer)
        return false;
    })
}

function start() {
    let main = document.querySelector("#main-block")
    toggleLoading(main, "hide")
    updateWeatherByGeoloc(main)
}
start()