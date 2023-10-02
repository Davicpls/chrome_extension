/* global chrome */

class Timer {
  constructor() {
    this.currentCycle = 0;
    this.interval = null;
    this.counter = 0;
    this.audioFocus = new Audio("/src/sounds/focus.mp3");
    this.audioRest = new Audio("/src/sounds/rest.mp3");
    this.audioFinish = new Audio("path/to/alert.mp3");
  }

  validateNumberInput(input) {
    return typeof input === "number" && input > 0;
  }

  playSoundFocus() {
    this.audioFocus.play();
    setTimeout(() => {
      this.audioFocus.pause();
      this.audioFocus.currentTime = 0;
    }, 5000);
  }

  playSoundRest() {
    this.audioRest.play();
    setTimeout(() => {
      this.audioRest.pause();
      this.audioRest.currentTime = 0;
    }, 5000);
  }

  startTimer(duration, displayElementId, callback) {
    if (this.interval) {
      clearInterval(this.interval);
    }

    let currentTime = duration * 60;

    this.interval = setInterval(() => {
      currentTime--;

      const minutes = Math.floor(currentTime / 60);
      const seconds = currentTime % 60;

      const timeString = [minutes, seconds]
        .map((v) => (v < 10 ? "0" + v : v))
        .join(":");

      document.getElementById(displayElementId).textContent = timeString;

      /*       chrome.runtime.sendMessage({ command: "getState" }, () => {
        document.getElementById(displayElementId).textContent = timeString;
      }); */

      if (currentTime <= 0) {
        if (this.counter % 2 === 0) {
          this.playSoundRest();
        } else {
          this.playSoundFocus();
        }
        this.counter++;
        clearInterval(this.interval);
        callback();
      }
    }, 1000);
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
      this.currentCycle = 0;

      /*       chrome.runtime.sendMessage({
        command: "startTimer",
        focusTime: focusTime,
        restTime: restTime,
        cycles: cycles,

      }); */

      const runCycle = () => {
        if (this.currentCycle < cycles * 2) {
          const isFocusTime = this.currentCycle % 2 === 0;

          if (isFocusTime) {
            this.startTimer(focusTime, "timerDisplayFocus", runCycle);
          } else {
            this.startTimer(restTime, "timerDisplayRest", runCycle);
          }
          this.currentCycle++;
          console.log(this.currentCycle)
          if (this.currentCycle % 2 === 1 && this.currentCycle > 2) {
            cyclesDecrement--
            document.getElementById("remainingCycles").textContent = cyclesDecrement;
          }
        } else {
          alert("All cycles completed!");
        }
      };

      runCycle();
    } else {
      alert("Valores de entrada inválidos!");
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

    document.getElementById("timerDisplayFocus").textContent = this.focusTime;
    document.getElementById("timerDisplayRest").textContent = this.restTime;
    document.getElementById("remainingCycles").textContent = this.cycles;
  }
}

const timer = new Timer();

document.getElementById("start").addEventListener("click", () => timer.start());
document.getElementById("reset").addEventListener("click", () => timer.reset());
