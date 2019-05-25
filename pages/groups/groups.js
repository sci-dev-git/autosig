const app = getApp()
Page({
  data: {
    tabCur: 0,
    showSearchResults: false,
    groupName: '测试群组 2',
    groupDesc: 'TFEEWLIGNJERKGJKBFEWBFWLGVNWWL WENFWLJGKWKVL WKNF KGWG W GWGW EWJKFGRGGNWGWB BER,BGL',
    loading: [true, true, true, true, true], // nearby, attended, created, search, mac
    nearbyGroups: null,
    lenNearbyGroups: 0,
    attendedGroups: null,
    lenAttendedGroups: 0,
    createdGroups: null,
    lenCreatedGroups: 0,
    searchResults: null,
    lenSearchResults: 0,
    maxlenNearbyGroups: 10, // “附近群组”最多显示的数据条数
    searchContent: '',
    currentGroup: null,
    showGroupDetails: false,
    wlanMac: '',
    wlanMacOrigin: ''
  },
  onLoad: function (opt) {
    this.fetchData()
  },
  /**
   * Helper函数 - 从服务器拉取数据
   */
  fetchData() {
    var api = require('../../service/autosig-apis')
    var _this = this
    // 获取附近的群组
    this.setData({'loading[0]': true})
    api.getNearbyGroups(
      app.globalData.token,
      _this.data.maxlenNearbyGroups,
      function (status, data) {
        _this.setData({ 'loading[0]': false })
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
    // 获取加入的群组
    this.setData({ 'loading[1]': true })
    api.getAttendedGroups(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[1]': false })
        if (status.code == 0) {
          _this.setData({
            lenAttendedGroups: data.size,
            attendedGroups: data.groups
          })
        } else {
          api.showError(status)
        }
      }
    )
    // 获取创建的群组
    this.setData({ 'loading[2]': true })
    api.getCreatedGroups(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[2]': false })
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
    // 获取WLAN MAC地址
    this.setData({ 'loading[4]': true })
    api.getWlanMAC(
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[4]': false })
        if (status.code == 0) {
          _this.setData({
            wlanMac: data.wlan_mac,
            wlanMacOrigin: data.wlan_mac
          })
        } else {
          api.showError(status)
        }
      }
    )
  },
  /**
   * Helper函数- 加入群组
   * @param uid 目标群组的UID.
   */
  joinGroup: function(uid) {
    wx.showLoading({
      title: '请稍后',
    })
    var api = require('../../service/autosig-apis')
    var _this = this
    api.attendGroup(
      uid,
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
    app.globalData.index_fetchData()
  },
  /**
   * 切换 标签栏
   */
  onTabSwitch: function(e) {
    this.setData({tabCur: e.currentTarget.dataset.id})
  },
  /**
   * 单击 创建群组
   */
  onCreateGroup: function() {
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
    wx.showLoading({
      title: '请稍后',
    })
    var api = require('../../service/autosig-apis')
    var _this = this
    api.createGroup(
      app.globalData.token,
      this.data.groupName,
      this.data.groupDesc,

      function (status, data) {
        wx.hideLoading()
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
  /**
   * （新建）群名称输入框内容改变
   */
  bindGroupNameInput(e) {
    this.setData({ groupName: e.detail.value.trim() })
  },
  bindGroupDescInput(e) {
    this.setData({ groupDesc: e.detail.value })
  },
  /**
   * 单击 搜索按钮
   */
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
    this.setData({'loading[3]': true})
    api.searchGroups(
      _this.data.searchContent,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        _this.setData({ 'loading[3]': false })
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
  /**
   * 搜索输入框内容改变
   */
  bindSearchInput(e) {
    this.setData({ searchContent: e.detail.value.trim() })
    if (this.data.searchContent.length == 0) {
      this.setData({ lenSearchResults: 0 })
      return
    }
    var api = require('../../service/autosig-apis')
    var _this = this
    var targetKeyword = _this.data.searchContent
    this.setData({'loading[3]': true})
    api.searchGroups(
      _this.data.searchContent,
      app.globalData.token,
      function (status, data, keyword) {
        _this.setData({ 'loading[3]': false })
        wx.hideLoading()
        if (status.code == 0 && keyword == targetKeyword) {
          _this.setData({
            lenSearchResults: data.size,
            searchResults: data.groups
          })
        }
      }
    )
  },
  /**
   * 单击 加入（群组）
   */
  onJoinGroup(e) {
    var group = e.currentTarget.dataset.cur
    this.joinGroup(group.uid)
  },
  /**
   * 单击群组列表时显示详细信息
   */
  onShowGroupDetail(e) {
    var group = e.currentTarget.dataset.cur
    this.setData({
      showGroupDetails: true,
      currentGroup: group
    })
  },
  onHideGroupDetails() {
    this.setData({showGroupDetails: false})
  },
  /**
   * Helper函数 - 调出编辑群组对话框
   */
  showGroupEdit(group, manage) {
    app.globalData.groupedit_currentGroup = group
    app.globalData.groupedit_manageGroup = manage
    app.globalData.groupedit_fetchData = this.fetchData
    wx.navigateTo({
      url: './groupedit/groupedit',
    })
  },
  /**
   * 在“加入的群组”列表中单击
   */
  onOpenAttendedGroupEdit(e) {
    var group = e.currentTarget.dataset.cur
    this.showGroupEdit(group, false)
  },
  /**
   * 在“创建的群组”列表中单击
   */
  onOpenCreatedGroupEdit(e) {
    var group = e.currentTarget.dataset.cur
    this.showGroupEdit(group, true)
  },
  /**
   * 单击 帮助按钮
   */
  onHelpTab() {
  },
  bindWlanMacInput(e) {
    this.setData({ wlanMac: e.detail.value })
  },
  /**
   * 单击 保存（WLAN MAC）设置按钮
   */
  onSaveWlanMac() {
    var err = null
    if (this.data.wlanMac.length == 0) {
      err = '请输入MAC地址'
    }
    // 校验MAC地址格式
    var inv_mac = false
    if (this.data.wlanMac.length != 17)
      inv_mac = true
    var macs = this.data.wlanMac.split(':')
    if (macs.length != 6) {
      inv_mac = true
    }
    var i = macs.length
    while(i--) {
      if (macs[i].length != 2) {
        inv_mac = true
      }
    }
    if (inv_mac) {
      err = '请输入正确的MAC地址。实例ab:ab:ab:ab:ab:ab'
    }
    if (err) {
      wx.showModal({
        title: '完善信息',
        content: err,
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
    api.updateWlanMAC(
      _this.data.wlanMac,
      app.globalData.token,
      function (status, data) {
        wx.hideLoading()
        if (status.code == 0) {
          _this.setData({ wlanMacOrigin: _this.data.wlanMac }) //同步远程数据
          wx.showToast({
            title: '成功设置',
          })
        } else {
          api.showError(status)
        }
      }
    )
  }
})
