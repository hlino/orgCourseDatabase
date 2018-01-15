
# PROJECT NAME

---

Name: Harrison Linowes

Date: 12/8/17

Project Topic: Student/Alumni Course Database

URL: https://p5-reddit-clone-sdcmaxgeit.now.sh/

---


### 1. Data Format and Storage

Data point fields:
- `Field 1`: name       	`Type: String`
- `Field 2`: professor       	`Type: String`
- `Field 3`: yearTaken       	`Type: Number`
- `Field 4`: semesterTaken      `Type: String`

Schema: 
```javascript
{
   	name: {
		type: String,
		require: true
	},
	professor: {
		type: String
	},
	yearTaken: {
		type: Number
	},
	semesterTaken: {
		type: String
	}
}
```

Data point fields:
- `Field 1`: name       	`Type: String`
- `Field 2`: major       	`Type: String`
- `Field 3`: year       	`Type: Number`
- `Field 4`: graduated      	`Type: String`
- `Field 5`: classesTaken      	`Type: [classSchema]`

Schema: 
```javascript
{
   	name: {
		type: String,
		require: true
	},
	major: {
		type: String,
		require: true
	},
	year: {
		type: String
	},
	graduated: {
		type: String,
		require: true
	},
	classesTaken: [classSchema]
}
```


### 2. Add New Data

HTML form route: `/addStudent`

POST endpoint route: `/api/addStudent`

Example Node.js POST request to endpoint: 
```javascript
var request = require("request");

var options = { 
    method: 'POST',
    url: 'http://localhost:3000/api/addStudent',
    headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
    },
    form: { 
        name: 'Harrison Linowes',
	major: 'Computer Science',
	year: 'Junior',
	graduated: 'False',
	classesTaken: []
    } 
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

### 3. View Data

GET endpoint route: `/api/getStudents`

### 4. Search Data

Search Field: major

### 5. Navigation Pages

Navigation Filters
1. Home -> `  /  `
2. Random -> `  /random  `
3. Remove Last -> `  /removeLast  `
4. Graduates -> `  /graduated  `
5. Undergraduates -> `  /undergrads  `
6. Add Student -> `  /addStudent  `

