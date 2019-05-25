const app = getApp()
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    toolbarForwardHint: '>',

    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    openId: null,
    hasOpenId: false,
    loginState: 0,

    attendedGroup: false,
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
  attached: function () {
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
  methods: {
    /**
     * 登陆状态改变时被调用
     * 在此处异步获取主页面所需的数据。
     */
    loginStateChanged: function () {
      wx.hideLoading()
      switch (this.data.loginState) {
        case 2: // 要求绑定
          this.setData({taskTotal: '1'})
          break;
        case 1: // 成功登陆
          this.setData({ taskTotal: '--' })
          break;
      }
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
    onAddGroup() {
      this.triggerEvent('gotogroup', {})
    },
    onAvatarTap() {
      this.triggerEvent('gotocenter', {})
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
      switch(index) {
        case 0:
          this.triggerEvent('gotogroup', {})
          break;
      }
    },
  }
})
