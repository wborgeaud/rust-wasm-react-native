import React, { Component } from 'react';
import { View, Button, TextInput, Text } from 'react-native';
import { WebView } from 'react-native-webview';



export default class App extends Component {

    webView = null;
    state = { s1: null, s2: null, sum: null };

    sendMessage = () => {
        this.webView.postMessage(JSON.stringify({ a: parseInt(this.state.s1), b: parseInt(this.state.s2) }));
    }

    onMessage = (event) => {
        this.setState({sum: JSON.parse(event.nativeEvent.data).sum}, () => console.log(this.state));
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Button
                    title="Press me"
                    onPress={this.sendMessage}
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
                    source={{ uri: 'http://10.0.2.2:8080/' }}
                    allowFileAccess={true}
                    cacheEnabled={false}
                    ref={(webView) => this.webView = webView}
                    onMessage={this.onMessage}
                />
                {this.state.sum && 
                <Text style={{flex: 1}}>The sum is {this.state.sum}</Text>}
            </View>
        )
    }
}
