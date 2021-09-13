import { GameState } from "./game-state.js"

let gameState = GameState.fromURL(window.location) || GameState.newGame()

// 将游戏初始状态保存到浏览器历史中

// 第一个参数是一个对象，包含文档的状态信息
// 他会使用结构化克隆的方式来保存，这样可以存储 Map、Set、Date、定型数组、ArrayBuffer

// 第二个参数是与状态对应的标题字符串，但多数浏览器都不支持

// 第三个参数是一个可选的 URL，URL 会在地址栏显示出来
// 给每个状态都关联一个 URL，可以让用户收藏应用的内部状态
// 但注意我们用这个 URL 打开新页面的时候需要重新解析，并不会收到 popstate 事件
history.replaceState(gameState, "", gameState.toURL())

// 渲染初始状态
gameState.render()

// 根据用户的猜测更新游戏状态
// 然后将状态保存到浏览器历史，并渲染新状态
document.querySelector("#input").onchange = (event) => {
  if (gameState.updateForGuess(parseInt(event.target.value))) {
    history.pushState(gameState, "", gameState.toURL())
  }
  gameState.render()
}

// 可以拿到当时 pushState 进去的状态的副本
// 然后再渲染新状态
window.onpopstate = (event) => {
  console.log(event)
  gameState = GameState.fromStateObject(event.state)
  gameState.render()
}
