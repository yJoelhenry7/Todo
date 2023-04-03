const db = require("../models/index");
const app = require("../app");
const request = require("supertest");
const cheerio = require("cheerio");
let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
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
    // add todo test
    test("create a todo", async () => {
      const res = await agent.get("/");
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
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.DT.length;
    const latestTodo = parsedGroupedResponse.DT[dueTodayCount - 1];
    
    res = await agent.get("/");
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
      let res = await agent.get("/");
      let csrfToken = extractCsrfToken(res);
      await agent.post("/todos").send({
        title: "Buy milk",
        dueDate: new Date().toISOString(),
        completed: false,
        "_csrf": csrfToken,
      });
      const groupedTodosResponse = await agent
        .get("/")
        .set("Accept", "application/json");
      const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
      const dueTodayCount = parsedGroupedResponse.DT.length;
      const latestTodo = parsedGroupedResponse.DT[dueTodayCount - 1];
      
      res = await agent.get("/");
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
  