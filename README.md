Installation
------------

1. [Install PhantomJS](http://phantomjs.org/download.html).

API
---

To spin up the server, run the following from the command line:

    phantomjs ./server.js <config-path>

Note that `config-path` is optional, and if omitted will default to the provided config.js file. You may also override any options from the config file using options on the command line:

    phantomjs ./server.js --port 8002 --ready_event onRender

The server exposes a single root endpoint at `/`. It returns generated html, based on the following parameters:

- `href`: The url to be rendered. This is required, and must be fully qualified.
- `max_time`: The maximum number of milliseconds until render. Any windows not already rendered by the `ready_event` will be rendered once this elapses. This is optional, and `30000` by default (30 seconds).
- `max_bytes`: The maximum number of incoming bytes. Any windows that load more than this value will return an error without rendering. This is optional, and `1048576` by default (1 MiB).
- `load_images`: This can be specified to any value to load document images. This is optional, and omitted by default.
- `ready_event`: This is the name of the `window` event that triggers render. This is optional, and `load` by default. To specify when rendering occurs, such as when the DOM is not ready to be rendered until after `window.onload`, trigger a DOM event manually, such as follows (using jQuery in this case):

```javascript
jQuery.getJSON("http://api.myapp.com", function(data) {
  myCustomRenderingCallback(data)

  var readyEvent = document.createEvent("Event")
  readyEvent.initEvent("renderReady", true, true)
  window.dispatchEvent(readyEvent)
})
```

Examples
--------

```bash
phantomjs ./server.js --port 8080
```
or
```bash
phantomjs ./server.js --ready_event onRender
```

Let's render the app with default settings:

```bash
curl localhost:8080 -G \
  --data-urlencode 'href=http://myapp.com/#!home'
```

Now let's cap the maximum rendering time at 10 seconds:

```bash
curl localhost:8080 -G \
  --data-urlencode 'href=http://myapp.com/#!home'
  -d max_time=10000
```

We can also cap the maximum incoming bytes at 100KiB:

```bash
curl localhost:8080 -G \
  --data-urlencode 'href=http://myapp.com/#!home'
  -d max_time=10000
  -d max_bytes=102400
```

Now let's allow images to load, raising the maximum incoming bytes to 500KiB:

```bash
curl localhost:8080 -G \
  --data-urlencode 'href=http://myapp.com/#!home'
  -d max_time=10000
  -d max_bytes=512000
  -d load_images
```

Now let's use the custom rendering event `render_ready`, triggered on the window of the DOM, using the default fallback maximum time:

```bash
curl localhost:8080 -G \
  --data-urlencode 'href=http://myapp.com/#!home'
  -d max_bytes=512000
  -d load_images
  -d ready_event=render_ready
```
