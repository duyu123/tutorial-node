const {
  createGzip,
  createDeflate
} = require('zlib')

// 文件压缩
module.exports = function (readStream, req, res) {
  // 浏览器支持的压缩方式
  const acceptEncoding = req.headers['accept-encoding']

  // 假设服务器只支持gzip和deflate
  if (acceptEncoding && acceptEncoding.match(/\b(gzip|deflate)\b/)) {
    if (acceptEncoding.match(/\bgzip\b/)) {
      res.setHeader('Content-Encoding', 'gzip')
      return readStream.pipe(createGzip())
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
      res.setHeader('Content-Encoding', 'deflate')
      return readStream.pipe(createDeflate())
    }
  } else {
    return readStream
  }
}