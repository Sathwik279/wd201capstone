1 .This repository contains the files required for the pupil first wd201 capstone project 
2 .the __tests__ folder consists of the files required for basic tests
3 .the .husky folder contains pre commit hooks requierd for linting and tests
4 .the config folder contains deployment configuration for 3 different deployment environments development,test and production.
5 .the migrations folder contains the required migrations for several tables in the project and several foreign key constraints etc.
6 .the models folder contains several models required for the project.
7 .the views folder contains educator sub folder and the student subfolder along with some other ejs files which are common for both the student and the educator.
8 .the educator subfolder in the views consists of reports subfolder which deals with the display of reports for the courses created by the educator.
9 .the create-chapter,create-course,create-page are used to create the course for the student and the index.js in this educator folder is the landing page for the educator.
10 .the student folder consists of the index.js which is the landing page for the student.
11 .the index.js in the views directory is the landing irrespective of the user before login 
12 .the password.ejs is used to change the password for respective users
13 .the show-chapters,show-courses,show-pages are used to display the course content to both the educator as well as enrolled students.
14 .show-pages only shows the content to the enrolled students
15 .signup.ejs and login.ejs are self descriptive.
16 .app.js is the main server for the application and consists of various endpoints and package middleware for the application to work effectively.
17 .the package.json consists of several scripts and packages for production as well as development environment 
