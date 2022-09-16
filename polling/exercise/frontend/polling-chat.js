const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;
let ERROR_RETRIAL = 1;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = JSON.stringify({ user, text });
  const options = {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await fetch("/poll", options);
    const json = await res.json();
  } catch (error) {
    console.error(error);
  }
}

async function getNewMsgs() {
  let json;

  try {
    const res = await fetch("/poll");
    json = await res.json();

    if (res.status >= 400) {
      throw new Error("Network error ", res.status);
    }

    allChat = json.msg;

    render();

    ERROR_RETRIAL = 1;
  } catch (error) {
    console.error(error);
    ERROR_RETRIAL += 1;
  }
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

let timeToNextRender = 0;

async function rafHandler(currentTime) {
  if (timeToNextRender <= currentTime) {
    await getNewMsgs();
    timeToNextRender = currentTime + INTERVAL * ERROR_RETRIAL;
  }
  requestAnimationFrame(rafHandler);
}

requestAnimationFrame(rafHandler);
