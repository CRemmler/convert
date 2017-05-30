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
     var file = files.filetoupload;
     nlogoFileName = file.name || "error";
     var configFile;
     var nlogoFile;
     var indexFile;
     var loginWidgerRange, studentWidgetRange, teacherWidgetRange;
     var widgetList = [];
     var inputComponentList = [];
     var reporterComponentList = [];
     // read in x.nlogo file
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
        for(i in array) {
          nlogoFile = nlogoFile + array[i] + "\n";
          if (arrayIndex === 1) { if ((array[i] === "") && (array[i = 1] != "")) { numTeacherWidgets++; } }
          if (arrayIndex === 8) {
            if ((array[i] === "") && (array[(parseInt(i) + 1).toString()] != "")) { newWidget = true; numStudentWidgets++; }
            if (array[i].includes("BUTTON") || array[i].includes("MONITOR") || array[i].includes("SLIDER") || 
              array[i].includes("VIEW") || array[i].includes("CHOOSER") || array[i].includes("SWITCH")
              || array[i].includes("INPUT")) {
              if (lastWidgetType === "view") {}
              if (lastWidgetType === "chooser") { inputComponentList.push([label, "netlogo-chooser-"+(numStudentWidgets + numTeacherWidgets - 3)]); }
              if (lastWidgetType === "switch") { inputComponentList.push([label, "netlogo-switch-"+(numStudentWidgets + numTeacherWidgets - 3)]); }              
              if (lastWidgetType === "slider") { inputComponentList.push([label, "netlogo-slider-"+(numStudentWidgets + numTeacherWidgets - 3)]); }
              // for the buttons, find last NIL and add 3 more NILS after it
              if (lastWidgetType === "button") { widget = widget.substr(0,widget.lastIndexOf("NIL"))+"NIL\nNIL\nNIL\nNIL\n"+widget.lastIndexOf("NIL"); }
                //remove the last 4 \n (and everything in between) and append "\n0\n1\n11\n"              
              if (lastWidgetType === "monitor") {
                widget = widget.substr(0,widget.lastIndexOf("\n"));
                widget = widget.substr(0,widget.lastIndexOf("\n"));
                widget = widget.substr(0,widget.lastIndexOf("\n"));
                widget = widget.substr(0,widget.lastIndexOf("\n"));
                widget = widget+'\n""\n0\n1\n11\n';
                reporterComponentList.push([label, "#netlogo-monitor-"+(numStudentWidgets + numTeacherWidgets)+" output"]);
              }
              widgetList.push(widget);
              if (array[i].includes("VIEW")) { lastWidgetType = "view"; label = array[(parseInt(i) + 5).toString()];}
              if (array[i].includes("CHOOSER")) { lastWidgetType = "chooser"; label = array[(parseInt(i) + 5).toString()];}
              if (array[i].includes("SWITCH")) { lastWidgetType = "switch"; label = array[(parseInt(i) + 5).toString()];}
              if (array[i].includes("BUTTON")) { lastWidgetType = "button"; }
              if (array[i].includes("SLIDER")) { lastWidgetType = "slider"; label = array[(parseInt(i) + 5).toString()]; }
              if (array[i].includes("MONITOR")) { lastWidgetType = "monitor"; label = array[(parseInt(i) + 5).toString()]; }
              newWidget = false;
              widget = "\n";
            }
            if (!newWidget) { widget = widget + array[i] + "\n"; }
          }
          if (array[i] === "@#$#@#$#@") { 
            if (arrayIndex === 8) {
              if (lastWidgetType === "view") {}
              if (lastWidgetType === "chooser") { inputComponentList.push([label, "netlogo-chooser-"+(numStudentWidgets + numTeacherWidgets - 3)]); }
              if (lastWidgetType === "switch") { inputComponentList.push([label, "netlogo-switch-"+(numStudentWidgets + numTeacherWidgets - 3)]); }              
              if (lastWidgetType === "slider") { inputComponentList.push([label, "netlogo-slider-"+(numStudentWidgets + numTeacherWidgets - 3)]); }
              // for the buttons, find last NIL and add 3 more NILS after it
              if (lastWidgetType === "button") { widget = widget.substr(0,widget.lastIndexOf("NIL"))+"NIL\nNIL\nNIL\nNIL\n"+widget.lastIndexOf("NIL"); }
                //remove the last 4 \n (and everything in between) and append "\n0\n1\n11\n"              
              if (lastWidgetType === "monitor") {
                widget = widget.substr(0,widget.lastIndexOf("\n"));
                widget = widget.substr(0,widget.lastIndexOf("\n"));
                widget = widget.substr(0,widget.lastIndexOf("\n"));
                widget = widget.substr(0,widget.lastIndexOf("\n"));
                widget = widget+'\n""\n0\n1\n11\n';
                reporterComponentList.push([label, "#netlogo-monitor-"+(numStudentWidgets + numTeacherWidgets)+" output"]);
              }
              widgetList.push(widget);
            }
            arrayIndex++; 
          }
        }
        teacherWidgetRange = [0, numTeacherWidgets - 1];
        studentWidgetRange = (numStudentWidgets === 0) ? teacherWidgetRange : [numTeacherWidgets, numTeacherWidgets + numStudentWidgets - 3];
        loginWidgetRange = [(numTeacherWidgets + numStudentWidgets - 2),(numTeacherWidgets + numStudentWidgets - 2)];
        widgetList.shift();

        var oldNlogoFile = nlogoFile;    
        var array = oldNlogoFile.toString().split("\n");
        nlogoFile = "";
        arrayIndex = 0;
        for (i in array) {
          if (array[i] === "@#$#@#$#@") { 
            arrayIndex++; 
            if (arrayIndex === 2) {
              for (var j=0; j<widgetList.length; j++) {
                nlogoFile = nlogoFile + widgetList[j] + "\n";
              }
            } 
          }
          nlogoFile = nlogoFile + array[i] + "\n";
        }
        //console.log(nlogoFile);
      }).then(function() {
        // read in config file
        fs.readFileAsync("gbcc/config.json", "utf8").then(function(data) {
           var array = data.toString().split("\n");
           var configData = data;
           configFile = "";
           for(var i in array) {
             configFile = configFile + array[i] + "\n";
             if (array[i].includes("loginComponents")) { configFile = configFile + '      "componentRange": [' +loginWidgetRange + "]\n" }
             if (array[i].includes("teacherComponents")) { configFile = configFile + '      "componentRange": [' +teacherWidgetRange + "]\n" }
             if (array[i].includes("studentComponents")) { configFile = configFile + '      "componentRange": [' +studentWidgetRange + "]\n" }
             if (array[i].includes("reporterComponents")) {
               for (var j=0; j<reporterComponentList.length; j++) {
                 configFile = configFile + '       "'+reporterComponentList[j][0]+'": "'+reporterComponentList[j][1]+'"';
                 configFile = (j+1 != reporterComponentList.length) ? configFile +',\n' : configFile +'\n';
               }
             }
             if (array[i].includes("inputComponents")) {
               for (var j=0; j<inputComponentList.length; j++) {
                 configFile = configFile + '       "'+inputComponentList[j][0]+'": "'+inputComponentList[j][1]+'"';
                 configFile = (j+1 != inputComponentList.length) ? configFile +',\n' : configFile +'\n';
               }
             }
           }
         }).then(function() {
            indexFile = "";
            // read in index1
            fs.readFileAsync("gbcc/index1.html", "utf8").then(function(data) {
               var array = data.toString().split("\n");
               for (i in array) { indexFile = indexFile + array[i] + "\n"; }
               // add nlogoFile after index1
               indexFile = indexFile + nlogoFile;
             }).then(function() {
                // add index3 after nlogoFile
                fs.readFileAsync("gbcc/index3.html", "utf8").then(function(data) {
                   var array = data.toString().split("\n");
                   for (i in array) { indexFile = indexFile + array[i] + "\n"; }
                }).then(function() {
                      var zip = new JSZip();
                      console.log(configFile);
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
                                    .pipe(fs.createWriteStream('out'+guid+'.zip'))
                                    .on('finish', function () {
                                        res.download('out'+guid+'.zip', function() {
                                          var FullPath= __dirname + '/out'+guid+'.zip';
                                          console.log(FullPath);
                                          fs.unlink(FullPath, function() {
                                            console.log(FullPath + " deleted");
                                          });
                                        });
                                    });
                                  }).catch(function(e) {
                                    res.sendfile('index.html');
                                    console.error(e.stack);
                                  });
                               });
                            });
                         });
                      });
                   });
                });
              });
           });
         });
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
