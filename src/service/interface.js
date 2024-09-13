/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2024-08-07 17:35:30
 */
import request from '@/service/request'
import loginRequest from '@/service/loginRequest'




// MOD-- 目录树相关
// 获取目录树
export function getCatalog(data) {
    return request.post('/Doc/DocCatalog/list', data);
}

// MOD-- DocSearch 查询相关
// 查询文档
export function docSearch(data) {
    return request.post('/docSearch/search', data);
}
// 添加已读查询结果
export function docSearchRead(docSearchId) {
    return request.post(`/docSearch/read/{${docSearchId}}`);
}


// MOD-- ApiDoc 文档相关
// 根据数据目录dcId获取接口文档
export function getApiInfoByDocId(data) {
    return request.get('/ApiDoc/getbydcid', data);
}


// MOD-- Doc 文档相关
// 根据dcId获取文档
export function getDocumentByDcId(data) {
    return request.get('/Doc/DocItem/getbydcid', data);
}

// 获取置顶的问题
export function getDocumentFaqTopList() {
    return request.get('/Doc/DocItem/list/topqa');
}

// 根据dcid获取文档列表
export function getDocumentListByDcId(data) {
    return request.get('/Doc/DocItem/list/bydcid', data);
}

// 按分组获取置顶的文档
export function getDocumentTopdocList(data) {
    return request.post('/Doc/DocItem/list/topdoc/bygroup', data);
}

// 获取升级日志相关置顶内容
export function getDocumentUpgradeTopList() {
    return request.get('/Doc/DocItem/list/topUpgradeDoc');
}

// MOD-- Demo 相关
// 根据示例dcId获取示例Demo
export function getDemoByDocId(data) {
    return request.get('/Demo/getbydcid', data);
}

// 获取置顶的Demo数据列表
export function getDemoTopList(data) {
    return request.post('/Demo/list/topdemos', data);
}

// MOD-- Message 相关
// 获取消息数量
export function getMessageNum(data) {
    return request.get('/message/GetMessageNum', data);
}
// 获取消息列表
export function getMessageList(data) {
    return request.get('/message/GetMessageList', data);
}
// 确认已读消息
export function receivedMessage(messageId) {
    return request.get(`/message/ReceivedMessage/{${messageId}}`);
}
// 确认已读多条消息
export function receivedMessageList(data) {
    return request.post('/message/ReceivedMessages', data);
}
// 删除消息
export function delMessages(data) {
    return request.post('/message/DeleteMessages', data);
}
// 删除所有消息
export function delAllMessages() {
    return request.post('/message/DeleteAllMessages');
}


// MOD-- 功能介绍 相关
// 查询功能介绍列表
export function getEngineFunctionList() {
    return request.post('/engineFunction/list');
}
// 查询功能介绍详细信息
export function getEngineFunctionDetail(funcId) {
    return request.post(`/engineFunction/detail/{${funcId}}`);
}


// MOD-- 视频 相关
// 查询产品视频
export function productVideo() {
    return request.get('/productVideo');
}

// MOD-- 照片墙 相关
// 查询照片墙列表
export function photoWallList() {
    return request.post('/photoWall/list');
}

// MOD-- 联系 相关
// 添加联系我们消息
export function contactUs(data) {
    return request.post('/contactUs', data);
}

// MOD-- 账号 相关
// 登录
export function loginService(data) {
    return loginRequest.post('/account/login', data);
}

// 手机号登录
export function phoneLoginService(data) {
    return loginRequest.post('/account/phoneLogin', data);
}

// 发送手机验证码
export function sendValidateNoService(data, headers) {
    return loginRequest.post('/account/sendPhoneValidateNo', data, headers);
}

// 退出
export function logoutService(headers) {
    return loginRequest.get('/account/logout', headers);
}

// 用户中心获取个人信息
export function getUserInfo() {
    return loginRequest.get('/user/getUserByCenter');
}

// 刷新token
export function refreshToken(data) {
    return loginRequest.post('/account/refreshToken', data);
}










