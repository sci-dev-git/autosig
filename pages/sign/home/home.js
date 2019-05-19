const app = getApp()
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    userInfo: null,
    attendedGroup:false,
    taskTotal: '--',
    taskFinished: '--',
    taskRatio: '---'
  },
  attached: function () {
    if (app.globalData.userInfo) {
      this.setData({userInfo: app.globalData.userInfo})
    } else {
      app.userInfoReadyCallback2 = res => {
        this.setData({ userInfo: res.userInfo })
      }
    }
  },
  methods: {
    onAddGroup() {
      this.triggerEvent('gotogroup', {})
    }
  }
})
