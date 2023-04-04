const { response } = require("express");
const express = require("express");
const { request } = require("http");
const app = express();
const { Todo,User } = require("./models");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const path = require("path");
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:false}));
var date = new Date();
var rdate = date.toISOString().split('T')[0];
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const e = require("express");
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.get("/", async (request, response) => {
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
      response.render("index", {
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

app.get("/todos", async (request, response) => {
  console.log("Todo List");
  try {
    const todo = await Todo.findAll();
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/signup",(request,response) =>{
  response.render("signup",{
    csrfToken: request.csrfToken(),
  });
})
app.post("/users",async(request,response)=>{
   console.log(request.body.firstName)
  //  Have to create the user 
  try {
    const user = await User.create({
      firstName : request.body.firstName,
      lastName : request.body.lastName,
      email:request.body.email,
      password:request.body.password,
    });
    response.redirect("/");
  } catch (error) {
    console.log(error);
  }

})

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

module.exports = app;
