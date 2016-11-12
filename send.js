// Publisher
// NODE version >= 6.9
let amqp = require('amqp');
let urls = require('./testUrls.js')

let connectOptions = require('./connectOptions.js');

let connection = amqp.createConnection(connectOptions);

connection.on('ready', function() {
    let sendMessage = function(connection, queue_name, message) {
        console.log(message);
        let encoded_payload = JSON.stringify(message);
        connection.publish(
            queue_name,
            encoded_payload,
            {"contentType": "application/json"}
        );
    }

    console.log(`Count: ${urls.length}`);
    for(let url of urls) {
        sendMessage(connection, "render", url)
    }

    // let count = 1;
    // setInterval(function() {
    //     let test_message = {
    //         "url": count
    //     }
    //     sendMessage(connection, "render", test_message)
    //     count += 1;
    // }, 2000)


})
