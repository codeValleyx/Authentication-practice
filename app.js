// https://github.com/londonappbrewery/Authentication-Secrets/
require("dotenv").config();
const express= require("express");
const mongoose= require("mongoose");
const session= require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app= express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(express.static("views"));

app.use(session(
    {
        secret: "alongsecretstringkey",
        resave: false,
        saveUninitialized: false
    }
));

app.use(passport.initialize());
app.use(passport.session());



mongoose.set("strictQuery", true);
const url = "mongodb://127.0.0.1:27017/userDB";
mongoose.connect(url, {useNewUrlParser: true});
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema(
    {
        email: String,
        password: String
    }
);

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res)=>{
    res.render("home");
});
app.get("/login", (req, res)=>{
    res.render("login");
});
app.get("/register", (req, res)=>{
    res.render("register");
});
app.get("/secrets", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/");
    }
});
app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err) res.send(err);
        res.redirect("/");
    });
});

app.post("/register", (req, res)=>{
    User.register({username: req.body.username}, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                // function works if authentication is successful
                res.redirect("/secrets");
            });
        }
    })           //function from passport-local-mongoose
});

app.post("/login", (req, res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                // function works if authentication is successful
                res.redirect("/secrets");
            });
        }
    }) // from passport
});

app.listen(80, ()=>console.log("Server started on port 80"));