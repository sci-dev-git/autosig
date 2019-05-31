// pages/summary/summary.js
const app = getApp()
const api = require('../../service/autosig-apis')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    colorArrays: ["#85B8CF", "#90C652", "#D8AA5A", "#FC9F9D", "#0A9A84", "#61BC69", "#12AEF3", "#E29AAD"],
    wlist: [],
    weeks: [],
    sections: [],
    currentWeekNo: 1,
    sectionThresh: 3,
    loading: [true], // weekNo
    lenTasks: 0,
    tasks: null
  },


  /**
   * Helper函数 - 从服务器拉取数据
   */
  fetchData(weekNo) {
    var _this = this
    // 获取所有活动
    this.setData({ 'loading[0]': true })
    api.getAllTasks(
      weekNo,
      app.globalData.token,
      function (status, data) {
        _this.setData({ 'loading[0]': false })
        if (status.code == 0) {
          // 预处理 - 按星期分类
          var wlist = []
          var weekList = []
          for(var i=0; i < 7; i++)
            weekList.push([])
          for(var i=0; i < data.tasks.length; i++) {
            weekList[data.tasks[i].activity.day-1].push(data.tasks[i])
          }
          // 构造课表
          var maxSections = 0
          for (var dayWeek = 0; dayWeek < 7; dayWeek++) {
            var minHour = 24
            var offset = 0
            var used = []
            for(var j=0; j < weekList[dayWeek].length; j++) {
              var task = weekList[dayWeek][j]
              var activity = task.activity
              var captext = activity.name + ';' + (activity.startHour < 10 ? '0' + activity.startHour : activity.startHour) + ':'
                + (activity.startMinute < 10 ? '0' + activity.startMinute : activity.startMinute) + ';' + activity.where
              if (activity.startHour < minHour)
                minHour = activity.startHour
              var len = 2
              // 处理时间冲突
              var timeidx = (activity.startHour - minHour) * len
              var curNo = offset + timeidx + 1
              if (used.indexOf(curNo) == -1) {
                used.push(curNo)
              } else {
                offset += len
                curNo += len
              }
              if (curNo > maxSections)
                maxSections = curNo
              wlist.push({
                "dayWeek": dayWeek+1,
                "no": curNo,
                "len": len,
                "caption": captext
              })
            }
          }
          var sections = []
          maxSections += len/2
          for(var i=0; i<maxSections; i++)
            sections.push(i+1)
          _this.setData({
            currentWeekNo: data.weekNo,
            lenTasks: data.size,
            tasks: data.tasks,
            sections: sections,
            sectionThresh: Math.floor(maxSections / 2)-1,
            wlist: wlist
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
    var weeks = []
    for(var i=0; i<25; i++)
      weeks.push(i+1)
    this.setData({ weeks: weeks })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.fetchData(-1)
  },

  /**
   * 选择周数
   */
  onPickerChange(e) {
    console.log(e.detail.value)
    this.setData({ currentWeekNo: parseInt(e.detail.value)+1 })
    this.fetchData(this.data.currentWeekNo)
  }
})