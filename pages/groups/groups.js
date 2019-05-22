const app = getApp()
Page({
  data: {
    showSearchResults: false,
    groupName: '测试群组',
    groupDesc: '2',
    nearbyGroups: null,
    lenNearbyGroups: 0,
    attendedGroups: null,
    lenAttendedGroups: 0,
    createdGroups: null,
    lenCreatedGroups: 0,
    searchResults: null,
    lenSearchResults: 0,
    maxlenNearbyGroups: 10, // “附近群组”最多显示的数据条数
    searchContent: ''
  },
  onLoad: function (opt) {
    this.fetchData()
  },
  /**
   * 从服务器拉取数据
   */
  fetchData() {
    this.setData({ loading: true })
    var api = require('../../service/autosig-apis')
    var _this = this
    // 获取附近的群组
    api.getNearbyGroups(
      app.globalData.token,
      _this.data.maxlenNearbyGroups,
      function (status, data) {
        if (status.code == 0) {
          _this.setData({
            lenNearbyGroups: data.size,
            nearbyGroups: data.groups
          })
        } else {
          api.showError(status)
        }
      }
    )
    // 获取创建的群组
    api.getCreatedGroups(
      app.globalData.token,
      function (status, data) {
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
  onAddGroup: function() {
    var err = null
    if (this.data.groupName.length == 0)
      err = '群名称不能为空'
    else if(this.data.groupDesc > 100)
      err = '群描述不能超过100字'
    if (err != null) {
      wx.showModal({
        title: '请完善信息',
        content: err,
        showCancel: false
      })
      return
    }
    var api = require('../../service/autosig-apis')
    var _this = this
    api.createGroup(
      app.globalData.token,
      this.data.groupName,
      this.data.groupDesc,

      function (status, data) {
        if (status.code == 0) {
          _this.fetchData()
          wx.showToast({
            title: '成功创建',
          })
        } else {
          api.showError(status)
        }
      })
  },
  bindGroupNameInput(e) {
    this.setData({ groupName: e.detail.value.trim() })
  },
  bindGroupDescInput(e) {
    this.setData({ groupDesc: e.detail.value })
  },
  onSearch() {
    if (this.data.searchContent.length == 0) {
      wx.showModal({
        title: '请输入关键字',
        showCancel: false
      })
      return
    }
    wx.showLoading({
      title: '加载中',
    })
    this.setData({ lenSearchResults: 0 })
    var api = require('../../service/autosig-apis')
    var _this = this
    api.searchGroups(
      _this.data.searchContent,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          _this.setData({
            lenSearchResults: data.size,
            searchResults: data.groups
          })
          if (data.size == 0) {
            wx.showModal({
              title: '未找到相关信息',
              showCancel: false
            })
          }
        } else {
          api.showError(status)
        }
      }
    )
  },
  bindSearchInput(e) {
    this.setData({ searchContent: e.detail.value.trim() })
  }
})
