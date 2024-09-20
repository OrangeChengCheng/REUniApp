<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2024-09-20 16:16:07
-->
<template>
    <base-view :nav_bar_item_back="false" :nav_bar_color="`--color-main-bg`">
        <view class="sup-card-page">
            <view class="input-box">
                <view class="input-card" @click="input_click">输入</view>
                <view class="scan-card" @click="scan_click">扫码</view>
            </view>
        </view>
    </base-view>
    <proj-input-dialog
        ref="ref_projInput_dialog"
        :dialog_shareUrl="scan_shareUrl"
        :dialog_needResource="dialog_input_needRecourse"
        :dialog_ProjInputCallBack="dialog_ProjInputCallBack"></proj-input-dialog>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import ProjInputDialog from '@/components/Dialog/ProjInputDialog.vue';
import { getSceneById, getSingleSceneTreeById, getProjectModel } from '@/service/interface';
import { useCardStore } from '@/stores/card';

const card_store = useCardStore();
const ref_projInput_dialog = ref<InstanceType<typeof ProjInputDialog> | null>(null);
const scan_shareUrl = ref('');
const dialog_input_needRecourse = ref(false);

onMounted(() => {
    card_store.addCard('www.google.com');
});

const input_click = () => {
    dialog_input_needRecourse.value = true;
    ref_projInput_dialog.value.show_dialog();
};

const scan_click = () => {
    if (Object.prototype.hasOwnProperty.call(uni, 'getAppAuthorizeSetting')) {
        const appAuthorizeSetting = uni.getAppAuthorizeSetting();
        if (appAuthorizeSetting.cameraAuthorized && appAuthorizeSetting.cameraAuthorized.length) {
            // 相机权限
            if (appAuthorizeSetting.cameraAuthorized == 'denied') {
                // 用户拒绝了相机的使用权限，需要自行打开
                uni.showToast({ title: '您已拒绝了授权，请前往设置进行打开', icon: 'none' });
            } else if (appAuthorizeSetting.cameraAuthorized == 'not determined') {
                // 用户未授权相机的使用权限
                uniapp_getScanAuthorize();
            } else if (appAuthorizeSetting.cameraAuthorized == 'authorized') {
                // 用户已授权相机的使用权限
                uniapp_scanQRCode();
            }
        }
    }
};

// MARK uni-app 获取相机授权信息
const uniapp_getScanAuthorize = () => {
    if (!Object.prototype.hasOwnProperty.call(uni, 'authorize')) {
        uni.showToast({ title: '授权获取失败', icon: 'none' });
        return;
    }
    // 获取相机授权
    uni.authorize({
        scope: 'scope.camera',
        success() {
            // 用户同意授权
            console.log('相机授权成功');
            uniapp_scanQRCode();
        },
        fail() {
            // 用户拒绝授权
            console.log('相机授权失败');
            uni.showToast({ title: '您拒绝了授权', icon: 'none' });
        },
    });
};

// MARK uni-app 相机扫码
const uniapp_scanQRCode = () => {
    if (!Object.prototype.hasOwnProperty.call(uni, 'scanCode')) {
        uni.showToast({ title: '扫码失败', icon: 'none' });
        return;
    }
    // 扫二维码
    uni.scanCode({
        success: (res) => {
            uni.$re.unipluginLog(JSON.stringify(res.result));
            scan_shareUrl.value = res.result;
            dialog_input_needRecourse.value = false;
            ref_projInput_dialog.value.show_dialog();
        },
        fail: (err) => {
            uni.showToast({ title: err.errMsg, icon: 'none' });
            uni.$re.unipluginLog(JSON.stringify(err));
        },
    });
};

// MARK Dialog 自定义模型查看
const dialog_ProjInputCallBack = (e: any) => {
    console.log(e);
    if (e.shareUrl.length > 0) {
        let shareParams: any = handleUrlData(e.shareUrl);
        showShareUrlRes(shareParams);
    } else if (e.resourcesAddress.length > 0) {
        showResourceAddressRes(e.resourcesAddress);
    }
};

// MARK 处理链接数据
const handleUrlData = (url: string): any => {
    uni.$re.unipluginLog('url = ' + url);

    // 使用字符串截取方式，无法使用URL的方式，uniapp在真机上无法使用URL方式
    let shareType: number = 0; // 判断分享链接类型 0：无 1：模型 2：场景
    if (url.includes('sceneShare/view')) {
        shareType = 2;
    } else if (url.includes('dataSetShare/view')) {
        shareType = 1;
    }
    if (!shareType) return null;
    if (!url.includes('token')) return null; // 分享链接不包含token报错

    let searchType = shareType === 2 ? '#/sceneShare/view' : '#/dataSetShare/view';
    let startIndex = url.indexOf(searchType) + searchType.length; // 找到 searchType 在URL中的位置
    let valueStartIndex = url.indexOf('/', startIndex + 1) + 1; // 计算所需值的起始位置（即第二个"/"之后的位置）
    let valueEndIndex = url.indexOf('/', valueStartIndex); // 计算所需值的结束位置（即第三个"/"之前的位置）
    let _id = url.substring(valueStartIndex, valueEndIndex); // 截取所需的值

    let tokenStartIndex = url.indexOf('token=') + 'token='.length; // 计算token的起始位置（即"token="之后的位置）
    let tokenEndIndex = url.indexOf('&', tokenStartIndex); // 如果URL中有其他查询参数，找到"&"字符的位置，作为token的结束位置
    let _token = tokenEndIndex !== -1 ? url.substring(tokenStartIndex, tokenEndIndex) : url.substring(tokenStartIndex); // 截取并输出token的

    let params = { shareType: shareType, id: _id, token: _token };
    uni.$re.unipluginLog('params = ' + JSON.stringify(params));
    return params;
};

