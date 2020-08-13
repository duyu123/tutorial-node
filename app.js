const http = require('http')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const url = require('url')
const zlib = require('zlib')
const ejs = require('ejs')

module.exports = class Server {
  constructor(opts = {}) {
    this.host = opts.host || '127.0.0.1'
    this.port = opts.port || 3000
    this.staticPath = opts.staticPath || 'static'
  }

  start() {
    let server = http.createServer(this.handleRequest.bind(this));

    server.listen(this.port, this.host, ()=> {
      console.info(`Server running at ${chalk.yellow(this.host)}:${chalk.blue(this.port)}`)
    })
  }

  handleRequest(req, res) {
    let self = this;

    // 获取请求的文件名
    let { pathname } = url.parse(req.url)
    
    // 把请求的文件名转换成static下的绝对路径
    let p = path.join(__dirname, './', this.staticPath, pathname);

    fs.stat(p, function(err, stats) {
      if(err) {
        res.end(err)
      }

      if(stats.isDirectory()) {
        self.sendDir(req, res, stats, p)
      } else {
        self.sendFile(req, res, stats, p)
      }
    })
  }

  sendFile(req, res, stats, p) {
    const ct = mine.getType(p) || 'text/plain';

    res.setHeader('Content-Type', ct + ';charset=utf-8') // 发送数据类型
    
    if(this.setCache(req, res, stats, p)) {
      res.statusCode = 304;
      return res.end();
    }

    let transform = this.gzip(req, res, stats, p)
    if(transform) {
      return fs.createReadStream(p).pipe(transform).pipe(res)
    }
    fs.createReadStream(p).pipe(res)
  }

  sendDir(req, res, stats, p) {
    let {pathname} = url.parse(req.url)

    res.setHeader('Content-Type', 'text/html;charset=utf-8') // 发送的数据类型
    let template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8')
    let files = fs.readdirSync(p)

    files = files.map(file => {
      return {
        filename: file,
        filepath: path.join(pathname, file)
      }
    })

    let str = ejs.render(template, {
      name: `index of ${pathname}`,
      arr: files
    })

    res.end(str)
  }

  setCache(req, res, stats, p) {
    res.setHeader('Cache-Control', 'max-age=10') // 缓存存活时间
    res.setHeader('Expires', new Date(Date.now() + 10* 1000).toGMTString()) // 缓存存活时间

    let etag = stats.ctime.getTime() + '-' + stats.size;
    let LastModified = stats.ctime.toFMTString();

    let ifNoneMatch = req.headers['if-none-match']
    let ifModifiedSince = req.headers['if-modified-since'] // 文件最后修改时间

    res.setHeader('Last-Modified', LastModified)
    res.setHeader('Etag', etag)

    if(etag === ifNoneMatch && LastModified === ifModifiedSince) {
      return true
    }

    return false
  }

  gzip(req, res, stats, p) {
    let encoding = req.headers['accept-encoding']

    if(encoding) {
      if(encoding.match(/\bgzip\b/)) {
        res.setHeader('Content-Encoding', 'gzip')
        return zlib.createGzip()
      }
      if(encoding.match(/\bdeflate\b/)) {
        res.setHeader('Content-Encoding','deflate')
        return zlib.createDeflate();
      }
      return false
    } else {
      return false
    }
  }

}