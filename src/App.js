import React, { Component } from 'react';
import Editor from './Editor';
import SimpleWebrtc from 'simplewebrtc/src/simplewebrtc';
import './App.css';
import * as firebase from 'firebase';
import Chat from './Chat';
import { Row, Col } from 'antd';

const userInfo = {
  name: "Tyan Chiau",
  photo: "https://raw.githubusercontent.com/tianhaoz95/pics/master/personal_avatar.png"
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      roomJoined:  false,
      peerCreated: false,
      connected: false,
    };
    this.rtc = new SimpleWebrtc({
      localVideoEl: '',
      remoteVideosEl: '',
      autoRequestMedia: false,
      url: "https://acumany-signal-master.herokuapp.com/",
    });
    this.editorFB = firebase.database().ref("/TestEditor");
    this.msgFB = firebase.database().ref("/TestMessage");
  }

  componentDidMount() {
    this.rtc.on('connectionReady', (sessionId) => {
      console.log("sessionId => ", sessionId);
      this.setState({ connected: true });
      this.rtc.joinRoom("test_room", () => {
        this.rtc.sendDirectlyToAll("editor", "initChannel", null);
        this.setState({ roomJoined: true });
      });
    })

    this.rtc.on('createdPeer', (peer) => {
      console.log(peer);
      this.setState({ peerCreated: true });
    });

  }

  render() {
    return (
      <div className="App">
        <Row>
          <Col span="20">
            <Editor
              rtc={this.rtc}
              fb={this.editorFB}
              type="webrtc"
              />
          </Col>
          <Col span="4">
            <Chat
              rtc={this.rtc}
              fb={this.msgFB}
              type="webrtc"
              userInfo={userInfo}
              />
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
