import React, { Component } from 'react';
import Quill from 'quill';
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
    this.handleSend = this.handleSend.bind(this);
    this.quillRef = null;
  }

  componentDidMount() {
    this.editor = new Quill(this.quillRef, quillOptions);

    this.editor.on("text-change", (delta, oldDelta, source) => {
      console.log("delta => ", delta);
      console.log("oldDelta => ", oldDelta);
      console.log("source => ", source);
      if (source === "user") {
        this.props.rtc.sendDirectlyToAll("editor", "delta", { data: delta });
      }
    });

    this.props.rtc.on('channelMessage', (room, label, message) => {
      console.log("receiving message");
      console.log("room =>", room);
      console.log("label =>", label);
      console.log("message => ", message);
      this.editor.updateContents(message.payload.data, "api");
    });
  }

  handleSend() {
    console.log("sending message");
    this.props.rtc.sendDirectlyToAll("test_label", "test_msg", {
      type: "test",
      msg: "see if it works"
    });
  }

  render() {
    return (
      <div>
        <div
          className="quill-editor-container"
          ref={(ref) => this.quillRef = ref}></div>
        <button onClick={this.handleSend}>
          Send test message
        </button>
      </div>
    );
  }
}

export default Editor;
