<!--
 * @Author: Lemon C
 * @Date: 2024-09-13 15:36:25
 * @LastEditTime: 2024-09-19 18:52:57
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

onMounted(() => {
    card_store.addCard('www.google.com');
});

const input_click = () => {
    console.log('-----------------------');
    // ref_projInput_dialog.value.show_dialog();
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

    let shareUrl = e.shareUrl;
    uni.$re.unipluginLog('shareUrl=' + shareUrl);

    // 使用字符串截取方式，无法使用URL的方式，uniapp在真机上无法使用URL方式
    const startIndex = shareUrl.indexOf('?'); // 查找查询字符串的开始位置（跳过'#'和'/index?'）
    const queryString = shareUrl.substring(startIndex + 1); // 提取查询字符串部分，注意要跳过'?'
    const params: any = queryString.split('&'); // 分割成参数数组
    let sceneId = '',
        tokenId = '';
    params.forEach((param: any) => {
        const [key, value] = param.split('=');
        if (key === 'sceneId') {
            sceneId = value;
        } else if (key === 'tokenId') {
            tokenId = value;
        }
    });
    uni.$re.unipluginLog('params' + JSON.stringify(params));

    uni.setStorageSync('RE_TokenId', tokenId);

    getSceneById(sceneId).then((res) => {
        console.log(res);
    });
    getSingleSceneTreeById({ sceneId: sceneId }).then((res) => {
        console.log(res);
        let dataSetIdList = getDataSetIds(res.data);
        getProjectModel({ dataSetIds: dataSetIdList }).then((res_2) => {
            console.log(res_2);
            let dataSetList: any[] = [];
            res_2.data.forEach((item: any) => {
                dataSetList.push({
                    dataSetId: item.resId,
                    resourcesAddress: item.resourcesAddress,
                });
            });
            uni.$re
                .realEngineRender({
                    name: 'uni-app',
                    dataSetList: dataSetList,
                })
                .then((res) => {
                    console.log(res);
                    uni.$re.unipluginLog(JSON.stringify(res));
                });
        });
    });
};

// MARK 递归获取数据集标识集合
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
