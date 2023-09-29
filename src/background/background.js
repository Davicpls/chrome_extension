/* global chrome */

let timerState = {
  isRunning: false,
  remainingTime: 0,
};

chrome.runtime.onMessage.addListener((message, sendResponse) => {
  if (message.command === "getState") {
    sendResponse(timerState);
  } else if (message.command === "startTimer") {
    timerState.isRunning = true;
    // fazer lógica
  }
});
