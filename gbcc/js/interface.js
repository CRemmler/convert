Interface = (function() {

  var items = {};

  function displayLoginInterface(rooms, components) {
    var roomButtonHtml, roomButtonId;
    setupItems();
    $(".netlogo-tab-area").addClass("hidden");
    $(".netlogo-export-wrapper").css("display","none");
    $(".netlogo-speed-slider").css("display","none");
    $(".admin-body").css("display","inline");
    // hide all widgets
    $(".netlogo-widget").addClass("hidden");
    $(".netlogo-model-title").removeClass("hidden");
    // show Welcome Students reporter
    var index = components.componentRange[0];
    var widget = "<div id='netlogo-monitor-"+index+"' class='netlogo-widget netlogo-monitor netlogo-output'"+
    "style='position: absolute; left: 40px; top: 82px; width: 238px; height: 45px; font-size: 14px;'>"+
    "<label class='netlogo-label'>Welcome Student</label> "+
    "<output class='netlogo-value'>Please choose a room.</output></div>";
    $("body").append(widget);
    // show Welcome teacher reporter
    index++;
    widget = "<div id='netlogo-monitor-"+index+"' class='netlogo-widget netlogo-monitor netlogo-output'"+
    "style='position: absolute; left: 40px; top: 341px; width: 238px; height: 45px; font-size: 14px;'>"+
    "<label class='netlogo-label ''>Welcome Teacher</label> <output class='netlogo-value'>"+
    "Please create a room.</output></div>";
    $("body").append(widget);
    // show room name input box
    index++;
    widget = "<label id='netlogo-inputBox-"+index+"' class='netlogo-widget netlogo-input-box netlogo-input'"+
    "style='position: absolute; left: 40px; top: 395px; width: 142px; height: 60px;'>"+
    "<div class='netlogo-label'>room-name</div>  <textarea class='netlogo-multiline-input create-room-input'></textarea></label>";
    $("body").append(widget);
    // show Create Room button
    index++;
    widget = "<button id='netlogo-button-"+index+"'class='netlogo-widget netlogo-button netlogo-command'"+
    " type='button' style='position: absolute; left: 186px; top: 421px; width: 96px; height: 33px;'>"+
    "<div class='netlogo-button-agent-context'></div> <span class='netlogo-label'>Create</span> </button>";
    $("body").append(widget);
    $("#netlogo-button-"+index).on("click", function() {
      var myRoom = $(".create-room-input").val();
      socket.emit("enter room", {room: myRoom});
    });
    // container for room Buttons
    widget = "<div class='netlogo-widget room-button-container' style='background-color: white; overflow: scroll;"+
    " border:1px solid black; position: absolute; left: 40px; top: 137px; width: 238px; height: 193px;"+
    " padding:5px'></div>"
    $("body").append(widget);
    for (var i=0; i<rooms.length; i++) {
      // a room button
      index++;
      widget = "<button id='netlogo-button-"+index+"'class='netlogo-widget netlogo-command'"+
      " type='button' style='width: 103px; height: 33px; border:0px; margin: 5px'>"+
      "<div class='netlogo-button-agent-context'></div> <span class='netlogo-label'>"+rooms[i]+"</span> </button>";
      $(".room-button-container").append(widget);
      $(".room-button-container").on("click", "#netlogo-button-"+index, function() {
        //$("#netlogo-button-"+index).on("click", function() {
        var myRoom = $("#"+$(this).attr("id")+" span").html();
        socket.emit("enter room", {room: myRoom});
      });
    }
    if (activityType === "hubnet") {
      $(".netlogo-gallery").prev().remove();
      $(".netlogo-gallery").remove();
    } else {
      $(".hubnetOnly").css("display","none");
    }
  }

  function displayTeacherInterface(room, components) {
    showItems(components.componentRange[0], components.componentRange[1]);
    if (activityType === "gbcc") { $(".netlogo-export-wrapper").css("display","block"); $(".exporthtml").css("display","none")} 
    $(".roomNameInput").val(room);
    $("#netlogo-title").append(" Room: "+room);
    $(".netlogo-view-container").removeClass("hidden");
    $(".netlogo-tab-area").removeClass("hidden");
    $(".admin-body").css("display","none");
  }

  function displayStudentInterface(room, components) {
    showItems(components.componentRange[0], components.componentRange[1]);
    $("#netlogo-title").append(" Room: "+room);
    $(".netlogo-view-container").removeClass("hidden");
    $(".admin-body").css("display","none");
    $(".teacherOnly").css("display","none");
    $(".netlogo-button:not(.hidden)").click(function(e){clickHandler(this, e, "button");});
    $(".netlogo-slider:not(.hidden)").click(function(e){clickHandler(this, e, "slider");});
    $(".netlogo-switcher:not(.hidden)").click(function(e){clickHandler(this, e, "switcher");});
    $(".netlogo-chooser:not(.hidden)").click(function(e){clickHandler(this, e, "chooser");});
    $(".netlogo-input-box:not(.hidden)").click(function(e){clickHandler(this, e, "inputBox");});
    $(".netlogo-view-container:not(.hidden)").click(function(e){clickHandler(this, e, "view");});
  }

  function displayDisconnectedInterface() {
    $(".admin-body").css("display","inline");
    $(".admin-body").html("You have been disconnected. Please refresh the page to continue.");
    $("#netlogo-model-container").addClass("hidden");
  }

  function displayAdminInterface(rooms) {
    $("#noRoomsChosen").css("display","none");
    $("#netlogo-model-container").addClass("hidden");
    $("#admin-data").html(rooms);
  }

  function clearRoom(roomName) {
    socket.emit("clear room", {roomName: roomName});
  }

  function clickHandler(thisElement, e, widget) {
    var value;
    var id = $(thisElement).attr("id");
    var label = $("#"+id+" .netlogo-label").text();
    if (widget === "view") {
      label = "view";
      position = [ e.clientX, e.clientY ];
      offset = $(thisElement).offset();
      offset = [ offset.left, offset.top ];
      pixelDimensions = [ parseFloat($(thisElement).css("width")), parseFloat($(thisElement).css("height")) ];
      percent = [ ((position[0] - offset[0]) / pixelDimensions[0]), ((position[1] - offset[1]) / pixelDimensions[1]) ];
      patchDimensions = [ universe.model.world.worldwidth, universe.model.world.worldheight ];
      value = [ (percent[0] * patchDimensions[0]) +  universe.model.world.minpxcor,
      universe.model.world.maxpycor - (percent[1] * patchDimensions[1]) ]
    } else if (widget === "button" ) {
      value = "";
    } else {
      value = world.observer.getGlobal(label);
      socket.emit("send reporter", {hubnetMessageSource: "server", hubnetMessageTag: label, hubnetMessage:value});
    }
    socket.emit("send command", {hubnetMessageTag: label, hubnetMessage:value});
  }

  function setupItems() {
    var key, value, id;
    $(".netlogo-widget").each(function() {
      id = $(this).attr("id");
      if (id) {
        key = parseInt(id.replace(/\D/g,''));
        if (key) {
          value = id;
          items[key] = value;
        }
      }
    });
  }

  function showItems(min, max) {
    $(".netlogo-widget").addClass("hidden");
    $(".netlogo-model-title").removeClass("hidden");
    for (var i=min; i<=max; i++) {
      $("#"+items[i]).removeClass("hidden");
    }
  }

  return {
    showLogin: displayLoginInterface,
    showTeacher: displayTeacherInterface,
    showStudent: displayStudentInterface,
    showDisconnected: displayDisconnectedInterface,
    showAdmin: displayAdminInterface,
    clearRoom: clearRoom
  };

})();
