// https://github.com/londonappbrewery/Authentication-Secrets/
require("dotenv").config();
const express= require("express");
const mongoose= require("mongoose");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");

const app= express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(express.static("views"));

mongoose.set("strictQuery", true);
const url = "mongodb://127.0.0.1:27017/userDB";
mongoose.connect(url, {useNewUrlParser: true});

const userSchema = new mongoose.Schema(
    {
        email: String,
        password: String
    }
);

// // const secret = "secretCipher";
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res)=>{
    res.render("home");
});
app.get("/login", (req, res)=>{
    res.render("login");
});
app.get("/register", (req, res)=>{
    res.render("register");
});

app.post("/register", (req, res)=>{
    User.findOne({email: req.body.username}, (err, result)=>{
        if(err) res.send(err);
        else{
            if(result) res.send("Username already exists");
            else{
                const newUser = new User({
                    email : req.body.username,
                    password : md5(req.body.password)
                });

                newUser.save((err)=>{
                    if(err)
                        res.send(err)
                    else
                        res.render("secrets");
                });
            }
        }
    });
});

app.post("/login", (req, res)=>{
    User.findOne({email : req.body.username}, (err, result)=>{
        if(err) res.send(err);
        else{
            if(result){
                if(result.password === md5(req.body.password)){
                    res.render("secrets");
                }
                else{
                    res.send("Wrong password");
                }
            } else{
                res.send("User doesn't exist");
            }
        }
    });
});

app.listen(80, ()=>console.log("Server started on port 80"));