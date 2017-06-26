var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var config = require('./config.json');
var exportworld = require('./export/exportworld.js');
var formidable = require('formidable');
var fs = require("node-fs");
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
					socket.to(key+"-student").emit("send update", {turtles: roomData[key].turtles, patches: roomData[key].patches});
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
		var myUserType, myUserId;
		socket.leave("login");
		if (data.room === "admin") {
			socket.emit("display admin", {roomData: getAdminData()});
		} else {
			// if user is first to enter a room, and only one room exists, then enable the timer
			if (Object.keys(roomData).length === 0) {
				if (activityType === "hubnet") { enableTimer(); }
			}
			// declare myRoom
			socket.myRoom = data.room;
			var myRoom = socket.myRoom;
			if (!roomData[myRoom]) {
				roomData[myRoom] = {};
				roomData[myRoom].turtles = {};
				roomData[myRoom].patches = {};
				roomData[myRoom].userData = {};
				roomData[myRoom].canvasOrder = [];
				roomData[myRoom].settings = {};
			}
			// declare myUserType, first user in is a teacher, rest are students
			socket.myUserType = (countUsers(myRoom) === 0) ? "teacher" : "student";
			myUserType = socket.myUserType;
			// declare myUserId
			myUserId = socket.id;
			roomData[myRoom].userData[myUserId] = {};
			roomData[myRoom].userData[myUserId].exists = true;
			// send settings to client
			socket.emit("save settings", {userType: myUserType, userId: myUserId});
			// join myRoom
			socket.join(myRoom+"-"+myUserType);
			// tell teacher or student to display their interface
			if (myUserType === "teacher") {
				// send the teacher a teacher interface
				socket.emit("display interface", {userType: "teacher", room: myRoom, components: config.interfaceJs.teacherComponents});
				//send to all students on intro page
				rooms = [];
				for (var key in roomData) { rooms.push(key); }
				socket.to("login").emit("display interface", {userType: "login", rooms: rooms, components: config.interfaceJs.loginComponents, activityType: activityType});
				if (activityType === "hubnet") { roomData[myRoom].settings.displayView = true;}
			} else {
				if (activityType === "hubnet") {
					// send student a student interface
					socket.emit("display interface", {userType: "student", room: myRoom, components: config.interfaceJs.studentComponents});
					// send teacher a hubnet-enter-message
					socket.to(myRoom+"-teacher").emit("execute command", {hubnetMessageSource: myUserId, hubnetMessageTag: "hubnet-enter-message", hubnetMessage: ""});
					socket.emit("display my view", {"display":roomData[myRoom].settings.displayView});
				} else {
					// it's gbcc, so send student a teacher interface
					socket.emit("display interface", {userType: "teacher", room: myRoom, components: config.interfaceJs.teacherComponents});
					var dataObject;
					if (roomData[myRoom].userData != {}) {
						for (var j=0; j < roomData[myRoom].canvasOrder.length; j++) {
							if (roomData[myRoom].userData[roomData[myRoom].canvasOrder[j]]["canvas"] != undefined) {
								dataObject = {
									hubnetMessageSource: roomData[myRoom].canvasOrder[j],
									hubnetMessageTag: "canvas",
									hubnetMessage: roomData[myRoom].userData[roomData[myRoom].canvasOrder[j]]["canvas"],
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
		var turtleId, turtle;
		var patchId, patch;
		for (var key in data.turtles)
		{
			turtle = data.turtles[key];
			turtleId = key;
			if (roomData[myRoom].turtles[turtleId] === undefined) {
				roomData[myRoom].turtles[turtleId] = {};
			}
			if (Object.keys(turtle).length > 0) {
				for (var attribute in turtle) {
					roomData[myRoom].turtles[turtleId][attribute] = turtle[attribute];
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
			if (Object.keys(patch).length > 0) {
				for (var attribute in patch) {
					roomData[myRoom].patches[patchId][attribute] = patch[attribute];
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
		if (roomData[myRoom].userData[myUserId]) {
			if (( data.hubnetMessageTag === "canvas") && (roomData[myRoom].userData[myUserId]["canvas"] === undefined)) {
				roomData[myRoom].canvasOrder.push(myUserId);
			}
			if (destination === "server") {
				roomData[myRoom].userData[myUserId][data.hubnetMessageTag] = data.hubnetMessage;
			} else {
				var dataObject = {
					hubnetMessageSource: myUserId,
					hubnetMessageTag: data.hubnetMessageTag,
					hubnetMessage: data.hubnetMessage,
					userId: myUserId,
					activityType: activityType
				};
			 	if (destination === "all-users"){
					if (( data.hubnetMessageTag === "canvas") && (roomData[myRoom].userData[myUserId]["canvas"] === undefined)) {
						roomData[myRoom].userData[myUserId].canvas = data.hubnetMessage;
					} else {
						roomData[myRoom].userData[myUserId][data.hubnetMessageTag] = data.hubnetMessage;
					}
					dataObject.hubnetMessage = data.hubnetMessage;
					socket.to(myRoom+"-teacher").emit("display reporter", dataObject);
					socket.to(myRoom+"-student").emit("display reporter", dataObject);
					socket.emit("display reporter", dataObject);
				} else {
					io.to(destination).emit("display reporter", dataObject);
				}
			}
		}
	});

	app.post('/exportgbccworld', function(req,res){
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
		 var myRoom = fields.roomname;
		 exportworld.exportData(roomData[myRoom], myRoom, res);
	 });
	});

	// pass reporter from student to server
	socket.on("request user data", function(data) {
		var myRoom = socket.myRoom;
		if (roomData[myRoom].userData != undefined) {
			socket.emit("accept user data", {userId: data.userId, userData: roomData[myRoom].userData[data.userId]});
		}
	});

	// pass reporter from student to server
	socket.on("get reporter", function(data) {
		var myRoom = socket.myRoom;
		var myUserId = socket.id;
		if (roomData[myRoom].userData[data.hubnetMessageSource]) {
			var dataObject = {
				hubnetMessageSource: data.hubnetMessageSource,
				hubnetMessageTag: data.hubnetMessageTag,
				hubnetMessage: roomData[myRoom].userData[data.hubnetMessageSource][data.hubnetMessageTag],
				userId: myUserId,
				activityType: activityType
			};
			socket.emit("display reporter", dataObject);
		}
	});

	// get value from server
	socket.on("get value", function(data) {
		var myRoom = socket.myRoom;
		var myUserId = socket.id;
		if (data.hubnetMessageSource === "") { data.hubnetMessageSource = myUserId; }
		if (roomData[myRoom].userData[data.hubnetMessageSource]) {
			var dataObject = {
				hubnetMessageSource: data.hubnetMessageSource,
				hubnetMessageTag: data.hubnetMessageTag,
				hubnetMessage: roomData[myRoom].userData[data.hubnetMessageSource][data.hubnetMessageTag],
			};
			socket.emit("display value", dataObject);
		}
	});

	socket.on("admin clear room", function(data) {
		clearRoom(data.roomName);
	});
	
	socket.on("display view", function(data) {
		var myRoom = socket.myRoom;
		roomData[myRoom].settings.displayView = data.display;
		socket.to(myRoom+"-student").emit("display my view", {"display":data.display});
	});
	
	// user exits
	socket.on('disconnect', function () {
		//clearInterval(myTimer);
		var myRoom = socket.myRoom;
		var myUserId = socket.id;
		if (roomData[myRoom] != undefined && roomData[myRoom].userData[myUserId] != undefined) {
			roomData[myRoom].userData[myUserId].exists = false;
		}
		if (socket.myUserType === "teacher") {
			if (activityType === "hubnet") {
				clearRoom(myRoom);
				disableTimer();
			} else {
				if (countUsers(myRoom) === 0) {	delete roomData[myRoom]; }
			}
		} else {
			if (roomData[myRoom] != undefined) {
				socket.to(myRoom+"-teacher").emit("execute command", {
					hubnetMessageSource: myUserId,
					hubnetMessageTag: "hubnet-exit-message",
					hubnetMessage: ""
				});
				if (countUsers(myRoom) === 0) { delete roomData[myRoom];}
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
		for (var key in roomData[myRoom].userData) {
			clientList.push(key);
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

function countUsers(roomName) {
	var users = 0;
	if (roomData[roomName]) {
		for (var key in roomData[roomName].userData) {
			if (roomData[roomName].userData[key].exists) { users++; }
		}
	}
	return users;
}

function getAdminData() {
	var displayData = "";
	displayData = displayData + "<hr>Any rooms?";
	for (var roomKey in roomData) {
		displayData = displayData + "<hr>Which room? " + roomKey;
		displayData = displayData + "<br>How many users?" + (countUsers(roomKey));
		displayData = displayData + "<br><button onclick=Interface.clearRoom('"+roomKey+"')>Clear Room</button>";
	}
	return displayData;
}
