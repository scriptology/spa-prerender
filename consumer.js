//Consumer
// NODE version >= 6.9
let amqp = require('amqp');
let connectOptions = require('./connectOptions.js');
let connection = amqp.createConnection(connectOptions);
let phantom   = require("phantom");

// add this for better debuging
connection.on('error', function(e) {
    console.log("Error from amqp: ", e);
});

// Wait for connection to become established.
// connection.on('ready', function() {
//     // Use the default 'amq.topic' exchange
//     console.log("ready");
//     connection.queue('render', {
//         durable: true,
//         autoDelete: false
//     }, function(q) {
//         console.log("connection queue");
//         // Catch all messages
//         q.bind('#');
//
//         // Receive messages
//         q.subscribe({ack: true}, function(json, headers, info, message) {
//             // Print messages to stdout
//             setTimeout(function() {
//                 console.log(json);
//                 //q.shift(true);
//             }, 100)
//         });
//     });
// });

let timeout = setTimeout(function() {}, 6000);
let sitepage;
let phInstance;
phantom.create()
    .then(instance => {
        phInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;
        return page.open('https://stackoverflow.com/');
    })
    .then(status => {
        console.log('status');
        let page = sitepage;
        return new Promise((resolve, reject) => {
            // setTimeout(() => {
            //     resolve(page.property('content'));
            // }, 4000);
            page.evaluate(function() {
                //return document.title;
                window.addEventListener("readyEvent", function() {
                    setTimeout(window.callPhantom, 0)
                    //return true;
                })
            }).then(function(e) {
                console.log(e);
                resolve(page.property('content'));
            })

        });
        // return page.evaluate(function() {
        //     //return document.title;
        //
        //     // window.addEventListener("readyEvent", function() {
        //     //   return true
        //     // })
        // }).then(function(d) {
        //     console.log(d);
        //
        //     //return sitepage.property('content');
        // });
    })
    .then(content => {
        console.log("content");
        //console.log(content);
        sitepage.close();
        phInstance.exit();
    })
    .catch(error => {
        console.log(error);
        phInstance.exit();
    });

// let promise = new Promise((resolve, reject) => {
//     console.log('0');
//     setTimeout(() => {
//         resolve(0)
//     }, 3000);
// })
// promise.then(function(res) {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//           resolve(res+1);
//         }, 3000);
//       });
// }).then(function(res) {
//     console.log(res + 1);
// });
