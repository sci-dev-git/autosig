const app = getApp()
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    userInfo: null,
    hasUserInfo: false,
    userInfoRequired: false,
    attendedGroup:false,
    taskTotal: '--',
    taskFinished: '--',
    taskRatio: '---'
  },
  attached: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        userInfoRequired: app.globalData.userInfoRequired
        })
    } else {
      if (app.globalData.userInfoRequired) {
        this.setData({
          hasUserInfo: false,
          userInfoRequired: true
        })
      } else {
        app.userInfoReadyCallback2 = res => {
          if (res.userInfo) {
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true,
              userInfoRequired: app.globalData.userInfoRequired
              })
          } else {
            if (res.userInfo) {
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true,
                userInfoRequired: app.globalData.userInfoRequired
              })
            } else {
              this.setData({
                hasUserInfo: false,
                userInfoRequired: true
              })
            }
          }
        }
      }
    }
  },
  methods: {
    onAddGroup() {
      this.triggerEvent('gotogroup', {})
    },
    onAvatarTap() {
      this.triggerEvent('gotocenter', {})
    }
  }
})
