var express = require('express');
var app = express();
var fs = require('fs');

var bodyParser = require('body-parser');
var multer  = require('multer');

var http = require('http'),
fs = require('fs');
var querystring = require('querystring');
var esprima = require('./jsprime-node/esprima.js');
var engine = require('./jsprime-node/engine.js');
var analyzer = require('./jsprime-node/analyzer.js');

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');


    // Pass to next layer of middleware
    next();
});



app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: '/tmp/'}).any());

/*'file' this should be key  from HTTP client
curl -X POST -F "file=@test.js" -F "file=@test.js" http://localhost:8081/upload/
* */

app.post('/upload', function (request, response) {
    var filePath = __dirname + "/" + request.files[0].filename;

    fs.readFile( request.files[0].path, function (err, data) {
        if (err) {
            console.log("Error On Reading file %s", request.files[0].path);
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

                response.end( JSON.stringify( response ) );
                return;
            }


            try {
                checkJsPrime(filePath, response);
            } catch (err) {
                console.log(err);
            } finally {
                removeFileSync(filePath);
            }
        });
    });
})


function removeFileSync(filePath) {
    const fs = require('fs');

    fs.unlinkSync(filePath);
    console.log('successfully deleted %s', filePath);
}

function readFileSync(filePath) {
    var fileString = fs.readFileSync(filePath, "utf8");
    return fileString;
}

function checkJsPrime(filePath, response) {
    var fileContent = readFileSync(filePath);

    var source = [
        fileContent
    ];
    var options = {
        undef: true,
        /*'-W100': true,
        '-W097': true*/
    };
    var predef = {
        foo: false
    };


    var result = esprima.parse(code, options);
    var str_result = JSON.stringify(result, null, 4);
    engine.analyze(str_result);
    engine.asignFunctionReturnValue(analyzer.sink);
    var jsprime_res = analyzer.analyzeArrays(engine.real_func_names, engine.real_func_call, engine.real_variable_const, engine.real_variable_var, engine.real_variable_obj, engine.startScope, engine.endScope, code, res);
    var respObj = {
        status : 'error',
        tool : 'jsprime',
        error  : jsprime_res
    };
    response.end( JSON.stringify(respObj));

}

var server = app.listen(8088, function () {
    console.log("Server started");
    console.log(server.address());
})
