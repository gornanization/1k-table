console.log(process.env.PORT, 'starting...');

require('http-server').createServer({
    root: 'dist'
}).listen(process.env.PORT || 3000);