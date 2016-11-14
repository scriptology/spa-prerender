let phantom   = require("phantom");
let stripJs = require('strip-js');
let cheerio = require('cheerio');
let createFile = require('create-file');
let config = require("./config/configRender");
let colors = require('colors');

// saveFile
let makeFilePath = function(url) {
    let u = url.replace(/.*?:\/\//g, "");
    console.log(u);
    let host = u.split('/')[0];
    let path = u.replace(host + '/', '');
    if(path.split("").splice(-1) == '/' || !path) {
        path = `${path}index`
    }
    return `./files/${host}/${path}.html`;
}

let renderPage = (url) => {

    return new Promise((resolve, reject)=> {

        let sitepage;
        let phInstance;
        phantom.create()
            .then(instance => {
                phInstance = instance;
                return instance.createPage();
            })
            .then(page => {
                sitepage = page;
                return page.open(url);
            })
            .then(status => {
                console.log(`Status get page: ${status}`);
                console.log('Start render');
                let page = sitepage;
                return new Promise((resolve, reject) => {
                    // resolve(page.property('content'));

                    page.on('onCallback', function (requestData, networkRequest) {
                        console.log('Get all data');
                        resolve(page.property('content'));
                    });

                    page.evaluate(function(config) {
                        //return document.title;
                        var timeout = setTimeout(function() {
                            window.callPhantom();
                        }, config.maxTime);

                        window.addEventListener("loaded", function() {
                            clearTimeout(timeout);
                            setTimeout(window.callPhantom, 0);
                        })

                    }, config)

                });
            })
            .then(content => {
                console.log("Update content");

                var hostArr = url.split("/");
                var host = hostArr[0] + "//" + hostArr[2];
                console.log(host);

                var $ = cheerio.load(content);

                $('base').attr('href', host + '/');

                $('link').each(function(i, elem) {
                    let href = $(this).attr("href");
                    if(href.indexOf(".") == 0) {
                        $(this).attr("href", href.replace(/./, host))
                    }
                    if(href.indexOf("/") == 0) {
                        $(this).attr("href", host + $(this).attr("href"))

                    }
                });

                var safeHtml = stripJs($.html())

                createFile(makeFilePath(url), safeHtml, function (err) {
                    console.log('File saved'.green);
                    resolve(safeHtml);
                });

                sitepage.close();
                phInstance.exit();
            })
            .catch(error => {
                console.log(error);
                phInstance.exit();
                reject(error);
            });
    })

}

module.exports = renderPage;

// clien side
// if (typeof $window.callPhantom === 'function') {
//     $window.callPhantom({ loaded: true });
// }
