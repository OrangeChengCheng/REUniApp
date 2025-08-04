/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-07-30 17:15:44
 */
import config from './config'
import reApi from './reApi'
import uniApi from './uniApi'
import tool from './tool'



export default {
    install() {
        if (!uni || typeof uni !== 'object') {
            return;
        }
        uni.$server = {
            commonTimeout: config.getTimeout(),
            getCurDownloadUrl: config.getCurDownloadUrl,
            getCurBaseUrl: config.getCurBaseUrl,
            updateCurBaseUrl: config.updateCurBaseUrl,
            getCurSource: config.getCurSource,
            getCurSourcePath: config.getCurSourcePath,
            updateCurSource: config.updateCurSource,
            getCurToken: config.getCurToken,
            updateCurToken: config.updateCurToken,
            getServerWhiteList: config.getServerWhiteList,
            updateServerWhiteList: config.updateServerWhiteList,
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
            url_handle: tool.url_handle,
            time_compare: tool.time_compare,
            cam_defauleDataSet: tool.cam_defauleDataSet,
        };
        uni.scan_code = uniApi.scan_code;
        uni.show_loading = uniApi.show_loading;
        uni.hide_loading = uniApi.hide_loading;
    }
}