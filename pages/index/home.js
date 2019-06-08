const app = getApp()
const api = require('../../service/autosig-apis')
const wlanProbe = require('../../service/wlan-probe')

// pages/begin/begin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openId: null,
    hasOpenId: false,
    loginState: 0,
    updateTime: '',
    updateTimeHM: '',

    attendedGroup: false,
    lenTasks: 0,
    tasks: null,
    loading: [true, true, false], // tasks, unread msgs, absent
    showCustomBarBg: false,
    toolbarForwardHint: '>',
    taskTodo: '--',
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
      icon: 'remind',
      color: 'cyan',
      badge: 0,
      name: '备忘'
    }, {
      icon: 'rank',
      color: 'cyan',
      badge: 0,
      name: '总表'
    }, {
      icon: 'location',
      color: 'olive',
      badge: 0,
      name: '导航'
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
    }],
    showSignState: false,
    signStateCurrent: null,
    lenAbsentees: 0,
    absentees: null,
    showMemo: false,
    memoTime: '12:00',
    memoContent: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
            this.setData({ authRequired: true })
          }
        }
      } else {
        this.setData({ authRequired: true })
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

    this.setData({
      updateTime: app.globalData.util.currentTime(),
      updateTimeHM: app.globalData.util.currentTimeHM()
    })
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
    this.fetchData()
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
    switch (this.data.loginState) {
      case 2: // 要求绑定
        this.setData({ taskTodo: '1' })
        break;
      case 1: // 成功登陆
        this.fetchData()
        break;
    }
  },

  /**
   * Helper函数 - 从服务器拉取数据
   */
  fetchData() {
    if (!app.globalData.canFetchData)
      return
    this.setData({ taskTodo: '--' })
    var _this = this

    // 获取今日任务
    if (this.data.lenTasks == 0) {
      this.setData({ 'loading[0]': true })
    }
    api.getTasks(
      app.globalData.token,
      function (status, data) {
        if (status.code == 0) {
          // 群组状态（注意else分支不要对称处理）
          app.globalData.attendedGroup = (data.num_attended_groups > 0 || data.num_created_groups > 0)
          app.globalData.joinGroupNaviBack = (data.num_attended_groups == 0)
          _this.setData({
            'loading[0]': false,
            attendedGroup: app.globalData.attendedGroup
          })
          // 获取备忘录数据
          // TODO: 合并到远程服务器
          const db_entry = 'memos'
          var i = data.size;
          while (i--) {
            data.tasks[i].isMemo = false
          }
          var memos = null
          try {
            memos = wx.getStorageSync(db_entry)
          } catch (e) {
          }
          if (memos != null) {
            var i = memos.length
            while (i--) {
              data.tasks.push({
                isMemo: true,
                memoIdx: i,
                activity: {
                  startHour: parseInt(memos[i].time.split(':')[0]),
                  startMinute: parseInt(memos[i].time.split(':')[1])
                },
                memo: memos[i]
              })
            }
          }
          // 对活动时间排序
          for (var i = 0; i < data.tasks.length; i++) {
            for (var j = i + 1; j < data.tasks.length; j++) {
              var H = data.tasks[i].activity.startHour;
              var M = data.tasks[i].activity.startMinute;
              var mH = data.tasks[j].activity.startHour;
              var mM = data.tasks[j].activity.startMinute;
              if (app.globalData.util.compareTime([H, M], [mH, mM]) > 0) {
                var tmp = data.tasks[i]
                data.tasks[i] = data.tasks[j]
                data.tasks[j] = tmp
              }
            }
          }
          // 为时间轴配色
          _this.planTimelineColors(data.tasks)
          // 刷新界面  
          _this.setData({
            lenTasks: data.size,
            tasks: data.tasks,
            taskTodo: data.num_todo + memos.length,
            updateTime: app.globalData.util.currentTime()
          })

        } else {
          api.showError(status)
        }
      }
    )
    // 获取未读公告信息
    this.setData({ 'loading[1]': true })
    api.getUnreadCount(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[1]': false })
        if (status.code == 0) {
          _this.setData({
            'iconList[1].badge': data.count
          })
        } else {
          api.showError(status)
        }
      }
    )
  },

  /**
   * Helper函数 - 为时间轴卡片配色
   * @param tasks 列表引用
   */
  planTimelineColors(tasks) {
    var colors = ['bg-mauve', 'bg-pink', 'bg-purple', 'bg - blue', 'bg-red', 'bg-orange', 'bg-yellow', 'bg-olive', 'bg-green']
    var colorIdx = 0
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i]
      if ( (task.managed && task.todo) ||
           (!task.managed && !task.signed) ) {
        task.bgcolor = 'bg-cyan'
      } else {
        task.bgcolor = colors[colorIdx % (colors.length - 1)]
        ++colorIdx
      }
    }
  },

  onMainScroll(e) {
    this.setData({ showCustomBarBg: e.detail.scrollTop > 10 })
  },

  /**
   * 单击 重新获取头像按钮
   */
  onRegetUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.authRequired = false
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: app.globalData.userInfo,
        authRequired: false,
        hasUserInfo: true,
        showUserInfo: true
      })
    }
  },

  /**
   * 单击 去完善 按钮
   */
  onGotoRegister(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: true,
      showUserInfo: true
    })
    app.globalData.util.gotoPage('/pages/logs/logs')
  },
  /**
   * Helper函数 - 在登陆未完成时，不能跳转到其它页面
   */
  switchPage(callback) {
    if (app.globalData.loginState == 1) {
      callback()
    } else {
      wx.showModal({
        title: '尚未登陆',
        content: '请等待登陆完成',
        showCancel: false,
      })
    }
  },
  gotogroups() {
    this.switchPage(function() {
        app.globalData.util.gotoPage('/pages/groups/groups')
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
    var _this = this
    var index = e.currentTarget.dataset.id
    switch (index) {
      case 0:
        this.gotogroups()
        break;
      case 1:
        this.switchPage(function () {
          app.globalData.util.gotoPage('/pages/broadcast/broadcast')
        })
        break;
      case 2:
        this.switchPage(function () {
          _this.setData({ showMemo: true })
        })
        break;
      case 3:
        this.switchPage(function () {
          app.globalData.util.gotoPage('/pages/summary/summary')
        })
        break;
      case 4:
        this.switchPage(function () {
          app.globalData.util.gotoPage('/pages/navigator/navigator')
        })
        break;
      case 5:
        this.switchPage(function () {
          app.globalData.util.gotoPage('/pages/center/center')
        })
        break;
      case 6:
        app.globalData.util.gotoPage('/pages/help/help')
        break;
    }
  },

  /**
   * 单击 发起/结束 签到
   */
  onSetSign(e) {
    var task = e.currentTarget.dataset.task
    var sign = !task.activity.signStarted;
    var _this = this

    wx.showModal({
      title: sign?'发起签到':'结束签到',
      content: '确定' + (sign?'发起':'结束') + '“' + task.activity.name + '”的签到？' + (sign?'':'一旦结束无法撤销！'),
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: sign ? '发起中' : '结束中',
          })
          _this.setData({ lenSearchResults: 0 })
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
      }
    })
  },

  /**
   * 单击 签到按钮
   */
  onSignin(e) {
    var task = e.currentTarget.dataset.task
    var activity = task.activity
    var wlanMACs = []
    var _this = this
    wx.showLoading({
      title: '扫描中',
    })
    wlanProbe.probeWLAN(
      /* success */
      function(list) {
        wx.hideLoading()
        console.info(list)
        var i=list.length
        while(i--) {
          wlanMACs.push(list[i].BSSID)
        }
        if (wlanMACs.length) {
          api.signin(
            activity.uid,
            app.globalData.token,
            wlanMACs,
            function (status, data) {
              if (status.code == 0) {
                wx.showToast({
                  title: '签到成功',
                })
                _this.fetchData()
              } else {
                api.showError(status)
              }
            }
          )
        } else {
          api.showError('E_SIGN_POINT_NF')
        }
      },
      /* fail */
      function (e) {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '请先打开WLAN开关',
          showCancel: false
        })
      }
    )
  },

  /**
   * 单击 查看签到
   */
  onQuerySignState(e) {
    var task = e.currentTarget.dataset.task;
    this.setData({
      showSignState: true,
      signStateCurrent: task
    })
    var _this = this
    this.setData({ 'loading[2]': true })
    api.getAbsentees(
      task.activity.uid,
      task.group.uid,
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[2]': false })
        if (status.code == 0) {
          _this.setData({
            lenAbsentees: data.size,
            absentees: data.absentees
          })
        } else {
          api.showError(status)
        }
      }
    )
  },

  /**
   * 隐藏 签到状态
   */
  onHideSignState() {
    this.setData({ showSignState: false })
  },

  /**
   * 隐藏 备忘
   */
  onHideMemo() {
    this.setData({ showMemo: false })
  },

  /**
   * 编辑备忘
   */
  bindMemoContentInput(e) {
    this.setData({ memoContent: e.detail.value })
  },
  onMemoTimeChange(e) {
    this.setData({ memoTime: e.detail.value })
  },

  /**
   * 单击 - 添加备忘
   */
  onCreateMemo() {
    var err = null
    if (this.data.memoContent.length == 0)
      err = '请输入备忘内容'
    if (err != null) {
      wx.showModal({
        title: '请完善信息',
        content: err,
        showCancel: false
      })
      return
    }
    var _this = this
    const db_entry = 'memos'
   
      // todo: sync data to the remote
      var memos = null
      try {
        memos = wx.getStorageSync(db_entry)
      } catch(e) {
      }
      if (!memos)
        memos = []
      let memo = {
        content: _this.data.memoContent,
        time: _this.data.memoTime
      }
     memos.push(memo)
      try {
        wx.setStorageSync(db_entry,memos)
        _this.onHideMemo()
        _this.fetchData()
      } catch(e) {
        console.info(e)
        wx.showModal({
          title: '提示',
          content: '提交失败',
          showCancel: false
        })
      }
  },

  /**
   * 单击 - 删除备忘
   */
  onRemoveMemo(e) {
    var memoIdx = e.currentTarget.dataset.memoIdx
    var _this = this
    const db_entry = 'memos'
    try {
      var memos = wx.getStorageSync(db_entry)
      if (memos == null)
        return
      memos.splice(memoIdx, 1)

      wx.setStorageSync(db_entry, memos)
      _this.fetchData()
    } catch(e) {
      wx.showModal({
        title: '提示',
        content: '提交失败',
        showCancel: false
      })
    }
  }
})
