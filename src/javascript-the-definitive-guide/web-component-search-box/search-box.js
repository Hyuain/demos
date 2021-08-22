/**
 * Key Points
 * 1. Web Component
 * 2. Shadow DOM
 * 3. Template
 */

// 自定义 WebComponent 继承了 HTMLElement 类
class SearchBox extends HTMLElement {

  input = null

  constructor() {
    super()
    // 将其转换为影子宿主，该方法返回一个 ShadowRoot 对象，并给 shadowRoot 赋值
    // 这个影子根节点对象是一个 DocumentFragment，可以用 DOM API 给他添加内容
    this.attachShadow({ mode: "open" })
    // 克隆我们定义的模板，模板包含了组件的后代和样式
    // 然后追加到影子根节点，用 append 和 appendChild 都行
    this.shadowRoot.append(SearchBox.template.content.cloneNode(true))

    // 取得影子 DOM 中重要元素的引用
    // 注意影子 DOM 中的元素用 document.querySelector 是找不到的（所以叫影子 DOM）
    this.input = this.shadowRoot.querySelector("#input")
    const leftSlot = this.shadowRoot.querySelector("slot[name='left']")
    const rightSlot = this.shadowRoot.querySelector("slot[name='right']")

    // 根据内部 input 的 focus 来调整 focused 属性，方便写样式
    // 注意 input 的 focus 和 blur 事件会冒泡，可以在 <search-box> 上监听到这些事件
    // input 上有的事件就不会冒泡到外面，比如 change
    this.input.onfocus = () => this.setAttribute("focused", "")
    this.input.onblur = () => this.removeAttribute("focused")

    // 监听放大镜的点击事件和 input 的 change 事件，向外发出 search 事件
    // 注意 input 的 change 事件在失去焦点之前都不会触发
    leftSlot.onclick = this.input.onchange = (event) => {
      event.stopPropagation()
      if (this.disabled) return
      this.dispatchEvent(new CustomEvent("search", {
        detail: this.input.value
      }))
    }

    rightSlot.onclick = (event) => {
      event.stopPropagation()
      if (this.disabled) return
      // clear 事件可以被 preventDefault 取消
      const e = new CustomEvent("clear", { cancelable: true })
      this.dispatchEvent(e)
      // 如果 clear 事件没有被 preventDefault 取消，则清空输入字段
      if (!e.defaultPrevented) {
        this.input.value = ""
      }
    }
  }

  // 属性被设置或改变时触发
  // 需要配合 observedAttributes 来使用
  attributeChangedCallback(name, oldValue, newValue) {
    console.log("attributeChangedCallback", name, oldValue, newValue)
    switch (name) {
      case "disabled": return this.input.disabled = newValue !== null
      case "placeholder": return this.input.placeholder = newValue
      case "size": return this.input.size = newValue
      case "value": return this.input.value = newValue
    }
  }

  // 定义一些供给外部访问的属性
  // 当通过设置方法修改了某个属性时，浏览器会调用 attributeChangedCallback

  get placeholder() { return this.getAttribute("placeholder") }
  get size() { return this.getAttribute("size") }
  get value() { return this.getAttribute("value") }
  get disabled() { return this.hasAttribute("disabled") }
  get hidden() { return this.hasAttribute("hidden") }

  set placeholder(value) { this.setAttribute("placeholder", value) }
  set size(value) { this.setAttribute("size", value) }
  set value(text) { this.setAttribute("value", text) }
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "")
    } else {
      this.removeAttribute("disabled")
    }
  }
  set hidden(value) {
    if (value) {
      this.setAttribute("hidden", "")
    } else {
      this.removeAttribute("hidden")
    }
  }
}

// 这个数组中列出的元素才会触发 attributeChangedCallback
SearchBox.observedAttributes = ["disabled", "placeholder", "size", "value"]

// <template> 用来保存样式和元素树
// 这样就可以复用 HTML 代码，并且通过这个 clone 出来的元素不需要再解析一遍
SearchBox.template = document.createElement("template")

SearchBox.template.innerHTML = `
<style>
/*
 * 这里的 :host 选择符，选中了阳光 DOM 中的 <search-box> 元素
 * 这些样式都是默认的，使用者可以通过阳光 DOM 中的样式来覆盖这些样式
 */
:host {
  display: inline-block;
  border: solid black 1px;
  border-radius: 5px;
  padding: 4px 6px;
}
:host([hidden]) {
  display: none;
}
:host([disabled]) {
  opacity: .5;
}
/* 这就是为什么我们要监听 input 的 focus 和 blur 来手动给 <search-box> 增加对应的属性 */
:host([focused]) {
  box-shadow: 0 0 2px 2px #6AE;
}

/* 下面这些样式就只会应用到影子 DOM 中 */
input {
  border-width: 0;
  outline: none;
  font: inherit;
  background: inherit;
  /* 加上这句话才能让使用 search-box 时在 search-box 上面写的 color 生效 */
  /* color: inherit; */
}
slot {
  cursor: default;
  user-select: none;
}
</style>
<div>
  <slot name="left">\u{1f50d}</slot> <!-- 放大镜 -->
  <input id="input" type="text">
  <slot name="right">\u{2573}</slot> <!-- ╳ -->
</div>  
`

customElements.define("search-box", SearchBox)