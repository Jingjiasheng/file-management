import crypto from "crypto"
const md5 = crypto.createHash('md5');


const FILE = {
    ROOT_DIR: process.env.ROOT_DIR = "/home/jing/file-manager/",
    genUserDir: (auth_code: string) => FILE.ROOT_DIR + md5.update(auth_code).digest("hex"),

}

export { FILE };