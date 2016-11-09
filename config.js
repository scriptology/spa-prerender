var system = require("system")

// 8001
exports.port = system.env.PORT || 8001

// 2 seconds
exports.maxTime = 10000

// 10 MiB
exports.maxBytes = 0x1000000

// window.onload
exports.readyEvent = "load"

// don't load images
exports.loadImages = false

console.log('Press Ctrl+C to stop.');