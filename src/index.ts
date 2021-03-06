import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import mime from "mime";
import morgan from "morgan";
import multer from "multer";
import { FILE } from "./utils/config/file_mgmt";
import { getLocalIp } from "./utils/get_server_ip";
import { autoClearUserDir } from "./utils/auto_run_ontime/auto_run_clear_user_dir";
import { autoClearReqLimitCache, reqLimitCheck } from "./utils/auto_run_ontime/auto_clear_req_limit";
import { checkSetAuth, clearIpBindAuth } from "./utils/auto_run_ontime/auto_clear_ip_bind_auths";
import { paramLogger } from "./utils/log_fmt/logger";


const app = express();
// const upload = multer({ dest: FILE.ROOT_DIR });
const upload = multer({ dest: FILE.TEMP_DIR });
// const jsonParser = bodyParser.json({ type: 'application/*+json' });
const urlParser = bodyParser.urlencoded();


// registry periodic duty
autoClearUserDir(FILE.CHECK_USER_DIR_CYCLE as number, FILE.CLEAR_USER_DIR_CYCLE as number)
autoClearReqLimitCache(FILE.CLEAR_REQ_LIMIT_CACHE_CYCLE as number)
clearIpBindAuth(FILE.CLEAR_IP_BIND_AUTH_CYCLE as number);

app.use(paramLogger);

app.use(express.static("static"));
app.set("view engine", "ejs");

// reader index page 
app.get("/", (_request, response) => response.render("index"));


app.use("/files", (req, res, next) => {
  try {
    let ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress as string;
    if (!reqLimitCheck(ip)) {
      return res.status(403).json({ code: 403100, message: "Request too fast, do not attack or try again later!" })
    }
    if (!req.headers.auth_code) {
      return res.status(400).json({ code: 400100, message: "You did not set your auth_code, please refresh page!" })
    }
    if (!checkSetAuth(ip, req.headers.auth_code as string)) {
      return res.status(400).json({ code: 400100, message: "You set your auth too quickly, Please set again tomorrow!" })
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
    return res.status(200).json({code: 200100, data:{ file_list: files_infos }, message: "Get user file list successfully!"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500100, message: "Something was wrong in user try to get files from server!" })
  }
});


// download one file
app.get("/files/download", urlParser, (req, res) => {
  try {
    const { file_name } = req.query;
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
