const { request, response } = require("express");
const express = require("express");
const app = express();
const { User , coursesCreated , coursesEnrolled } = require("./models");

const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs"); //we are not using plain html
app.set("views", path.join(__dirname, "views"));

app.get("/", (request, response) => {
  response.render("index");
});

app.post("/users", async (request, response) => {
  await console.log(request);
  const hashedPwd = await bcrypt.hashSync(request.body.password, saltRounds);
  try {
    const user = await User.create({
      name: request.body.name,
      email: request.body.email,
      password: hashedPwd,
      role: request.body.role,
    });
    response.json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/course",async(request,response)=>{
    try{
        const course = await coursesCreated.create({
        courseName:request.body.courseName,
        educatorId:request.body.educatorId
        });
        response.json(course);
    }catch(err){
        console.log(err);
    }

})

module.exports = app;
