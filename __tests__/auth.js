const request = require("supertest");
const cheerio = require("cheerio");
const app = require("../app");
const db = require("../models/index");

let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const signUp = async (agent, name, email, password, role) => {
  let res = await agent.get("/signup");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/api/users").send({
    name: name,
    email: email,
    password: password,
    role: role,
    _csrf: csrfToken,
  });
  return res;
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
  return res;
};

const logout = async (agent) => {
  let res = await agent.get("/signout");
  return res;
}

describe("course test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
     res = await agent.post("/api/user").send({
      name: "User A",
      email: "user.a@test.com",
      password: "12345678",
      role: "educator",
      _csrf: csrfToken,
    });
    console.log(res);
    expect(res._body.user.name).toBe("User A");
  });

  test("Sign out", async () => {
    let res = await agent.get("/educator");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    
  });

  test("create a course",async()=>{
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
     res = await agent.post("/api/user").send({
      name: "User A",
      email: "user.a@test.com",
      password: "12345678",
      role: "educator",
      _csrf: csrfToken,
    });
    console.log(res);
    expect(res._body.user.name).toBe("User A");
    res = await agent.post("/course").send({
      courseName: "course1",
      educatorId: res._body.user.id,
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(200);
  })

  test("enroll a course",async()=>{
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
     res = await agent.post("/api/user").send({
      name: "User A",
      email: "user.a@test.com",
      password: "12345678",
      role: "educator",
      _csrf: csrfToken,
    });
    console.log(res);
    expect(res._body.user.name).toBe("User A");
    res = await agent.post("/course").send({
      courseName: "course1",
      educatorId: res._body.user.id,
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/signup");
    const csrfToken2 = extractCsrfToken(res);
     res = await agent.post("/api/user").send({
      name: "User B",
      email: "user.b@test.com",
      password: "12345678",
      role: "student",
      _csrf: csrfToken2,
    });
    const studId = res._body.user.id;
    console.log(res);
    let res2 = await agent.get("/enroll").send({
      courseId: 1,
      userId: studId,
      courseName:"course1",
      _csrf: csrfToken2,
    });
    expect(res.statusCode).toBe(201);
  })
});

