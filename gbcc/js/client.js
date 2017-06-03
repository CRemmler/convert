var socket;
var universe;
var universes = {};
var commandQueue = [];
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
        Interface.showLogin(data.rooms, data.components, data.activityType);
        activityType = data.activityType;
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
          world.hubnetManager.setGbccCanvasSource(canvasImg.userId);
          world.hubnetManager.gbccRunCode("canvas-click");
        };  
        $(".netlogo-gallery").append(canvasImg);
      } else {        
        $("#image-"+data.hubnetMessageSource).attr("src", data.hubnetMessage);
      }
    } else {
      //console.log(data.components[data.hubnetMessageTag]);
      if (activityType === "hubnet") {
        // send it to reporters
        $(data.components[data.hubnetMessageTag]).val(data.hubnetMessage);
      } else {
        // save it in world
        switch (data.hubnetMessageTag) {
          case "patches": 
            break;
          case "turtles": 
            break;
          default: 
            if (world.observer.getGlobal(data.hubnetMessageTag) != undefined) {
              world.observer.setGlobal(data.hubnetMessageTag, data.hubnetMessage);
            }
            break;
        }
      }
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
  
  // when student clicks on chooser, slider, switch, input-box, slider or button on Student Interface  
  $(".netlogo-widget-container").on("click", ".student-input", function() {
    var label, value, id;
    if ($(this).attr("id").includes("chooser")) {
      id = $(this).attr("id");
      label = $("#"+id+" .netlogo-label").text();
      value = $("#"+id+" option:selected").val();
    } else if ($(this).attr("id").includes("slider")) {
      id = $(this).attr("id");
      label = $("#"+id+" .netlogo-label").text();
      value = $("#"+id+" input").val();
    } else if ($(this).attr("id").includes("switch")) {
      id = $(this).attr("id");
      label = $("#"+id+" .netlogo-label").text();
      value = $("#"+id+" input").prop("value");
    } else if ($(this).attr("id").includes("inputBox")) {
      id = $(this).attr("id");
      label = $("#"+id+" .netlogo-label").text();
      value = $("#"+id+" textarea").val();      
    } else if ($(this).attr("id").includes("button")) {
      id = $(this).attr("id");
      label = $("#"+id+" .netlogo-label").text();
      value = "";      
    } 
    if (!($(this).attr("id").includes("button"))) {
      socket.emit("send reporter", {hubnetMessageSource: "server", hubnetMessageTag: label, hubnetMessage:value});      
    }
    console.log("send value "+value + " " + label + " " + id);
    socket.emit("send command", {hubnetMessageTag: label, hubnetMessage:value});
  });
});
