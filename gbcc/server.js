var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var config = require('./config.json');
const PORT = process.env.PORT || 3000;
var myTimer;
var roomData = {};

app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

var activityType = ((config.interfaceJs.teacherComponents.componentRange[0] === config.interfaceJs.studentComponents.componentRange[0])
  && (config.interfaceJs.teacherComponents.componentRange[1] === config.interfaceJs.studentComponents.componentRange[1])) ?
	"gbcc" : "hubnet";
	
io.on('connection', function(socket){
	var rooms = [];
	
	for (var key in roomData) { rooms.push(key); }
	socket.emit("display interface", {userType: "login", rooms: rooms, components: config.interfaceJs.loginComponents, activityType: activityType});
	socket.join("login");
	
	function enableTimer() {
		//console.log("enable");
		var myTimer = setInterval(function() {
			for (var key in roomData) {
				if (socket) {
					socket.to(key+"-student").emit("send update", {turtles: roomData[key].turtleUpdates, patches: roomData[key].patchUpdates});	
					roomData[key].turtleUpdates = {};
					roomData[key].patchUpdates = {};
				}
			}
		}, 250);
	}

	function disableTimer() {
		//console.log("disable");
		clearInterval(myTimer);
	}
	
	// user enters room
	socket.on("enter room", function(data) {
		var myUserType, myUserId, myTurtleId;
		socket.leave("login");
		if (data.room === "admin") {
			socket.emit("display admin", {roomData: getRoomData()});
		} else {
			// if user is first to enter a room, and only one room exists, then enable the timer
			if (Object.keys(roomData).length === 0) { 
				// if teacher and student have different interfaces (hubnet, not gbcc)
				if (config.interfaceJs.teacherComponents.componentRange != config.interfaceJs.studentComponents.componentRange) {
					enableTimer();
				} 
			}
			// declare myRoom
			socket.myRoom = data.room;
			var myRoom = socket.myRoom;
			if (!roomData[myRoom]) {
				roomData[myRoom] = {};
				roomData[myRoom].teacherInRoom = false;
				roomData[myRoom].turtles = {};
				roomData[myRoom].patches = {};
				roomData[myRoom].turtleUpdates = {};
				roomData[myRoom].patchUpdates = {};
				roomData[myRoom].turtleDict = {};
				roomData[myRoom].userIdDict = {};
				roomData[myRoom].userData = {};
			}
			// declare myUserType, first user in is a teacher, rest are students
			socket.myUserType = (!roomData[myRoom].teacherInRoom) ? "teacher" : "student";
			myUserType = socket.myUserType;
			// declare myUserId
			myUserId = socket.id;
			roomData[myRoom].userData[myUserId] = {};
			// send settings to client
			socket.emit("save settings", {userType: myUserType, userId: myUserId});
			// join myRoom
			socket.join(myRoom+"-"+myUserType);
			// tell teacher or student to display their interface
			//socket.emit("display interface", {userType: socket.myUserType, room: myRoom});
			if (myUserType === "teacher") {
				// send the teacher a teacher interface
				socket.emit("display interface", {userType: "teacher", room: myRoom, components: config.interfaceJs.teacherComponents});
				// remember that there is already a teacher in room
				roomData[myRoom].teacherInRoom = true;
				roomData[myRoom].userIdDict["teacher"] = myUserId;
				//send to all students on intro page
				rooms = [];
				for (var key in roomData) { rooms.push(key); }
				socket.to("login").emit("display interface", {userType: "login", rooms: rooms, components: config.interfaceJs.loginComponents, activityType: activityType});
			} else {
				if (activityType === "hubnet") {
					// send student a student interface
					socket.emit("display interface", {userType: "student", room: myRoom, components: config.interfaceJs.studentComponents});
					// send teacher a hubnet-enter-message
					socket.to(myRoom+"-teacher").emit("execute command", {hubnetMessageSource: myUserId, hubnetMessageTag: "hubnet-enter-message", hubnetMessage: ""});
				} else {
					// it's gbcc, so send student a teacher interface
					socket.emit("display interface", {userType: "teacher", room: myRoom, components: config.interfaceJs.teacherComponents});				
					var dataObject
					if (roomData[myRoom].userData != {}) {
						
						for (var k in roomData[myRoom].userData) {
							//console.log(roomData[myRoom].userData[k]["canvas"]);
							if (roomData[myRoom].userData[k]["canvas"] != undefined) {
								dataObject = {
									hubnetMessageSource: k,
									hubnetMessageTag: "canvas",
									hubnetMessage: roomData[myRoom].userData[k]["canvas"],
									components: config.clientJs.reporterComponents,
									userId: myUserId,
									activityType: activityType
								};
								socket.emit("display reporter", dataObject);
							}
						}
					}
				
				}
			}
		}
	});	
  
	// store updates to world
	socket.on("update", function(data) {
		var myRoom = socket.myRoom;
		var userId;
		var turtleId, turtle;
		var patchId, patch;	
		for (var key in data.turtles) 
		{
			turtle = data.turtles[key];
			turtleId = key;
			if (roomData[myRoom].turtles[turtleId] === undefined) {
				// save userId and turtleId in dicts, for new student
				userId = turtle.USERID;
				roomData[myRoom].turtleDict[userId] = turtleId;
				roomData[myRoom].userIdDict[turtleId] = userId;	
				roomData[myRoom].turtles[turtleId] = {};
			}
			if (roomData[myRoom].turtleUpdates[turtleId] === undefined) {		
				roomData[myRoom].turtleUpdates[turtleId] = {};
			} 
			if (Object.keys(turtle).length > 0) {
				for (var attribute in turtle) {
					roomData[myRoom].turtles[turtleId][attribute] = turtle[attribute];
					roomData[myRoom].turtleUpdates[turtleId][attribute] = turtle[attribute];
				}
			}
		}
		for (var key in data.patches) 
		{
			patch = data.patches[key];
			patchId = key;
			if (roomData[myRoom].patches[patchId] === undefined) {
				roomData[myRoom].patches[patchId] = {};
			} 
			if (roomData[myRoom].patchUpdates[patchId] === undefined) {
				roomData[myRoom].patchUpdates[patchId] = {};
			} 
			if (Object.keys(patch).length > 0) {
				for (var attribute in patch) {
					roomData[myRoom].patches[patchId][attribute] = patch[attribute];
					roomData[myRoom].patchUpdates[patchId][attribute] = patch[attribute];
				}
			}
		}
	});
	
	// pass command from student to teacher
	socket.on("send command", function(data) {
		var myRoom = socket.myRoom;
		var myUserId = socket.id;
		socket.to(myRoom+"-teacher").emit("execute command", {
			hubnetMessageSource: myUserId,
			hubnetMessageTag: data.hubnetMessageTag,
			hubnetMessage: data.hubnetMessage
		});
	});
	
	// pass reporter from server to student
	socket.on("send reporter", function(data) {
		var myRoom = socket.myRoom;
		var myUserId = socket.id;
		var destination = data.hubnetMessageSource;
		if (destination === "server") {
			roomData[myRoom].userData[myUserId][data.hubnetMessageTag] = data.hubnetMessage;
		} else {
			var dataObject = {
				hubnetMessageSource: myUserId,
				hubnetMessageTag: data.hubnetMessageTag,
				hubnetMessage: data.hubnetMessage,
				components: config.clientJs.reporterComponents,
				userId: myUserId,
				activityType: activityType
			};
		 	if (destination === "all-users"){
				socket.to(myRoom+"-teacher").emit("display reporter", dataObject);
				socket.to(myRoom+"-student").emit("display reporter", dataObject);
				socket.emit("display reporter", dataObject);
			} else {
				io.to(destination).emit("display reporter", dataObject);
			}
		}
	});
	
	// pass reporter from student to server
	socket.on("get reporter", function(data) {
		var myRoom = socket.myRoom;
		var myUserId = socket.id;
		socket.messageQueue = [];
		if (roomData[myRoom].userData[data.hubnetMessageSource]) {
			var dataObject = {
				hubnetMessageSource: data.hubnetMessageSource,
				hubnetMessageTag: data.hubnetMessageTag,
				hubnetMessage: roomData[myRoom].userData[data.hubnetMessageSource][data.hubnetMessageTag],
				components: config.clientJs.reporterComponents,
				userId: myUserId,
				activityType: activityType
			};
			socket.emit("display reporter", dataObject);
		}
	});
	
	socket.on("admin clear room", function(data) {
		clearRoom(data.roomName);
	});
	
	// user exits 
	socket.on('disconnect', function () {
		//clearInterval(myTimer);
		var myRoom = socket.myRoom;
		var myTurtleId = socket.myTurtleId;
		var myUserId = socket.id;
		if (socket.myUserType === "teacher") {
			// if it's not a flat model...
			if (config.interfaceJs.teacherComponents.componentRange != config.interfaceJs.teacherComponents.componentRange) {
				clearRoom(myRoom);
				disableTimer();
			} else {
				delete roomData[myRoom].userData[myUserId];
				if (Object.keys(roomData[myRoom].userData).length === 0) { 
					delete roomData[myRoom]; 
				}				
			}
		} else {
			if (roomData[myRoom] != undefined) {
				var myTurtleId = roomData[myRoom].turtleDict[myUserId];
				var updateTurtles = {};
				var turtle = {};
				turtle.who = myTurtleId;
				updateTurtles[myTurtleId] = turtle;
				socket.to(myRoom+"-teacher").emit("execute command", {
					hubnetMessageSource: myUserId, 
					hubnetMessageTag: "hubnet-exit-message", 
					hubnetMessage: ""
				});
				delete roomData[myRoom].userData[myUserId];
				delete roomData[myRoom].turtles[myTurtleId];
				if (config.interfaceJs.teacherComponents.componentRange != config.interfaceJs.teacherComponents.componentRange) {
					if (roomData[myRoom].turtles === {}) { delete roomData[myRoom]; }
				} else {
					if (Object.keys(roomData[myRoom].userData).length === 0) { 
						delete roomData[myRoom]; 
					}				
				}
				if (Object.keys(roomData).length === 0) { disableTimer();}
			}
		}
	});	
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT );
});

