This repository contains the files required for the pupil first wd201 capstone project 
the __tests__ folder consists of the files required for basic tests
the .husky folder contains pre commit hooks requierd for linting and tests
the config folder contains deployment configuration for 3 different deployment environments development,test and production.
the migrations folder contains the required migrations for several tables in the project and several foreign key constraints etc.
the models folder contains several models required for the project.
the views folder contains educator sub folder and the student subfolder along with some other ejs files which are common for both the student and the educator.
the educator subfolder in the views consists of reports subfolder which deals with the display of reports for the courses created by the educator.
the create-chapter,create-course,create-page are used to create the course for the student and the index.js in this educator folder is the landing page for the educator.
the student folder consists of the index.js which is the landing page for the student.
the index.js in the views directory is the landing irrespective of the user before login 
the password.ejs is used to change the password for respective users
the show-chapters,show-courses,show-pages are used to display the course content to both the educator as well as enrolled students.
show-pages only shows the content to the enrolled students
signup.ejs and login.ejs are self descriptive.
app.js is the main server for the application and consists of various endpoints and package middleware for the application to work effectively.
the package.json consists of several scripts and packages for production as well as development environment 
