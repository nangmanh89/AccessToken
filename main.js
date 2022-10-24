let http = require("http");
require("dotenv").config()
let fs = require("fs")
let axios = require("axios")
let url = require("url")
let jwt = require("jsonwebtoken");
let bcrypt = require('bcrypt')
let token = require("./generateToken/createToken");
const { readFile } = require("fs/promises");
// bcrypt.hash(process.env.USERPASS, 10, function(err, hash) {
//    console.log(hash);
// });

let service = http.createServer(function (req, res) {
    if (req.method === 'GET') {
        //   console.log(req.headers.reaccesstoken);  
        switch (req.url) {
            case "/list-Car":
                listCar(req, res)
                break
            default:
                res.writeHead(404, { 'Content-Type': 'application/json' })
                res.end("404 not found!!!")
        }
    } else if (req.method === 'POST') {
        switch (req.url) {
            case "/login":
                login(req, res)
                break
            case "/refreshToken":
                reToken(req, res)
                break
            default:
                res.writeHead(404, { 'Content-Type': 'application/json' })
                res.end("404 not found!!!")
        }
    }
}
);

let Port = parseInt(process.env.PORT, 10) || 8956
service.listen(
    Port,
    console.log(
        `service on: http://localhost:${Port}`
    )
);


function getData(req) {
    return new Promise((resolve, reject) => {
        req.on("data", (chunk) => {
            let str = decodeURIComponent(escape(String.fromCharCode(...chunk)))
            resolve(JSON.parse(str))
        });
    })
}

//Check pass user entered 
let decodePass = (passUserInput) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(passUserInput, process.env.USERPASS, function (err, result) {
            resolve(result)
        })
    })
}
//get userInfo at sever
let infoClient = () => {
    return new Promise((res, rej) => {
        fs.readFile('user.json', "utf-8", function (err, data) {
            res(data)
        })
    })
}

//get refeshToken at sever 
let useReToken = () => {
    return new Promise((res, rej) => {
        fs.readFile('tokenUser.json', "utf-8", function (err, data) {
            res(data)
        })
    })
}
// Save tokenUSer
let saveToken = (data) => {
    return new Promise((res, rej) => {
        fs.writeFile("./tokenUser.json", `${data}`, function (data) {
            res(data)
        })
    })
}


// login and creatToken for client
async function login(req, res) {
    let data = await getData(req)
    // Check passWord User 
    let valuePass = await decodePass(data.pass)
    let getRegisInfo = JSON.parse(await infoClient())
    if (data.user === getRegisInfo.email && valuePass === true) {
        // Create accesToken and refeshToken for client
        let accesToken = await token.generateToken(getRegisInfo, process.env.SECRETSIGN, "6000");
        let refeshToken = await token.generateToken(getRegisInfo, process.env.SECRETSIGN, "360d");
        let tokenList = JSON.stringify({ accesToken, refeshToken })
        await saveToken(tokenList)
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(tokenList)
    } else { console.log('ERR EMAIL OR PASSWORD'); }
}

// Used accessToken to get result (List - Car)
async function listCar(req, res) {
    let verify = await token.verifyToken(req.headers.reaccesstoken, process.env.SECRETSIGN)
    let userInfo = JSON.parse(await infoClient())
    if (verify.data.name === userInfo.name && verify.data.email === userInfo.email) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end("Show list Car for client");
    } else ("Token ERR OR Expired")
}

// In case Token expired (Client send request with refeshToken and server returns the new token)
async function reToken(req, res) {
    let data = await getData(req)
    let verify = await token.verifyToken(data.refeshToken, process.env.SECRETSIGN)
    let userInfo = JSON.parse(await infoClient())
    if (verify.data.name === userInfo.name && verify.data.email === userInfo.email) {
        let getRegisInfo = JSON.parse(await infoClient())
        let accesToken = await token.generateToken(getRegisInfo, process.env.SECRETSIGN, "6000");
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(accesToken);
    } else ("reEnter refeshToken")
}

