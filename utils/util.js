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
