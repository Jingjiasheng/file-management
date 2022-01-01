import crypto from "crypto";

const FILE = {
    ROOT_DIR: process.env.ROOT_DIR = "C:\\file-management\\file-management\\root\\",
    genUserDir: (auth_code: string) => FILE.ROOT_DIR + crypto.createHash('md5').update(auth_code).digest("hex") + "\\",
}

export { FILE };

