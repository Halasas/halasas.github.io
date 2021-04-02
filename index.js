let serverURL = 'http://localhost:3000'
let currentUserID = 1

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
            console.error(error)
            processError(error) 
            return error;
        })
}

function getRequestURLbyCityname(name) {
    return `${serverURL}/weather/city?city=${name}`
}

function getRequestURLbyCoords(latitude, longitude) {
    return `${serverURL}/weather/coordinates?lat=${latitude}&long=${longitude}`
}


function processWeather(data, weatherContainer) {
    weatherContainer.querySelector("#name").innerHTML = data.name 
    weatherContainer.querySelector("#weather-icon").src = `https://openweathermap.org/img/wn/${data.weatherIcon}@4x.png`
    weatherContainer.querySelector("#temperature").innerHTML = Math.round(data.temperature) + "°C"
    
    weatherContainer.querySelector("#wind").innerHTML = `${data.windDirrection}deg ${data.wind} m/s`
    weatherContainer.querySelector("#sky-condition").innerHTML = data.skycondition
    weatherContainer.querySelector("#pressure").innerHTML = `${data.pressure} hpa`
    weatherContainer.querySelector("#humidity").innerHTML = `${data.humidity} %`
    weatherContainer.querySelector("#coordinates").innerHTML = `[${data.coordinates.lon}, ${data.coordinates.lat}]`
    toggleLoading(weatherContainer, "show")
}

function processError(error, weatherContainer) {
    toggleLoading(weatherContainer, "hide")
    weatherContainer.querySelector("#loading-text").innerHTML = `Something wrong... Uh... ${error}`
}

function toggleFavoriteErrorDisplay(mode, text) {
    let errorDisplay = document.querySelector("#error-display")
    let errorDisplayText = document.querySelector("#error-display-text")
    errorDisplayText.innerHTML = "Oops ... it seems that such a city does not exist or you are not connected to the Internet"
    if(mode == "show") {
        errorDisplay.classList.remove("hidden")
        if(text) {
            errorDisplayText.innerHTML = text
        }
    }
    else if (mode == "hide") {
        errorDisplay.classList.add("hidden")
    }
}

document.querySelector("#error-display button").addEventListener("click", evt => {
    toggleFavoriteErrorDisplay("hide")
})


function updateWeatherByGeoloc(weatherContainer) {
    navigator.geolocation.getCurrentPosition(
        position => {
        let url = getRequestURLbyCoords(position.coords.latitude, position.coords.longitude)
        console.log(url)
        requestWeather(url, 
            data => { 
                processWeather(data, weatherContainer)
            },
            error => {
                processError(error, weatherContainer)
            })
    },
    error => {
        requestWeather(getRequestURLbyCityname('Why'), 
        data => { 
            processWeather(data, weatherContainer)
        },
        error => {
            processError(error, weatherContainer)
        })
    })
}

document.querySelector("#geoloc-button").addEventListener("click", 
    evt => {updateWeatherByGeoloc(document.querySelector("#mainBlock"))})

function insertIntoDB(name, onSuccess, onFail) {
    console.log("insertIntoDB in process")
    fetch(`${serverURL}/favorites`, {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({ userID : currentUserID, city : name })
    }).then(response => {
        console.log("insertIntoDB in process")
        if(!response.ok || response.status == 202) {
            throw new Error(response.status)
        }
        onSuccess()
    }).catch(err => {
        console.error(err.message)
        onFail(err.message)
    })
}

function deleteFromDB(name, onSuccess, onFail) {
    fetch(`${serverURL}/favorites`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({ userID : currentUserID, city : name })
    }).then(response => {
        if(!response.ok) {
            throw new Error("" + response.status + response.statusText)
        }
        onSuccess()
    }).catch(err => {
        console.error(err.message)
        onFail(err.message)
    })
}

function addFavorite(name) {
    console.log("addFavorite")
    if(name == "") {
        return
    }
    let favoriteItem = favoriteTemplate.cloneNode(true).content.querySelector("#favorite-item")
    favoriteList.append(favoriteItem)
    toggleLoading(favoriteItem, "hide")

    requestWeather(getRequestURLbyCityname(name), data => { 
        processWeather(data, favoriteItem)
        toggleFavoriteErrorDisplay("hide")
        let button = favoriteItem.querySelector("#delete-button")
        button.addEventListener("click", evt => {
                button.disabled = true
                deleteFromDB(data.name, () => {
                    favoriteItem.remove()
                }, () => {
                    button.disabled = false
                    toggleFavoriteErrorDisplay("show", "Failed to remove city from favorites")
                })
            })
        toggleLoading(favoriteItem, "show")
        console.log("addFavorite complited")
    },
    error => {
        console.error(error)
        favoriteItem.remove()
        toggleFavoriteErrorDisplay("show")
    })
}

document.querySelector("#favorite-form").addEventListener("submit", 
    evt => {
        evt.preventDefault()
        toggleFavoriteErrorDisplay("hide")

        let input = document.querySelector("#favorite-form input")
        let value = input.value
        if(value == "") {
            return
        }
        input.value = ""

        insertIntoDB(value, () => {
            console.log("insert complited")
            addFavorite(value)
        }, (status) => {
            if(status == 202) {
                toggleFavoriteErrorDisplay("show", "The city has already been added to favorites")
            }
            else {
                toggleFavoriteErrorDisplay("show")
            }
        })
    })

function onStart() {
    let main = mainBlock
    toggleLoading(main, "hide")
    updateWeatherByGeoloc(main)
    fetch(`${serverURL}/favorites?userID=${currentUserID}`)
        .then(response =>{
        if(!response.ok) {
            throw new Error(response.status)
        } else {
            return response.json()
        }
    }).then(response => {
        response.forEach(record => {
            addFavorite(record.city)
        });
    }).catch(err => {
        console.error(err.message)
        toggleFavoriteErrorDisplay("show")
    })
    toggleFavoriteErrorDisplay("hide")
}
onStart()

