var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema();

var classSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	professor: {
		type: String
	},
	semesterYearTaken: {
		type: String
	},
	studentsTaken: [studentSchema]
});

studentSchema.add({
	name: {
		type: String,
		require: true
	},
	major: {
		type: String,
		require: true
	},
	year: {
		type: String,
		require: true
	},
	graduated: {
		type: String,
		require: true
	},
	classesTaken: [classSchema]
});

var Student = mongoose.model('Student', studentSchema);
var Class = mongoose.model('Class', classSchema);

module.exports = {
	Student: Student,
	Class: Class
};