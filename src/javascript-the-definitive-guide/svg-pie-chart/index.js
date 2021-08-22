import pieChart from "./pie-chart.js"

chart.append(pieChart({
  width: 640, height: 640,  // 指定宽高
  cx: 200, cy: 200, r: 180, // 指定圆心坐标和半径
  lx: 400, ly: 10,          // 指定图例的位置
  data: {
    "JavaScript": 71.5,
    "Java": 45.4,
    "Bash/Shell": 40.4,
    "Python": 37.9,
    "C#": 35.3,
    "PHP": 31.4,
    "C++": 24.6,
    "C": 22.1,
    "TypeScript": 18.3,
    "Ruby": 10.3,
    "Swift": 8.3,
    "Objective-C": 7.3,
    "Go": 7.2,
  }
}))