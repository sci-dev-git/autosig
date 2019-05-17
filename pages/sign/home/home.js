const app = getApp()
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    userInfo: null,
    signProg: '30%'
  },
  attached: function () {
    this.setData({userInfo: app.globalData.userInfo})
  }
})
