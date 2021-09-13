export class GameState {
  // 用于创建新游戏的工厂函数
  static newGame() {
    let s = new GameState()
    s.secret = s.randomInt(0, 100)
    s.low = 0         // 猜测必须大于...
    s.high = 100      // 猜测必须小于...
    s.numGuesses = 0  // 已经猜了多少次
    s.guess = null    // 上一次猜的
    return s
  }

  // 通过 history.pushState() 保存游戏状态时
  // 只保存了一个简单的对象，而不是 GameState 实例
  // 因此这个工厂函数会基于这个对象重建 GameState 对象
  static fromStateObject(stateObject) {
    let s = new GameState()
    for (let key of Object.keys(stateObject)) {
      s[key] = stateObject[key]
    }
    return s
  }

  // 将游戏历史变成 URL，方便我们存储
  // 注意不能将 secret 放在 URL 中，因为这样就泄密了
  // 如果用户用这些参数新开一个页面，我们会重新从最高值和最低值之间选择一个随机数
  toURL() {
    let url = new URL(window.location)
    url.searchParams.set("l", this.low)
    url.searchParams.set("h", this.high)
    url.searchParams.set("n", this.numGuesses)
    url.searchParams.set("g", this.guess)
    return url.href
  }

  // 这个工厂函数会基于指定的 URL 创建一个新的 GameState 对象
  static fromURL(url) {
    let s = new GameState()
    let params = new URL(url).searchParams
    s.low = parseInt(params.get("l"))
    s.high = parseInt(params.get("h"))
    s.numGuesses = parseInt(params.get("n"))
    s.guess = parseInt(params.get("g"))

    if (isNaN(s.low) || isNaN(s.high) || isNaN(s.numGuesses) || isNaN(s.guess)) {
      return null
    }

    // 我们不能将 secret 存在 URL 中，因此需要重新生成一个
    s.secret = s.randomInt(s.low, s.high)
    return s
  }

  randomInt(min, max) {
    return min + Math.ceil(Math.random() * (max - min - 1))
  }

  // 将当前的游戏状态显示在页面上
  render() {
    let heading = document.querySelector("#heading")
    let range = document.querySelector("#range")
    let input = document.querySelector("#input")
    let playAgain = document.querySelector("#play-again")

    heading.textContent = document.title =
      `I'm thinking of a number between ${this.low} and ${this.high}.`

    range.style.marginLeft = `${this.low}%`
    range.style.width = `${this.high - this.low}%`

    input.value = ""
    input.focus()

    if (this.guess === null) {
      input.placeholder = "Type your guess and hit Enter"
    } else if (this.guess < this.secret) {
      input.placeholder = `${this.guess} is too low. Guess again`
    } else if (this.guess > this.secret) {
      input.placeholder = `${this.guess} is too high. Guess again`
    } else {
      input.placeholder = document.title = `${this.guess} is correct!`
      heading.textContent = `You win in ${this.numGuesses} guesses!`
      playAgain.hidden = false
    }
  }

  // 基于用户的猜测更新游戏状态
  // 更新成功返回 true，否则返回 false
  updateForGuess(guess) {
    if ((guess > this.low) && (guess < this.high)) {
      if (guess < this.secret) this.low = guess
      else if (guess > this.secret) this.high = guess
      this.guess = guess
      this.numGuesses++
      return true
    } else {
      alert(`Place enter a number greater than ${
        this.low} and less than ${this.high}`)
      return false
    }
  }
}
