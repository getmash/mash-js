# Post Message

Post Message library is a wrapper over the native browser [PostMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage). It creates a bi-directional tunnel between two instances of the library. Any messages not intended for the target will be ignored, reducing the noise that can be caused through PostMessage in the browser. It also supports restricting the origin which can receive messages sent from an instance of this library.

## Installation

Install the package with:

```shell
yarn add @getmash/post-message
# or 
npm install @getmash/post-message --save
```

## Usage

```typescript

import PostMessageEngine from "@getmash/post-message"

// in iframe

const receiver = new PostMessageEngine({
  name: "receiver",
  targetName: "sender",
  targetOrigin: "mysite.com",
  targetWindow: window.parent
})

receiver.listen(msg => console.log(msg))

// in host page

const sender = new PostMessageEngine({
  name: "sender",
  targetName: "receiver",
  targetOrigin: "myiframe.com",
  targetWindow: iframe.window
})

sender.send({ hello: "world" })
```
