const app = getApp()
// pages/begin/begin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showCustomBarBg: false,
    toolbarForwardHint: '>',

    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    openId: null,
    hasOpenId: false,
    loginState: 0,

    canOperate: false,
    attendedGroup: false,
    lenTasks: 0,
    tasks: null,
    loading: [true],
    taskTotal: '--',
    taskFinished: '--',
    taskRatio: '---',
    iconList: [{
      icon: 'list',
      color: 'blue',
      badge: 0,
      name: '群组'
    }, {
      icon: 'notice',
      color: 'olive',
      badge: 0,
      name: '公告'
    }, {
      icon: 'location',
      color: 'olive',
      badge: 0,
      name: '导航'
    }, {
      icon: 'remind',
      color: 'cyan',
      badge: 0,
      name: '备忘'
    }, {
      icon: 'rank',
      color: 'cyan',
      badge: 0,
      name: '评测'
    }, {
      icon: 'profile',
      color: 'purple',
      badge: 0,
      name: '个人'
    }, {
      icon: 'question',
      color: 'purple',
      badge: 0,
      name: '帮助'
    }]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      if (!app.globalData.authRequired) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          if (res.userInfo != null) {
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          } else {
            this.setData({
              authRequired: true
            })
          }
        }
      } else {
        this.setData({
          authRequired: true
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
      this.loginStateChanged()
    }
    // 由于 login 是网络请求，可能会在 Page.onLoad 之后才返回
    // 所以此处加入 callback 以防止这种情况
    app.loginStateCallback = () => {
      if (app.globalData.openId) { //登陆未出错
        this.setData({
          openId: app.globalData.openId,
          hasOpenId: true
        })
      }
      this.setData({
        loginState: app.globalData.loginState
      })
      this.loginStateChanged()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * Helper函数 - 登陆状态改变时被调用
   * 在此处异步获取主页面所需的数据。
   */
  loginStateChanged: function () {
    wx.hideLoading()
    switch (this.data.loginState) {
      case 2: // 要求绑定
        this.setData({ taskTotal: '1' })
        break;
      case 1: // 成功登陆
        this.setData({ canOperate: true })
        app.globalData.index_fetchData = this.fetchData
        this.fetchData()
        break;
    }
  },

  /**
   * Helper函数 - 从服务器拉取数据
   */
  fetchData() {
    if (!this.data.canOperate)
      return
    this.setData({ taskTotal: '--' })
    var api = require('../../service/autosig-apis')
    var _this = this
    // 获取今日任务
    this.setData({ 'loading[0]': true })
    api.getTasks(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[0]': false })
        if (status.code == 0) {
          _this.setData({
            attendedGroup: (data.num_attended_groups > 0),
            lenTasks: data.size,
            tasks: data.tasks
          })
        } else {
          api.showError(status)
        }
      }
    )
  },

  onMainScroll(e) {
    this.setData({ showCustomBarBg: e.detail.scrollTop > 20 })
  },
  onGotoRegister(e) {
    wx.showLoading({
      title: '加载中',
    })
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: true,
      showUserInfo: true
    })
    wx.navigateTo({
      url: '/pages/logs/logs',
    })
    wx.hideLoading()
  },
  gotogroups() {
    wx.navigateTo({
      url: '/pages/groups/groups',
    })
  },
  onAddGroup() {
    this.gotogroups()
  },
  onAvatarTap() {
    // TODO
  },

  onToolbarScroll(event) { //工具栏滚动时触发
    if (event.detail.scrollLeft > 100) {
      this.setData({ toolbarForwardHint: '' })
    } else {
      this.setData({ toolbarForwardHint: '>' })
    }
  },

  /**
   * 单击 主导航栏
   */
  onMainNaviTap(e) {
    var index = e.currentTarget.dataset.id
    switch (index) {
      case 0:
        this.gotogroups()
        break;
    }
  },

  /**
   * 单击 发起/结束 签到
   */
  onSetSign(e) {
    var task = e.currentTarget.dataset.task
    var sign = !task.activity.signStarted;

    wx.showLoading({
      title: sign?'发起中':'结束中',
    })
    this.setData({ lenSearchResults: 0 })
    var api = require('../../service/autosig-apis')
    var _this = this
    api.setSign(
      task.activity.uid,
      sign,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          _this.fetchData()
        } else {
          api.showError(status)
        }
      }
    )
  }
})
