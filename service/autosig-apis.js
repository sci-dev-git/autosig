/**@file
 * 与后端服务连接的胶合逻辑
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

const app = getApp()

const apiHost = "https://autosigs.applinzi.com";
//const apiHost = "http://localhost:5050"; // for debug

function requestAPI(url, callback, opaque) {
  wx.request({
    url: url,
    success: function (res) {
      try {
        var responseObj = res.data;
        if (responseObj == null || responseObj.status == null) {
          throw(false)
        }
        if (responseObj.status.code) { // an error has been occured
          var msg = responseObj.status.msg
          var code = responseObj.status.code
          console.warn('autosig-api: server returns: msg = '+msg+', code = '+code)

          if (responseObj.status.msg == 'E_TOKEN_AUTH')
            app.relogin()
        }
        callback(responseObj.status, responseObj.data, opaque);
      } catch(e) {
        console.warn(e)
        console.warn('autosig-api: server returns invalid data.')
        callback({ "code": -2, "msg": "E_NETWORK" }, null, opaque)
      }
    },
    fail: function (res) {
      callback({ "code": -1, "msg": "E_NETWORK" }, null, opaque);
    }
  });
}

function throwParamCheckError(callback) {
  callback({ "code": -2, "msg": "E_INTERNAL" }, null)
  console.error('autosig-api: null parameetrs given in API calling!')
}

/**
 * 用户注册接口
 * @param openid
 * @param place 学校
 * @param code 证件号
 * @param name 姓名
 * @return 成功 (返回成功调用login的所有数据)
 */
module.exports.reg = function (openid, place, code, name, callback) {
  if (openid == null || place == null || code == null || name == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/reg?openid=${openid}&place=${place}&code=${code}&real_name=${name}`, callback);
}

/**
 * 用户登陆接口
 * @param jscode
 * @return 成功:
 * {
 *   token: 用于内部认证的唯一凭证
 *   openId: 从微信后台换取的用户ID
 *   info: {
 *     realName:
 *     code:
 *     place:
 *     openId:
 *   }
 * }
 * 失败：返回错误代码。
 */
module.exports.login = function (jscode, callback) {
  if (jscode == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/login?wxcode=${jscode}`, callback)
}

/**
 * 创建群组接口
 * @param token 用于内部认证的唯一凭证
 * @param name 群名称
 * @param desc 群描述
 */
module.exports.createGroup = function (token, name, desc, callback) {
  if (token == null || name == null || desc == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/create_group?name=${name}&desc=${desc}&token=${token}`, callback)
}

/**
 * 获取创建的群组接口
 * @param token 用于内部认证的唯一凭证
 * @return
 * {
 *   size: 返回群组的数量
 *   groups: {}
 * }
 */
module.exports.getCreatedGroups = function (token, callback) {
  if (token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/get_created_groups?token=${token}`, callback)
}

/**
 * 获取附近的群组
 * @param token 用于内部认证的唯一凭证
 * @return
 * {
 *   size: 返回群组的数量
 *   groups: {}
 * }
 */
module.exports.getNearbyGroups = function (token, maxlen, callback) {
  if (token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/get_nearby_groups?maxlen=${maxlen}&token=${token}`, callback)
}


/**
 * 获取已加入的群组接口
 * @param token 用于内部认证的唯一凭证
 * @return
 * {
 *   size: 返回群组的数量
 *   groups: {}
 * }
 */
module.exports.getAttendedGroups = function (token, callback) {
  if (token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/get_attended_groups?token=${token}`, callback)
}


/**
 * 搜索群组接口
 * @param keyword 关键字
 * @param token 用于内部认证的唯一凭证
 * @param callback 特殊，其参数为(state, data, keyword)。keyword为开始异步调用时
 *  传入的关键字参数的副本。
 * @return
 * {
 *   size: 返回群组的数量
 *   groups: {}
 * }
 */
module.exports.searchGroups = function (keyword, token, callback) {
  if (token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/search_groups?keyword=${keyword}&token=${token}`, callback, keyword)
}

/**
 * 加群接口
 * @param uid 目标群组的uid
 * @param token 用于内部认证的唯一凭证
 */
module.exports.attendGroup = function (uid, token, callback) {
  if (uid == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/group/attend?uid=${uid}&token=${token}`, callback)
}

/**
 * 退群接口
 * @param uid 目标群组的uid
 * @param token 用于内部认证的唯一凭证
 */
