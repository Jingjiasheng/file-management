import crypto from "crypto";

const FILE = {
    TEMP_DIR: process.env.TEMP_DIR ?? "C:\\Temp\\",
    ROOT_DIR: process.env.ROOT_DIR ?? "C:\\Temp\\root_path\\",
    genUserDir: (auth_code: string) => FILE.ROOT_DIR + crypto.createHash('md5').update(auth_code).digest("hex") + "/",
}

export { FILE };

