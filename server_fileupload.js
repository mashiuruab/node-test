var express = require('express');
var app = express();
var fs = require('fs');
const uuidV1 = require('uuid/v1');
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
    console.log(req.files);

    var file = __dirname + "/" + req.files[0].filename;

    fs.readFile( req.files[0].path, function (err, data) {
        fs.writeFile(file, data, function (err) {
            if( err ){
                console.log( err );
            }else{
                response = {
                    message:'File uploaded successfully',
                    filename:req.files[0].filename
                };
            }
            console.log( response );
            checkJsLint(req.files[0].filename, data)
            /*console.log(checkJsHint());*/

            res.end( JSON.stringify( response ) );
        });
    });
})


function checkJsLint(fileName, data) {
    var options = {"edition": "latest", "length": 100};
    var l = new LintStream(options);

    console.log(fileName);
    console.log(data);

    l.write({file: fileName, body: 'function test(a, b) {return a + b;}'});


    l.on('data', function (chunk, encoding) {
        // chunk is an object

        // chunk.file is whatever you supplied to write (see above)
        /*assert.deepEqual(chunk.file, fileName);*/

        // chunk.linted is an object holding the result from running JSLint
        // chunk.linted.ok is the boolean return code from JSLINT()
        // chunk.linted.errors is the array of errors, etc.
        // see JSLINT for the complete contents of the object

        console.log(chunk.linted);
        console.log(chunk.linted.ok);
        console.log(chunk.linted.errors)
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