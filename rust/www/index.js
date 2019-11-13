import * as wasm from "rust";

let sum;
document.addEventListener("message", function(event) {
    console.log(event.data);
    let {a: s1, b: s2} = JSON.parse(event.data); 
    sum = wasm.add(s1, s2);
    window.ReactNativeWebView.postMessage(JSON.stringify({sum}));
}, false);
