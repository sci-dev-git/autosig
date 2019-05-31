//index.js
/**
 * 在确认已经完成userInfo和openId的获取前，不得提前加载该页面。
 */
const app = getApp()
const api = require('../../service/autosig-apis')

Page({
  data: {
    userInfo: null,
    openId: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    place_names: ['太原理工大学'],
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    motto: '欢迎进入独步校园！',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    index: 0,
    userCode: '',
    userName: ''
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
        title: '请完善信息',
        content: err,
        showCancel: false
      })
      return
    }
    var _this = this
    wx.showLoading({
      title: '请稍后',
    })
    api.reg(
      this.data.openId,
      this.data.place_names[this.data.index],
      this.data.userCode,
      this.data.userName,

      function(status, data) {
        wx.hideLoading()
        if(status.code == 0) {
          app.loginAutosig(data) // 成功注册并登陆
          wx.showToast({
            title: '注册成功',
          })
          wx.navigateBack()
        } else {
          api.showError(status)
        }
      })
  },
  onPlaceChanged(e) {
    var index = e.detail.value
    this.setData({
      index: index,
      place: this.data.place_names[index]
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
