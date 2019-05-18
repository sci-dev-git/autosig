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
    this.setData({userInfo: app.globalData.userInfo})
  },
  methods: {
    onAddGroup() {
      this.triggerEvent('gotogroup', {})
    }
  }
})
