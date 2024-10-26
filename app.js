const { request, response } = require("express");
const express = require("express");
const app = express();
const {
  User,
  coursesCreated,
  coursesEnrolled,
  chapter,
  page,
} = require("./models");

const path = require("path");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const passport = require("passport");

const cookieParser = require("cookie-parser");//csrf needs this..
const csrf = require("tiny-csrf");

const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const localStrategy = require("passport-local");

const saltRounds = 10;

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); //used to parse json data from body
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs"); //we are not using plain html
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "my-super-secret-key 423422409284294820948204",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24 hrs
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      const formRole = req.body.role;
      User.findOne({ where: { email: email } })
        .then(async (user) => {
          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          // Check password (use bcrypt.compare if passwords are hashed)
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid password" });
          }

          // Check role (assumes the role is provided in the request body)
          // Get role from DB
          if (formRole !== user.role) {
            return done(null, false, { message: "Role does not match" });
          }
          //console.log("authenticated successfully  returning");
          return done(null, user); // Authenticated successfully
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  //console.log("Serializing the user in session", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});
app.get("/", (request, response) => {
  response.render("index"); //csrf not required
});

app.get("/signup", (request, response) => {
  response.render("signup",{
    csrfToken:request.csrfToken(),  //csrf done
  });
});
 
app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken:request.csrfToken(),  //csrf done
  });
});

app.get("/signout", (request, response, next) => {
  //signout
  request.logout((err) => {
    if (err) {
      return;
    }
    response.redirect("/");
  });
});
// ----------------------------------------------
app.get(
  "/educator",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const userId = request.user.id;
    const userRole = request.user.role;
    const userName = request.user.name;
    const allCourses = await coursesCreated.findAll();
    const enrolledCourses = await coursesEnrolled.findAll({
      where: { studentId: request.user.id },
    });
    const enrolledCourseIds = enrolledCourses.map(
      (enrollment) => enrollment.courseId
    );
    const unenrolledCourses = allCourses.filter(
      (course) => !enrolledCourseIds.includes(course.id)
    );

    if (request.accepts("html")) {
      response.render("./educator/index", {
        enrolledCourses,
        unenrolledCourses,
        userName,
        userRole,
        allCourses,
        userId,
        csrfToken:request.csrfToken(),
      });
    } else {
      response.json({});
    }
  }
);

app.get(
  "/student",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const userId = request.user.id;
    const userRole = request.user.role;
    const userName = request.user.name;
    //console.log("userId", userId);
    if (request.accepts("html")) {
      response.render("./student/index", {
        userRole,
        userName,
        csrfToken:request.csrfToken(),
      });
    } else {
      response.json({});
    }
  }
);
// ----------------------------------------------
app.get("/create-course", async (request, response) => {
  const userRole = request.user.role;
  response.render("./educator/create-course", {
    userRole,
    csrfToken:request.csrfToken(),
  });
});

app.get("/create-chapter", async (request, response) => {
  const courseId = request.query.courseId;
  const userRole = request.user.role;

  response.render("./educator/create-chapter", {
    courseId,
    userRole,
    csrfToken:request.csrfToken(),
  });
});

app.get("/create-page", async (request, response) => {
  const chapterId = request.query.chapterId;
  const userRole = request.user.role;
  const courseId = request.query.courseId;
  console.log("chapterId", chapterId);
  console.log("courseId", request.query.courseId);
  const courseChapters = await chapter.findAll({
    where: { courseId: request.query.courseId },
  });
  response.render("./educator/create-page", {
    courseId,
    courseChapters,
    chapterId,
    userRole,
    csrfToken:request.csrfToken(),
  });
});

app.get("/mark-as-completed/:pageId", async (request, response) => {
  console.log("Hit the markAsCompleted route");
  const pageId = request.params.pageId;
  const pageToBeUpdated = await page.findByPk(pageId);

  if (pageToBeUpdated) {
    // Update the completed array by adding the user's ID
    pageToBeUpdated.completed = [...pageToBeUpdated.completed, request.user.id];
    await pageToBeUpdated.save();

    // Send a JSON success response instead of redirecting
    response.status(200).json({ success: true });
  } else {
    // If the page is not found
    response.status(404).json({ success: false, message: "Page not found" });
  }
});

//---------------------------------------------- the data center for fetch requests
app.get("/fetch-chapters/:courseId/:role", async (request, response) => {
  const allChapters = await chapter.findAll();
  const courseChapters = await chapter.findAll({
    where: { courseId: request.params.courseId },
  });
  response.json({ allChapters, courseChapters });
});

