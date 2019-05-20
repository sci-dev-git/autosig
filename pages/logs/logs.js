//index.js
/**
 * 在确认已经完成userInfo和openId的获取前，不得提前加载该页面。
 */
const app = getApp()

Page({
  data: {
    userInfo: null,
    openId: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    sch_names: ['tyut', 'aaa'],
    cur_sch: '选择学校',
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    motto: '欢迎进入独步校园！',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    place: '',
    userCode: '2018',
    userName: 'AAA'
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      openId: app.globalData.openId
    })
  },
  logbtn: function(options){
    var err = null
    if (!this.data.userCode.length)
      err = '证件号不能为空！'
    else if (!this.data.userName.length)
      err = '姓名不能为空！'
    if (err != null) {
      wx.showModal({
        title: '输入错误',
        content: err,
        showCancel: false
      })
      return
    }
    var api = require('../../service/autosig-apis')
    var _this = this
    api.reg(
      this.data.openId,
      this.data.place,
      this.data.userCode,
      this.data.userName,

      function(status, data) {
        if(status.code == 0) {
          app.globalData.token = data.token // 成功注册并登陆
          app.globalData.loginState = 1
          app.openIdReadyCallback()
          wx.showToast({
            title: '注册成功',
          })
          wx.navigateBack()
        } else {
          api.showError(status)
        }
      })
  },
  bindUserCodeInput(e){
    this.setData({
      userCode:e.detail.value.trim()
    })
  },
  bindUserNameInput(e){
    this.setData({
      userName:e.detail.value.trim()
    })
  }
})
