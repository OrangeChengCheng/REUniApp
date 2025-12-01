/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-12-01 16:44:27
 */
import config from './config'
import reApi from './reApi'
import uniApi from './uniApi'
import tool from './tool'
import serviceApi from './serviceApi'
import { initRsaPublicKey, rsaEncrypt } from './rsa/rsa'


export default {
    install() {
        if (!uni || typeof uni !== 'object') {
            return;
        }
        uni.$service = {
            commonTimeout: config.getTimeout(),
            getServerWhiteList: config.getServerWhiteList,
            updateServerWhiteList: config.updateServerWhiteList,
            getSharedUrlInfo: serviceApi.getSharedUrlInfo,
        };
        uni.$re = {
            unipluginLog: reApi.unipluginLog,
            realEngineRender: reApi.realEngineRender,
            registerAppMsg: reApi.registerAppMsg,
            sendMsgUniToApp: reApi.sendMsgUniToApp,
        };
        uni.$tool = {
            update_data: tool.update_data,
            del_data: tool.del_data,
            getAppVersion: tool.getAppVersion,
            initializeData: tool.initializeData,
            url_base: tool.url_base,
            url_handle: tool.url_handle,
            time_To_Date: tool.time_To_Date,
            time_compare: tool.time_compare,
            time_format: tool.time_format,
            cam_defauleDataSet: tool.cam_defauleDataSet,
        };
        uni.$rsa = {
            initRsaPublicKey: initRsaPublicKey,
            rsaEncrypt: rsaEncrypt,
        };
        uni.scan_code = uniApi.scan_code;
        uni.show_loading = uniApi.show_loading;
        uni.hide_loading = uniApi.hide_loading;
    }
}