module.exports.quitGroup = function (uid, token, callback) {
  if (uid == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/group/quit?uid=${uid}&token=${token}`, callback)
}

/**
 * 获取群组成员的接口
 * @param uid 目标群组的uid
 */
module.exports.getGroupMembers = function (uid, callback) {
  if (uid == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/group/get_members?uid=${uid}`, callback)
}

/**
 * 删除群组成员的接口
 * @param uid 目标群组的uid
 * @param openid 目标用户的openId
 * @param token 用于内部认证的唯一凭证
 */
module.exports.removeGroupMember = function (uid, openId, token, callback) {
  if (uid == null || openId == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/group/remove_member?uid=${uid}&openid=${openId}&token=${token}`, callback)
}

/**
 * 删除群组的接口
 * @param uid 目标群组的uid
 * @param token 用于内部认证的唯一凭证
 */
module.exports.removeGroup = function (uid, token, callback) {
  if (uid == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/remove_group?uid=${uid}&token=${token}`, callback)
}

/**
 * 更新群组信息的接口
 * @param uid 目标群组的uid
 * @param name 群组名称
 * @param desc 群组描述
 * @param token 用于内部认证的唯一凭证
 */
module.exports.updateGroupInfo = function (uid, name, desc, token, callback) {
  if (uid == null || name == null || desc == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/group/update_info?uid=${uid}&name=${name}&desc=${desc}&token=${token}`, callback)
}

/**
 * 从群组创建活动的接口
 * @param uid 目标群组的uid
 * @param update 是否仅更新数据（不创建）
 * @param activity_uid 目标活动的uid (仅当update-true时有效，否则设为null)
 * @param name 活动的名称
 * @param where 活动地点
 * @param host 活动主讲
 * @param start_hour 起始时间 时
 * @param start_minute 起始时间 分
 * @param day 星期
 * @param weeks 周数列表
 * @param desc 描述
 * @param token 用于内部认证的唯一凭证
 */
module.exports.createActivity = function (
  uid,
  update,
  activity_uid,
  name,
  where,
  host,
  start_hour, start_minute,
  day,
  weeks,
  desc,
  token, callback)
{
  for(var i=0; i < arguments.length; i++) {
    if (i != 2 && arguments[i] == null) {
      throwParamCheckError(callback)
      return
    }
  }
  requestAPI(`${apiHost}/group/create_activity?uid=${uid}&update=${update}&activity_uid=${activity_uid}&name=${name}&where=${where}&host=${host}&start_hour=${start_hour}&start_minute=${start_minute}&day=${day}&weeks=${weeks}&desc=${desc}&token=${token}`, callback)
}

/**
 * 从群组获取所有活动的接口
 * @param uid 目标群组的uid
 * @param day 当前星期
 */
module.exports.getActivities = function (uid, day, callback) {
  if (uid == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/group/get_activities?uid=${uid}&day=${day}`, callback)
}

/**
 * 从群组删除活动的接口
 * @param uid 目标群组的uid
 * @param token 用于内部认证的唯一凭证
 */
module.exports.removeActivity = function (uid, activity_uid, token, callback) {
  if (uid == null || activity_uid == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/group/remove_activity?uid=${uid}&activity_uid=${activity_uid}&token=${token}`, callback)
}

/**
 * 设置用户的WLAN MAC的接口
 * @param mac WLAN MAC地址
 * @param token 用于内部认证的唯一凭证
 */
module.exports.updateWlanMAC = function (mac, token, callback) {
  if (mac == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/update_wlan_mac?mac=${mac}&token=${token}`, callback)
}

/**
 * 获取用户的WLAN MAC的接口
 * @param token 用于内部认证的唯一凭证
 */
module.exports.getWlanMAC = function (token, callback) {
  if (token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/usr/get_wlan_mac?token=${token}`, callback)
}

/**
 * 获取任务列表接口
 * @param token 用于内部认证的唯一凭证
 */
module.exports.getTasks = function (token, callback) {
  if (token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/task/today?token=${token}`, callback)
}

/**
 * 获取所有任务列表接口
 * @param weekno -1表示当前周
 * @param token 用于内部认证的唯一凭证
 */
module.exports.getAllTasks = function (weekno, token, callback) {
  if (weekno == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/task/all_tasks?weekno=${weekno}&token=${token}`, callback)
}

/**
 * 获取缺席者列表的接口
 * @param uid 目标活动的uid
 * @param token 用于内部认证的唯一凭证
 */
module.exports.getAbsentees = function (uid, group_uid, token, callback) {
  if (uid == null || group_uid == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/task/absentees?&uid=${uid}&group_uid=${group_uid}&token=${token}`, callback)
}

