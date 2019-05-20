const app = getApp()
Component({
  data: {
    userInfo: null,
    noImage: true
  },
  attached() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        noImage: false
        })

    } else {
      app.userInfoReadyCallback3 = res => {
        this.setData({
          userInfo: res.userInfo,
          noImage: false
          })
      }
    }
  }
})