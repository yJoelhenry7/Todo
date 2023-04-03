const db = require("../models/index");
const app = require("../app");
const request = require("supertest");
let server, agent;
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
      const response = await agent.post("/todos").send({
        title: "Buy milk",
        dueDate: new Date().toISOString(),
        completed: false,
      });
      expect(response.statusCode).toBe(302);
    });

  });
  