var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var _ = require('underscore');
var expstate = require('express-state');

var mongoose = require('mongoose');
var dotenv = require('dotenv');
dotenv.load();
console.log(process.env.MONGODB);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));


// Set up express-state
expstate.extend(app);
app.set("state namespace", 'App'); 

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

var models = require('./models/models');

var http = require('http').Server(app);
var io = require('socket.io')(http);

//the home page renders a list of all classes in the orgs database
app.get('/', function(req, res){
	models.Class.find().distinct('name', function(err, courseNames){
			return res.render('home', {courseNames: courseNames});
	});
});

//renders a page containing all of the students that took a specific class
app.get('/course/:name', function(req, res){

	var courseName = req.params.name;

	models.Class.findOne({name: courseName}, function(err, courses){

		var studentsInCourse = [];

		for(var i=0; i<courses.studentsTaken.length; i++){

			var cur = (courses.studentsTaken[i].toJSON());

			var temp = {_id: cur._id, stuName: cur.name, prof: courses.professor, smstrYr: courses.semesterYearTaken};

			studentsInCourse.push(temp);
		}

		return res.render('course', {courses: courses, studentsInCourse: studentsInCourse});
	});
});

app.get('/allStudents', function(req, res){

	models.Student.find({}, function(err, students){

		return res.render('allStudents', {students: students});
	});
});

//render the profile for the specific student id given
app.get('/student/:id', function(req, res){

	models.Student.findOne({_id: req.params.id}, function(err, stu){

		return res.render('studentProfile', {student: stu});
	});
});

//renders a page where an existing student can add a course to their profile
app.get('/studentAddCourse/:id', function(req, res){

	models.Student.findOne({_id: req.params.id}, function(err, stu){

		res.expose(req.params.id, "stu_id");
		return res.render('addClass', {student: stu});
	});
});

//renders a page where a user can enter in the data for a new student
app.get('/addStudent', function(req, res){

	//create a page where you can enter in new student data
	//then have a button called create student and add courses
	//have that page forward to studentAddCourse

	return res.render('students', {});
});

app.get('/api/getCourses', function(req, res){
	models.Class.find({}, function(err, courses){

		res.send(courses);
	});
});

app.get('/api/courseQuery/:course', function(req, res){

	var course = req.params.course.toUpperCase();

	var regex = new RegExp("^"+course+".*");

	//console.log("REGEX: "+regex);
	var result = models.Class.find({"name": regex}, function(err, result){
		//console.log("RESULT: "+result);
		return res.json(result);
	});
});

 //recieves the post request for adding a new student
app.post('/api/addStudent', function(req, res){

	console.log("Adding Student...");

	//TODO: Could check to see if student has already been created

	//create new Student
	var student =  new models.Student({
		name: req.body.name,
		major: req.body.major,
		year: req.body.year,
		graduated: req.body.graduated,
		classesTaken: []
	});

	//TODO: Check about the emit
	student.save(function(err, new_student){
		if(err) throw err;
		//io.emit('new student', new_student);
		return res.send(new_student._id);
	});
});

//adds a course and updates the specified student or just updates course if it already exists
app.post('/api/addCourse', function(req, res){

	console.log("IN THE POST ADDING COURSE");

	var course_id = req.body.course_id;
	var professor_name = req.body.professor;
	var semesterYear = req.body.semesterYear;
	var stu_id = req.body.student_id;

	models.Class.findOne({name: course_id, professor: professor_name, semesterYearTaken: semesterYear}, function(err, course){

		models.Student.findOne({_id: stu_id}, function(err, stu){

			console.log(stu);
			console.log(course);

			//the course did not previously exist to add a new one
			if(course == null){

				var c = new models.Class({
					name: course_id,
					professor: professor_name, 
					semesterYearTaken: semesterYear,
					studentsTaken: [stu]
				});

				c.save(function(err, new_course){
					console.log("ADDING NEW COURSE TO STUDENT");

					if(err) throw err;

					stu.classesTaken.push(new_course);

					stu.save(function(err){
						if(err) throw err;

						return res.send('Successfully Added Course and Updated Student');
					});
				});
			}
			//the course does exist, just update the list of students taken
			else{

				course.studentsTaken.push(stu);
				stu.classesTaken.push(course);

				course.save(function(err){
					if(err) throw err;

					stu.save(function(err){
						if(err) throw err;

						return res.send('Successfully Updated Course and Student');
					});
				});
				
			}
		});
	});

	//renders home page once all courses have been added
	// models.Class.find().distinct('name', function(err, courseNames){
	// 		return res.render('home', {courseNames: courseNames});
	// });
});

