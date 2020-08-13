const program = require('commander')
const Server = require('./app');

program
    .option('-p,--port <n>', 'port:')
    .option('-o,--host [value]','host:')

program.parse(process.argv)

new Server(program).start();