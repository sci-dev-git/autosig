// pages/groups/groupedit/groupedit.js
const app = getApp()
const api = require('../../../service/autosig-apis')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentGroup: null,
    manageGroup: false,
    lenMembers: 0,
    members: null,
    lenActivities: 0,
    activities: null,
    loading: [false], // memebrs
    groupName: '',
    groupDesc: '',
    activityName: '',
    activityTime: '12:00',
    activityDesc: '',
    activityWhere: '',
    activityHost: '',
    daySelectorCur: 0,
    scrollLeft: 0,
    showCreateActivity: false,
    weekSelected: Array(25),
    weekModeCur: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.switchWeekMode(0)
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
   * Helper函数 - 从服务器拉取数据
   */
  fetchData() {
    this.setData({
      currentGroup: app.globalData.groupedit_currentGroup,
      manageGroup: app.globalData.groupedit_manageGroup,
      groupName: app.globalData.groupedit_currentGroup.name,
      groupDesc: app.globalData.groupedit_currentGroup.desc,
    })
    var _this = this
    this.setData({ 'loading[0]': true })
    api.getGroupMembers(
      this.data.currentGroup.uid,
      function (status, data) {
        _this.setData({ 'loading[0]': false })
        if (status.code == 0) {
          console.log(data.users)
          _this.setData({
            lenMembers: data.size,
            members: data.users
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
          wx.showToast({
            title: '退出成功',
            showCancel: false
          })
          wx.navigateBack()
        } else {
          api.showError(status)
        }
      }
    )
  },
  /**
   * Helper函数 - 删除群成员
   */
  removeMember: function(uid, targetOpenId) {
    wx.showLoading({
      title: '请稍后',
    })
    var _this = this
    api.removeGroupMember(
      uid,
      targetOpenId,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          app.globalData.groupedit_fetchData()
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
          wx.showToast({
            title: '删除成功',
            showCancel: false
          })
          wx.navigateBack()
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
          app.globalData.groupedit_fetchData()
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
  },
  /**
   * 滑动 转换
   */
  onDaySelectorTap(e) {
    this.setData({
      daySelectorCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  /**
   * 单击 添加（活动）
   */
  onCreateActivity() {
    this.setData({ showCreateActivity: true })
  },
  /**
   * 关闭 添加活动对话框
   */
  onHideCreateActivity() {
    this.setData({ showCreateActivity: false })
  },
  /**
   * 在周数选择器上单击的事件
   */
  onWeekTap(e) {
    var weekId = e.currentTarget.dataset.cur;
    var dict = 'weekSelected[' + weekId + ']'
    this.setData({ [dict]: !(this.data.weekSelected[weekId]) })
  },
  /**
   * 改变单双周模式
   */
  onSwitchWeekMode(e) {
    var mode = e.currentTarget.dataset.mode
    this.switchWeekMode(mode)
    this.setData({ weekModeCur: mode })
  }
})
