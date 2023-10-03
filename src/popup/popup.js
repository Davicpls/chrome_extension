/* global chrome */

class Timer {
  constructor() {
    this.currentCycle = 0;
    this.counter = 0;
    chrome.runtime.onMessage.addListener(this.handleMessages.bind(this));
  }

  validateNumberInput(input) {
    return typeof input === "number" && input > 0;
  }

  handleMessages(message) {
    if (message.command === "updateTime") {
      const { timeString, elementId } = message;
      document.getElementById(elementId).textContent = timeString;
    } else if (message.command === "decrementCycle") {
      const { cyclesDecrement } = message;
      document.getElementById("remainingCycles").textContent = cyclesDecrement;
    } else if (message.command === "playSoundRest") {
      let audioRest = new Audio("/src/sounds/rest.mp3");
      audioRest.play();
      setTimeout(() => {
        audioRest.pause();
        audioRest.currentTime = 0;
      }, 5000);
    } else if (message.command === "playSoundFocus") {
      let audioFocus = new Audio("/src/sounds/focus.mp3");
      audioFocus.play();
      setTimeout(() => {
        audioFocus.pause();
        audioFocus.currentTime = 0;
      }, 5000);
    } else if (message.command === "playSoundFinish") {
      let audioFinish = new Audio("/src/sounds/finish.mp3");
      audioFinish.play();
      setTimeout(() => {
        audioFinish.pause();
        audioFinish.currentTime = 0;
      }, 5000);
      alert("All cycles completed!");
    }
  }

  start() {
    const focusTime = Number(document.getElementById("input-focus").value);
    const restTime = Number(document.getElementById("input-rest").value);
    const cycles = Number(document.getElementById("input-cycles").value);

    let cyclesDecrement = Number(document.getElementById("input-cycles").value);
    document.getElementById("remainingCycles").textContent = cyclesDecrement;

    if (
      this.validateNumberInput(focusTime) &&
      this.validateNumberInput(restTime) &&
      this.validateNumberInput(cycles)
    ) {
      chrome.runtime.sendMessage({
        command: "startTimer",
        focusTime: focusTime,
        restTime: restTime,
        cycles: cycles,
        cyclesDecrement: cyclesDecrement,
      });
    } else {
      alert("Those are not valid numbers!");
    }
  }

  reset() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.focusTime = "0:00";
    this.restTime = "0:00";
    this.cycles = 0;
    this.currentCycle = 0;

    chrome.runtime.sendMessage({
      command: "resetTimer",
    });

    document.getElementById("timerDisplayFocus").textContent = this.focusTime;
    document.getElementById("timerDisplayRest").textContent = this.restTime;
    document.getElementById("remainingCycles").textContent = this.cycles;
  }
}

const timer = new Timer();

document.getElementById("start").addEventListener("click", () => timer.start());
document.getElementById("reset").addEventListener("click", () => timer.reset());

document.addEventListener("DOMContentLoaded", function () {
  chrome.runtime.sendMessage({ command: "getState" }, function (response) {
    if (response && response.timeString && response.elementId) {
      document.getElementById(response.elementId).textContent =
        response.timeString;
    }
  });
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "isPopupOpen") {
    sendResponse({ isOpen: true });
  }
});
