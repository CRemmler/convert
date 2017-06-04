var socket;
var universe;
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
  $(".netlogo-widget-container").on("click", ".student-input", function(e) {
    var type, label, value, id;
    var position, offset, size;
    if ($(this).attr("id").includes("chooser")) { type = "chooser";
    } else if ($(this).attr("id").includes("slider")) { type = "slider";
    } else if ($(this).attr("id").includes("switch")) { type = "switch";
    } else if ($(this).attr("id").includes("inputBox")) { type = "inputBox";    
    } else if ($(this).attr("id").includes("button")) { type = "button";
    } else if ($(this).attr("id").includes("view")) { type = "view"; } 
    id = $(this).attr("id");    
    switch (type) {
      case "chooser":
        label = $("#"+id+" .netlogo-label").text();
        value = $("#"+id+" option:selected").val();
        break;
      case "slider": 
        label = $("#"+id+" .netlogo-label").text();
        value = $("#"+id+" input").val();
        break;
      case "switch": 
        label = $("#"+id+" .netlogo-label").text();
        value = $("#"+id+" input").prop("value");
        break;
      case "inputBox": 
        label = $("#"+id+" .netlogo-label").text();
        value = $("#"+id+" textarea").val();    
        break;  
      case "button":
        label = $("#"+id+" .netlogo-label").text();
        value = "";      
        break;
      case "view": 
        label = "view";
        position = [ e.clientX, e.clientY ];
        offset = $(this).offset();
        offset = [ offset.left, offset.top ];
        pixelDimensions = [ parseFloat($(this).css("width")), parseFloat($(this).css("height")) ];
        percent = [ ((position[0] - offset[0]) / pixelDimensions[0]), ((position[1] - offset[1]) / pixelDimensions[1]) ]; 
        patchDimensions = [ universe.model.world.worldwidth, universe.model.world.worldheight ];
        value = [ (percent[0] * patchDimensions[0]) +  universe.model.world.minpxcor, 
        universe.model.world.maxpycor - (percent[1] * patchDimensions[1]) ]
        break;
    } 
    if ((type != "button") && (type != "view")) {
      socket.emit("send reporter", {hubnetMessageSource: "server", hubnetMessageTag: label, hubnetMessage:value});      
    }
    socket.emit("send command", {hubnetMessageTag: label, hubnetMessage:value});
    console.log("send "+value + " " + label + " " + id);
  });
  
  
  // highlight all text in output, when clicked
  $(".netlogo-output").click(function() { 
    var sel, range;
    var el = $(this)[0];
    if (window.getSelection && document.createRange) { //Browser compatibility
      sel = window.getSelection();
      if(sel.toString() == ''){ //no text selection
         window.setTimeout(function(){
            range = document.createRange(); //range object
            range.selectNodeContents(el); //sets Range
            sel.removeAllRanges(); //remove all ranges from selection
            sel.addRange(range);//add Range to a Selection.
        },1);
      }
    }
  });
  
});
