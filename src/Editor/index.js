import React, { Component } from 'react';
import Quill from 'quill';
import moment from "moment";
import { uploadAction, sendInitReq } from './helper';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.core.css';
import './index.css';

const toolbarOptions = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'font': [] }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean']
];

const quillOptions = {
  debug: 'info',
  modules: {
    toolbar: toolbarOptions,
  },
  readOnly: false,
  theme: 'snow'
};

class Editor extends Component {
  constructor(props) {
    super(props);
    this.quillRef = null;
    this.editor = null;
    this.timestamp = 0;
    this.peerCreated = props.peerCreated;
  }

  componentWillReceiveProps(nextProps) {
    this.peerCreated = nextProps.peerCreated;
  }

  componentDidMount() {
    this.editor = new Quill(this.quillRef, quillOptions);

    if (this.props.type === "webrtc") {
      sendInitReq(this.props.rtc)
      .then((snap) => {
        var content = snap.data.payload.content;
        this.editor.setContents(content, "api");
      })
      .catch((err) => {
        console.log("fuck", err);
      });
    }

    this.editor.on("text-change", (delta, oldDelta, source) => {
      console.log("delta => ", delta);
      console.log("oldDelta => ", oldDelta);
      console.log("source => ", source);
      if (source === "user") {
        var action = delta;
        var timestamp = moment().valueOf();
        this.timestamp = timestamp;
        uploadAction(action, this.props.fb, this.props.rtc, this.props.type, timestamp);
      }
    });

    this.props.rtc.on('channelMessage', (room, label, message) => {
      console.log("receiving message");
      console.log("room =>", room);
      console.log("label =>", label);
      console.log("message => ", message);
      if (label === "editor" && message.type === "initReq") {
        var content = this.editor.getContents();
        this.props.rtc.sendDirectlyToAll("editor", "initRes", { content: content });
      }
      if (label === "editor" && message.type === "action") {
        this.editor.updateContents(message.payload.action, "api");
        this.timestamp = message.payload.timestamp;
      }
    });

    this.props.fb.on('child_added', (snap) => {
      var content = snap.val();
      if (content.timestamp !== this.timestamp) {
        console.log("now the lastest timestamp, updating");
        this.editor.updateContents(content.action, "api");
        this.timestamp = content.timestamp;
      }
    });
  }

  renderLoading() {
    return(
      <div>
        
      </div>
    );
  }

  render() {
    return (
      <div>
        <div
          className="quill-editor-container"
          ref={(ref) => this.quillRef = ref}></div>
      </div>
    );
  }
}

export default Editor;
