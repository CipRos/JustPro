console.log("[JP Launcher] Loading...")
var list = [
  {url: "https://www.google.com/", load: "https://raw.githubusercontent.com/CipRos/JustPro/main/google.js"}
]

var lnk = list.find((link) => link.url == document.location.href)
fetch(lnk.load).then(r => r.text()).then(r => eval(r))
