# HOW TO RUN IT

## This one method to run it with ts-node ->

1. Download source code to local
    > git clone git@github.com:Jingjiasheng/file-management.git

2. Npm install lib
    > npm i

3. Config the root dir that file will saved on your server
    > cd file-management && vim config.ts // or use other editor which you can open and update config.ts

4. Ok, the last step is run:
    > ts-node file-index.ts

5. If you see print `listen on 4040（or your changed port）` on your system terminal, It's mean you start it successfully! Just link :
 - Local
    > http://lcoalhost:(your port)

 - Remote Server
    > http://(your ip):(your port)

## This is other way to run it with docker ->

1. Are you looking forward to it? Wait first. I haven't finished yet!
    > lalala

## Next step

- IP 绑定 auth_code 需要加上时间绑定数量限制

- 上传/下载传文件的请求速率限制

- 下载文件的进度显示

- 清理 最后更新时间 + 30 day 的文件夹