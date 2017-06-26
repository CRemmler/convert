'use strict';

var fs = require("node-fs");
var JSZip = require("jszip");
var Promise = require("bluebird");
Promise.promisifyAll(fs);


function createReport(data, fileName) {
  var webpage = "";
  var value;
  webpage += "<html>\n";
  webpage += "  <head>\n";
  webpage += "  </head>\n";
  webpage += "  <body>\n";
  webpage += "    <b>"+fileName+"</b><hr>\n";
  for (var user in data.userData) {
    for (var key in data.userData[user] ) {
      value = data.userData[user][key];
      if (key === "canvas") {
        webpage += "    <p><img src='"+value+"'>";
      } else { if (key != "exists") {
          webpage += "    <p><span><b>"+key+"</b></span>\n";
          webpage += "    <br><span>"+value+"</span><hr>\n";
        }
      }
    }
  }
  webpage += "  </body>\n";
  webpage+= "</html>";
  return webpage;
}

function sendResponse(reportData, zip, res, fileName) {
  zip.file("reportData.html", reportData);
  zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
  .pipe(fs.createWriteStream(fileName+".zip"))
  .on('finish', function () {
    res.download(fileName+".zip", function() {
    });
  });
}

module.exports = {
  exportData: function (data, roomName, res) {
    var zip = new JSZip();
    var d = new Date();
    var fileName = roomName+"-"+d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+"-"+d.getHours()+"-"+d.getMinutes();
    for (var user in data.userData) {
      for (var key in data.userData[user] ) { if (key === "exists") { data.userData[user][key]=false; } }
    }
    zip.file("world.json", JSON.stringify(data));
    sendResponse(createReport(data, fileName), zip, res, fileName);
  }
};

