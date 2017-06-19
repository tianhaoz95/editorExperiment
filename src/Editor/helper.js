export function uploadActionToFB(action, fb, timestamp) {
  return new Promise((resolve, reject) => {
    var ref = fb.push();
    var pushObj = {
      timestamp: timestamp,
      action: action,
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
        description: "cannot upload action to firebase",
        reason: err,
      });
    });
  });
}

export function uploadActionToRtc(action, rtc, timestamp) {
  rtc.sendDirectlyToAll(
    "editor",
    "action",
    {
      action: action,
      timestamp: timestamp,
    }
  );
}

export function uploadAction(action, fb, rtc, type, timestamp) {
  switch (type) {
    case "firebase": {
      uploadActionToFB(action, fb, timestamp)
      .then(() => {
        console.log("uploaded to firebase");
      })
      .catch((err) => {
        console.log("fuck", err);
      });
      break;
    }

    case "webrtc": {
      uploadActionToRtc(action, rtc, timestamp);
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
      rtc.sendDirectlyToAll("editor", "initReq", null);
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
      if (label === "editor" && message.type === "initRes") {
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

export function PrintElem(elem)
{
    var mywindow = window.open('', 'PRINT');

    var title = "<title>Here is your document</title>";

    var header = title;

    mywindow.document.write('<html><head>' + header + '</head><body >');
    mywindow.document.write(elem.innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();

    return true;
}