app.get("/show-courses", async (request, response) => {
  // Fetch courses created by the educator
  const createdCourses = await coursesCreated.findAll({
    where: { educatorId: request.user.id },
  });

  // Fetch the courses where the student is already enrolled
  const enrolledCourses = await coursesEnrolled.findAll({
    where: { studentId: request.user.id },
  });
  console.log("enrolledCourses", enrolledCourses);

  // Convert enrolledCourses into an array of course IDs
  const enrolledCourseIds = enrolledCourses.map((course) => course.courseId);

  // Fetch all courses available (coursesCreated)
  const allCourses = await coursesCreated.findAll();

  // Filter out the courses from createdCourses that the student has already enrolled in
  const unenrolledCourses = allCourses.filter(
    (course) => !enrolledCourseIds.includes(course.id)
  );

  //console.log("enrolledCourses", enrolledCourses);
  // Fetch all chapters
  const allChapters = await chapter.findAll();

  const userRole = request.user.role;
  const userName = request.user.name;
  const userId = request.user.id;

  // Render the page with all necessary data
  response.render("./show-courses", {
    userRole,
    userId,
    userName,
    allCourses,
    createdCourses,
    unenrolledCourses,
    enrolledCourses,
    allChapters,
    csrfToken:request.csrfToken(),
  });
});

app.get("/show-chapters", async (request, response) => {
  try {
    const userRole = request.user.role;
    const courseId = request.query.courseId;
    console.log("courseId", courseId);
    console.log(typeof courseId);
    const courseChapters = await chapter.findAll({
      where: { courseId: parseInt(courseId) },
    });
    console.log("courseChapters", courseChapters);
    const userName = request.user.name;

    const userCreatedCourses = await coursesCreated.findAll({
      where: { educatorId: request.user.id }, // assuming 'userId' field refers to the creator of the course
      attributes: ["id"], // only fetch course IDs
    });
    const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);

    response.render("./show-chapters", {
      userCreatedCourseIds,
      courseId,
      userRole,
      courseChapters,
      userName,
      csrfToken:request.csrfToken(),
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/show-pages/:chapterId/:role", async (request, response) => {
  try {
    //console.log("chapterId" + request.params.chapterId);
    const chapterId = request.params.chapterId;
    const userRole = request.params.role;
    const courseId = request.query.courseId;
    const userCreatedCourses = await coursesCreated.findAll({
      where: { educatorId: request.user.id }, // assuming 'userId' field refers to the creator of the course
      attributes: ["id"], // only fetch course IDs
    });
    const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);
    const chapterPages = await page.findAll({
      where: { chapterId: request.params.chapterId },
    });
    const enrolledCourse = await coursesEnrolled.findOne({
      where: { courseId, studentId: request.user.id },
    });
    const isEnrolled = enrolledCourse ? true : false;

    if (
      (userRole === "educator" &&
        userCreatedCourseIds.includes(parseInt(courseId))) ||
      isEnrolled
    ) {
      response.render("./show-pages", {
        userCreatedCourseIds,
        courseId,
        chapterId,
        userRole,
        chapterPages,
        csrfToken:request.csrfToken(),
      });
    } else if (userRole === "student" && isEnrolled) {
      // //console.log("Dear student you dont have access to this page");
      response.render("./show-pages", {
        courseId,
        chapterId,
        userRole,
        chapterPages,
        csrfToken:request.csrfToken(),
      });
    } else if (userRole === "student") {
      response.send(`
        <html>
          <body>
        <script>
          alert("You are not currently enrolled in this course.");
          setTimeout(() => {
            window.location.href = "/student";
          }, 1000);
        </script>
          </body>
        </html>
      `);
    } else {
      response.send(`
          <html>
            <body>
          <script>
            alert("You are not authorized to view this page.");
            setTimeout(() => {
              window.location.href = "/educator";
            }, 1000);
          </script>
            </body>
          </html>
        `);
    }
  } catch (err) {
    //console.log(err);
  }
});
app.get("/show-pages/:chapterId/:role/:courseId", async (request, response) => {
  try {
    //console.log("chapterId" + request.params.chapterId);
    const chapterId = request.params.chapterId;
    const userRole = request.params.role;
    const chapterPages = await page.findAll({
      where: { chapterId: request.params.chapterId },
    });
    const userCreatedCourses = await coursesCreated.findAll({
      where: { educatorId: request.user.id }, // assuming 'userId' field refers to the creator of the course
      attributes: ["id"], // only fetch course IDs
    });
    console.log("userCreatedCourses", userCreatedCourses);

    const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);
    console.log("userCreatedCourseIds", userCreatedCourseIds);

    const courseId = request.params.courseId;
    console.log("courseId", courseId);

    if (userRole === "educator") {
      response.render("./show-pages", {
        userCreatedCourseIds,
        courseId,
        chapterId,
        userRole,
        chapterPages,
        csrfToken:request.csrfToken(),
      });
    } else {
      // //console.log("Dear student you dont have access to this page");
      response.render("./show-pages", {
        courseId,
        chapterId,
        userRole,
        chapterPages,
        csrfToken:request.csrfToken(),
      });
    }
  } catch (err) {
    //console.log(err);
  }
});

