// pages/groups/groupedit/groupedit.js
const app = getApp()
const api = require('../../../service/autosig-apis')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentGroup: null,
    currentPlace: '',
    manageGroup: false,
    lenMembers: 0,
    members: null,
    lenActivities: 0,
    activities: null,
    loading: [false, false], // memebrs, activities
    groupEditMode: false,
    groupName: '',
    groupDesc: '',
    acitivityEditMode: false,
    currentActivity: null,
    activityName: '',
    activityTime: '',
    activityDesc: '',
    activityWhere: '',
    activityHost: '',
    weekSelected: Array(25),
    weekModeCur: 0,
    daySelectorCur: 0,
    scrollLeft: 0,
    showCreateActivity: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.switchWeekMode(0)
    this.fetchData()
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
   * Helper函数 - 从服务器拉取数据
   */
  fetchData() {
    this.setData({
      currentGroup: app.globalData.groupedit_currentGroup,
      currentPlace: app.globalData.asusrInfo.place,
      manageGroup: app.globalData.groupedit_manageGroup,
      groupName: app.globalData.groupedit_currentGroup.name,
      groupDesc: app.globalData.groupedit_currentGroup.desc,
    })
    var _this = this
    // 获取群内成员
    this.setData({ 'loading[0]': true })
    api.getGroupMembers(
      this.data.currentGroup.uid,
      function (status, data) {
        _this.setData({ 'loading[0]': false })
        if (status.code == 0) {
          _this.setData({
            lenMembers: data.size,
            members: data.users
          })
        } else {
          api.showError(status)
        }
      }
    )
    // 获取创建的活动
    this.fetchActivityData(this.data.daySelectorCur + 1)
  },
  fetchActivityData(day) {
    var _this = this
    this.setData({ 'loading[1]': true })
    api.getActivities(
      this.data.currentGroup.uid,
      day,
      function (status, data) {
        _this.setData({ 'loading[1]': false })
        if (status.code == 0) {
          // 对活动时间排序
          for (var i = 0; i < data.size; i++) {
            for (var j = i + 1; j < data.size; j++) {
              var H = data.activities[i].startHour;
              var M = data.activities[i].startMinute;
              var mH = data.activities[j].startHour;
              var mM = data.activities[j].startMinute;
              if (app.globalData.util.compareTime([H, M], [mH, mM]) > 0) {
                var tmp = data.activities[i]
                data.activities[i] = data.activities[j]
                data.activities[j] = tmp
              }
            }
          }
          _this.setData({
            lenActivities: data.size,
            activities: data.activities
          })
        } else {
          api.showError(status)
        }
      }
    )
  },

  /**
   * Helper函数 - 退出群组
   */
  quitGroup: function (uid) {
    wx.showLoading({
      title: '请稍后',
    })
    var _this = this
    api.quitGroup(
      uid,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          app.globalData.groupedit_fetchData()
          app.globalData.index_fetchData()
          wx.showToast({
            title: '退出成功',
            showCancel: false
          })
          wx.navigateBack() // 退出当前页面，因为对群组不再拥有访问权限
        } else {
          api.showError(status)
        }
      }
    )
  },
  /**
   * Helper函数 - 删除群成员
   */
  removeMember: function(uid, openid) {
    wx.showLoading({
      title: '请稍后',
    })
    var _this = this
    api.removeGroupMember(
      uid,
      openid,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          app.globalData.groupedit_fetchData()
          app.globalData.index_fetchData()
          _this.fetchData()
          wx.showToast({
            title: '删除成功',
            showCancel: false
          })
        } else {
          api.showError(status)
        }
      }
    )
    app.globalData.index_fetchData()
  },
  /**
   * Helper函数 - 删除群组
   */
  removeGroup: function (uid) {
    wx.showLoading({
      title: '请稍后',
    })
    var _this = this
    api.removeGroup(
      uid,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          app.globalData.groupedit_fetchData()
          app.globalData.index_fetchData()
          wx.showToast({
            title: '删除成功',
            showCancel: false
          })
          wx.navigateBack() // 退出当前页面，因为群组已经不存在
        } else {
          api.showError(status)
        }
      }
    )
  },
  /**
   * Helper函数 - 删除活动
   */
  removeActivity(uid) {
    wx.showLoading({
      title: '请稍后',
    })
    var _this = this
    api.removeActivity(
      this.data.currentGroup.uid,
      uid,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          _this.fetchData()
          app.globalData.groupedit_fetchData()
          app.globalData.index_fetchData()
          wx.showToast({
            title: '删除成功',
            showCancel: false
          })
        } else {
          api.showError(status)
        }
      }
    )
  },
  /**
   * Helper函数 - 切换单双周模式
   */
  switchWeekMode(mode) {
    switch (mode) {
      case 0: // 全部
        for (var i = 0; i < 25; i++) {
          var dict = 'weekSelected[' + i + ']'
          this.setData({ [dict]: true })
        }
        break
      case 1: // 单周
        for (var i = 1; i <= 25; i++) {
          var dict = 'weekSelected[' + (i - 1) + ']'
          this.setData({ [dict]: (i % 2) })
        }
        break
      case 2: // 双周
        for (var i = 1; i <= 25; i++) {
          var dict = 'weekSelected[' + (i-1) + ']'
          this.setData({ [dict]: (i % 2 == 0) })
        }
        break
    }
  },
  /**
   * Helper函数 - 确定当前所处的单双周模式
   * @param weeks null 使用weekSelected作为数据源
   */
  resolveWeekMode(weeks) {
    var odd = false, even = false
    if(weeks) {
      for (var i = 0; i < weeks.length; i++) {
        if (weeks[i] % 2)
          odd = true
        else
          even = true
      }
    } else {
      for (var i = 1; i <= 25; i++) {
        if (this.data.weekSelected[i-1]) {
          if (i % 2)
            odd = true
          else
            even = true
        }
      }
    }
    this.setData({ weekModeCur: even && odd ? 0 : (odd ? 1 : 2) })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.fetchData()
    wx.stopPullDownRefresh()
  },

  /**
   * 单击 退出该群
   */
  onQuitGroup: function () {
    var _this = this
    wx.showModal({
      title: '退出群组',
      content: '确定退出当前群组：“' + this.data.currentGroup.name + '”？',
      success(res) {
        if (res.confirm) {
          _this.quitGroup(_this.data.currentGroup.uid)
        }
      }
    })
  },
  /**
   * 单击 删除该群
   */
  onRemoveGroup: function () {
    var _this = this
    wx.showModal({
      title: '删除群组',
      content: '确定删除群组：“' + this.data.currentGroup.name + '”？该操作将同时删除群组内的所有活动。',
      success(res) {
        if (res.confirm) {
          _this.removeGroup(_this.data.currentGroup.uid)
        }
      }
    })
  },
  /**
   * 单击 成员列表中的“删除”按钮
   */
  onRemoveMember: function(e) {
    var user = e.currentTarget.dataset.cur
    var _this = this
    wx.showModal({
      title: '删除成员',
      content: '确定删除群成员：“' + user.realName + '”？',
      success(res) {
        if (res.confirm) {
          _this.removeMember(_this.data.currentGroup.uid, user.openId)
        }
      }
    })
  },

  /**
   * （修改）群名称输入框内容改变
   */
  bindGroupNameInput(e) {
    this.setData({ groupName: e.detail.value.trim() })
  },
  bindGroupDescInput(e) {
    this.setData({ groupDesc: e.detail.value })
  },

  /**
   * （创建）活动名称输入框内容改变
   */
  bindActivityNameInput(e) {
    this.setData({ activityName: e.detail.value.trim() })
  },
  bindActivityTimeChange(e) {
    this.setData({
      activityTime: e.detail.value
    })
  },
  bindActivityDescInput(e) {
    this.setData({ activityDesc: e.detail.value })
  },
  bindActivityWhereInput(e) {
    this.setData({ activityWhere: e.detail.value })
  },
  bindActivityHostInput(e) {
    this.setData({ activityHost: e.detail.value })
  },

  /**
   * 单击 保存
   */
  onSaveInfo() {
    if (this.data.groupEditMode) {
      var err = null
      if (this.data.groupName.length == 0)
        err = '群名称不能为空'
      else if (this.data.groupDesc > 100)
        err = '群描述不能超过100字'
      if (err != null) {
        wx.showModal({
          title: '请完善信息',
          content: err,
          showCancel: false
        })
        return
      }
      wx.showLoading({
        title: '请稍后',
      })
      var _this = this
      api.updateGroupInfo(
        this.data.currentGroup.uid,
        this.data.groupName,
        this.data.groupDesc,
        app.globalData.token,

        function (status, data) {
          wx.hideLoading()
          if (status.code == 0) {
            _this.setData({ // 同步数据
              'currentGroup.name': _this.data.groupName,
              'currentGroup.desc': _this.data.groupDesc
            })
            app.globalData.groupedit_fetchData()
            app.globalData.index_fetchData()
            wx.showToast({
              title: '修改成功',
              showCancel: false
            })
          } else {
            api.showError(status)
            this.setData({
              groupName: app.globalData.groupedit_currentGroup.name,
              groupDesc: app.globalData.groupedit_currentGroup.desc,
            })
          }
        })
    }
    this.setData({ groupEditMode: !this.data.groupEditMode })
  },
  /**
   * 单击 关闭
   */
  onCloseInfoEdit() {
    this.setData({ groupEditMode: false })
  },
  /**
   * 滑动 转换
   */
  onDaySelectorTap(e) {
    this.setData({
      daySelectorCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
    this.fetchActivityData(this.data.daySelectorCur + 1)
  },
  /**
   * 单击 添加（活动）按钮
   */
  onCreateActivity() {
    this.onCloseInfoEdit()
    this.switchWeekMode(0)
    this.setData({ // 复位表达的所有数据
      acitivityEditMode: false,
      showCreateActivity: true,
      currentActivity: null,
      activityName: '测试活动',
      activityTime: '12:00',
      activityDesc: '描述',
      activityWhere: '明向',
      activityHost: 'AA',
      weekModeCur: 0,
    })
  },
  contains(list, item) {
    var i = list.length;
    while(i--)
      if (list[i] == item) return true
    return false
  },
  timestr(hour, minute) {
    var H = (hour < 10) ? '0' + hour : hour
    var S = (minute < 10) ? '0' + minute : minute
    return H + ':' + S
  },
  /**
   * 单击修改（群组）按钮
   */
  onEditActivityTap(e) {
    var group = e.currentTarget.dataset.cur
    this.onCloseInfoEdit()
    this.setData({ // 从当前活动恢复表单的所有数据
      acitivityEditMode: true,
      currentActivity: group,
      showCreateActivity: true,
      activityName: group.name,
      activityTime: this.timestr(group.startHour, group.startMinute),
      activityDesc: group.desc,
      activityWhere: group.where,
      activityHost: group.host,
      weekModeCur: 0,
    })
    this.resolveWeekMode(group.weeks)
    // 恢复周选择器数据
    for (var i = 0; i < 25; i++) {
      var sel = this.contains(group.weeks, i+1)
      var dict = 'weekSelected[' + i + ']'
      this.setData({ [dict]: sel })
    }
  },
  /**
   * 关闭 添加活动对话框
   */
  onHideCreateActivity() {
    this.setData({
      showCreateActivity: false,
    })
  },
  /**
   * 改变起始时间
   */
  onActivityTimeChange(e) {
    this.setData({ activityTime: e.detail.value })
  },
  /**
   * 在周数选择器上单击的事件
   */
  onWeekTap(e) {
    var weekId = e.currentTarget.dataset.cur;
    var dict = 'weekSelected[' + weekId + ']'
    this.setData({ [dict]: !(this.data.weekSelected[weekId]) })
    this.resolveWeekMode(null)
  },
  /**
   * 改变单双周模式
   */
  onSwitchWeekMode(e) {
    var mode = e.currentTarget.dataset.mode
    this.switchWeekMode(mode)
    this.setData({ weekModeCur: mode })
  },
  /**
   * 单击创建(修改)群组按钮
   */
  onUpdateGroup() {
    wx.showLoading({
      title: '请稍后',
    })
    var timeHS = this.data.activityTime.split(':')
    var weeks = []
    for(var i=0; i < 25; i++) {
      if (this.data.weekSelected[i])
        weeks.push(i+1)
    }
    var _this = this
    api.createActivity(
      this.data.currentGroup.uid,
      this.data.acitivityEditMode,
      this.data.acitivityEditMode ? this.data.currentActivity.uid : null,
      this.data.activityName,
      this.data.activityWhere,
      this.data.activityHost,
      timeHS[0], timeHS[1],
      this.data.daySelectorCur+1,
      weeks,
      this.data.activityDesc,
      app.globalData.token,

      function (status, data) {
        wx.hideLoading()
        _this.onHideCreateActivity()
        if (status.code == 0) {
          _this.fetchData()
          app.globalData.groupedit_fetchData()
          app.globalData.index_fetchData()
        } else {
          api.showError(status)
        }
      })
  },
  /**
   * 单击 删除（活动）按钮
   */
  onRemoveActivity(e) {
    var activity = e.currentTarget.dataset.cur
    var _this = this
    wx.showModal({
      title: '删除活动',
      content: '确定删除活动：“' + activity.name + '”？',
      success(res) {
        if (res.confirm) {
          _this.removeActivity(activity.uid)
        }
      }
    })
  }
})
