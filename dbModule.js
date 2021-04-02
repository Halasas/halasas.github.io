const sqlite3 = require("sqlite3").verbose()

let db = new Object()

function load(name) {
    db = new sqlite3.Database(`./${name}.db`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if(err) {
            console.error(err)
        }
    })
    console.log(`Connected to the ${name} database.`);
    return db;
}

function run(sql, callback) {
    db.serialize(() => {
        db.run(sql)
        callback()
    })
    return db;
}

function close() {
    db.close((error) => {
        if (error) {
            console.error(error.message)
            throw new Error(error.message)
        }
    });
}

function forEach(sql, func) {
    db.serialize(() => {
        db.each(sql, (error, row) => {
            if(error) {
                console.error(error.message)
                throw new Error(error.message)
            }
            else {
                func(row)
            }
        })
    })
}

function forAll(sql, func) {
    db.serialize(() => {
        db.all(sql, (error, rows) => {
            if(error) {
                console.error(error)
                throw new Error(error)
            }
            else {
                func(rows)
            }
        })
    })
}

module.exports = {
    load : (name) => load(name),
    close : (sql) => close(sql),
    run: (sql, callback) => run(sql, callback),
    forEach : (sql, func) => forEach(sql, func),
    forAll : (table, func) => forAll(table, func)
}

load("favorites")
// run("INSERT INTO favorites ( userID, city ) VALUES( 1, 'Lol')")
// run("INSERT INTO favorites ( userID, city ) VALUES( 1, 'Lel')")
// run("INSERT INTO favorites ( userID, city ) VALUES( 1, 'Lal')")

// run("INSERT INTO favorites ( userID, city ) VALUES ( 2, 'Sas')")
// run("INSERT INTO favorites ( userID, city ) VALUES ( 2, 'Ses')")
// run("INSERT INTO favorites ( userID, city ) VALUES ( 2, 'Sus')")

// forAll("favorites", (row) => console.log(row))
// forEach("SELECT * FROM favorites WHERE userID = 2", (row) => console.log(row))

close()
