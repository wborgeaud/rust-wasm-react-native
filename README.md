# rust-wasm-react-native

This repository gives a template for using Rust functions in a React Native project through WebAssembly. Here's the TLDR:

1. Create a `wasm-pack` project exposing the Rust functions you want to export. 
2. Serve a web page exposing these functions through `message` events.
3. Use a React Native `WebView` of this web page.
4. Call Rust functions by sending messages to the `WebView`. 

## Pros and Cons

### Pros

- Alternative is to use native modules but it is a pain to setup with Rust and React Native, and requires lots of different configurations for Android and iOS.
- Other alternative is to serve `wasm`  files locally on the app and use them in a `WebView`.  This is also a pain to setup since local files need to be put in different places in Android and iOS, and you will get a bunch of permission errors along the way.
- The way shown in this repository is very easy to setup, works out of the box, and allows for a clear separation between the Rust and React Native development.

### Cons

- The device needs an Internet connection to download the web page.
- Mild privacy issue since one can track requests to the web server. But all computations using WebAssembly are done locally on the device.
- Probably quite slower than using the native modules.

## Prototype

This gives an example of this structure with a simple Rust function that adds two numbers.

### Rust

Create a `wasm-pack` project following the instructions given [here](https://rustwasm.github.io/docs/book/game-of-life/hello-world.html). The `src/lib.rs` exposes the functions you want to export. Here's ours:

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: u32, b: u32) -> u32 {
	a + b
}
```

Then, build the package with `wasm-pack build` and create a web directory with `package.json` like:

```javascript
/* -------- SNIP -------- */
"devDependencies": {
    "rust": "file:../pkg",
    "webpack": "^4.29.3",
    "webpack-cli": "^3.1.0",
    "webpack-dev-server": "^3.1.5",
    "copy-webpack-plugin": "^5.0.0"
  }
/* -------- SNIP -------- */
```

The WebAssembly functions can be called from Javascript using `message` events. Here's our `index.js`:

```javascript
import * as wasm from "rust"; // Import the wasm package

let sum;
document.addEventListener("message", function(event) { // Receive parameters in a message
    let {a: s1, b: s2} = JSON.parse(event.data); // Parse the parameters
    sum = wasm.add(s1, s2); // Call the wasm function
    window.ReactNativeWebView.postMessage(JSON.stringify({sum})); // Send a message to React Native with the result of the wasm function.
}, false);
```

Now, serve this web directory on a web server. For this prototype, we serve it on `localhost:8080`.

### React Native

Create a React Native project with `react-native-webview` linked. Here is our `App.js` that shows the basic way to call the WebAssembly functions served by our web server:

```javascript
import React, { Component } from 'react';
import { View, Button, TextInput, Text } from 'react-native';
import { WebView } from 'react-native-webview';



export default class App extends Component {

    webView = null; // Holds the reference to the WebView
    state = { s1: null, s2: null, sum: null };
	
	// Sends a message to the WebView with the parameters of the Rust function `add`.
    sendMessage = () => {
        this.webView.postMessage(JSON.stringify({ a: parseInt(this.state.s1), b: parseInt(this.state.s2) }));
    }
	
    // Listen for messages from the WebView containing the result of the wasm function.
    onMessage = (event) => {
        this.setState({sum: JSON.parse(event.nativeEvent.data).sum}, () => console.log(this.state));
    }
    
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Button
                    title="Press me"
                    onPress={this.sendMessage} // Sends a message on button press.
                />
                <TextInput
                    placeholder="First summand"
                    onChangeText={(text) => this.setState({ s1: text })}
                    value={this.state.s1}
                />
                <TextInput
                    placeholder="Second summand"
                    onChangeText={(text) => this.setState({ s2: text })}
                    value={this.state.s2}
                />
                <WebView
                    style={{ height: 0 }}
                    useWebkit={true}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    source={{ uri: 'http://10.0.2.2:8080/' }} // Change to your webserver.
                    allowFileAccess={true}
                    cacheEnabled={false}
                    ref={(webView) => this.webView = webView} // Set ref.
                    onMessage={this.onMessage} // Listens for messages.
                />
                {this.state.sum && 
                <Text>The sum is {this.state.sum}</Text>}
            </View>
        )
    }
}
```

This component gives a way to call the Rust function `add` from React Native, through WebAssembly.
