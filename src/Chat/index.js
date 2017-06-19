import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';
import { Form, Button, Input } from 'antd';
import { uploadAction, sendInitReq } from './helper';
import _ from 'lodash';
import moment from 'moment';
import './index.css';

const FormItem = Form.Item;

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      disabled: true,
    };
    this.timestamp = 0;
    this.chatboxRef = null;
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    this.chatboxRef.scrollTop = this.chatboxRef.scrollHeight;
  }

  componentDidMount() {
    var thisObj = this;

    if (this.props.type === "webrtc") {
      sendInitReq(this.props.rtc)
      .then((snap) => {
        this.setState({
          disabled: false,
          messages: snap.data.payload.messages,
        });
      })
      .catch((err) => {
        this.setState({
          disabled: false,
        });
      });
    } else {
      this.setState({
        disabled: false,
      });
    }

    this.props.rtc.on('channelMessage', (room, label, message) => {
      console.log("receiving message");
      console.log("room =>", room);
      console.log("label =>", label);
      console.log("message => ", message);
      if (label === "textchat" && message.type === "initReq") {
        this.props.rtc.sendDirectlyToAll("textchat", "initRes", { messages: this.state.messages });
      }
      if (label === "textchat" && message.type === "message") {
        var oldList = this.state.messages;
        oldList.push(message.payload.message);
        var newList = _.orderBy(oldList, ['timestamp'], ['asc']);
        this.timestamp = message.payload.timestamp;
        console.log("updating state in webrtc");
        this.setState({ messages: newList });
      }
    });

    this.props.fb.on("child_added", (snap) => {
      var data = snap.val();
      if (thisObj.timestamp !== data.timestamp) {
        var oldList = thisObj.state.messages;
        oldList.push(data.message);
        var newList = _.orderBy(oldList, ['timestamp'], ['asc']);
        this.timestamp = data.timestamp;
        console.log("updating state in firebase");
        this.setState({ messages: newList });
      }
    });
  }

  handleSubmit(e) {
    var thisObj = this;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        var timestamp = moment().valueOf();
        this.timestamp = timestamp;
        var message = {
          name: this.props.userInfo.name,
          photo: this.props.userInfo.photo,
          content: values.message,
          timestamp: timestamp,
        };
        uploadAction(message, this.props.fb, this.props.rtc, this.props.type, timestamp);
        var list = thisObj.state.messages;
        list.push(message);
        thisObj.setState({ messages: list });
        this.props.form.setFieldsValue({ message: "" });
      }
    });
  }

  render() {

    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;

    console.log(this.state.messages);

    return(
      <div>
        <div className="chat-box-container" ref={(ref) => this.chatboxRef = ref}>
          <Comment.Group>
            {this.state.messages.map((message, index) => (
              <Comment key={index}>
                <Comment.Avatar src={message.photo} />
                <Comment.Content>
                  <Comment.Author as="a">{message.name}</Comment.Author>
                  <Comment.Metadata>
                    <div>{moment(message.timestamp).format("h:mm a")}</div>
                  </Comment.Metadata>
                  <Comment.Text>{message.content}</Comment.Text>
                </Comment.Content>
              </Comment>
            ))}
          </Comment.Group>
        </div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            {getFieldDecorator('message', {
              rules: [{ required: true , message: 'Message cannot be empty'}],
            })(
              <Input
                disabled={this.state.disabled}
                placeholder="Type your message"
                suffix={
                  <Button
                    htmlType="submit"
                    icon="message"
                    disabled={this.state.disabled}
                    ></Button>}
                    />
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(Chat);
