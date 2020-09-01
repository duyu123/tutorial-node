module.exports = {
  hostname: '127.0.0.1',
  port: 3000,
  root: process.cwd(),
  compressExt: /\.(html|js|css|md|json)/,
  cache: {
    maxAge: 600, // 有效期，单位秒
    expires: true,
    cacheControl: true,
    lastModified: true,
    etag: true,
    open: false
  }
}