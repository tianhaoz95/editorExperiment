import React, { Component } from 'react';
import Editor from './Editor';
import SimpleWebrtc from 'simplewebrtc/src/simplewebrtc';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.rtc = new SimpleWebrtc({
      localVideoEl: '',
      remoteVideosEl: '',
      autoRequestMedia: false,
      url: "https://acumany-signal-master.herokuapp.com/",
    });
  }

  componentDidMount() {
    this.rtc.on('connectionReady', (sessionId) => {
      console.log("sessionId => ", sessionId);
      this.rtc.joinRoom("test_room", (err, description) => {
        console.log("err => ", err);
        console.log("description => ", description);
      });
    })

    this.rtc.on('createdPeer', (peer) => {
      console.log(peer);
    });

  }

  render() {
    return (
      <div className="App">
        <Editor rtc={this.rtc}/>
      </div>
    );
  }
}

export default App;
