// 一个 FIFO 的任务队列
let taskList = []
// 总任务数
let totalTaskCount = 0
// 已经处理了多少任务
let currentTaskNumber = 0
// 正在处理的任务
let taskHandle = null

let totalTaskCountElem = document.getElementById("totalTaskCount")
let currentTaskNumberElem = document.getElementById("currentTaskNumber")
let progressBarElem = document.getElementById("progress")
let startButtonElem = document.getElementById("startButton")
let logElem = document.getElementById("log")

// 用来保存 log 函数产生的 DocumentFragment
// 当下次 animation frame 渲染的时候，会将其内容 append 到 log 里面去
let logFragment = null
// 跟踪是否为即将到来的帧已经安排了 status display box 的更新，防止其多次执行
let statusRefreshScheduled = false

function enqueueTask(taskHandler, taskData) {
  taskList.push({
    handler: taskHandler,
    data: taskData,
  })

  // 已经添加了多少任务进入队列，并不会因为任务出队而减少
  totalTaskCount++

  if (!taskHandle) {
    taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 })
  }

  scheduledStatusRefresh()
}

// 该函数会在以下条件下被调用：
// 1. 浏览器检测到有足够的空闲时间
// 2. 或者我们的任务超时了，这里设置的 1s 超时
function runTaskQueue(deadline) {
  // 当空闲时间还有的时候、或者超时了，就执行任务队列里面的任务
  while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && taskList.length) {
    let task = taskList.shift()
    currentTaskNumber++

    task.handler(task.data)
    scheduledStatusRefresh()
  }

  // 当空闲时间用完了
  // 如果还有任务要执行，需要继续调用一次 requestIdleCallback 等待下次空闲执行剩下的任务
  // 如果没有任务了，就等下次 enqueue 的时候再调用 requestIdleCallback
  if (taskList.length) {
    taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 })
  } else {
    taskHandle = 0
  }
}

// 安排视图的更新，更新我们在视图上的进度条
function scheduledStatusRefresh() {
  if (!statusRefreshScheduled) {
    requestAnimationFrame(updateDisplay)
    statusRefreshScheduled = true
  }
}

// 更新视图，绘制 progress box、log
// 他会在渲染下一帧时、 DOM 处于可以让我们更改的安全状态时被调用
function updateDisplay() {
  // 标记是否滚动到了最底部
  let scrolledToEnd = logElem.scrollHeight - logElem.clientHeight <= logElem.scrollTop + 1

  if (totalTaskCount) {
    if (progressBarElem.max != totalTaskCount) {
      totalTaskCountElem.textContent = totalTaskCount
      progressBarElem.max = totalTaskCount
    }

    if (progressBarElem.value != currentTaskNumber) {
      currentTaskNumberElem.textContent = currentTaskNumber
      progressBarElem.value = currentTaskNumber
    }
  }

  if (logFragment) {
    logElem.appendChild(logFragment)
    logFragment = null
  }

  // 加入了一些 log 之后，需要继续往下滚
  if (scrolledToEnd) {
    logElem.scrollTop = logElem.scrollHeight - logElem.clientHeight
  }

  statusRefreshScheduled = false
}

function log(text) {
  if (!logFragment) {
    logFragment = document.createDocumentFragment()
  }

  const el = document.createElement("div")
  el.textContent = text
  logFragment.appendChild(el)
}

// 这里以一个 log 任务作为实例
// 只需要类似地写一个需要放在空闲时间执行的任务即可
// 注意在这里面不能修改DOM，修改DOM的任务需要放在 requestAnimationFrame 中
function logTaskHandler(data) {
  log(`Running task #${currentTaskNumber}`)

  for (i = 0; i < data.count; i++) {
    log((i + 1).toString() + ". " + data.text)
  }
}

function decodeTechnoStuff() {
  totalTaskCount = 0
  currentTaskNumber = 0
  updateDisplay()

  let n = getRandomIntInclusive(100, 200)

  for (let i = 0; i < n; i++) {
    let taskData = {
      count: getRandomIntInclusive(75, 150),
      text: `This text is from task number ${i + 1} of ${n}`
    }
    // 解封这段代码，对比没有使用后台计算的情况，一切都被阻塞了
    logTaskHandler(taskData)
    // 直接使用 updateDisplay()，不使用 requestAnimationFrame，会更卡
    // scheduledStatusRefresh()
    // updateDisplay()
    enqueueTask(logTaskHandler, taskData)
  }
}

startButtonElem.addEventListener("click", decodeTechnoStuff, false)

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}
