var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var fs = require("node-fs");
var JSZip = require("jszip");
var formidable = require('formidable');
var Promise = require("bluebird");
Promise.promisifyAll(fs);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.post('/fileupload',function(req,res){
   console.log("NOTE FROM C: If you get an ENOENT error, place your file in this directory, and then upload.");
   var form = new formidable.IncomingForm();
   var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
   form.parse(req, function(err, fields, files) {
     var title = files.filetoupload.name;
     nlogoFileName = files.filetoupload.path || "error";
     var configFile;
     var nlogoFile;
     var indexFile;
     var loginWidgerRange, studentWidgetRange, teacherWidgetRange;
     var widgetList = [];
     fs.readFileAsync(nlogoFileName, "utf8").then(function(data) {
        var array = data.toString().split("\n");
        nlogoFile = "";
        var numTeacherWidgets = 0;
        var numStudentWidgets = 0;
        var arrayIndex = 0;
        var widget = "";
        var newWidget = false;
        var lastWidgetType = "";
        var label;
        var widgets = ["BUTTON", "SLIDER", "SWITCH", "CHOOSER", "INPUTBOX", "MONITOR", "OUTPUT", "TEXTBOX", "VIEW", "GRAPHICS-WINDOW", "PLOT"];
        var viewWidgets = ["VIEW", "GRAPHICS-WINDOW"];
        for(i in array) {
          // buttons on the client need a client-procedure, to avoid a console error
          if (arrayIndex === 0 && array[i] === "@#$#@#$#@") { nlogoFile = nlogoFile + "\n\nto client-procedure\nend\n"; }
          nlogoFile += array[i] + "\n";
          if (arrayIndex === 1) { if (widgets.indexOf(array[i]) > -1) { numTeacherWidgets++; } }
          if (arrayIndex === 8) {
            if ((widgets.indexOf(array[i]) > -1) || (array[i]==="@#$#@#$#@")) {
              if ((array[i] != "VIEW") && (array[i]!="@#$#@#$#@")) { numStudentWidgets++; }
              switch (lastWidgetType) {
                case "BUTTON":
                  widget = widget.substr(0,widget.lastIndexOf("NIL"))+"NIL\nNIL\nNIL\n"+widget.lastIndexOf("NIL")+"\n\n";
                  widget = widget.replace("NIL","client-procedure");
                  if (widget.split("NIL").length === 5) { widget = widget.replace("NIL\nNIL","NIL\nNIL\nNIL"); }
                  break;
                case "MONITOR":
                  widget = widget.substr(0,widget.indexOf("NIL"))+'""'+"\n0\n1\n11\n";
                  //widget = widget.replace("NIL",label+"\n0");
                  break;
                case "CHOOSER":
                  var widgetLines = widget.split("\n");
                  widgetLines[7]  = widgetLines[7].replace(/\\"/g, "\"");
                  widget          = widgetLines.join("\n");
              }
              if ((widget != "") && (viewWidgets.indexOf(lastWidgetType) === -1)) {
                widgetList.push(widget);
                widget = "";
              }
              lastWidgetType = array[i];
              label = array[(parseInt(i) + 5).toString()];
            }
            if (lastWidgetType != "VIEW") { widget += array[i] + "\n"; }

          }
          if (array[i] === "@#$#@#$#@") { arrayIndex++; }
        }
        teacherWidgetRange = [0, numTeacherWidgets - 1];
        studentWidgetRange = (numStudentWidgets === 0) ? teacherWidgetRange : [numTeacherWidgets, numTeacherWidgets + numStudentWidgets - 1];
        loginWidgetRange = [(numTeacherWidgets + numStudentWidgets), (numTeacherWidgets + numStudentWidgets)];
        var oldNlogoFile = nlogoFile;
        var array = oldNlogoFile.toString().split("\n");
        nlogoFile = "";
        arrayIndex = 0;
        for (i in array) {
          if (array[i] === "@#$#@#$#@") {
            arrayIndex++;
            if (arrayIndex === 2) {
              for (var j=0; j<widgetList.length; j++) {
                nlogoFile += widgetList[j] + "\n";
              }
            }
          }
          nlogoFile += array[i] + "\n";
        }
        //console.log(nlogoFile);
      }).then(function() {
      fs.readFileAsync("gbcc/config.json", "utf8").then(function(data) {
         var array = data.toString().split("\n");
         var configData = data;
         configFile = "";
         for(var i in array) {
           configFile += array[i] + "\n";
           if (array[i].includes("loginComponents")) { configFile = configFile + '      "componentRange": [' +loginWidgetRange + "]\n" }
           if (array[i].includes("teacherComponents")) { configFile = configFile + '      "componentRange": [' +teacherWidgetRange + "]\n" }
           if (array[i].includes("studentComponents")) { configFile = configFile + '      "componentRange": [' +studentWidgetRange + "]\n" }
         }
         //console.log(configFile);
      }).then(function() {
      fs.readFileAsync("gbcc/index1.html", "utf8").then(function(data) {
         indexFile = "";
         var array = data.toString().split("\n");
         for (i in array) { indexFile += array[i] + "\n"; }
         indexFile += "\ndocument.title = '"+title+"';\n</script>";
         indexFile += "\n<script type='text/nlogo' id='nlogo-code' data-filename='"+title+"'>";
         indexFile += nlogoFile;
      }).then(function() {
      fs.readFileAsync("gbcc/index3.html", "utf8").then(function(data) {
         var array = data.toString().split("\n");
         for (i in array) { indexFile += array[i] + "\n"; }
      }).then(function() {
        var zip = new JSZip();
        zip.file("config.json", configFile);
        zip.file("index.html", indexFile);
        zip.file(nlogoFileName, nlogoFile);
        fs.readFileAsync("gbcc/js/client.js", "utf8").then(function(data) {
           zip.file("js/client.js", data);
        }).then(function() {
        fs.readFileAsync("gbcc/js/interface.js", "utf8").then(function(data) {
           zip.file("js/interface.js", data);
        }).then(function() {
        fs.readFileAsync("gbcc/js/jquery.min.js", "utf8").then(function(data) {
           zip.file("js/jquery.min.js", data);
        }).then(function() {
        fs.readFileAsync("gbcc/js/tortoiseCompiler.js", "utf8").then(function(data) {
           zip.file("js/tortoiseCompiler.js", data);
        }).then(function() {
        fs.readFileAsync("gbcc/package.json", "utf8").then(function(data) {
           zip.file("package.json", data);
        }).then(function() {
        fs.readFileAsync("gbcc/readme.md", "utf8").then(function(data) {
           zip.file("readme.md", data);
        }).then(function() {
        fs.readFileAsync("gbcc/server.js", "utf8").then(function(data) {
           zip.file("server.js", data);
        }).then(function() {
        zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
          .pipe(fs.createWriteStream(guid+'.zip'))
          .on('finish', function () {
            res.download(guid+'.zip', function() {
              var fullPath= __dirname + '/'+guid+'.zip';
              console.log(fullPath);
              fs.unlink(fullPath, function() {
                console.log(fullPath + " deleted");
              });
            });
          });
        }).catch(function(e) {
          res.sendfile('index.html');
          console.error(e.stack);
        }); }); }); }); }); }); }); }); }); });
      });
   });
});

function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

app.get('/', function(req, res){
	res.sendfile('index.html');
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT );
});
