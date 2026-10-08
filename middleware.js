const jwt = require("jsonwebtoken");

function authMiddleware(req,res,next){
    const token = req.headers.token;
    const decoded = jwt.verify(token, "thejus123");


    // const token = req.headers.token || req.headers.authorization?.replace("Bearer ", "");

    // if(!token){
    //     return res.status(401).json({
    //         message:"token invalid or not found"
    //     })
    // }

    // try {
    //     const decoded = jwt.verify(token, "thejus123");
    if(decoded.userId){
        // Keep userId as a string to match Mongo ObjectId (or string) stored on todos
        req.userId = decoded.userId;
        next()
    }
    else{
        res.status(403).json({
            message:"token invalid or not found"
        })
    }
}

module.exports = {
    authMiddleware : authMiddleware
}