function clearRoom(roomName) {
	var myRoom = roomName;
	var clientList = [];
	if (roomData[myRoom]) {
		// if teacher and student have different interfaces (hubnet, not gbcc)
		if (config.interfaceJs.teacherComponents.componentRange === config.interfaceJs.teacherComponents.componentRange) {
			for (var key in roomData[myRoom].userData) {
				clientList.push(key);
			}
		} else {
			for (var key in roomData[myRoom].userIdDict) {
				clientList.push(roomData[myRoom].userIdDict[key]);
			}			
		}
		for (var i=0; i<clientList.length; i++) {
			if (io.sockets.sockets[clientList[i]]) {
				io.to(clientList[i]).emit("display interface", {userType: "disconnected"});
				io.sockets.sockets[clientList[i]].disconnect();
			}
		}
		delete roomData[myRoom];
	}
}

function getRoomData() {
	var displayData = "";
	var buttonAction;
		displayData = displayData + "<hr>Any rooms?";
	for (var roomKey in roomData) {
		displayData = displayData + "<hr>Which room? " + roomKey;
		displayData = displayData + "<br> Is there a teacher? ";
		displayData = roomData[roomKey].teacherInRoom ? displayData + " yes": displayData + " no";
		displayData = displayData + "<br> Students?";
		if (roomData[roomKey].turtles != {}) {
			for (var turtleKey in roomData[roomKey].turtles) {
				var turtle = roomData[roomKey].turtles[turtleKey];
				if ((turtle.WHO != "-1") && (turtle.BREED === "STUDENTS")) {
					displayData = displayData + "<br>";
					displayData = displayData + "Turtle " + turtle.WHO + " with userId " + turtle.USERID;
				}
			}
		}
		displayData = displayData + "<br><button onclick=Interface.clearRoom('"+roomKey+"')>Clear Room</button>";
	}
	return displayData;
}