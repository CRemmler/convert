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
        Interface.showLogin(data.rooms, data.components, activityType);
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
        var canvasImg = new Image();
        canvasImg.id = "image-" + data.hubnetMessageSource;
        canvasImg.src = data.hubnetMessage;
        canvasImg.userId = data.hubnetMessageSource;
        canvasImg.onclick = function() {
          socket.emit("request user data", {userId: canvasImg.userId});
          //world.hubnetManager.setGbccCanvasSource(canvasImg.userId);        
          //world.hubnetManager.gbccRunCode('gbcc-gallery-click "'+canvasImg.userId+'"');
        };  
        $(".netlogo-gallery").append(canvasImg);
      } else {        
        $("#image-"+data.hubnetMessageSource).attr("src", data.hubnetMessage);
      }
    } else {
      if (activityType === "hubnet") {
        // send it to reporters
        $(data.components[data.hubnetMessageTag]).val(data.hubnetMessage);
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
    
  // when student clicks on button on Student Interface
  $(".netlogo-widget-container").on("click", ".student-button", function() {
    socket.emit("send command", {hubnetMessageTag: $(this).text().trim(), hubnetMessage:""});
  });
  // when student clicks on chooser, switch, slider on Student Interface  
  $(".netlogo-widget-container").on("click", ".student-input", function() {
    var label, value, id;
    if ($(this).attr("id").includes("chooser")) {
      id = $(this).attr("id");
      label = $("#"+id+" span").text()
      value = $("#"+id+" option:selected").val()
    } else if ($(this).attr("id").includes("slider")) {
      id = $(this).attr("id");
      label = $("#"+id+" input").text().trim();
      value = $("#"+id+" input").val();
    } else if ($(this).attr("id").includes("switch")) {
      id = $(this).attr("id");
      label = $("#"+id+" span").text();
      value = $("#"+id+" input").val();
    }
    //console.log("send value "+value + " " + label + " " + id);
    socket.emit("send command", {hubnetMessageTag: label, hubnetMessage:parseInt(value)});
    socket.emit("send reporter", {hubnetMessageSource: "server", hubnetMessageTag: label, hubnetMessage:parseInt(value)});
  });
});
