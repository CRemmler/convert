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
   var form = new formidable.IncomingForm();
   form.uploadDir = __dirname + '/nlogo';
   form.parse(req, function(err, fields, files) {
     var file = files.filetoupload;
     filename = file.name || "error";
     fs.rename(file.path, form.uploadDir + "/" + filename);
     var newData;
     fs.readFileAsync(filename, "utf8").then(function(data) {
        var array = data.toString().split("\n");
        for(i in array) {
           if (array[i] === "@#$#@#$#@") { 
             console.log("SECTION");
             newData = newData + "SECTION\n";
           }
        }
      }).then(function() {
        //fs.writeFile(form.uploadDir+"/out"+file.name, newData, function(err) {
        //  if (err) throw err;
        //  console.log('complete');
        //});
      
      }).then(function() {
        //res.download("package.json");
        var zip = new JSZip();
        console.log("make zip files");
        zip.file("hello.txt", "Hello World\n");
        zip.file("dog.txt", "hellow dog");
        fs.readFileAsync("pig.html", "utf8").then(function(data) {
           zip.file("piggies.txt", data);
        }).then(function() {
          fs.readFileAsync("pig.html", "utf8").then(function(data) {
             zip.file("piggies2.txt", data);
          }).then(function() {
            zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
            .pipe(fs.createWriteStream('out.zip'))
            .on('finish', function () {
                res.download("out.zip", function() {
                  var FullPath= __dirname + '/out.zip';
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

app.get('/', function(req, res){
	res.sendfile('index.html');
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT );
});
