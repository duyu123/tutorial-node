// 文件的范围读取
module.exports = function (totalSize, req, res) {
  const range = req.headers['range']
  if (range) {
    const sizes = range.match(/bytes=(\d*)-(\d*)/);

    const end = sizes[2] || totalSize - 1;
    const start = sizes[1] || totalSize - end;

    if (start < 0 || end > totalSize || start > end) {
      return { code: 200 }
    } else {
      res.setHeader('Accept-Ranges','bytes')
      res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`)
      res.setHeader('Content-Length', end - start)

      return {
        code: 206,
        start: Number.parseInt(start),
        end: Number.parseInt(end)
      }
    }
  } else {
    return {
      code: 200
    }
  }
}