/**
 * 设置签到接口
 * @param uid 目标活动的uid
 * @param start true开始签到，false停止签到
 */
module.exports.setSign = function (uid, start, token, callback) {
  if (uid == null || start == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/activity/set_sign?uid=${uid}&start=${start}&token=${token}`, callback)
}

/**
 * 签到接口
 * @param uid 目标活动的uid
 * @param token 用于内部认证的唯一凭证
 * @param wlan_macs 探测到的WLAN MAC地址列表
 */
module.exports.signin = function (uid, token, wlan_macs, callback) {
  if (uid == null || token == null || wlan_macs == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/activity/signin?uid=${uid}&wlan_macs=${wlan_macs}&token=${token}`, callback)
}

/**
 * 获取公告接口
 * @param token 用于内部认证的唯一凭证
 */
module.exports.getMsgs = function (token, callback) {
  if (token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/broadcast/msgs?token=${token}`, callback)
}

/**
 * 发布公告接口
 * @param token 用于内部认证的唯一凭证
 */
module.exports.postMsg = function (uids, title, content, tags, token, callback) {
  if (uids == null || uids.length == 0 || token == null || title == null || content == null || tags == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/broadcast/post?uids=${uids}&title=${title}&content=${content}&tags=${tags}&token=${token}`, callback)
}

/**
 * 删除公告接口
 * @param uid 群组UID
 * @param msg_uid 目标消息的uid.
 * @param token 用于内部认证的唯一凭证
 */
module.exports.removeMsg = function (uid, msg_uid, token, callback) {
  if (uid == null || msg_uid == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/broadcast/remove?uid=${uid}&msg_uid=${msg_uid}&token=${token}`, callback)
}

/**
 * 获取未读公告数量的接口
 * @param token 用于内部认证的唯一凭证
 */
module.exports.getUnreadCount = function (token, callback) {
  if (token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/broadcast/unread?&token=${token}`, callback)
}

/**
 * 标识公告已读的接口
 * @param uids 目标公告的列表
 * @param token 用于内部认证的唯一凭证
 */
module.exports.msgMarkRead = function (uids, token, callback) {
  if (uids == null || token == null) {
    throwParamCheckError(callback)
    return
  }
  requestAPI(`${apiHost}/broadcast/unread_msgs?&token=${token}`, callback)
}


var errDisplayed = false; // 对于多个异步请求同时抛出错误的情况，只反馈最早的错误

/**
 * 通过showToast显示来自服务器的错误消息
 * @param status 回调函数中的错误信息
 */
module.exports.showError = function(status) {
  if (!errDisplayed) {
    errDisplayed = true
    var err
    switch(status.msg) {
      case 'E_FAULT':
        err = '操作失败'; break;
      case 'E_SERVER_FAULT':
        err = '服务正忙'; break;
      case 'E_TOKEN_AUTH':
        err = '验证失败，正在重新登陆'; break;
      case 'E_USER_EXISTING':
        err = '用户已存在'; break;
      case 'E_USER_NON_EXISTING':
        err = '用户不存在'; break;
      case 'E_PERMISSION_DENIED':
        err = '权限不足'; break;
      case 'E_GROUP_EXISTING':
        err = '群组已存在'; break;
      case 'E_GROUP_NON_EXISTING':
        err = '群组不存在'; break;
      case 'E_ACTIVITY_EXISTING':
        err = '活动已存在'; break;
      case 'E_ACTIVITY_NON_EXISTING':
        err = '活动不存在'; break;
      case 'E_TASK_EXISTING':
        err = '任务已存在'; break;
      case 'E_TASK_NON_EXISTING':
        err = '任务不存在'; break;
      case 'E_ASSET_NOT_FOUND':
        err = '资源未找到'; break;
      case 'E_NETWORK':
        err = '连接失败'; break;
      case 'E_INVALID_PARAMETER':
        err = '网络传输错误'; break;
      case 'E_SIGN_IS_ENDED':
        err = '签到已经结束'; break;
      case 'E_SIGN_UNSTARTED':
        err = '签到未开始'; break;
      case 'E_SIGN_POINT_NF':
        err = '离签到点过远'; break;
      case 'E_WLAN_UNCONFIG':
        err = '管理员未设置签到点，请联系管理员处理'; break;
      case 'E_BROADCAST_NOT_FOND':
        err = '公告未找到'; break;
      default:
        err = '操作失败'; break;
    }
    wx.showModal({
      title: '提示',
      content: err,
      showCancel: false,
      complete: function () {
        errDisplayed = false
      }
    })
  }
}
