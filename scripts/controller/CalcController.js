class CalcController {
  constructor() {
    this._audio = new Audio("click.mp3");
    this._audioOnOf = false;
    this._lastOperator = "";
    this._lastNumber = "";
    this._operation = [];
    this._locale = "pt-Br";
    this._displayCalcEl = document.querySelector("#display");
    this._dateEl = document.querySelector("#data");
    this._timeEl = document.querySelector("#hora");
    this._currentDate;
    this.initialize();
    this.initButtonsEvent();
    this.initKeyboard();
    this.pasteFromClipboard();
  }

  pasteFromClipboard() {
    document.addEventListener("paste", (e) => {
      let text = e.clipboardData.getData("Text");
      this.displayCalc = parseInt(text);
    });
  }

  copyToClipboard() {
    let input = document.createElement("input");
    input.value = this.displayCalc;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    input.remove();
  }

  initialize() {
    setInterval(() => {
      this.displayDate = this.currentDate.toLocaleDateString(this._locale);
      this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }, 0);
    document.querySelectorAll(".btn-ac").forEach((btn) => {
      btn.addEventListener("dblclick", (e) => {
        this.toggleAudio();
      });
    });
  }

  toggleAudio() {
    this._audioOnOf = !this._audioOnOf;
  }

  playAudio() {
    if (this._audioOnOf) {
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }

  initKeyboard() {
    document.addEventListener("keyup", (e) => {
      this.playAudio();
      switch (e.key) {
        case "Escape":
          this.clearAll();
          break;
        case "Backspace":
          this.clearEntry();
          break;
        case "+":
        case "-":
        case "/":
        case "*":
        case "%":
          this.addOperator(e.key);
          break;
        case "Enter":
        case "=":
          this.calc();
          break;
        case ",":
        case ".":
          this.addDot(".");
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          this.addOperator(parseInt(e.key));
          break;
        case "c":
          if (e.ctrlKey) this.copyToClipboard();
          break;
      }
    });
  }

  addEventListenerAll(element, events, fn) {
    events.split(" ").forEach((event) => {
      element.addEventListener(event, fn, false);
    });
  }

  clearAll() {
    this._operation = [0];
    this.displayCalc = 0;
  }

  clearEntry() {
    this._operation.pop();
    this.setLastNumberToDisplay();
  }

  getLast() {
    return this._operation[this._operation.length - 1];
  }

  isOperator(value) {
    return ["+", "-", "*", "/", "%"].indexOf(value) > -1;
  }

  pushOperation(value) {
    this._operation.push(value);
    if (this._operation.length > 3) {
      this.calc();
      console.log(this._operation);
    }
  }

  getResult() {
    try {
      return eval(this._operation.join(""));
    } catch (e) {
      setTimeout(() => {
        this.setError();
      }, 1);
    }
  }

  calc() {
    let last = "";
    this._lastOperator = this.getLastItem(true);
    if (this._operation.length < 3) {
      let firstItem = this._operation[0];
      this._operation = [firstItem, this._lastOperator, this._lastNumber];
    }
    if (this._operation.length > 3) {
      last = this._operation.pop();
      this._lastNumber = this.getResult();
    } else if (this._operation.length == 3) {
      this._lastNumber = this.getLastItem(false);
    }
    let result = this.getResult();
    if (last == "%") {
      result /= 100;
      this._operation = [result];
    } else {
      this._operation = [result];
      if (last) {
        this._operation.push(last);
      }
    }
    this.setLastNumberToDisplay();
  }

  getLastItem(isOperator = true) {
    let lastItem;

    for (let x = this._operation.length - 1; x >= 0; x--) {
      if (this.isOperator(this._operation[x]) == isOperator) {
        lastItem = this._operation[x];
        break;
      }
    }
    if (!lastItem) {
      lastItem = isOperator ? this._lastOperator : this.lastNumber;
    }
    return lastItem;
  }

  setLastNumberToDisplay() {
    let lastNumber = this.getLastItem(false);

    if (!lastNumber) lastNumber = 0;
    this.displayCalc = lastNumber;
  }

  addOperator(value) {
    if (isNaN(this.getLast())) {
      if (this.isOperator(value)) {
        this._operation[this._operation.length - 1] = value;
      } else {
        this.pushOperation(value);
        this.setLastNumberToDisplay();
      }
    } else if (this.isOperator(value)) {
      this.pushOperation(value);
    } else {
      this._operation[this._operation.length - 1] =
        this._operation[this._operation.length - 1] * 10 + value;

      this.setLastNumberToDisplay();
    }

    console.log(this._operation);
  }

  setError() {
    this.displayCalc = "Error";
  }

  addDot() {
    let lastOperation = this.getLast();
    if (this.isOperator(lastOperation) || !lastOperation) {
      this.pushOperation("0.");
    } else {
      this.setLastOperation(lastOperation.toString() + ".");
    }
    this.setLastNumberToDisplay();
  }

  execBtn(value) {
    this.playAudio();
    switch (value) {
      case "ac":
        this.clearAll();
        break;
      case "ce":
        this.clearEntry();
        break;
      case "soma":
        this.addOperator("+");
        break;
      case "subtracao":
        this.addOperator("-");
        break;
      case "divisao":
        this.addOperator("/");
        break;
      case "multiplicacao":
        this.addOperator("*");
        break;
      case "porcento":
        this.addOperator("%");
        break;
      case "igual":
        this.calc();
        break;
      case "ponto":
        this.addDot(".");
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        this.addOperator(parseInt(value));
        break;
      default:
        this.setError();
        break;
    }
  }

  initButtonsEvent() {
    let buttons = document.querySelectorAll("#buttons > g, #parts > g");
    buttons.forEach((btn, index) => {
      this.addEventListenerAll(btn, "click drag", (e) => {
        let classe = btn.className.baseVal.replace("btn-", "");
        this.execBtn(classe);
      });
      this.addEventListenerAll(btn, "mouseover mouseup mousedown", (e) => {
        btn.style.cursor = "pointer";
      });
    });
  }

  get displayTime() {
    return this._timeEl.innerHTML;
  }

  set displayTime(val) {
    this._timeEl.innerHTML = val;
  }

  get displayDate() {
    return this._dateEl.innerHTML;
  }

  set displayDate(val) {
    this._dateEl.innerHTML = val;
  }

  get displayCalc() {
    return this._displayCalcEl.innerHTML;
  }

  set displayCalc(val) {
    if (val.toString().length > 9) {
      this.setError();
      return;
    }
    this._displayCalcEl.innerHTML = val;
  }
  get currentDate() {
    return new Date();
  }

  set currentDate(val) {
    this._dateEl = val;
  }
}
