const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,

  /**
 * 将Unix格式的时间戳转换为ascii码
 */
  timestamp2asc: function (timestamp) {
    var now = new Date();
    now.setTime(timestamp)
    var y = now.getFullYear()
  　var m = now.getMonth() + 1
    var d = now.getDate()
    var h = now.getHours()
    var min = now.getMinutes()
    var s = now.getSeconds()
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + ' ' +
      (h < 10 ? "0" + h : h) + ':' + (min < 10 ? "0" + min : min) + ':' + (s < 10 ? "0" + s : s);
  },

  /**
   * 格式化当前时间 h:m:s
   */
  currentTime: function () {
    var now = new Date();
    var h = now.getHours()
    var min = now.getMinutes()
    var s = now.getSeconds()
    return (h < 10 ? "0" + h : h) + ':' + (min < 10 ? "0" + min : min) + ':' + (s < 10 ? "0" + s : s);
  },

  currentTimeHM: function () {
    var now = new Date();
    var h = now.getHours()
    var min = now.getMinutes()
    var s = now.getSeconds()
    return (h < 10 ? "0" + h : h) + ':' + (min < 10 ? "0" + min : min);
  },

  /**
   * 比较时间大小
   * @param src 二维数组 [hour, minute]
   * @param dst 二维数组 [hour, minute]
   */
  compareTime: function(src, dst) {
    for(var i=0; i < 2; i++) {
      var diff = src[i] - dst[i]
      if (diff)
        return diff
    }
    return 0;
  },

  gotoPage: function (path, hideLoading) {
    if (hideLoading && hideLoading == true) {
      wx.navigateTo({ url: path })
    } else {
      wx.showLoading({
        title: '请稍后',
      })
      wx.navigateTo({
        url: path,
        complete: function () {
          wx.hideLoading()
        }
      })
    }
  }
}
