
var nodemon = require('nodemon');
nodemon.config = './config/nodemon.json';

nodemon({
  script: 'consumer.js',
  ext: 'js json'
});


nodemon.on('start', function () {
  console.log('App has started');
}).on('quit', function () {
  console.log('App has quit');
}).on('restart', function (files) {
  console.log('App restarted due to: ', files);
});
