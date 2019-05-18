const app = getApp()
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    userInfo: null,
    attendedGroup:false
  },
  attached: function () {
    this.setData({userInfo: app.globalData.userInfo})
  },
  methods: {
    onAddGroup() {
      this.triggerEvent('gotogroup', {})
    }
  }
})
