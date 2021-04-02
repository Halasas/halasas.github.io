const fetch = require("node-fetch");

let APIKey="6759acba74d5a9f3fed19e25654c7484"

function getRequestURLbyCityname(name) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${APIKey}&units=metric`
}

function getRequestURLbyCoords(lat, long) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APIKey}&units=metric`
}

function getWeather(data, onSuccess, onFail) {
    let url = ""
    if("city" in data) {
        url = getRequestURLbyCityname(data.city)
    }
    else {
        url = getRequestURLbyCoords(data.lat, data.long)
    }

    console.log(encodeURI(url))
    fetch(encodeURI(url))
        .then(response => {
            if(!response.ok) {
                throw new Error(response.status)
            }
            return response.json()
        })
        .then(response => {
            onSuccess({
                name : response.name ,
                weatherIcon : response.weather[0].icon,
                temperature : response.main.temp,
                
                windDirrection : response.wind.deg,
                wind: response.wind.speed,
                skycondition : response.weather[0].description,
                pressure : response.main.pressure,
                humidity : response.main.humidity,
                coordinates : { lon : response.coord.lon, lat : response.coord.lat}
            })
        })
        .catch(error => {
            onFail(error.message)
        })
}

module.exports = {
    getWeather : (data, onSuccess, onFail) => getWeather(data, onSuccess, onFail)
}