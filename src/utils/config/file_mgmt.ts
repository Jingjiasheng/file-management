import crypto from "crypto";
import os from "os";

const FILE = {
    TEMP_DIR: process.env.TEMP_DIR ?? os.type() === "Windows_NT" ? "C:\\Temp\\" : "/home/jing/file-manager/user_dir/temp/",
    ROOT_DIR: process.env.ROOT_DIR ?? os.type() === "Windows_NT" ? "C:\\Temp\\root_path\\" : "/home/jing/file-manager/user_dir/",
    genUserDir: (auth_code: string) => FILE.ROOT_DIR + crypto.createHash('md5').update(auth_code).digest("hex") + "/",
    // check user dir is timeout unit: sec
    CHECK_USER_DIR_CYCLE: process.env.CHECK_USER_DIR_CYCLE ?? 12 * 60 * 60,
    // clear user dir every day  unit: sec
    CLEAR_USER_DIR_CYCLE: process.env.CLEAR_USER_DIR_CYCLE ?? 30 * 24 * 60 * 60,
    // clear user request limit  unit: sec
    CLEAR_REQ_LIMIT_CACHE_CYCLE: process.env.CLEAR_REQ_LIMIT_CACHE_CYCLE ?? 1 * 30
}

export { FILE };

