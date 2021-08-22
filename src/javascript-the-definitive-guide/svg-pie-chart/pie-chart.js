export default (options = {}) => {
  const { width, height, cx, cy, r, lx, ly, data } = options

  // SVG 元素的 XML 命名空间
  const svg = "http://www.w3.org/2000/svg"

  // 创建 <svg> 元素不能用 createElement，要用 createElementNS 并传入命名空间
  const chart = document.createElementNS(svg, "svg")
  // 指定像素大小及用户坐标
  chart.setAttribute("width", width)
  chart.setAttribute("height", width)
  chart.setAttribute("viewBox", `0 0 ${width} ${height}`)

  // 定义饼图的文本样式，也可以使用 CSS 来设置
  chart.setAttribute("font-family", "sans-serif")
  chart.setAttribute("font-size", "18")

  // 根据传入的数据计算总量
  const labels = Object.keys(data)
  const values = Object.values(data)
  const total = values.reduce((x, y) => x + y)

  // 计算每个扇形的角度，起始角度为 angles[i]，结束角度为 angles[i + 1]
  // 这里的角度用弧度表示
  const angles = [0]
  values.forEach((value, i) => angles.push(angles[i] + value/total * 2 * Math.PI))

  // 遍历所有的扇形
  values.forEach((value, i) => {
    // 计算扇形圆弧相接的两点
    const x1 = cx + r * Math.sin(angles[i])
    const y1 = cy - r * Math.cos(angles[i])
    const x2 = cx + r * Math.sin(angles[i+1])
    const y2 = cy - r * Math.cos(angles[i+1])

    // big 用于标记角度大于半圆
    // 对于 SVG 弧形绘制组件是必须的
    const big = (angles[i+1] - angles[i] > Math.PI) ? 1 : 0

    // 描述如何绘制扇形
    const path = `M${cx},${cy}` + // 移动到圆心
      `L${x1},${y1}` +            // 画一条直线到 (x1, y1)
      `A${r},${r} 0 ${big} 1` +   // 画一条半径为 r 的圆弧
      `${x2},${y2}` +             // 圆弧的终点为 (x2, y2)
      "Z"                         // 在 (cx, cy) 关闭路径

    // 计算颜色，这个公式可以计算约 15 种颜色
    const color = `hsl(${(i*40)%360},${90-3*i}%,${50+2*i}%)`

    // 使用 <path> 描述每个扇形
    const slice = document.createElementNS(svg, "path")
    // 设置 path 的属性
    slice.setAttribute("d", path) // 设置扇形的路径
    slice.setAttribute("fill", color) // 设置填充颜色
    slice.setAttribute("stroke", "black") // 设置轮廓线颜色
    slice.setAttribute("stroke-width", "1") // 设置轮廓线宽度
    chart.append(slice) // 将扇形添加到饼图中

    // 为图例中的每一项画一个小方块
    const icon = document.createElementNS(svg, "rect")
    icon.setAttribute("x", lx) // 定位
    icon.setAttribute("y", ly + 30*i)
    icon.setAttribute("width", 20) // 设置大小
    icon.setAttribute("height", 20)
    icon.setAttribute("fill", color)
    icon.setAttribute("stroke", "black")
    icon.setAttribute("stroke-width", "1")
    chart.append(icon)

    // 在小方块右侧加标签
    const label = document.createElementNS(svg, "text")
    label.setAttribute("x", lx + 30)
    label.setAttribute("y", ly + 30*i + 16)
    label.append(`${labels[i]} ${value}`) // 把文本加到标签中
    chart.append(label)
  })

  return chart
}