/************************************************************************/ 

//renders a page containing all of the classes taken by a specific student
// app.get('/classes/:id', function(req, res){

// 	models.Student.findOne({_id: req.params.id}, function(err, student){

// 		return res.render('classes', {student: student});
// 	});
// });

// app.get('/graduated', function(req, res){

// 	models.Student.find({graduated: "Yes"}, function(err, students){

// 		if(students.length == 0){
// 			students = null;
// 		}

// 		var title = "List of students who have graduated:";

// 		return res.render('grad_undergrad', {students: students, title: title});
// 	});
// });

// app.get('/undergrads', function(req, res){

// 	models.Student.find({graduated: "No"}, function(err, students){

// 		if(students.length == 0){
// 			students = null;
// 		}

// 		var title = "List of undergraduate students:";

// 		return res.render('grad_undergrad', {students: students, title: title});
// 	});
// });

// app.get('/random', function(req, res){

// 	models.Student.find({}, function(err, students){

// 		console.log("LENGTH: "+students.length)

// 		if(students.length > 0){
// 			var rand = Math.floor((Math.random() * (students.length)));
// 			var stu = students[rand];
// 			console.log("Rand Num: "+rand);
// 		}
// 		else{
// 			var stu = null;
// 		}

// 		var title = "Random Student:"

// 		console.log(stu);

// 		return res.render('random', {students: stu, title: title});
// 	});
// });

// //renders the page confirming to remove the last student
// app.get('/removeLast', function(req, res){

// 	models.Student.find({}, function(err, students){

// 		var i = students.length - 1;

// 		if(students.length > 0){
// 			var lastStu = students[students.length - 1];
// 		}
// 		else{
// 			var lastStu = null;
// 		}
		
// 		console.log(lastStu);

// 		return res.render('remove_last', {last: lastStu, index: i});
// 	});
// });

// /* Add whatever endpoints you need! Remember that your API endpoints must
//  * have '/api' prepended to them. Please remember that you need at least 5 
//  * endpoints for the API, and 5 others. 
//  */

// app.post('/api/addClass', function(req, res){

// 	console.log("Student ID: "+req.body.id);

// 	models.Student.findOne({_id: req.body.id}, function(err, student){

// 		if(err) throw err;
// 		if(!student) return res.send('No Student Found With That ID');

// 		student.classesTaken.push({
// 			name: req.body.class,
// 			professor: req.body.professor,
// 			yearTaken: req.body.yearTaken,
// 			semesterTaken: req.body.semesterTaken
// 		});
// 		student.save(function(err){
// 			if(err) throw err;
// 			//TODO: maybe add an io.emit here
// 			res.send('Successfully added a class');
// 		});
// 	});
// });

// //post request that removes the specified student from the database
// app.post('/api/remove', function(req, res){

// 	var stu_id = req.body.id;
// 	var indexToRemove = req.body.index;

// 	models.Student.findByIdAndRemove(stu_id, function(err, stu){

// 		//TODO: remove the specified student then io.emit("removedLast")
// 		console.log("LAST STUDENT REMOVED");

// 		io.emit('removedLast', stu_id);
// 	});
// });

// app.get('/api/studentQuery/:major', function(req, res){

// 	var major = req.params.major.toUpperCase();

// 	var regex = new RegExp("^"+major+".*");

// 	console.log("REGEX: "+regex);
// 	var result = Student.find({"major": regex}, function(err, result){
// 		//console.log("RESULT: "+result);
// 		res.json(result);
// 	});
// });

// app.get('/api/getStudents', function(req, res){
// 	models.Student.find({}, function(err, students){
// 		res.send(students);
// 	});	
// });

http.listen(3000, function() {
    console.log('House of Representatives listening on port 3000!');
});

//https://code.tutsplus.com/tutorials/full-text-search-in-mongodb--cms-24835
//https://docs.mongodb.com/manual/reference/operator/query/regex/
//db.users.find({"name": /m.*/}), this should return every student with a name starting with m
//TODO: will need to create a get request in the api that returns the result of this query
//		This get will be called every time the user types a new word to populate a new search result

//Will look similar to this:
// app.get('/', function(req, res){
// 	Student.find({}, function(err, students){
// 			return res.render('home', {students: students});
// 	});
// });