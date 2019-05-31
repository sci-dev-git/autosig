const gis = require('../../service/gis-university')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: [true],
    centerX: 23.10229,
    centerY: 113.3245211,
    controls: [{
      id: 1,
      iconPath: '/assets/location-control.png',
      position: {
        left: 10,
        top: 10,
        width: 40,
        height: 40
      },
      clickable: true
    }],
    markers: []
  },

  /**
   * Helper函数 - 获取地理测绘信息
   */
  getUniversityMarkers() {
    let markers = [];
    for (let item of gis) {
      let marker = this.createMarker(item);
      markers.push(marker)
    }
    return markers;
  },
  createMarker(point) {
    let latitude = point.latitude;
    let longitude = point.longitude;
    let marker = {
      iconPath: "/assets/location.png",
      id: point.id || 0,
      name: point.name,
      latitude: latitude,
      longitude: longitude,
      width: 25,
      height: 48,
      label: {
        content: point.name
      }
    };
    return marker;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      centerX: gis[0].latitude,
      centerY: gis[0].longitude,
      markers: this.getUniversityMarkers()
    })
  },

  onMapUpdated: function (e) {
    this.setData({'loading[0]': false})
  },

  /**、
   * 单击 地图控件
   */
  onControltap(e) {
    switch (e.controlId) {
      case 1:
        let that = this
        wx.getLocation({
          type: 'gcj02',
          success: (res) => {
            this.setData({
              centerX: res.latitude,
              centerY: res.longitude
            })
          }
        })
        break;
    }
  }
})