// MARK 查看分享链接资源
const showShareUrlRes = (params: any) => {
    uni.setStorageSync('RE_Token', params.token);
    if (params.shareType === 2) {
        showSceneRes(params.id);
    } else {
        showModelRes(params.id);
    }
};

// MARK re-api 查看分享链接资源 -- 场景资源
const showSceneRes = (sceneId: string) => {
    getSceneInfo(sceneId).then((res_1) => {
        getSceneTree({ sceneId: sceneId }).then((res_2) => {
            let dataSetIdList = getDataSetIds(res_2);
            getDataSetList({ dataSetIds: dataSetIdList }).then((res_3) => {
                const dataSetList = handleDataSetTrans(res_3, res_1.dataSetPosition);
                uni.$re
                    .realEngineRender({
                        name: 'uni-app',
                        worldCRS: res_1.coordinates,
                        dataSetList: dataSetList,
                    })
                    .then((result) => {
                        console.log(result);
                        uni.$re.unipluginLog(JSON.stringify(result));
                    });
            });
        });
    });
};

// MARK re-api 查看分享链接资源 -- 模型资源
const showModelRes = (dataSetId: string) => {
    getDataSetList({ dataSetIds: [dataSetId] }).then((res) => {
        uni.$re
            .realEngineRender({
                name: 'uni-app',
                dataSetList: res,
            })
            .then((result) => {
                console.log(result);
                uni.$re.unipluginLog(JSON.stringify(result));
            });
    });
};

// MARK re-api 查看模型资源链接
const showResourceAddressRes = (address: string) => {
    let dataSetList = [
        {
            dataSetId: 'address-res',
            resourcesAddress: address,
            useTransInfo: true,
            rotate: [0, 0, 0, 1],
            scale: [1, 1, 1],
            offset: [0.0, 0.0, 0.0],
            dataSetCRS: '',
            dataSetCRSNorth: 0.0,
        },
    ];
    uni.$re
        .realEngineRender({
            name: 'uni-app',
            dataSetList: dataSetList,
        })
        .then((result) => {
            console.log(result);
            uni.$re.unipluginLog(JSON.stringify(result));
        });
};

// MARK Service 获取场景信息
const getSceneInfo = (paran: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getSceneById(paran).then((res) => {
            if (res.data) {
                let info = { coordinates: res.data.coordinates, dataSetPosition: res.data.dataSetPosition };
                resolve(info);
            } else {
                reject(new Error('位置偏移信息获取失败！'));
            }
        });
    });
};

// MARK Service 获取场景目录树
const getSceneTree = (paran: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getSingleSceneTreeById(paran).then((res) => {
            console.log(res);
            if (res.data) {
                resolve(res.data);
            } else {
                reject(new Error('场景目录树获取失败！'));
            }
        });
    });
};

// MARK Service 获取数据集资源地址
const getDataSetList = (params: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getProjectModel(params).then((res) => {
            console.log(res);
            let dataSetList: any[] = [];
            res.data.forEach((item: any) => {
                dataSetList.push({
                    dataSetId: item.dataSetId,
                    resourcesAddress: item.resourcesAddress,
                    rotate: item.rotate?.split(" ").map(Number),
                    scale: item.scale?.split(" ").map(Number),
                    offset: item.translation?.split(" ").map(Number),
                });
            });
            if (dataSetList.length > 0) {
                resolve(dataSetList);
            } else {
                reject(new Error('资源地址获取失败！'));
            }
        });
    });
};

// MARK Service 处理数据集偏移信息
const handleDataSetTrans = (dataSetList: any, dataSetTrans: any): any => {
    dataSetList.forEach((dataSet: any) => {
        let dataSetTranData = dataSetTrans.find((obj: any) => obj.dataSetId == dataSet.dataSetId);
        if (dataSetTranData) {
            dataSet.rotate = dataSetTranData.rotate?.split(" ").map(Number);
            dataSet.scale = dataSetTranData.scale?.split(" ").map(Number);
            dataSet.offset = dataSetTranData.translation?.split(" ").map(Number);
        }
    });
    return dataSetList;
};

// MARK Service 递归获取数据集标识集合
const getDataSetIds = (sceneTree: any) => {
    let dataSetIdList: string[] = [];
    if (sceneTree && sceneTree.length > 0) {
        sceneTree.forEach((item: any) => {
            if (item.dataSetId && item.dataSetId !== '00000000-0000-0000-0000-000000000000') {
                dataSetIdList.push(item.dataSetId);
            }
            if (item.subNodes && item.subNodes.length > 0) {
                let childrenDataSetList = getDataSetIds(item.subNodes);
                dataSetIdList = dataSetIdList.concat(childrenDataSetList);
            }
        });
    }
    return dataSetIdList;
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-card-page {
    position: relative;
    display: flex;
    flex: 1;
    background-color: aquamarine;
    // background-color: var(--color-main-bg);
    flex-direction: column;
    overflow-y: auto;

    .input-box {
        position: relative;
        width: 100%;
        height: 150rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .input-card,
        .scan-card {
            position: relative;
            height: calc(100% - 40rpx);
            aspect-ratio: 1;
            background-color: var(--color-white);
            box-shadow: 0rpx 6rpx 12rpx rgba(174, 209, 235, 0.16);
            border-radius: 8rpx;
            margin: 10rpx 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
