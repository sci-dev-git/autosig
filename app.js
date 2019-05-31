//app.js
const util = require('utils/util')
App({
  /**
   * Helper函数 - 登陆独步校园
   */
  doLogin() {
    this.globalData.canFetchData = false
    this.globalData.loginState = 0
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var api = require('/service/autosig-apis')
        var that = this
        api.login(
          res.code,
          function (status, data) {
            that.globalData.inRelogin = false
            switch (status.msg) {
              case 'E_OK':
                // 成功登陆 发送openId到后台
                that.loginAutosig(data)
                break;
              case 'E_USER_NON_EXISTING':
                // 用户不存在, 请求绑定. 发送openId到后台
                that.globalData.openId = data.openId
                that.globalData.loginState = 2
                that.updateLoginState()
                break;
              default:
                // 服务出错
                that.globalData.loginState = 3
                that.updateLoginState()
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
  },
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    this.doLogin()
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
    this.globalData.canFetchData = true
    this.updateLoginState()
  },
  updateLoginState() {
    if (this.loginStateCallback) {
      this.loginStateCallback()
    }
  },
  /**
   * 公开函数：重新登陆
   */
  relogin() {
    if (this.globalData.inRelogin) // 避免重复发起重登录命令
      return
    this.globalData.inRelogin = true
    this.doLogin()
  },
  globalData: {
    util: util,
    userInfo: null,
    asusrInfo: null,
    openId: null,
    token: null,
    loginState: 0, // 0 = logining, 1 = login, 2 = not login, 3 = error
    authRequired: false, // true=要求授权
    canFetchData: false, // 标明子页面可以从服务器拉取数据
    inRelogin: false,

    groupedit_currentGroup: null,
    groupedit_manageGroup: false
  }
})
