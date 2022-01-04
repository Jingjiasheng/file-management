import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import mime from "mime";
import morgan from "morgan";
import multer from "multer";
import { FILE } from "./utils/file_mgmt";
import { getLocalIp } from "./utils/get_server_ip";
import { reqLimitCheck } from "./utils/req_limit_check";


const app = express();
// const upload = multer({ dest: FILE.ROOT_DIR });
const upload = multer({ dest: FILE.TEMP_DIR });
const jsonParser = bodyParser.json({ type: 'application/*+json' });
const urlParser = bodyParser.urlencoded();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))


app.use(express.static("static"));
app.set("view engine", "ejs");

// reader index page 
app.get("/", (_request, response) => response.render("index"));


app.use("/files", (req, res, next) => {
  try {
    if (!reqLimitCheck(req.ip)) {
      return res.status(403).json({ code: 403100, message: "Request too fast, do not attack or try again later!" })
    }
    if (!req.headers.auth_code) {
      return res.status(400).json({ code: 400100, message: "You did not set your auth_code, please refresh page!" })
    }
    const user_dri = FILE.genUserDir(req.headers.auth_code as string);
    // create file dir for new user if not exist
    if (!fs.existsSync(user_dri)) {
      fs.mkdirSync(user_dri);
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500100, message: "Something was wrong in user dir check or The server was attacked!" })
  }
})



// get file list
app.post("/files/get_list", urlParser, (req, res) => {
  try {
    const user_dri = FILE.genUserDir(req.headers.auth_code as string);
    let files_infos: any[] = []
    fs.readdirSync(user_dri).forEach(file_name => {
      files_infos.push({
        ...(fs.statSync(user_dri + file_name)),
        file_name: file_name,
        file_path: user_dri + file_name,
        mime_type: mime.lookup(user_dri + file_name)
      })
    })
    files_infos = files_infos.slice(0, 5)
    res.send({ file_list: files_infos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500100, message: "Something was wrong in user try to get files from server!" })
  }
});


// download one file
app.post("/files/download", urlParser, (req, res) => {
  try {
    const { file_name } = req.body;
    const user_dir = FILE.genUserDir(req.headers.auth_code as string)
    const file_path = user_dir + file_name;
    if (fs.existsSync(file_path) && fs.statSync(file_path).isFile()) {
      res.download(file_path);
    }
    else {
      return res.status(400).json({ code: 400100, message: "Sorry, file is not exist!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500100, message: "Something was wrong in user try to download file!" })
  }
});


// delete files
app.post("/files/delete", urlParser, (req, res) => {
  try {
    const { file_names } = req.body;
    const user_dir = FILE.genUserDir(req.headers.auth_code as string)
    file_names.map(file_name => {
      const file_path = user_dir + file_name;
      // if (!(fs.existsSync(file_path) && fs.statSync(file_path).isFile())) {
      //   return res.status(400).json({ code: 400100, message: "Sorry, file is not exist!" });
      // }
      fs.unlinkSync(file_path);
    });
    return res.status(200).json({ code: 200100, message: "File deletion complete!" })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500100, message: "Something was wrong in user try to delete files!" })
  }
});


//upload single file to server
app.post("/files/upload", upload.single("file"), (req, res) => {
  try {
    if (req.file === undefined) {
      return res.status(403).json({ code: 403100, message: "Cannot upload empty file!" });
    }
    const oldpath = req.file.destination + req.file.filename;
    const newpath = FILE.genUserDir(req.headers.auth_code as string) + req.file.originalname;
    fs.copyFileSync(oldpath, newpath);
    fs.unlinkSync(oldpath);
    return res.status(200).json({ code: 200100, message: "Upload File To Server Successfully!" })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500100, message: "Something was wrong in user try to upload file to server!" })
  }
});

// start server and bind port
app.listen(process.env.PORT ?? 4040);
if (process.env.NODE_ENV != "prod") {
  console.log(`Server Start In http://${getLocalIp()}:${process.env.PORT ?? 4040}`);
}
else {
  console.log("Server start success!");
}
