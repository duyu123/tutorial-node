const http = require('http')
const chalk = require('chalk')
const path = require('path')
const defaultConf = require('./tools/config')
const route = require('./tools/route')
const open = require('./tools/open')

module.exports = class Server {
  constructor(config = {}) {
    this.conf = Object.assign({}, defaultConf, config)
    // this.staticPath = opts.staticPath || 'static'
  }

  start() {
    const server = http.createServer((req, res) => {
      if (req.url !== '/favicon.ico') {
        const filePath = path.join(this.conf.root, req.url)

        route(req, res, filePath, this.conf)
      }
    }).listen(this.conf.port, this.conf.hostname, () => {
      const addr = `http://${this.conf.hostname}:${this.conf.port}`;
      console.info(`Server running at ${chalk.green(addr)}`)
      if (this.conf.open) {
        open(addr)
      }
    })
  }

}