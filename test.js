let jwt = require("jsonwebtoken")
require("dotenv").config()
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjAzOS0zODQtOTEwIiwibmFtZSI6Ik3huqFuaCIsImVtYWlsIjoibmFuZ21hbmg4OUB5YWhvby5jb20ifSwiaWF0IjoxNjY2NTkyNjQxLCJleHAiOjE2OTc2OTY2NDF9.hgsj-BXKLgHomhD9zBUBZId7RtslVOzwDBskaBrMWGM"
let verifyToken = (token, secretKey) => {
   return new Promise((resolve, reject) => {
     jwt.verify(token, secretKey, (error, decoded) => {
       if (error) {
         return reject(error);
       }
       resolve(decoded);
     });
   });
 }
console.log(process.env.SECRETSIGN);
 async function da(){
   let re = await verifyToken(token,process.env.SECRETSIGN)
   console.log(re);
 }

 
//    var decoded = jwt.decode(token);
 
// // get the decoded payload and header
// var decoded = jwt.decode(token, {complete: true});
// console.log(decoded.header);
// console.log(decoded.payload.data)

