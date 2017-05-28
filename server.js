var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var fs = require("node-fs");
var JSZip = require("jszip");
var formidable = require('formidable');
var Promise = require("bluebird");
Promise.promisifyAll(fs);

const PORT = process.env.PORT || 3000;



// https://github.com/Stuk/jszip/issues/293
/*zip
.generateNodeStream({streamFiles:true})
.on('end', function () {
  console.log("zip stream ended.");
})
.pipe(fs.createWriteStream('out.zip'))
.on('finish', function () {
  console.log("out.zip written.");
});*/


app.use(express.static(__dirname));
  
app.post('/fileupload',function(req,res){
  console.log("fog fileupload");
   var form = new formidable.IncomingForm();
   form.uploadDir = __dirname + '/nlogo';
   form.parse(req, function(err, fields, files) {
     var file = files.filetoupload;
     filename = file.name || "error";
     fs.rename(file.path, form.uploadDir + "/" + filename);
     var newData;
     fs.readFileAsync(filename, "utf8").then(function(data) {
        //  console.log(contents);
          var array = data.toString().split("\n");
          for(i in array) {
             if (array[i] === "@#$#@#$#@") { 
               console.log("SECTION");
               newData = newData + "SECTION\n";
             }
          }
      }).then(function() {
        fs.writeFile(form.uploadDir+"/out"+file.name, newData, function(err) {
          if (err) throw err;
          console.log('complete');
        });
      }).then(function() {
        res.send("200");
        /*var zip = new JSZip();
        console.log("make zip files");
        zip.file("hello.txt", "Hello World\n");
        zip.file("dog.txt", "hellow dog");
        
        zip.generateAsync({type:"blob"})
        .then(function (blob) {
          console.log("saved as hello.zip");
            saveAs(blob, "hello.zip");
        });*/
        /*zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream('out.zip'))
        .on('finish', function () {
            // JSZip generates a readable stream with a "end" event,
            // but is piped here in a writable stream which emits a "finish" event.
            console.log("out.zip written.");
        });*/
      }).catch(function(e) {
        res.send("200");
          console.error(e.stack);
      });
   });
   
});
  
app.get('/filedownload', function(req, res){
  console.log("download file");
  var file = __dirname + '/package.json';
  res.download(file); // Set disposition and send it.
//  res.sendfile('index.html');
  var FullPath= __dirname + '/nlogo/package.json';
  console.log(FullPath);
  fs.unlink(FullPath, function() {
    console.log(FullPath + " deleted");
  });
});
  
app.get('/', function(req, res){
	res.sendfile('index.html');
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT );
});
