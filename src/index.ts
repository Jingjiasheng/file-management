import fs from "fs";
import path from "path";

import express from "express";
import multer from "multer";
import morgan from "morgan";
import mime from "mime";

import { config } from "./config";
import { getLocalIp } from "./utils/get_server_ip";
import { reqLimitCheck } from "./utils/req_limit_check";
import { FILE } from "./utils/file_mgmt";


const app = express();
const upload = multer({ dest: "./root" });


// base file root dir
const file_root = config.file_root_path;

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))


app.use(express.static("static"));
app.set("view engine", "ejs");

// reader index page 
app.get("/", (_request, response) => response.render("index"));


app.use("/files", (req, res, next) => {
  if (!reqLimitCheck(req.ip)){
    return res.status(403).json({code: 403100, message: "Request too fast, do not attack or try again later!"})
  }
  next();
})



// get file list
app.get("/files", (req, res) => {
  const user_dri = FILE.genUserDir(req.body.auth_code);
  // create user file dir if not exist
  fs.existsSync(user_dri) ?? fs.mkdirSync(user_dri);

  let files_infos: any[] = []
  fs.readdirSync(user_dri).forEach(file_name => {
     files_infos.push({
       ...(fs.statSync(user_dri+ file_name)),
       file_name: file_name,
       file_path: user_dri+file_name,
       mime_type: mime.getType(user_dri+file_name)
     })
  })
  files_infos = files_infos.slice(0,5)
  console.log(files_infos)
  res.send({ file_list: files_infos });
});


// download one file
app.get("/files/download/:file_name", (req, res) => {
  const { file_name } = req.params;
  const user_dri = FILE.genUserDir(req.body.auth_code)

  const file_path = user_dri + file_name;   
  if (fs.statSync(file_path).isFile()){
    res.download(file_path);
  }
  else {
    res.end("Sorry, file is not exist!");
  }
});

//upload single file to server
app.post("/files/upload", upload.single("file"), (request,  response) => {
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

// start server and bind port
app.listen(config.server_port);
if (process.env.NODE_ENV != "prod"){
  console.log(`Server Start In http://${getLocalIp()}:${config.server_port}`);
}
else {
  console.log("Server start success!");
}
