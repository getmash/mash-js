# JsonRPC Engine

JsonRPC Engine is a wrapper over [PostMessageEngine](../post-message) that enforces the JsonRPC spec through PostMessage. It adds a simple API on top of the send/listen functions exposed through [PostMessageEngine](../post-message) to allow calling function throughs PostMessage. If you are not familiar with the JsonRPC spec, check it out here:  https://www.jsonrpc.org/specification

## Installation

Install the package with:

```shell
yarn add @getmash/jsonrpc-engine
# or 
npm install @getmash/jsonrpc-engine --save
```

## Usage

```typescript

import JsonRPCEngine, { NewSuccessResponse } from "@getmash/post-message"

// in iframe

function hello(name: string) {
  return `Hello ${name}`;
}

const receiver = new JsonRPCEngine({
  name: "receiver",
  targetName: "sender",
  targetOrigin: "mysite.com",
  targetWindow: window.parent
})

receiver.listen(msg => {
  const method = message.method;
  const name = message.params[0] as string;
  if (method === "hello") {
    return NewSuccessResponse(msg.id, hello(name))
  }
})

// in host page

const sender = new JsonRPCEngine({
  name: "sender",
  targetName: "receiver",
  targetOrigin: "myiframe.com",
  targetWindow: iframe.window
})

sender.call<string>("hello", "World").then((msg) => {
  console.log(msg) // Hello World
})
```
