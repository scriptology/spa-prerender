
let webpage   = require("webpage");
let phantom   = require("phantom");
let stripJs = require('strip-js');
let cheerio = require('cheerio');
let config = require("./config.js");


// saveFile
// let saveFile = function(url, content) {
//     let u = url.replace(/.*?:\/\//g, "");
//     let domain = u.split('/')[0];
//     let path = u.replace(domain + '/', '');
//
//     createFile('./files/' + path, content, function (err) {
//         console.log('file saved');
//     });
// }


function onRequest(req, res) {
  let page          = webpage.create()
  let bytesConsumed = 0

  if (req.method != "GET") {
    return send(405, toHTML("Method not accepted."))
  }

  let url = parse(req.url);
  console.log(url);

  if (url.pathname != "/") {
    return send(404, toHTML("Not found."))
  }

  let query = url.query
  let href  = query.href

  if (!href) {
    return send(400, toHTML("`href` parameter is missing."))
  }

  let maxTime    = Number(query.max_time)  || config.maxTime
  let maxBytes   = Number(query.max_bytes) || config.maxBytes
  let readyEvent = query.ready_event       || config.readyEvent
  let loadImages = "load_images" in query  || config.loadImages

  page.settings.loadImages = loadImages

  page.onInitialized = function() {
    page.evaluate(onInit, readyEvent)

    function onInit(readyEvent) {
      window.addEventListener(readyEvent, function() {
        setTimeout(window.callPhantom, 0)
      })
    }
  }

  page.onResourceReceived = function(resource) {
    if (resource.bodySize) bytesConsumed += resource.bodySize

    if (bytesConsumed > maxBytes) {
      send(502, toHTML("More than " + maxBytes + "consumed."))
    }
  }

  page.onCallback = function() {
    send(200, page.content)
  }

  var timeout = setTimeout(page.onCallback, maxTime);

  page.open(href)

  function send(statusCode, data) {
    clearTimeout(timeout)

    var hostArr = href.split("/");
    var host = hostArr[0] + "//" + hostArr[2];
    console.log(host);

    var $ = cheerio.load(data);


    $('base').attr('href', host + '/');

    $('link').each(function(i, elem) {
        var href = $(this).attr("href");
        if(href.indexOf(".") == 0) {
            $(this).attr("href", href.replace(/./, host))
        }
        if(href.indexOf("/") == 0) {
            $(this).attr("href", host + $(this).attr("href"))

        }
    });

    var safeHtml = stripJs($.html())

    res.statusCode = statusCode

    res.setHeader("Content-Type", "text/html")
    res.setHeader("Content-Length", byteLength(safeHtml))
    res.setHeader("X-Rndrme-Bytes-Consumed", bytesConsumed.toString())

    res.write(safeHtml);

    res.close();
    page.close();
    console.log('close page');
  }
}

function byteLength(str) {
  return encodeURIComponent(str).match(/%..|./g).length
}

function toHTML(message) {
  return "<!DOCTYPE html><body>" + message + "</body>\n"
}

function parse(url) {
  var anchor = document.createElement("a")

  anchor.href = url
  anchor.query = {}

  anchor.search.slice(1).split("&").forEach(function(pair) {
    pair = pair.split("=").map(decodeURIComponent)
    anchor.query[pair[0]] = pair[1]
  })

  return anchor
}