app.get("/courses", async (request, response) => {
  const userRole = request.user.role;
  const allCourses = await coursesCreated.findAll();
  const edCreatedCourses = await coursesCreated.findAll({
    where: { educatorId: request.user.id },
  });
  const edEnrolledCourses = await coursesEnrolled.findAll({
    where: { studentId: request.user.id },
  });

  if (request.user.role === "educator") {
    response.render("./educator/show-courses", {
      userRole,
      allCourses,
      edCreatedCourses,
      csrfToken:request.csrfToken(),
    });
  } else {
    response.render("./student/courses", {
      userRole,
      allCourses,
      edEnrolledCourses,
      csrfToken:request.csrfToken(),
    });
  }
});

app.post("/users", async (request, response) => {
  const hashedPwd = await bcrypt.hashSync(request.body.password, saltRounds);
  try {
    const user = await User.create({
      name: request.body.name,
      email: request.body.email,
      password: hashedPwd,
      role: request.body.role,
    });
    request.login(user, (err) => {
      if (err) {
        //console.log(err);
      }
      if (user.role === "educator") response.redirect("/educator");
      else {
        response.redirect("/student");
      }
    });
  } catch (error) {
    //console.log(error);
  }
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (request, response) => {
    if (request.body.role === "educator") {
      response.redirect("/educator");
    } else {
      response.redirect("/student");
    }
  }
);

app.post("/page", async (request, response) => {
  const pg = await page.create({
    pageName: request.body.pageName,
    pageContent: request.body.pageContent,
    completed:[],
    chapterId: request.body.chapterId,
  });
  const chapterPages = await page.findAll({
    where: { chapterId: request.body.chapterId },
  });
  const courseId = request.body.courseId;
  const userRole = request.user.role;
  const userCreatedCourses = await coursesCreated.findAll({
    where: { educatorId: request.user.id }, // assuming 'userId' field refers to the creator of the course
    attributes: ["id"], // only fetch course IDs
  });
  console.log("userCreatedCourses", userCreatedCourses);

  const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);
  console.log("userCreatedCourseIds", userCreatedCourseIds);

  response.render("./show-pages", {
    userCreatedCourseIds,
    courseId,
    chapterId: request.body.chapterId,
    chapterPages,
    userRole,
    csrfToken:request.csrfToken(),
  });
});

app.post("/chapter", async (request, response) => {
  //first find the courses
  try {
    const chptr = await chapter.create({
      chapterName: request.body.chapterName,
      chapterDesc: request.body.chapterDesc,
      courseId: request.body.courseId,
    });
    const chapterPages = await page.findAll({
      where: { chapterId: chptr.id },
    });

    const userRole = request.user.role;
    const chapterId = chptr.id;
    const courseId = request.body.courseId;

    const userCreatedCourses = await coursesCreated.findAll({
      where: { educatorId: request.user.id }, // assuming 'userId' field refers to the creator of the course
      attributes: ["id"], // only fetch course IDs
    });
    console.log("userCreatedCourses", userCreatedCourses);

    const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);
    console.log("userCreatedCourseIds", userCreatedCourseIds);

    response.render("./show-pages", {
      userCreatedCourseIds,
      courseId,
      userRole,
      chapterId,
      chapterPages,
      csrfToken:request.csrfToken(),
    });
  } catch (err) {
    //console.log(err);
  }
});

app.post("/course", async (request, response) => {
  try {
    const course = await coursesCreated.create({
      courseName: request.body.courseName,
      educatorId: request.user.id,
    });
    const createdCourses = [course];
    const userRole = request.user.role;
    const userName = request.user.name;
    response.render("./show-courses", {
      userRole,
      userName,
      createdCourses,
      csrfToken:request.csrfToken(),
    });
  } catch (err) {
    //console.log(err);
  }
});

app.post("/enroll", async (request, response) => {
  const { courseId, userId, courseName } = request.body;

  try {
    const alreadyEnrolled = await coursesEnrolled.findOne({
      where: { courseId, studentId: userId },
      //this finds that if the student is already enrolled in the course
    });

    if (alreadyEnrolled && request.user.role === "educator") {
      response.redirect("/educator");
    }
    if (alreadyEnrolled && request.user.role === "student") {
      response.redirect("/student");
    }

    // Enroll the student in the course
    await coursesEnrolled.create({
      courseId,
      studentId: userId,
      courseName,
    });
    if (request.user.role === "student") {
      response.redirect("/student");
    }
    response.status(200).redirect("/educator");
  } catch (err) {
    //console.log(err);
  }
});

module.exports = app;
