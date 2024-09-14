import config from './config'
import reApi from './reApi'


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
        };
    }
}