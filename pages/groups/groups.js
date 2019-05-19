const app = getApp()
Component({
  options: {
    addGlobalClass: true,
  },
  attached: function() {
    let list = [];
    for (let i = 0; i < 26; i++) {
      list[i] = String.fromCharCode(65 + i)
    }
    this.setData({
      list: list,
      listCur: list[0]
    })
  }
})
