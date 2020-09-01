const fs = require('fs')
const {
  promisify
} = require('util')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const ejs = require('ejs')
const path = require('path')
const mine = require('mime')
const compress = require('./compress')
const range = require('./range')
const isFresh = require('./cache')

const tplPath = path.join(__dirname, '../template.html')
const source = fs.readFileSync(tplPath, 'utf8')

module.exports = async function (req, res, filePath, config) {
  try {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      const ext = path.extname(path.basename(filePath)).replace('.', '')
      const ct = mine.getType(ext) || 'text/plain';
      res.setHeader('Content-Type', ct + ';charset=utf-8')
      if (isFresh(stats, req, res)) {
        res.statusCode = 304
        res.end()
        return
      }
      // 将数据通过管道推送给res, 当文件较大时，也不会阻塞
      let rs;
      const {
        code,
        start,
        end
      } = range(stats.size, req, res)
      if (code === 200) {
        res.statusCode = 200
        rs = fs.createReadStream(filePath, 'utf8')
      } else {
        res.statusCode = 216
        rs = fs.createReadStream(filePath, {
          start,
          end
        }, 'utf8')
      }

      if (filePath.match(config.compressExt)) {
        rs = compress(rs, req, res)
      }
      res.pipe(res)
    } else if (stats.isDirectory()) {
      res.setHeader('Content-Type', 'text/html;charset=utf-8')
      const files = await readdir(filePath)

      const dir = path.relative(config.root, filePath)

      res.end(ejs.render(source, {
        name: `index of ${path.basename(filePath)}`,
        dir: dir ? `/${dir}` : '',
        arr: files
      }))
    }
  } catch (e) {
    console.error(e)
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.statusCode = 404
    res.end(filePath + 'is not found!')
  }
}