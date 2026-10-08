const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
// ... rest of your file


const MONGO_URI ="";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        // Do not crash the process here; allow caller to handle or retry.
    });

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}
})

const todoSchema = new mongoose.Schema({
    title: {type: String},
    description: {type: String},
    userId: { type: String, required: true } // Store userId as a string to match Mongo ObjectId (or string) stored on todos
});

const organizationSchema = new mongoose.Schema({
    title: {type: String},
    description: {type: String},
    admin: mongoose.Types.ObjectId,
    members: [mongoose.Types.ObjectId]


})

const userModel = mongoose.model("users", userSchema);
const todoModel = mongoose.model("todo", todoSchema);
const organizationModel = mongoose.model("organization", organizationSchema);

module.exports = {
    userModel: userModel,
    todoModel: todoModel,
    organizationModel: organizationModel
}