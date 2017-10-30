var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config.properties');

var bodyParser = require('body-parser');
var multer  = require('multer');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: '/tmp/'}).any());

/*'file' this should be key  from HTTP client
curl -X POST -F "file=@test.js" -F "file=@test.js" http://localhost:8081/upload/
* */

app.post('/ui/upload', function (req, res) {
    var filePath = __dirname + "/" + req.files[0].filename;

    fs.readFile( req.files[0].path, function (err, data) {
        if (err) {
            console.log("Error On Reading file %s", req.files[0].path);
            console.log(err);
            return;
        }

        fs.writeFile(filePath, data, function (err) {
            if( err ){
                console.log("Error on writing file at path : %s", filePath);
                console.log( err );
                response = {
                    message:'Error Happened',
                    error:err
                };

                res.end(JSON.stringify(response ));
                return;
            }

            console.log('File Written at path %s', filePath);

            postSrcFile(filePath, res);
        });
    });
});


function removeFileSync(filePath) {
    const fs = require('fs');

    fs.unlinkSync(filePath);
    console.log('successfully deleted %s', filePath);
}

function readFileSync(filePath) {
    var fileString = fs.readFileSync(filePath, "utf8");
    return fileString;
}

function postSrcFile(filepath, response) {
    var formData = {
        file: fs.createReadStream(filepath),
    };

    var jslintServerAddress = properties.get('server.jslint');
    var jslintUri = jslintServerAddress + "/upload";

    request.post(
            {url: jslintUri, formData: formData},

            function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                console.log('Upload successful!  Server responded with:', body);

                removeFileSync(filepath);

                respMessage = {
                    status : 'ok',
                    msg : JSON.parse(body)
                };

                response.end(JSON.stringify(respMessage));
            });
}

var server = app.listen(8082, function () {
    console.log("Server started");
    console.log(server.address());
});