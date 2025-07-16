/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-07-10 11:04:53
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
            getCurToken: config.getCurToken,
            updateCurToken: config.updateCurToken,
            getServerWhiteList: config.getServerWhiteList,
            updateServerWhiteList: config.updateServerWhiteList,
            checkWhiteListContain: config.checkWhiteListContain,
        };
        uni.$re = {
            unipluginLog: reApi.unipluginLog,
            realEngineRender: reApi.realEngineRender,
            registerAppMsg: reApi.registerAppMsg,
            sendMsgUniToApp: reApi.sendMsgUniToApp,
        };
        uni.$tool = {
            url_handle: tool.url_handle,
            time_compare: tool.time_compare,
            cam_defauleDataSet: tool.cam_defauleDataSet,
        };
        uni.scan_code = uniApi.scan_code;
        uni.show_loading = uniApi.show_loading;
        uni.hide_loading = uniApi.hide_loading;
    }
}