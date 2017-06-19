export function uploadActionToFB(message, fb, timestamp) {
  return new Promise((resolve, reject) => {
    var ref = fb.push();
    var pushObj = {
      timestamp: timestamp,
      message: message,
    };
    ref.set(pushObj)
    .then(() => {
      resolve({
        type: "success",
        description: null,
      });
    })
    .catch((err) => {
      console.log("fuck", err);
      reject({
        type: "fail",
        description: "cannot upload message to firebase",
        reason: err,
      });
    });
  });
}

export function uploadActionToRtc(message, rtc, timestamp) {
  rtc.sendDirectlyToAll(
    "textchat",
    "message",
    {
      message: message,
      timestamp: timestamp,
    }
  );
}

export function uploadAction(message, fb, rtc, type, timestamp) {
  switch (type) {
    case "firebase": {
      uploadActionToFB(message, fb, timestamp)
      .then(() => {
        console.log("uploaded to firebase");
      })
      .catch((err) => {
        console.log("fuck", err);
      });
      break;
    }

    case "webrtc": {
      uploadActionToRtc(message, rtc, timestamp);
      break;
    }

    default: console.log("you are a long way from home");

  }
}

export function sendInitReq(rtc) {
  return new Promise((resolve, reject) => {
    var count = 0;
    var req = setInterval(() => {
      console.log("sending initial request");
      rtc.sendDirectlyToAll("textchat", "initReq", null);
      count = count + 1;
      if (count === 15) {
        clearInterval(req);
        reject({
          type: "fail",
          description: "no response for initialize"
        });
      }
    }, 200);
    rtc.on('channelMessage', (room, label, message) => {
      if (label === "textchat" && message.type === "initRes") {
         clearInterval(req);
         resolve({
           type: "success",
           description: "got initialize response",
           data: message,
         });
      }
    });
  });
}
