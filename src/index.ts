import fs from "fs";
import path from "path";

import express from "express";
import multer from "multer";
import morgan from "morgan";

import { config } from "./config";
import { getLocalIp } from "./utils/get_ip";


const app = express();
const upload = multer({ dest: "./root" });


// base file root dir
const file_root = config.file_root_path;

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
// get file list
app.get("/files", (_request, response) => {
  const files: string[] = [];
  for (const file of fs.readdirSync(file_root)) { 
    files.push(file);
    console.log(file); 
  }
  response.send({ file_list: files });
});


// get file list
app.get("/download/:file_name", (request, response) => {
  const { file_name } = request.params;
  const file_path = path.join(file_root, file_name);    
  if (fs.statSync(file_path).isFile()){
    response.download(file_path);
  } 
  else {
    response.end("Sorry, file is not exist!");
  }
});

//upload single file to server
app.post("/files", upload.single("file"), (request,  response) => {
  // const oldpath = request.file.destination + "/" + request.file.filename;
  // const newpath = request.file.destination + "/" + request.file.originalname;
  // fs.rename(oldpath,newpath,() => {
  //   console.log("重命名成功" + newpath);
  // });
  //成功预览
  // res.send(`<h1>上传成功</h1><img src="./upload/${req.file.originalname}"/>`);
  setTimeout(()=>{},2000)
  response.send("upload file to server");
});

app.use(express.static("static"));
app.set("view engine", "ejs");
//upload single file to server
app.get("/", (_request, response) => response.render("index"));


// start server and bind port
app.listen(config.server_port);
if (process.env.NODE_ENV != "prod"){
  console.log(`Server Start In http://${getLocalIp()}:${config.server_port}`);
}
else {
  console.log("Server start success!");
}
