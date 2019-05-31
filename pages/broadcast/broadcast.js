// pages/broadcast/broadcast.js
const app = getApp()
const api = require('../../service/autosig-apis')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabCur: 0,
    broadcasts: null,
    lenBroadcasts: 0,
    postedBroadcasts: null,
    lenPostedBroadcasts: 0,
    canPostMessage: false,
    createdGroups: null,
    lenCreatedGroups: 0,
    groupSelected: [],
    lenPostedMsgs: 0,
    loading: [false, false],
    msgTitle: '通知 1',
    msgContent: 'qwnfkfeq',
    msgTags: ''
  },

  /**
   * Helper函数 - 从服务器拉取数据
   */
  fetchData() {
    if (!app.globalData.canFetchData)
      return
    var _this = this
    // 获取当前消息
    this.setData({ 'loading[0]': true })
    api.getMsgs(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[0]': false })
        if (status.code == 0) {
          var i=data.msgs_size
          while(i--)
          { data.msgs[i].datestr = app.globalData.util.timestamp2asc(data.msgs[i].msg.date) }
          i = data.posted_msgs_size
          while (i--)
          { data.posted_msgs[i].datestr = app.globalData.util.timestamp2asc(data.posted_msgs[i].msg.date) }
          
          _this.setData({
            broadcasts: data.msgs,
            lenBroadcasts: data.msgs_size,
            postedBroadcasts: data.posted_msgs,
            lenPostedBroadcasts: data.posted_msgs_size
          })
        } else {
          api.showError(status)
        }
      }
    )
    // 获取创建的群组（用于选择发布目标）
    this.setData({ 'loading[1]': true })
    api.getCreatedGroups(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[1]': false })
        if (status.code == 0) {
          var groupSelected = []
          var i = data.size
          while(i--) {
            groupSelected.push(false)
          }
          _this.setData({
            lenCreatedGroups: data.size,
            createdGroups: data.groups,
            groupSelected: groupSelected
          })
        } else {
          api.showError(status)
        }
      }
    )
  },

  /**
   * Helper函数 - 获取当前已选择的群组的数量
   */
  getNumSelectedGroup() {
    var sum = 0
    var i = this.data.lenCreatedGroups
    while(i--) {
      if (this.data.groupSelected[i]) sum += 1
    }
    return sum
  },

  /**
   * Helper函数 - 根据编辑状态更新页面布局
   */
  updateEditor() {
    var selectedGroup = (this.getNumSelectedGroup() != 0)
    var inputMsg = (this.data.msgTitle.length != 0) && (this.data.msgContent.length != 0)
    this.setData({ canPostMessage: selectedGroup && inputMsg })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    this.fetchData()
  },

  /**
   * 切换 标签栏
   */
  onTabSwitch: function (e) {
    this.setData({ tabCur: e.currentTarget.dataset.id })
  },

  /**
   * 单击 群组列表（选择群组）
   */
  onSelectGroup: function(e) {
    var idx = e.currentTarget.dataset.idx
    var group = this.data.createdGroups[idx]
    var target = 'groupSelected[' + idx +']'
    this.setData({ [target]: !this.data.groupSelected[idx] })
    this.updateEditor()
  },

  /**
   * 编辑 公告标单
   */
  bindMsgTitleInput(e) {
    this.setData({ msgTitle: e.detail.value.trim() })
    this.updateEditor()
  },
  bindMsgContentInput(e) {
    this.setData({ msgContent: e.detail.value })
    this.updateEditor()
  },

  pageScrollToBottom: function () {
    wx.createSelectorQuery().select('#broadcast_box').boundingClientRect(function (rect) {
      console.info(rect)
      wx.pageScrollTo({ scrollTop: rect.bottom })
    }).exec()
  },

  /**
   * 单击 发布公告
   */
  onPostMessage() {
    wx.showLoading({
      title: '发布中',
    })
    var uids = []
    var i = this.data.lenCreatedGroups
    while (i--) {
      if (this.data.groupSelected[i])
        uids.push(this.data.createdGroups[i].uid)
    }
    var _this = this
    api.postMsg(
      uids,
      this.data.msgTitle,
      this.data.msgContent,
      this.data.msgTags,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          _this.fetchData()
          _this.setData({ tabCur: 0 }) // 切换到所有公告页面
          _this.pageScrollToBottom()
          wx.showToast({
            title: '发布成功'
          })
        } else {
          api.showError(status)
        }
      }
    )
  },

  /**
   * 单击 删除（公告）
   */
  onRemoveBroadcast(e) {
    var msg = e.currentTarget.dataset.cur.msg
    var uid = msg.uid
    var group_uid = msg.groupUid
    var _this = this
    wx.showModal({
      title: '删除公告',
      content: '确定删除当前公告？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
          })
          api.removeMsg(
            group_uid,
            uid,
            app.globalData.token,
            function (status, data) {
              wx.hideLoading()
              if (status.code == 0) {
                _this.fetchData()
              } else {
                api.showError(status)
              }
          })
        }
      }
    })
  }
})
