var express = require('express');
var app = express();
var fs = require('fs');
var LintStream = require('jslint').LintStream;

var bodyParser = require('body-parser');
var multer  = require('multer');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: '/tmp/'}).any());

/*'file' this should be key  from HTTP client
curl -X POST -F "file=@test.js" -F "file=@test.js" http://localhost:8081/upload/
* */

app.post('/upload', function (req, res) {
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
            }else{
                response = {
                    message:'File uploaded successfully',
                    filename:req.files[0].filename
                };
            }

            checkJsLint(filePath, data);

            /*console.log(checkJsHint());*/

            res.end( JSON.stringify( response ) );
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

function checkJsLint(filePath, data) {
    var options = {"edition": "latest", "length": 100};
    var lintStream = new LintStream(options);

    var fileContent = readFileSync(filePath);

    lintStream.write({file: filePath, body: fileContent});


    lintStream.on('data', function (chunk, encoding) {
        // chunk is an object

        // chunk.file is whatever you supplied to write (see above)
        /*assert.deepEqual(chunk.file, filePath);*/

        // chunk.linted is an object holding the result from running JSLint
        // chunk.linted.ok is the boolean return code from JSLINT()
        // chunk.linted.errors is the array of errors, etc.
        // see JSLINT for the complete contents of the object

        if (!chunk.linted.ok) {
            console.log('Error  Status >>>>>>>>>>>>>>>>>>>>>');
            console.log(chunk.linted.errors);
        }

        removeFileSync(filePath);
    });
}

function checkJsHint(data) {
    var source = [
        'function goo() {}',
        'foo = 3;'
    ];
    var options = {
        undef: true
    };
    var predef = {
        foo: false
    };

    JSHINT.jshint(source, options, predef)

    console.log(JSHINT.data());
}

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})