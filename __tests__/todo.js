const db = require("../models/index");
const app = require("../app");
const request = require("supertest");
const cheerio = require("cheerio");
let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
const login = async (agent,username,password)=>{
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email:username,
    password:password,
    _csrf:csrfToken,
  });
};

describe("List the todo items", function () {
    beforeAll(async () => {
      await db.sequelize.sync({ force: true });
      server = app.listen(4000, () => {});
      agent = request.agent(server);
    });
    afterAll(async () => {
      await db.sequelize.close();
      server.close();
    });

    // signup test
    test("Sign up", async()=>{
      let res = await agent.get("/signup");
      const csrfToken = extractCsrfToken(res);
      res = await agent.post("/users").send({
        firstName : "Test",
        lastName : "User",
        email : "user.a@test.com",
        password:"12345678",
        _csrf:csrfToken,
      });
      expect(res.statusCode).toBe(302);
    });
    // signout test
    test("Sign out",async()=>{
      let res = await agent.get("/todos");
      expect(res.statusCode).toBe(200);
      res = await agent.get("/signout");
      expect(res.statusCode).toBe(302);
      res = await agent.get("/todos");
      expect(res.statusCode).toBe(302);
    });

    // add todo test
    test("create a todo", async () => {
      let agent = request.agent(server);
      await login(agent,"user.a@test.com","12345678");
      const res = await agent.get("/todos");
      const csrfToken = extractCsrfToken(res);
      const response = await agent.post("/todos").send({
        title: "Buy milk",
        dueDate: new Date().toISOString(),
        completed: false,
        "_csrf": csrfToken,
      });
      expect(response.statusCode).toBe(302);
    });

  // mark todo as complete test
  test("Mark a todo as complete", async () => {
    let agent = request.agent(server);
    await login(agent,"user.a@test.com","12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.DT.length;
    const latestTodo = parsedGroupedResponse.DT[dueTodayCount - 1];
    
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const markCompleteResponse = await agent
    .put(`/todos/${latestTodo.id}`)
    .send({
      completed : true,
     "_csrf": csrfToken,
    });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
    // Delete a Todo test
    test("Delete a Todo", async () => {
      let agent = request.agent(server);
      await login(agent,"user.a@test.com","12345678");
      let res = await agent.get("/todos");
      let csrfToken = extractCsrfToken(res);
      await agent.post("/todos").send({
        title: "Buy milk",
        dueDate: new Date().toISOString(),
        completed: false,
        "_csrf": csrfToken,
      });
      const groupedTodosResponse = await agent
        .get("/todos")
        .set("Accept", "application/json");
      const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
      const dueTodayCount = parsedGroupedResponse.DT.length;
      const latestTodo = parsedGroupedResponse.DT[dueTodayCount - 1];
      
      res = await agent.get("/todos");
      csrfToken = extractCsrfToken(res);
      const deleteTodo = await agent
      .delete(`/todos/${latestTodo.id}`)
      .send({
       "_csrf": csrfToken,
      });
      const parsedUpdateResponse = JSON.parse(deleteTodo.text);
      expect(parsedUpdateResponse.success).toBe(true);
    });
  });
  