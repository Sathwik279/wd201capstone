const { request, response } = require("express");
const express = require("express");
const app = express();
const {
  User,
  coursesCreated,
  coursesEnrolled,
  chapter,
  page,
  pageCompletion,
} = require("./models");

const path = require("path");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const passport = require("passport");

const cookieParser = require("cookie-parser"); //csrf needs this..
const csrf = require("csurf");

const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const localStrategy = require("passport-local");
const { INTEGER } = require("sequelize");

const saltRounds = 10;

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); //used to parse json data from body
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("shh! some secret string"));

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

app.use(
  csrf({
    cookie: true, // Store CSRF token in cookies
  })
);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); // Generates a new token on every request
  next();
});

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

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid password" });
          }

          // Check role (assumes the role is provided in the request body)
          // Get role from DB
          if (formRole !== user.role) {
            return done(null, false, { message: "Role does not match" });
          }
          ////("authenticated successfully  returning");
          return done(null, user); // Authenticated successfully
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
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
  response.render("index", {
    csrfToken: request.csrfToken(),
  }); //csrf not required
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
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

app.get("/reports/course",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const userId = request.user.id;
  const courses = await coursesCreated.findAll({
    where: { educatorId: userId },
  });
  const courseIds = courses.map((course) => course.id);
  console.log("Courses " + courseIds);
  response.render("./educator/reports/index", {
    csrfToken: request.csrfToken(),
    courses: courses,
  });
});
app.get("/reports/course/:courseId",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const courseId = request.params.courseId;
  const students = await coursesEnrolled.findAll({
    where: { courseId: courseId },
  });
  const studentIds = students.map((student) => student.studentId);

  response.render("./educator/reports/users", {
    csrfToken: request.csrfToken(),
    courseId: courseId,
    studentIds: studentIds,
  });
});

app.post("/getProgress",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const courseId = request.body.courseId;
  const studentId = request.body.studentId;
  const courseProg = await coursesEnrolled.findOne({
    where: { courseId: courseId, studentId: studentId },
  });
  console.log("course progrss " + courseProg.courseProgress);
  response.json({ courseProg: courseProg.courseProgress });
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
        csrfToken: request.csrfToken(),
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
    if (request.accepts("html")) {
      response.render("./student/index", {
        userRole,
        userName,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({});
    }
  }
);
// ------------------------------------------------------
app.get(
  "/create-course",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    if (!request.user) {
      return response.redirect("/login"); // Redirect if user is not authenticated
    }
    const userRole = request.user.role;
    response.render("./educator/create-course", {
      userRole,
      csrfToken: request.csrfToken(),
    });
  }
);

app.get("/create-chapter",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const courseId = request.query.courseId;
  const userRole = request.user.role;

  response.render("./educator/create-chapter", {
    courseId,
    userRole,
    csrfToken: request.csrfToken(),
  });
});

app.get("/create-page",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const chapterId = request.query.chapterId;
  const userRole = request.user.role;
  const courseId = request.query.courseId;
  const courseChapters = await chapter.findAll({
    where: { courseId: request.query.courseId },
  });
  response.render("./educator/create-page", {
    courseId,
    courseChapters,
    chapterId,
    userRole,
    csrfToken: request.csrfToken(),
  });
});

app.get("/fetch-chapters/:courseId/:role",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const allChapters = await chapter.findAll();
  const courseChapters = await chapter.findAll({
    where: { courseId: request.params.courseId },
  });
  response.json({ allChapters, courseChapters });
});

app.get("/show-courses",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const createdCourses = await coursesCreated.findAll({
    where: { educatorId: request.user.id },
  });

  const enrolledCourses = await coursesEnrolled.findAll({
    where: { studentId: request.user.id },
  });

  const enrolledCourseIds = enrolledCourses.map((course) => course.courseId);

  const allCourses = await coursesCreated.findAll();

  const unenrolledCourses = allCourses.filter(
    (course) => !enrolledCourseIds.includes(course.id)
  );
  const allChapters = await chapter.findAll();
  const userRole = request.user.role;
  const userName = request.user.name;
  const userId = request.user.id;
  const create = request.body.create ? "create" : "";
  response.render("./show-courses", {
    create,
    userRole,
    userId,
    userName,
    allCourses,
    createdCourses,
    unenrolledCourses,
    enrolledCourses,
    allChapters,
    csrfToken: request.csrfToken(),
  });
});

