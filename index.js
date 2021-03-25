let APIKey="6759acba74d5a9f3fed19e25654c7484"
let favoriteNames = []

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
    weatherContainer.querySelector("#weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`
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
    },
    error => {
        requestWeather(getRequestURLbyCityname("saint petersburg"), 
        data => { 
            processWeather(data, weatherContainer)
        },
        error => {
            processError(error, weatherContainer)
        })
    })
}

document.querySelector("#geoloc-button").addEventListener("click", 
    evt => {updateWeatherByGeoloc(document.querySelector("#main-block"))})


function addToLocalStorage(name) {
    favoriteNames.push(name)
    localStorage.setItem("favoriteNames", JSON.stringify(favoriteNames))
}

function removeFromLocalStorage(name) {
    favoriteNames.splice(favoriteNames.indexOf(name), 1)
    localStorage.setItem("favoriteNames", JSON.stringify(favoriteNames))
}

function addFavorite(name) {
    if(name == "") {
        return
    }
    let favoriteItem = favoriteTemplate.cloneNode(true).content.querySelector("#favorite-item")
    toggleLoading(favoriteItem, "hide")
    favoriteItem.querySelector("#delete-button").addEventListener("click",
        evt => {
            favoriteItem.remove()
            removeFromLocalStorage(name)
        })
    localStorage
    favoriteList.append(favoriteItem)
    requestWeather(getRequestURLbyCityname(name), 
    data => { 
        processWeather(data, favoriteItem)
        console.log(name)
    },
    error => {
        favoriteItem.remove()
        removeFromLocalStorage(name)
    })
}

document.querySelector("#favorite-form").addEventListener("submit", 
    evt => {
        evt.preventDefault()
        let input = document.querySelector("#favorite-form input")
        addFavorite(input.value)
        addToLocalStorage(input.value)
        input.value = ""
    })

function onStart() {
    let main = mainBlock
    toggleLoading(main, "hide")
    updateWeatherByGeoloc(main)
    if(localStorage.getItem("favoriteNames") != null) {
        favoriteNames = JSON.parse(localStorage.getItem("favoriteNames"))
    }
    favoriteNames.forEach(name => {
        addFavorite(name)
    })
    console.log(favoriteNames)

}
onStart()