import express from 'express';
import fs from "fs";
import path from 'path';
import { config } from './config';
import { get_local_ip } from './utils/get_ip';

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
app.post('/files', (_request, response) => {
    response.send('upload file to server');
})

app.use(express.static("static"));
app.set('view engine', 'ejs');
//upload single file to server
app.get('/', (_request, response) => response.render("index"));


// start server and bind port
app.listen(config.server_port)
console.log(`Server Start In http://${get_local_ip()}:${config.server_port}`)