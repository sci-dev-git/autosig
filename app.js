//app.js
const util = require('utils/util')
App({
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    this.globalData.loginState = 0
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var api = require('/service/autosig-apis')
        var _this = this
        api.login(
          res.code,
          function(status, data) {
            switch (status.msg) {
              case 'E_OK':
                // 成功登陆 发送openId到后台
                _this.loginAutosig(data)
                break;
              case 'E_USER_NON_EXISTING':
                // 用户不存在, 请求绑定. 发送openId到后台
                _this.globalData.openId = data.openId
                _this.globalData.loginState = 2
                _this.updateLoginState()
                break;
              default:
                // 服务出错
                _this.globalData.loginState = 3
                _this.updateLoginState()
                api.showError(status)
            }
          })
      }
    })
    // 获取用户信息
    this.globalData.authRequired = false
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              if (this.userInfoReadyCallback2) {
                this.userInfoReadyCallback2(res)
              }
              if (this.userInfoReadyCallback3) {
                this.userInfoReadyCallback3(res)
              }
            }
          })
        } else {
          this.globalData.authRequired = true // 要求授权
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
          }
        }
      }
    })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },
  /**
   * 成功登陆独步校园服务器后，暂存用户信息和登陆凭证
   * @param resp 从login()或reg()接口返回的data对象。
   */
  loginAutosig(resp) {
    this.globalData.openId = resp.openId
    this.globalData.asusrInfo = resp.info
    this.globalData.loginState = 1
    this.globalData.token = resp.token
    this.updateLoginState()
  },
  updateLoginState() {
    if (this.loginStateCallback) {
      this.loginStateCallback()
    }
  },
  globalData: {
    util: util,
    userInfo: null,
    asusrInfo: null,
    openId: null,
    token: null,
    loginState: 0, // 0 = logining, 1 = login, 2 = not login, 3 = error
    authRequired: false, // true=要求授权

    groupedit_currentGroup: null,
    groupedit_manageGroup: false
  }
})
