const { response } = require("express");
const express = require("express");
const { request } = require("http");
const app = express();
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const path = require("path");
var date = new Date();
var rdate = date.toISOString().split('T')[0];
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const e = require("express");
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const localStrategy = require('passport-local');
const { error } = require("console");
const bcrypt = require('bcrypt');
const saltRounds = 10;
// set ejs as a View Engine
app.set("view engine", "ejs");
// middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:false}));
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(session({
  secret:"my-super-secret-key-21728172615261562",
  cookie:{
    maxAge:24 * 60 * 60 * 1000 //24 hours
  }
}))
app.use(passport.initialize());
app.use(passport.session());

// Authentication Strategy for passport
passport.use(new localStrategy({
   usernameField: 'email',
   passwordField:'password'
}, (username,password,done)=>{
  User.findOne({where: {email:username,password:password}})
  .then((user)=>{
    return done(null,user)
  }).catch((error)=>{
    return (error)
  })
}))
// Sereializing user information
passport.serializeUser((user,done)=>{
  console.log("Serializing user in session", user.id)
  done(null,user.id)
})
// deserializing user information
passport.deserializeUser((id,done)=>{
  User.findByPk(id)
  .then(user =>{
    done(null,user)
  })
  .catch((error)=>{
    done(error,null)
  })
})

const { Todo,User } = require("./models");

// ports
app.get("/", async (request, response) => {
   response.render("index",{
    title:"Todo Application",
    csrfToken:request.csrfToken(),
   });
});

app.get("/todos",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const complete = await Todo.getCompleted();
  Todo.findAll().then((todos) => {
    var overDue = [];
    var dueToday = [];
    var dueLater = [];
    todos.map(async (todo) => {
      if (todo.dataValues.dueDate < rdate) {
        await overDue.push(todo.dataValues);
      } else if (todo.dataValues.dueDate === rdate) {
        await dueToday.push(todo.dataValues);
      } else if(todo.dataValues.dueDate > rdate){
        await dueLater.push(todo.dataValues);
      }
    });
    if (request.accepts("html")) {
      response.render("todos", {
        OD: overDue,
        DL: dueLater,
        DT: dueToday,
        complete : complete,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        OD: overDue,
        DL: dueLater,
        DT: dueToday,
      });
    }
  });
});
app.post("/todos", async (request, response) => {
  // console.log("Creating a Todo", request.body);
  try {
      await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    return response.redirect("/")
  } catch (error) {
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async (request, response) => {
  console.log("We Have to Update a todo With ID:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async(request, response) => {
  console.log("Delete a todo by ID :", request.params.id);
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error);
  }
});

// -------------------------------------Signup Route--------------------------------------
app.get("/signup",(request,response) =>{
  response.render("signup",{
    csrfToken: request.csrfToken(),
  });
})
app.post("/users",async(request,response)=>{
  // Hash password using bcrypt
   const hashedPwd = await bcrypt.hash(request.body.password,saltRounds);
  //  Have to create the user 
  try {
    const user = await User.create({
      firstName : request.body.firstName,
      lastName : request.body.lastName,
      email:request.body.email,
      password:hashedPwd,
    });
    request.logIn(user,(err)=>{
      if(err){
        console.log(err);
      }
      response.redirect("/todos");
    })
  } catch (error) {
    console.log(error);
  }
})
// --------------------------------------------------------------------------------------

module.exports = app;
