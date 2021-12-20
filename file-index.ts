import express from 'express';
import fs from "fs";
import path from 'path';
import { config } from './config';

var app = express()

// base file root dir
const file_root = config.file_root_path;

// get file list
app.get('/files', (_request, response) => {
    let files: string[] = [];
    fs.readdirSync(file_root)
    .forEach(file => { 
        files.push(file)
        console.log(file); 
    })
    response.send({
        file_list: files
    })
})


// get file list
app.get('/download/:fileName', (request, response) => {
    const { fileName } = request.params;
    const filePath = path.join(file_root, fileName);    
    if(fs.statSync(filePath).isFile()){
        response.download(filePath);
    } 
    else {
        response.end("Sorry, file is not exist!");
    }
})

//upload single file to server
app.post('/files', function (request, response) {
    response.send('upload file to server');
})

app.set("views", path.join(__dirname, "./static"))
app.use('./static',express.static(path.resolve(__dirname,"./")));
app.use(express.static("assets"));
app.set('view engine', 'ejs');
//upload single file to server
app.get('/', function (request, response) {
    response.render("index");
})

// start server and bind port
app.listen(config.server_port)
console.log('启动4040')