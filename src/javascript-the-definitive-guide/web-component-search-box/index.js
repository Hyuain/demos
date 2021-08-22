box.addEventListener("search", (e) => {
  console.log("search!", e)
})

box.addEventListener("focus", (e) => {
  console.log("focus", e)
})

const handleToggleDisabled = () => {
  box.disabled = !box.disabled
}

const handleToggleHidden = () => {
  box.hidden = !box.hidden
}

const handleChangeValue = () => {
  box.value += "1"
}