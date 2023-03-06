const path = require('path');
const scpClient = require('scp2'); // 引入scp2
const ora = require('ora');
const chalk = require('chalk');
const spinner = ora('正在发布到服务器...');
const fsPromises = require('fs').promises;
const Client = require('ssh2').Client;

init();
async function init() {
  const black = ["node_modules", "web", ".idea","log.log",".DS_Store", ".git", ".gitignore"];
  const dirList = await fsPromises.readdir('./');

  // foreach 批量上传 ssh2 报链接错误
  for (let i = 0; i < dirList.length;) {
    const v = dirList[i];
    if (!black.includes(v)) {
      await scp(v)
      if (i + 1 === dirList.length) {
        console.log(chalk.blue('上传结束!'));
        process.exit(0);
      }
    }
    i++
  }
}

function scp(fileName) {
  return new Promise((resolve) => {
    const conn = new Client();
    const PATH = `/service/web/${fileName}`;
    const server = {
      host: '', // 服务器的IP地址
      port: '', // 服务器端口
      username: "", // 用户名
      password: '', // 密码
      path: PATH, // 项目部署的服务器目标位置
      command: `rm -rf ${PATH}`, // 删除命令
    };

    const SCP_UPLOAD_PATH = path.resolve(__dirname, `./${fileName}`);
    conn
      .on('ready', () => {
        conn.exec(server.command, (err, stream) => {
          if (err) {
            throw err;
          }
          stream
            .on('close', () => {
              spinner.start(fileName + " 正在发布到服务器...");
              scpClient.scp(
                SCP_UPLOAD_PATH, // 本地打包文件的位置
                {
                  host: server.host,
                  port: server.port,
                  username: server.username,
                  password: server.password,
                  path: server.path,
                },
                async (err) => {
                  if (err) {
                    console.log(chalk.red(fileName + '上传失败!'));
                    throw err;
                  } else {
                    conn.end();
                    console.log(chalk.green(fileName + '上传成功!'));
                    resolve()
                  }
                  spinner.stop();
                },
              );
            })
        });
      })
      .connect({
        host: server.host,
        port: server.port,
        username: server.username,
        password: server.password,
      });
  })
}
