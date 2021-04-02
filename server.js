const express = require("express")
const cors = require("cors")
const weatherAPI = require("./openweatherAPI")
const db = require("./dbModule");

const app = express()
app.use(cors())
app.use(express.json())

function processGetWeather(request, response) {
    weatherAPI.getWeather(request.query, (result) => {
        console.log(`onSuccess: ${JSON.stringify(result)}`)
        response.send(result)
    }, (error) => {
        console.log(`onFail: ${JSON.stringify(error)}`)
        response.sendStatus(error)
    })
}

app.get("/weather/coordinates", (request, response) =>
                processGetWeather(request, response))

app.get("/weather/city", (request, response) =>
                processGetWeather(request, response))

app.get("/favorites",(request, response) => {
    let userID = request.query.userID;
    try {
        db.load("favorites")
        db.forAll(`SELECT * FROM favorites WHERE userID=${userID}`, (rows) => {
            db.close()
            console.log(rows)
            response.status(200).send(JSON.stringify(rows))
        })
    } catch(error) {
        db.close()
        response.status(404).send(JSON.stringify(error))
    }
})


app.post("/favorites",(request, response) => {
    console.log("POST " + request.url)
    try{
        weatherAPI.getWeather(request.body, (result)=>{
            let userID = request.body.userID;
            let city = result.name;
            db.load("favorites")
            db.forAll(`SELECT 1 FROM favorites WHERE userID = ${userID} AND city = '${city}'`, (rows) => {
                if(rows.length > 0) {
                    response.sendStatus(202)
                }
                else {
                    db.run(`INSERT INTO favorites ( userID, city ) 
                    VALUES ( ${userID}, '${city}' )`, () => {
                        console.log("POST 200")
                        response.sendStatus(200)
                    })
                }
                db.close()
            })
        }, (error)=>{
            console.error(error.message)
            response.sendStatus(error.message)
        })
    } catch (error) {
        db.close()
        response.status(404).send(JSON.stringify(error))
    }
})


app.delete("/favorites",(request, response) => {
    console.log("DELETE " + request.url)
    let userID = request.body.userID;
    let city = request.body.city;
    try{
        db.load("favorites")
        db.run(`DELETE FROM favorites WHERE userID = ${userID} AND city = '${city}'`, () => {
            db.close()
            response.sendStatus(200)
        })
    } catch (error) {
        console.error(error)
        response.status(404).send(JSON.stringify(error))
    }
})

app.listen(3000);


db.load("favorites")
// db.run("DELETE FROM favorites WHERE userID=1", ()=>{})
db.forAll(`SELECT * FROM favorites`, (rows) => {
    console.log(rows)
})
db.close() 