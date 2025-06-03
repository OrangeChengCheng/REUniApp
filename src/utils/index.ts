/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-06-03 12:37:02
 */
import config from './config'
import reApi from './reApi'
import uniApi from './uniApi'
import tool from './tool'


function toast(title: string) {
    console.log("---------------------");
    console.log(title);
    console.log("---------------------");

}



export default {
    install() {
        if (!uni || typeof uni !== 'object') {
            return;
        }
        uni.$u = {
            toast,
        };
        uni.$window = {
            serverUrl: config.getServerUrl(),
            downloadUrl: config.getDownloadUrl(),
            commonTimeout: config.getTimeout(),
        };
        uni.$re = {
            unipluginLog: reApi.unipluginLog,
            realEngineRender: reApi.realEngineRender,
            reAppToUniMessageHandler: reApi.reAppToUniMessageHandler,
            reUniPostData: reApi.reUniPostData,
        };
        uni.$tool = {
            url_handle: tool.url_handle,
            time_compare: tool.time_compare,
            cam_defauleDataSet: tool.cam_defauleDataSet,
        };
        uni.scan_code = uniApi.scan_code;
        uni.show_loading = uniApi.show_loading;
        uni.hide_loading = uniApi.hide_loading;
        uni.update_serverUrl = config.updateServerUrl;
    }
}