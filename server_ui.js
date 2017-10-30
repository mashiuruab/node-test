var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
var async = require('async');
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

function httpPost(urlOptions, callback) {
    request.post(urlOptions,

        function optionalCallback(err, httpResponse, body) {
            if (err) {
                console.error('upload failed:', err);
                return;
            }
            callback(httpResponse, body)
        });
}

function postSrcFile(filepath, response) {
    var formData = {
        file: fs.createReadStream(filepath),
    };

    var jslintServerAddress = properties.get('server.jslint');
    var jslintUri = jslintServerAddress + "/upload";

    var jshintServerAddress =  properties.get('server.jshint');
    var jshintUri = jshintServerAddress + "/upload";

    var serverUrlsWithOptions = [
        {url : jslintUri, formData: formData},
        {url : jshintUri, formData: formData}
        ];

    var responses = [];
    var completed_request = 0;

    async.map(serverUrlsWithOptions, httpPost, function (httpResponse, body) {
        console.log('Upload successful!  Server responded with:', body);

        responses.push(JSON.parse(body));

        completed_request++;

        if (completed_request == serverUrlsWithOptions.length) {
            removeFileSync(filepath);

            respMessage = {
                status : 'ok',
                msg : responses
            };

            response.end(JSON.stringify(respMessage));
        } else {
            console.log("completed_request = %s and  length = %s",
                completed_request, serverUrlsWithOptions.length)
        }
    })
}

var server = app.listen(8082, function () {
    console.log("Server started");
    console.log(server.address());
});