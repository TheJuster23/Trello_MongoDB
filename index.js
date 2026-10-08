const express = require("express");
const {authMiddleware} = require("./middleware");
const jwt = require("jsonwebtoken")
const {userModel , todoModel, organizationModel} = require("./model.js")

// let CURRENT_TODO_ID = 1;
// let CURRENT_USER = 1;


// let USERS = [];
// let TODOS = [];

const app = express();
app.use(express.json())
app.post("/signup",async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    // const userExist = USERS.find(u => u.username === username);
    const existingUser = await userModel.findOne({
        username: username,
        password: password
    })
    if(existingUser){
        res.status(403).json({
            message: "user already exist"
        });
        return;
    }

    const newUser =await userModel.create({
        username: username,
        password: password
    })

    // USERS.push({
    //     id : CURRENT_USER++,
    //     username : username,
    //     password : password
    // })
    res.json({
        id: newUser._id

    })


})

app.post("/signin", async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const userExist =  await  userModel.findOne({
        username: username,
        password: password
    });
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

app.post("/add-member-to-organization", authMiddleware, async(req,res)=>{
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memberUsername = req.body.memberUsername;
    try {
        const organization = await organizationModel.findById(organizationId);

        if (!organization || organization.admin.toString() !== userId){
            return res.status(403).json({
                message: "Organization doesn't exist or you are not its admin"
            });
        }

        const memberUser = await userModel.findOne({ username: memberUsername });
        if(!memberUser){
            return res.status(404).json({
                message: "Member user not found"
            });
        }

        await organizationModel.updateOne({
            _id: organizationId
        },{
            "$addToSet": {
                "members": memberUser._id
            }
        });

        return res.json({
            message: "Member added to organization"
        });
    } catch (error) {
        console.error("Failed to add organization member:", error);
        return res.status(500).json({
            message: "Failed to add member to organization"
        });
    }
})


app.post("/organization", authMiddleware, async(req,res)=>{
    const userId =  req.userId;

    const organization = await organizationModel.create({
        title : req.body.title,
        description: req.body.description,
        admin: userId,
        members : []
    })

    res.json({
        message: "Org created",
        id: organization._id
    })
})

app.get("/organization", authMiddleware, async(req,res)=>{
    userId = req.userId;
    const organizationId = req.query.organizationId;
    const organization =await  organizationModel.findOne({
        _id: organizationId
    });
    if (!organization || organization.admin.toString() !== userId){
        res.status(411).json({
            message: "oraganinzation doesnt exist or you are not the admin of the account"
        });
        return
    }

    const members =  await userModel.find({
        _id: organization.members
    })

    res.json({
        organization: organization.title,  //todo:????
        description: organization.description,
        members: members.map(m=>({
            username: m.username,
            id: m._id
        }))
    })


})

app.post("/todo",authMiddleware, (req,res)=>{
    const userId = req.userId;
    const title = req.body.title;
    const description = req.body.description;
    

    const newTodo = todoModel.create({
        userId: userId,
        title: title,
        description: description
    })
    // TODOS.push({
    //     id:CURRENT_TODO_ID++,
    //     title:title,
    //     description: description,
    //     userId:userId
    // })
    res.json({
        message: "Todo made"
    })
     
})

app.delete("/todo/:todoId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const todoId = req.params.todoId;

    try {
        const deletedTodo = await todoModel.findOneAndDelete({
            _id: todoId,
            userId: userId
        });

        if (!deletedTodo) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        return res.json({
            message: "Deleted"
        });
    } catch (error) {
        return res.status(400).json({
            message: "Invalid todo ID"
        });
    }
});


app.delete("/members", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memberUsername = req.body.memberUsername;

    try {
        const organization = await organizationModel.findById(organizationId);

        if (!organization || organization.admin.toString() !== userId) {
            return res.status(403).json({
                message: "Organization doesn't exist or you are not its admin"
            });
        }

        const memberUser = await userModel.findOne({ username: memberUsername });
        if (!memberUser) {
            return res.status(404).json({
                message: "Member user not found"
            });
        }

        const result = await organizationModel.updateOne(
            { _id: organizationId },
            { $pull: { members: memberUser._id } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                message: "Member is not in this organization"
            });
        }

        return res.json({
            message: "Member deleted"
        });
    } catch (error) {
        console.error("Failed to delete organization member:", error);
        return res.status(500).json({
            message: "Failed to delete member"
        });
    }
});



app.get("/todo",authMiddleware,(req,res)=>{
    const userId = req.userId;
    const userTodos = TODOS.filter(t => t.userId == userId);
    res.json({
        todos: userTodos
    })

})

app.listen(3000);