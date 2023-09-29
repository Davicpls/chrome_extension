class Timer {
  constructor() {
    this.currentCycle = 0;
    this.interval = null;
  }

  validateNumberInput(input) {
    return typeof input === "number" && input > 0;
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

      if (currentTime <= 0) {
        clearInterval(this.interval);
        callback();
      }
    }, 1000);
  }

  start() {
    const focusTime = Number(document.getElementById("input-focus").value);
    const restTime = Number(document.getElementById("input-rest").value);
    const cycles = Number(document.getElementById("input-cycles").value);

    document.getElementById("timerDisplayFocus").textContent = focusTime;
    document.getElementById("timerDisplayRest").textContent = restTime;
    document.getElementById("remainingCycles").textContent = cycles;

    if (
      this.validateNumberInput(focusTime) &&
      this.validateNumberInput(restTime) &&
      this.validateNumberInput(cycles)
    ) {
      this.currentCycle = 0;

      const runCycle = () => {
        if (this.currentCycle < cycles * 2) {
          const isFocusTime = this.currentCycle % 2 === 0;

          if (isFocusTime) {
            this.startTimer(focusTime, "timerDisplayFocus", runCycle);
          } else {
            this.startTimer(restTime, "timerDisplayRest", runCycle);
          }

          this.currentCycle++;
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
    this.interval = null;
    this.currentCycle = 0;
  }
}

const timer = new Timer();
document.getElementById("start").addEventListener("click", () => timer.start());
