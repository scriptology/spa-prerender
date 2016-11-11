//Consumer
// NODE version >= 6.9
let amqp = require('amqp');
let connectOptions = require('./connectOptions.js');

let connection = amqp.createConnection(connectOptions);

// add this for better debuging
connection.on('error', function(e) {
    console.log("Error from amqp: ", e);
});

// Wait for connection to become established.
connection.on('ready', function() {
    // Use the default 'amq.topic' exchange
    console.log("ready");
    connection.queue('render', {
        durable: true,
        autoDelete: false
    }, function(q) {
        console.log("connection queue");
        // Catch all messages
        q.bind('#');

        // Receive messages
        q.subscribe({ack: true}, function(json, headers, info, message) {
            // Print messages to stdout
            setTimeout(function() {
                console.log(json);
                saveFile(json.url);
                //q.shift(true);
            }, 100)
        });
    });
});


let saveFile = function(url) {
    let u = url.replace(/.*?:\/\//g, "");
    let domain = u.split('/')[0];
    let patchArray = u.replace(domain + '/', '').split('/');
    console.log(patchArray);
    console.log("---");
}
