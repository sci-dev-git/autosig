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
    createdGroups: null,
    lenCreatedGroups: 0,
    loading: [false, false]
  },

  /**
   * Helper函数 - 从服务器拉取数据
   */
  fetchData() {
    var _this = this
    // 获取当前消息
    this.setData({ 'loading[0]': true })
    api.getMsgs(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[0]': false })
        if (status.code == 0) {
          _this.setData({
            lenBroadcasts: data.size,
            broadcasts: data.msgs
          })
        } else {
          api.showError(status)
        }
      }
    )
    // 获取创建的群组
    this.setData({ 'loading[1]': true })
    api.getCreatedGroups(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[1]': false })
        if (status.code == 0) {
          _this.setData({
            lenCreatedGroups: data.size,
            createdGroups: data.groups
          })
        } else {
          api.showError(status)
        }
      }
    )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchData()
  },

  /**
   * 切换 标签栏
   */
  onTabSwitch: function (e) {
    this.setData({ tabCur: e.currentTarget.dataset.id })
  },


})