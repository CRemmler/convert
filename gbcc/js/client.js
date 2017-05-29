var socket;
var universe;
var universes = {};
var commandQueue = [];

jQuery(document).ready(function() {
  var userId;
  var userType;
  var turtleDict = {};
  socket = io();

  // save student settings
  socket.on("save settings", function(data) {
    userId = data.userId; 
    userType = data.userType; 
    world.hubnetManager.gbccSetupGallery();
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
        Interface.showLogin(data.rooms, data.components, data.activityType);
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
  
  socket.on("display admin", function(data) {
    $("#adminData").html(data.roomData);
  });

  // students display reporters
  socket.on("display reporter", function(data) {
    if (data.hubnetMessageTag === "canvas") {
      if ($("#image-"+data.hubnetMessageSource).length === 0) {
        console.log("display canvas",data.hubnetMessageSource);
        var canvasImg = new Image();
        canvasImg.id = "image-" + data.hubnetMessageSource;
        canvasImg.src = data.hubnetMessage;
        canvasImg.onclick = function() {
          socket.emit("get reporter", {hubnetMessageSource: data.hubnetMessageSource, hubnetMessageTag: "code-example"});
        };  
        $(".netlogo-gallery").append(canvasImg);
      } else {        
        $("#image-"+data.hubnetMessageSource).attr("src", data.hubnetMessage);
      }
    } else {
      $(data.components[data.hubnetMessageTag]).val(data.hubnetMessage);
    }
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
    
  // when student clicks on button on Student Interface
  $(".netlogo-widget-container").on("click", ".student-button", function() {
    socket.emit("send command", {hubnetMessageTag: $(this).text().trim(), hubnetMessage:""});
  });
  // when student clicks on chooser, switch, slider on Student Interface  
  $(".netlogo-widget-container").on("click", ".student-input", function() {
    var value;
    if ($(this).attr("id").includes("chooser")) {
      value = $(this).text().substr(0,$(this).text().indexOf(" "));
    } else if ($(this).attr("id").includes("slider")) {
      value = $(this).text().trim();
    } else if ($(this).attr("id").includes("switch")) {
      value = +$(this).children().text();
    }
    //socket.emit("send command", {hubnetMessageTag: $(this).text().trim(), hubnetMessage:value});
    socket.emit("send reporter", {hubnetMessageSource: "server", hubnetMessageTag: $(this).text().trim(), hubnetMessage:value});
  });
});
