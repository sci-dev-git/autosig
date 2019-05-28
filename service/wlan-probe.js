/**@file
 * WLAN探针实现
 */
/*
 *  Autosign (独步校园) (AP-scanning-based Attendance Signature System)
 *  Copyright (C) 2019, AutoSig team. <diyer175@hotmail.com>
 *
 *  This project is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public License(GPL)
 *  as published by the Free Software Foundation; either version 2.1
 *  of the License, or (at your option) any later version.
 *
 *  This project is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Lesser General Public License for more details.
 */

module.exports.probeWLAN = function(callback, failcallback) {
  if (wx.canIUse('startWifi') && wx.canIUse('getWifiList')) {
    // Register the callback function for onGetWifiList
    wx.onGetWifiList(function (res) {
      console.error('onGetWifiList')
      callback(res.wifiList)
    })
    // Switch on WIFI and scan all the APs
    wx.startWifi({
      success(e) {
        wx.getWifiList({
          fail(e) {
            failcallback(e)
            console.error('Failed to get Wi-Fi list: ' + e.errMsg)
          }
        })
      },
      fail(e) {
        failcallback(e)
        console.error('Failed to start Wi-Fi:' + e.errMsg)
      }
    })
  } else {
    // Report compatibility issues
    failcallback(e)
    console.error('Unsupported by the current version!')
  }
}