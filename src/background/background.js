/* global chrome */

let interval = null;
let counter = 0;
let currentCycle = 0;
let cyclesDecrement = 0;
let focusTime = 0;
let restTime = 0;
let cycles = 0;

let timerState = {
  isRunning: false,
};

function isPopupOpen(callback) {
  chrome.runtime.sendMessage({ command: "isPopupOpen" }, (response) => {
    if (chrome.runtime.lastError) {
      callback(false);
    } else {
      callback(response.isOpen);
    }
  });
}

function resetTimer() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  timerState.isRunning = false;
  counter = 0;
  currentCycle = 0;
  focusTime = 0;
  restTime = 0;
  cycles = 0;
  cyclesDecrement = 0;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.command === "startTimer") {
    timerState.isRunning = true;

    focusTime = message.focusTime;
    restTime = message.restTime;
    cycles = message.cycles;
    cyclesDecrement = message.cyclesDecrement;

    const startTimer = (duration, displayElementId, callback) => {
      if (interval) {
        clearInterval(interval);
      }

      let currentTime = duration * 60;

      interval = setInterval(() => {
        currentTime--;

        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;

        const timeString = [minutes, seconds]
          .map((v) => (v < 10 ? "0" + v : v))
          .join(":");

        console.log(displayElementId, timeString);

        chrome.runtime.sendMessage({
          command: "updateTime",
          timeString: timeString,
          elementId: displayElementId,
        });

        if (message.command === "resetTimer") {
        }

        if (currentTime <= 0) {
          if (counter % 2 === 0) {
            isPopupOpen((isOpen) => {
              if (isOpen) {
                chrome.runtime.sendMessage({
                  command: "playSoundRest",
                });
              } else {
                chrome.notifications.create(
                  {
                    type: "basic",
                    iconUrl: "/icons/icon128.png",
                    title: "Rest!",
                    message: "It's rest time!",
                  },
                  (notificationId) => {
                    if (chrome.runtime.lastError) {
                      console.error(chrome.runtime.lastError);
                    } else {
                      console.log(
                        "Notification created with ID:",
                        notificationId
                      );
                    }
                  }
                );
              }
            });
          } else {
            isPopupOpen((isOpen) => {
              if (isOpen) {
                chrome.runtime.sendMessage({
                  command: "playSoundFocus",
                });
              } else {
                chrome.notifications.create(
                  {
                    type: "basic",
                    iconUrl: "/icons/icon128.png",
                    title: "Focus!",
                    message: "It's focus time!",
                  },
                  (notificationId) => {
                    if (chrome.runtime.lastError) {
                      console.error(chrome.runtime.lastError);
                    } else {
                      console.log(
                        "Notification created with ID:",
                        notificationId
                      );
                    }
                  }
                );
              }
            });
          }
          counter++;
          clearInterval(interval);
          callback();
        }
      }, 1000);
    };

    const runCycle = (stop) => {
      if (currentCycle < cycles * 2) {
        const isFocusTime = currentCycle % 2 === 0;

        if (stop) {
          return;
        }

        if (isFocusTime) {
          startTimer(focusTime, "timerDisplayFocus", runCycle);
        } else {
          startTimer(restTime, "timerDisplayRest", runCycle);
        }
        currentCycle++;
        if (currentCycle % 2 === 1 && currentCycle > 2) {
          cyclesDecrement--;
          chrome.runtime.sendMessage({
            command: "decrementCycle",
            cyclesDecrement: cyclesDecrement,
          });
        }
      } else {
        if (isPopupOpen()) {
          chrome.runtime.sendMessage({
            command: "playSoundFinish",
          });
        } else {
          chrome.notifications.create(
            {
              type: "basic",
              iconUrl: "/icons/icon128.png",
              title: "Done, congratz!",
              message: "Your cycles just ended!",
            },
            (notificationId) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
              } else {
                console.log("Notification created with ID:", notificationId);
              }
            }
          );
        }
      }
    };
    runCycle();
  }
  if (message.command === "resetTimer") {
    resetTimer();
  }
});
