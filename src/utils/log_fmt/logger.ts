/***********************************************************
 * jing ** 8/30/21 2:49 PM ** Logger 中间件
 ***********************************************************/

 import logger from "morgan";
 import type { Request, Response } from "express";
 
 /** 使用正确的时区设置时间格式(在process.env.TZ中定义的时区) */
 logger.token("date", () => {
   const p = new Date()
     .toString()
     .replace(/[A-Z]{3}\+/, "+")
     .split(/ /);
   return p[2] + "/" + p[1] + "/" + p[3] + ":" + p[4] + " " + p[5];
 });
 
 logger.token("requestParameters", (req: Request, _res: Response) => JSON.stringify(req.query) || "-");
 
 logger.token("requestBody", (req: Request, _res: Response) => JSON.stringify(req.body) || "-");
 
 logger.format(
   "show_params",
   "--请求    路径|-> 方法 [:method] --- 地址 [:url] \n" +
   "--请求    发起|-> 地址 [:remote-addr] --- 用户 [:remote-user] --- 日期 [:date] \n" +
   "--用户    环境|-> 环境 [:user-agent] \n" +
   "--请求    结果|-> 状态 [:status] --- 内容长度 [:res[content-length]] --- 响应时长 [:response-time] ms \n" +
   "---------------------------------------------------");
 
 const paramLogger = logger("show_params");
 
 /** 为响应代码4xx和5xx设置特殊的错误日志记录 */
 const errorLogger = logger("common", {
   stream: process.stderr,
   skip: (_, response) => response.statusCode < 400,
 });
 
 /** 为所有请求设置访问日志(跳过错误) */
 const commonLogger = logger("common", {
   stream: process.stdout,
   skip: (_, response) => response.statusCode >= 400
 });
 export {
   errorLogger, commonLogger, paramLogger
 };
 