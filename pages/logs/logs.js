//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    sch_names: ['tyut', 'aaa'],
    cur_sch: '选择学校',
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    motto: '欢迎进入独步校园！',
    userInfo: {},
    hasUserInfo: false,
    openId: null,
    hasOpenId: false,
    loginState: 0,
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
    wx.showLoading({
      title: '加载中',
    })

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    // 获取从app.js返回的openid
    if (app.globalData.openId) {
      this.setData({
        openId: app.globalData.openId,
        loginState: app.globalData.loginState,
        hasOpenId: true
      })
      this.openIdAcquired()
    } else {
      // 由于 login 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.openIdReadyCallback = () => {
        this.setData({
          openId: app.globalData.openId,
          loginState: app.globalData.loginState,
          hasOpenId: true
        })
        this.openIdAcquired()
      }
    }
  },
  openIdAcquired: function () { //获取到openId时被调用
    wx.hideLoading()
    if (this.data.loginState == 1) {
      // 无需绑定
      this.gotoMainPage()
    }
  },
  gotoMainPage: function() { // 跳转到主页面
    wx.redirectTo({
      url: '../index/index',
    })
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
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
          _this.gotoMainPage()
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
