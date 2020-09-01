const {
  exec
} = require('child_process');

module.exports = function (url) {
  switch (process.platform) { // 判断运行平台
    case 'darwin': // mac
      exec(`open ${url}`); // 执行系统命令
      break;
    case 'win32':
      exec(`start ${url}`);
      break;
  }
}