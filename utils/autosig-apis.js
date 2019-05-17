/*
 *  Autosign (AP-scanning-based Attendance Signature System)
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

const app = getApp()

const apiHost = "https://autosigs.applinzi.com";

module.exports.reg = function (jscode, place, code, name, callback) {
  wx.request({
    url: `${apiHost}/usr/reg?wxcode=${jscode}&place=${place}&code=${code}&real_name=${name}`,
    success: function (res) {
      var responseObj = res.data;
      if (responseObj.status.code)
        callback(responseObj.status, null);
      else
        callback(responseObj.status, responseObj.data);
    },
    fail: function (res) {
      callback({"code":-1,"msg":""}, null);
    }
  });
}
