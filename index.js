const express = require("express");
const {authMiddleware} = require("./middleware");
const jwt = require("jsonwebtoken")

let CURRENT_TODO_ID = 1;
let CURRENT_USER = 1;


let USERS = [];
let TODOS = [];

const app = express();
app.use(express.json())
app.post("/signup", (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const userExist = USERS.find(u => u.username === username);
    if(userExist){
        res.status(403).json({
            message: "user already exist"
        });
        return;
    }

    USERS.push({
        id : CURRENT_USER++,
        username : username,
        password : password
    })
    res.json({
        id: CURRENT_USER-1

    })


})

app.post("/signin", (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const userExist = USERS.find(u => u.username === username);
    if(!userExist){
        res.status(403).json({
            message: "Incorrect Message"
            
        })
        return
    }
    const token = jwt.sign({
        userId: userExist.id, // lost a lot of time cause it was userExist.username
    },"thejus123");
    res.json({
        token
    })

})

app.post("/todo",authMiddleware, (req,res)=>{
    const userId = req.userId;
    const title = req.body.title;
    const description = req.body.description;
    TODOS.push({
        id:CURRENT_TODO_ID++,
        title:title,
        description: description,
        userId:userId
    })
    res.json({
        message: "Todo made"
    })
     
})

app.delete("/todo/:todoId", authMiddleware, (req, res)=>{
    const userId = req.userId;
    const todoId = parseInt(req.params.todoId);

    const todoIndex = TODOS.findIndex(t => t.userId === userId && t.id === todoId);
    if(todoIndex !== -1){
        TODOS.splice(todoIndex, 1);
    // const todoIndex = TODOS.findIndex(t => t.userId === userId && t.id === todoId);
    // if(todoIndex !== -1){
    //     TODOS.splice(todoIndex, 1);
        res.json({
            message: "Deleted"
        })
    }
    else{
        res.status(403).json({
            message: "its not your todo or todo doesnt exist"
        })
    }
})


app.get("/todo",authMiddleware,(req,res)=>{
    const userId = req.userId;
    const userTodos = TODOS.filter(t => t.userId == userId);
    res.json({
        todos: userTodos
    })

})

app.listen(3000);