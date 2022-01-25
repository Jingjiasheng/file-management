import fs from "fs";
import { FILE } from "../config/file_mgmt";

const autoCleanUserFile = async (clear_user_dir_cycle_time: number): Promise<void> => {

  const root_dir = FILE.ROOT_DIR
  const dir_info = await fs.readdirSync(root_dir);
  console.log("系统存在用户目录数量", dir_info.length);
  console.log("系统存在用户目录有：", dir_info);

  await Promise.all(dir_info.map(async (item): Promise<void> => {
    const user_dir = root_dir + "/" + item;
    const item_stat = await fs.statSync(user_dir);
    /** 如果是正常文件夹执行判断删除 */
    if(item_stat.isDirectory() && (Date.now() - item_stat.mtimeMs) / (1000) > clear_user_dir_cycle_time) { // min
      console.log("存在过期用户目录:", item, "即将执行删除...");
      if( await fs.existsSync(user_dir) ) {
        const user_files = await fs.readdirSync(user_dir);
        await Promise.all(user_files.map(async (file,index) => {
          let user_file = user_dir + "/" + file;
          // 因为用户上传的文件都在在一个目录下同级，所以不需要递归删除，只需要删除平级文件即可
          // if(fs.statSync(user_file).isDirectory()) { // recurse
          //   deleteFolder(user_file);
          // } else { // delete file
          console.log("正在删除目录:", item , "子文件", file);
          await fs.unlinkSync(user_file);
          console.log("成功删除目录:", item , "子文件", file);
          // }
        }));
        await fs.rmdirSync(user_dir);
        console.log("过期用户目录:", item, "删除完成！");
      }
    }
    /** 如果根目录下存在文件则属于非正常情况，执行删除 */
    if(item_stat.isFile()) {
      console.log("发现异常文件，正在执行删除:", user_dir);
      await fs.unlinkSync(user_dir)
      console.log("已经删除异常文件:", user_dir);
    }
  }))
}

export const autoClearUserDir = (check_user_dir_cycle_time: number, clear_user_dir_cycle_time: number) => {
  console.log("Aleardy Init AutoClearUserDir Cycle task ======================================")
  setInterval(() => {
        console.log(`${Date()} Start Timeout File Check And Clear ============================================ `);
        autoCleanUserFile(clear_user_dir_cycle_time)
        console.log(`${Date()} Finish Timeout File Check And Clear =========================================== `);
      }, check_user_dir_cycle_time * 1000) //unit: sec
}
