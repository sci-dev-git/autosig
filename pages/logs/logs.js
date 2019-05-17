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
    code: '',
    hasCode: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userCode: '',
    userName: ''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
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

    if (app.globalData.code) {
      this.setData({
        code: app.globalData.code,
        hasCode: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.codeReadyCallback = res => {
        this.setData({
          code: res.code,
          hasCode: true
        })
      }
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  logbtn: function(options){
    var api = require('../../utils/autosig-apis')
    api.reg(this.data.code,
            this.data.place,
            this.data.userCode,
            this.data.userName,

            function(err) {
              console.log(err)
              if(err.code == 0) {
                wx.redirectTo({
                  url: '../index/index',
                })
              } else {
                wx.showModal({
                  title: '绑定',
                  content: '绑定失败',
                })
              }
            }
    ) 
    

  },
  bindUserCodeInput(e){
    this.setData({
      userCode:e.detail.value
    })
  },
  bindUserNameInput(e){
    this.setData({
      userName:e.detail.value
    })
  }
})