app.get("/show-chapters",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  try {
    const userRole = request.user.role;
    const courseId = request.query.courseId;

    const courseChapters = await chapter.findAll({
      where: { courseId: parseInt(courseId) },
    });

    const userName = request.user.name;

    const userCreatedCourses = await coursesCreated.findAll({
      where: { educatorId: request.user.id },
      attributes: ["id"],
    });
    const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);

    response.render("./show-chapters", {
      userCreatedCourseIds,
      courseId,
      userRole,
      courseChapters,
      userName,
      csrfToken: request.csrfToken(),
    });
  } catch (err) {
    //(err);
  }
});

app.get("/show-pages/:chapterId/:role",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  try {
    const chapterId = request.params.chapterId;
    const userRole = request.params.role;
    const userId = request.user.id;
    const courseId = request.query.courseId;
    const userCreatedCourses = await coursesCreated.findAll({
      where: { educatorId: request.user.id },
      attributes: ["id"],
    });
    const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);
    const chapterPages = await page.findAll({
      where: { chapterId: request.params.chapterId },
    });
    const enrolledCourse = await coursesEnrolled.findOne({
      where: { courseId, studentId: request.user.id },
    });
    const isEnrolled = enrolledCourse ? true : false;
    const completedPages = await pageCompletion.findAll({
      where: { userId: userId },
    });
    if (
      (userRole === "educator" &&
        userCreatedCourseIds.includes(parseInt(courseId))) ||
      isEnrolled
    ) {
      response.render("./show-pages", {
        completedPages,
        userId,
        userCreatedCourseIds,
        courseId,
        chapterId,
        userRole,
        chapterPages,
        csrfToken: request.csrfToken(),
      });
    } else if (userRole === "student" && isEnrolled) {
      response.render("./show-pages", {
        completedPages,
        userId,
        courseId,
        chapterId,
        userRole,
        chapterPages,
        csrfToken: request.csrfToken(),
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
    ////(err);
  }
});

app.get("/show-pages/:chapterId/:role/:courseId",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  try {
    const chapterId = request.params.chapterId;
    const userRole = request.params.role;
    const userId = request.user.id;
    const chapterPages = await page.findAll({
      where: { chapterId: request.params.chapterId },
    });
    const completedPages = await pageCompletion.findAll({
      where: { userId: userId },
    });
    const userCreatedCourses = await coursesCreated.findAll({
      where: { educatorId: request.user.id },
      attributes: ["id"],
    });

    const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);

    const courseId = request.params.courseId;

    if (userRole === "educator") {
      response.render("./show-pages", {
        completedPages,
        userId,
        userCreatedCourseIds,
        courseId,
        chapterId,
        userRole,
        chapterPages,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.render("./show-pages", {
        completedPages,
        userId,
        courseId,
        chapterId,
        userRole,
        chapterPages,
        csrfToken: request.csrfToken(),
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/courses",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
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
      csrfToken: request.csrfToken(),
    });
  } else {
    response.render("./student/courses", {
      userRole,
      allCourses,
      edEnrolledCourses,
      csrfToken: request.csrfToken(),
    });
  }
});

app.get("/password",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  response.render("./password", {
    csrfToken: request.csrfToken(),
  });
});

app.post("/checkProgress",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const courseId = request.body.courseId;
  const userId = request.body.userId;
  const completedPages = await pageCompletion.findAll({
    where: {
      userId: userId,
      courseId: courseId,
    },
  });

  const coursePages = await page.findAll({
    where: {
      courseId: courseId,
    },
  });

  const progress = (completedPages.length / coursePages.length) * 100;

  await coursesEnrolled.update(
    { courseProgress: parseInt(progress) },
    { where: { courseId: courseId, studentId: userId } }
  );

  return response.json({ progress: progress });
});

app.post("/checkComplete",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const pageId = request.body.pageId;
  const userId = request.body.userId;
  try {
    const result = await pageCompletion.findOne({
      where: {
        pageId: pageId,
        userId: userId,
      },
    });
    console.log("current page id is " + pageId);

    if (result) {
      console.log("completed");
      response.json({ completed: true });
    } else {
      console.log("not completed");
      response.json({ completed: false });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/markAsCompleted",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const pageId = request.body.pageId;
  const userId = request.body.userId;
  const courseId = request.body.courseId;
  try {
    await pageCompletion.create({
      pageId: pageId,
      courseId: courseId,
      userId: userId,
    });
    response.status(200).json({ completed: true });
  } catch (err) {
    console.log(err);
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
        console.log(err);
      }
      if (user.role === "educator") response.redirect("/educator");
      else {
        response.redirect("/student");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/user", async (request, response) => {
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
        console.log(err);
      }
      response.status(201).json({ user });
    });
  } catch (error) {
    console.log(error);
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

app.post("/page",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const pg = await page.create({
    pageName: request.body.pageName,
    pageContent: request.body.pageContent,
    courseId: request.body.courseId,
    completed: [],
    chapterId: request.body.chapterId,
  });
  const chapterPages = await page.findAll({
    where: { chapterId: request.body.chapterId },
  });
  const courseId = request.body.courseId;
  const userId = request.user.id;
  const userRole = request.user.role;
  const userCreatedCourses = await coursesCreated.findAll({
    where: { educatorId: request.user.id },
    attributes: ["id"],
  });

  const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);

  response.render("./show-pages", {
    userId,
    userCreatedCourseIds,
    courseId,
    chapterId: request.body.chapterId,
    chapterPages,
    userRole,
    csrfToken: request.csrfToken(),
  });
});

