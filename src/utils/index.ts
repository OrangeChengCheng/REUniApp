/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2024-09-23 10:58:22
 */
import config from './config'
import reApi from './reApi'
import uniApi from './uniApi'


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
            serverBaseUrl: config.serverBaseUrl,
            serverUrl: config.serverUrl,
            imageBaseUrl: config.imageBaseUrl,
            exampleUrl: config.exampleUrl,
            downloadBaseUrl: config.downloadBaseUrl,
            commonTimeout: config.commonTimeout,
        };
        uni.$re = {
            unipluginLog: reApi.unipluginLog,
            realEngineRender: reApi.realEngineRender,
        };
        uni.scan_code = uniApi.scan_code;
    }
}