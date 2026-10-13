/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2026-10-09 15:09:47
 */
import config from './config'
import reApi from './reApi'
import uniApi from './uniApi'
import tool from './tool'
import dataTool from './dataTool'
import entityTool from './entityTool'
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
            getSharedInfo: serviceApi.getSharedInfo,
        };
        uni.$re = {
            unipluginLog: reApi.unipluginLog,
            realEngineRender: reApi.realEngineRender,
            registerAppMsg: reApi.registerAppMsg,
            sendMsgUniToApp: reApi.sendMsgUniToApp,
            showShareRes: reApi.showShareRes,
            entitySel: reApi.entitySel,
        };
        uni.$tool = {
            update_data: tool.update_data,
            del_data: tool.del_data,
            getAppVersion: tool.getAppVersion,
            initializeData: tool.initializeData,
            url_base: tool.url_base,
            url_handle: tool.url_handle,
            time_To_IOSDate: tool.time_To_IOSDate,
            time_compare: tool.time_compare,
            time_format: tool.time_format,
            generateUUID: tool.generateUUID,
            utf8ByteLength: tool.utf8ByteLength,
            splitStringByByteLength: tool.splitStringByByteLength,
            formatByte: tool.formatByte,
        };
        uni.$dataTool = {
            cam_defauleDataSet: dataTool.cam_defauleDataSet,
            card_getProjName: dataTool.card_getProjName,
            card_getSceneData: dataTool.card_getSceneData,
            card_getBimData: dataTool.card_getBimData,
            card_getCadData: dataTool.card_getCadData,
        };
        uni.$entityTool = {
            getEntitySetNodes: entityTool.getEntitySetNodes,
            getEntityNodes: entityTool.getEntityNodes,
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