app.post("/chapter",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
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
    const userId = request.user.id;
    const courseId = request.body.courseId;

    const userCreatedCourses = await coursesCreated.findAll({
      where: { educatorId: request.user.id },
      attributes: ["id"],
    });
    const userCreatedCourseIds = userCreatedCourses.map((course) => course.id);

    response.render("./show-pages", {
      userCreatedCourseIds,
      userId,
      courseId,
      userRole,
      chapterId,
      chapterPages,
      csrfToken: request.csrfToken(),
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/course",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  try {
    const course = await coursesCreated.create({
      courseName: request.body.courseName,
      educatorId: request.user.id,
    });
    const createdCourses = [course];
    const userRole = request.user.role;
    const userId = request.user.id;
    const create = request.body.create ? "create" : "";
    const userName = request.user.name;

    response.render("./show-courses", {
      create,
      userRole,
      userId,
      userName,
      createdCourses,
      csrfToken: request.csrfToken(),
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/enroll",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const { courseId, userId, courseName } = request.body;

  try {
    const alreadyEnrolled = await coursesEnrolled.findOne({
      where: { courseId, studentId: userId },
    });

    if (alreadyEnrolled && request.user.role === "educator") {
      response.redirect("/educator");
    }
    if (alreadyEnrolled && request.user.role === "student") {
      response.redirect("/student");
    }

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
    //(err);
  }
});

app.post("/password",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const userId = request.user.id;
  const user = await User.findByPk(userId);
  const oldPass = request.body.oldPass;
  const newPass = request.body.newPass;
  const hashedPwd = await bcrypt.hashSync(newPass, 10);
  const result = await bcrypt.compare(oldPass, user.password);
  try {
    if (result) {
      await user.updatePass(hashedPwd);
      response.redirect("/login");
    } else {
      return response.status(400).json({ content: "passwords dont match" });
    }
  } catch (err) {
    return response.status(500).json(err);
  }
});

app.put(
  "/page",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const pageId = request.body.pageId;
      const pageContent = request.body.pageContent;
      const pg = await page.findOne({
        where: {
          id: pageId,
        },
      });

      if (!pg) {
        return response
          .status(404)
          .json({ success: false, message: "Page not found" });
      }
      await pg.update({
        pageContent,
      });
      return response.json({
        success: true,
        message: "Page successfully updated",
      });
    } catch (err) {
      console.log(err);
    }
  }
);

app.delete(
  "/course/:id/:userId",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const courseId = request.params.id;
      const userId = request.params.userId;
      const course = await coursesCreated.findOne({
        where: {
          id: courseId,
          educatorId: userId,
        },
      });

      if (!course) {
        return response
          .status(404)
          .json({ success: false, message: "Course not found" });
      }
      await coursesCreated.destroy({
        where: {
          id: courseId,
          educatorId: userId,
        },
      });

      return response.json({
        success: true,
        message: "Course successfully deleted",
      });
    } catch (error) {
      return response
        .status(422)
        .json({ success: false, message: "The error is " + error.message });
    }
  }
);

app.delete(
  "/page",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const courseId = request.body.courseId;
      const userId = request.body.userId;
      const pageId = request.body.pageId;
      console.log("entered the delete request");
      const deletionPage = await page.findOne({
        where: {
          id: pageId,
        },
      });

      if (!page) {
        return response
          .status(404)
          .json({ success: false, message: "page not found" });
      }
      await page.destroy({
        where: {
          id: pageId,
        },
      });

      return response.json({
        success: true,
        message: "page successfully deleted",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

app.delete(
  "/chapter/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const chapterId = request.params.id;
      const userId = request.user.id;
      console.log("entered the delete request");
      const deletionChapter = await chapter.findOne({
        where: {
          id: chapterId,
        },
      });

      if (!deletionChapter) {
        return response
          .status(404)
          .json({ success: false, message: "chapter not found" });
      }
      await chapter.destroy({
        where: {
          id: chapterId,
        },
      });

      return response.json({
        success: true,
        message: "chapter successfully deleted",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = app;
