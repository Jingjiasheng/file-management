import os from "os";

export const getLocalIp = (): string => {
  const os_type = os.type(); //系统类型
  const net_info = os.networkInterfaces()!; //网络信息
  let ip = "";
  if (os_type === "Windows_NT") {
    for (const dev in net_info) {
      //win7的网络信息中显示为本地连接，win10显示为以太网
      if (dev === "本地连接" || dev === "以太网") {
        for (let j = 0; j < net_info[dev]!.length; j++) {
          if (net_info[dev]![j].family === "IPv4") {
            ip = net_info[dev]![j].address;
            break;
          }
        }
      }
    }

  }
  else if (os_type === "Linux") {
    ip = net_info.enp2s0![0].address;
  }

  return ip;
};