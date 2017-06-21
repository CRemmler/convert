var socket;
var universe;
var commandQueue = [];
var userData = {};
var myData = {};
var activityType;

jQuery(document).ready(function() {
  var userId;
  var userType;
  var turtleDict = {};
  socket = io();

  // save student settings
  socket.on("save settings", function(data) {
    userId = data.userId;
    userType = data.userType;
  });

  // display teacher or student interface
  socket.on("display interface", function(data) {
    switch (data.userType) {
      case "teacher":
        Interface.showTeacher(data.room, data.components);
        break;
      case "student":
        Interface.showStudent(data.room, data.components);
        break;
      case "login":
        activityType = data.activityType;
        Interface.showLogin(data.rooms, data.components);
        break;
      case "disconnected":
        Interface.showDisconnected();
        break;
    }
  });

  // display admin interface
  socket.on("display admin", function(data) {
    Interface.showAdmin(data.roomData);
  });

  // student repaints most recent changes to world (hubnet, not gbcc)
  socket.on("send update", function(data) {
    universe.applyUpdate({turtles: data.turtles, patches: data.patches});
    universe.repaint();
  });

  // show or hide student view
  socket.on("display my view", function(data) {
    (data.display) ? $(".netlogo-view-container").css("display","block") : $(".netlogo-view-container").css("display","none");
  });

  // students display reporters
  socket.on("display reporter", function(data) {
    //console.log("display reporter "+data.hubnetMessageTag+" "+data.hubnetMessage);
    if (data.hubnetMessageTag === "canvas") {
      if ($("#image-"+data.hubnetMessageSource).length === 0) {
        var canvasImg = new Image();
        canvasImg.id = "image-" + data.hubnetMessageSource;
        canvasImg.src = data.hubnetMessage;
        canvasImg.userId = data.hubnetMessageSource;
        canvasImg.onclick = function() {
          socket.emit("request user data", {userId: canvasImg.userId});
        };
        $(".netlogo-gallery").append(canvasImg);
      } else {
        $("#image-"+data.hubnetMessageSource).attr("src", data.hubnetMessage);
      }
    } else {
      var matchingMonitors = session.widgetController.widgets().filter(function(x) { 
        return x.type === "monitor" && x.display === data.hubnetMessageTag; 
      });
      if (matchingMonitors.length > 0) {
        matchingMonitors[0].compiledSource = data.hubnetMessage;
        matchingMonitors[0].reporter       = function() { return data.hubnetMessage; };
      }
      else if (activityType === "hubnet") {
        //console.log(data.hubnetMessageTag+" "+data.hubnetMessage);
        world.observer.setGlobal(data.hubnetMessageTag.toLowerCase(),data.hubnetMessage);
      } else {
        // WARNING: gbcc-set-globals overwrites globals, may not want this feature
        if (world.observer.getGlobal(data.hubnetMessageTag) != undefined) {
          world.observer.setGlobal(data.hubnetMessageTag, data.hubnetMessage);
        }
      }
    }
  });

  // This function is called after the user clicks on a canvas in the gallery.
  // The data from that user is downloaded before the gallery click handler is initiated
  // WARNING: This means you should not call the gallery click handler from within NetLogo
  // AND You should not call gbcc-get-from-user from outside of the click handler
  socket.on("accept user data", function(data) {
    userData = data.userData;
    world.hubnetManager.gbccRunCode('gbcc-gallery-click "'+data.userId+'"');
  });

  socket.on("execute command", function(data) {
    var commandObject = {};
    commandObject.messageSource = data.hubnetMessageSource;
    commandObject.messageTag = data.hubnetMessageTag;
    commandObject.message = data.hubnetMessage;
    commandQueue.push(commandObject);
    world.hubnetManager.setHubnetMessageWaiting(true);
  });

  // student leaves activity and sees login page
  socket.on("teacher disconnect", function(data) {
    Interface.showDisconnected();
  });

});
