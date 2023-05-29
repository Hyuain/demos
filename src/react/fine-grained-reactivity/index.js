/*
  effect 的调用栈，用于 state.getter 获取到当前 getter 所在的 effect 上下文
*/

const effectStack = []


/*
  实现一个 useState
  传入 value 形成闭包
  返回 getter 和 setter
*/
function useState(value) {

  // subs 用来存储订阅了该 state 的 effect
  const subs = new Set()

  // getter 中会创建 effect 和 state 的订阅关系
  const getter = () => {
    const effect = effectStack[effectStack.length - 1]
    if (effect) {
      // 建立订阅关系
      subscribe(effect, subs)
    }
    return value
  }
  const setter = (nextValue) => {
    if (Object.is(value, nextValue)) { return }
    value = nextValue
    // 向所有订阅了的 effect 发送通知
    // 注意浅拷贝，否则 subs 会在遍历过程中发生变化
    for (const effect of [...subs]) {
      effect.execute()
    }
  }
  return [getter, setter]
}

function subscribe(effect, subs) {
  // 将 effect 添加到 subs 中
  subs.add(effect)
  // 将 subs 添加到 effect 中
  effect.deps.add(subs)
}

/*
  实现一个 useEffect
  期望：
  useEffect 执行之后，回调函数会立即执行一次
  会在依赖发生变化时，执行回调函数
  不需要显式指定 useEffect 的依赖
*/
function useEffect(callback) {
  const execute = () => {
    // 清空所有与该 effect 相关的订阅发布关系，这些关系会在 callback 执行时重新建立
    // 每次重新建立依赖关系保证当前的依赖关系是最新的
    // 因为可能经过一些判断之后，effect 不再依赖某些 state，或新增对某些 state 的依赖
    cleanup(effect)
    // 将当前 effect 推入栈顶
    // 这样 state.getter 执行时可以获取到当前栈顶的 effect（即当前 getter 所处的 effect 上下文）
    effectStack.push(effect)
    try {
      // 执行回调
      callback()
    } finally {
      // effect 出栈
      effectStack.pop()
    }
  }

  const effect = {
    execute,
    deps: new Set()
  }

  // 立即执行一次，建立发布订阅关系
  execute()
}

function cleanup(effect) {
  // 从 effect 订阅的所有 state 中的 subs 中移除该 effect
  for (const subs of effect.deps) {
    subs.delete(effect)
  }
  // 清空 effect 的依赖列表
  effect.deps.clear()
}

/*
  在 TestComp 中使用 useState, useEffect, useMemo
*/
function TestComp() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // 执行 state.getter 之后，该 effect 会订阅 state 的变化
    console.log('count is:', count()) // 0
  })

  useEffect(() => {
    console.log('will not execute when count changed')
  })

  // state.setter 执行时，会向所有订阅了该 state 的 effect 发送通知
  setCount(2) // 2
}

TestComp()