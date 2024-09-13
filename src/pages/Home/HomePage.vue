<template>
    <base-view
        :nav_bar_title="`项目首页`"
        :nav_bar_item_back="false"
        :nav_bar_item_setting="true"
        :nav_bar_item_scan="true"
        :nav_bar_item_callback="nav_bar_item_callback">
        <!-- 主体内容 -->
        <view class="sup-home-page">
            <view class="scene-box" v-if="false" @click="sceneAction"> 模型场景 </view>
            <view class="modules-box">
                <view class="modules-top-box">
                    <view class="modules-item" @click="modulesAction(1)">
                        <icon-font name="ic-moxingguanli"></icon-font>
                        <text class="modules-item-text">五亿面</text>
                    </view>
                    <view class="modules-item" @click="modulesAction(2)">
                        <icon-font name="ic-moxingzuguanli"></icon-font>
                        <text class="modules-item-text">一亿面</text>
                    </view>
                    <view class="modules-item" @click="modulesAction(3)">
                        <icon-font name="ic-ico-qxsy"></icon-font>
                        <text class="modules-item-text">一千万面</text>
                    </view>
                </view>
                <view class="modules-bottom-box">
                    <view class="modules-item" @click="modulesAction(4)">
                        <icon-font name="ic-yg"></icon-font>
                        <text class="modules-item-text">五百万面</text>
                    </view>
                    <view class="modules-item">
                        <icon-font name="ic-WMTS" @click="modulesAction(5)"></icon-font>
                        <text class="modules-item-text">一百万面</text>
                    </view>
                    <view class="modules-item modules-item-empty"> </view>
                </view>
            </view>
            <view class="other-box" v-if="false">
                <view class="cad-item" @click="otherAction(1)">
                    <image src="../..//static/bg/cad.png" class="other-item-bg" />
                    <text class="other-item-text">二维图纸</text>
                </view>
                <view class="other-right-box">
                    <view class="point-cloud-item" @click="otherAction(2)">
                        <image src="../..//static/bg/point_cloud.png" class="other-item-bg" />
                        <text class="other-item-text">点云</text>
                    </view>
                    <view class="panorama-item" @click="otherAction(3)">
                        <image src="../..//static/bg/panorama.png" class="other-item-bg" />
                        <text class="other-item-text">360全景</text>
                    </view>
                </view>
            </view>
        </view>
    </base-view>
    <sel-face-num-dialog ref="ref_selFaceNum_dialog" :dialog_SelFaceNumCallBack="dialog_SelFaceNumCallBack"></sel-face-num-dialog>
    <custom-input-dialog
        ref="ref_customInput_dialog"
        :dialog_dataSetId="scan_dataSetId"
        :dialog_resourcesAddress="scan_resourcesAddress"
        :dialog_CustomInputCallBack="dialog_CustomInputCallBack"></custom-input-dialog>
</template>

// MOD-- JavaScript
<script setup>
import { ref, onMounted } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import SelFaceNumDialog from '@/components/Dialog/SelFaceNumDialog.vue';
import CustomInputDialog from '@/components/Dialog/CustomInputDialog.vue';
// import { judgeIosPermission } from '@/js_sdk/wa-permission/permission.js'

const reModule = ref(null);
const ref_selFaceNum_dialog = ref(null);
const ref_customInput_dialog = ref(null);
const sel_module_type = ref(0);
const load_faceNum = ref(1500000);
const scan_resourcesAddress = ref('');
const scan_dataSetId = ref('');
const uni_app_osName = ref('');

onMounted(() => {
    if (Object.prototype.hasOwnProperty.call(uni, 'requireNativePlugin')) {
        reModule.value = uni.requireNativePlugin('REUniPlugin-REModule');
        uniapp_log('uni-plugin 加载成功');
    } else {
        uni.showToast({ title: '加载插件失败', icon: 'none' });
    }
    uni.getSystemInfo({
        success: (res) => {
            console.log('设备信息获取成功：' + JSON.stringify(res));
            uni_app_osName.value = res.osName;
            uniapp_log(JSON.stringify(res));
        },
        fail: (err) => {
            console.log('设备信息获取失败： ', JSON.stringify(err));
            uniapp_log(JSON.stringify(err));
        },
    });
});

// MARK NavItemClick 导航栏点击
const nav_bar_item_callback = (type) => {
    console.log('---------- ', type);
    if (type == 'nav-bar-item-scan') {
        nav_item_scanAction();
    } else if (type == 'nav-bar-item-info') {
        nav_item_inputAction();
    }
};

// MARK NavItemClick 扫码
const nav_item_scanAction = () => {
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

// MARK NavItemClick 输入
const nav_item_inputAction = () => {
    ref_customInput_dialog.value.show_dialog();
};

// MARK Click 场景查看
const sceneAction = () => {
    uni.showToast({ title: '暂未开放', icon: 'none' });
};

// MARK Click 模型选择
const modulesAction = (type) => {
    sel_module_type.value = type;
    ref_selFaceNum_dialog.value.show_dialog();
};

// MARK Click 其他模型选择
const otherAction = (type) => {
    uni.showToast({ title: '暂未开放', icon: 'none' });
};

// MARK Dialog 最大面数选择
const dialog_SelFaceNumCallBack = (faceNum) => {
    load_faceNum.value = faceNum;
    model_handleDataSet();
};

// MARK Dialog 自定义模型查看
const dialog_CustomInputCallBack = (e) => {
    uni_app_loadDataSet(e.dataSetId, e.resourcesAddress, e.faceNum);
};

// MARK Model 处理数据
const model_handleDataSet = () => {
    var dataSetId = '';
    var resourcesAddress = '';
    var maxInstDrawFaceNum = load_faceNum.value;
    switch (sel_module_type.value) {
        case 1:
            dataSetId = 'res_bigelem06';
            resourcesAddress = 'https://realbim.bjblackhole.cn:8009/default.aspx?dir=url_res02&path=res_bigelem06';
            break;
        case 2:
            dataSetId = '3a14a3cc0c974d1a050688c0cb3df936';
            resourcesAddress =
                'http://realbim.bjblackhole.cn:18088/blackhole3D/EngineRes/RequestEngineRes?dir=url_res_d&path=3a14a3cc0c974d1a050688c0cb3df936';
            break;
        // case 2:
        //     dataSetId = '3a14a3cc0649767274fb78000f136e33';
        //     resourcesAddress = 'http://realbim.bjblackhole.cn:18088/blackhole3D/EngineRes/RequestEngineRes?dir=url_res_e&path=3a14a3cc0649767274fb78000f136e33';
        //     break;
        case 3:
            dataSetId = '3a14a3cbeeebdfb01d634989ca575ed0';
            resourcesAddress =
                'http://realbim.bjblackhole.cn:18088/blackhole3D/EngineRes/RequestEngineRes?dir=url_res_e&path=3a14a3cbeeebdfb01d634989ca575ed0';
            break;
        case 4:
            dataSetId = '3a14a3cbd8e209a9b2a638121097345c';
            resourcesAddress =
                'http://realbim.bjblackhole.cn:18088/blackhole3D/EngineRes/RequestEngineRes?dir=url_res_d&path=3a14a3cbd8e209a9b2a638121097345c';
            break;
        case 5:
            dataSetId = '3a14a3cbd41753a6781666f6aae444e2';
            resourcesAddress =
                'http://realbim.bjblackhole.cn:18088/blackhole3D/EngineRes/RequestEngineRes?dir=url_res_e&path=3a14a3cbd41753a6781666f6aae444e2';
            break;
        default:
            break;
    }

    uni_app_loadDataSet(dataSetId, resourcesAddress, maxInstDrawFaceNum);
};

// MARK uni-app 加载模型
const uni_app_loadDataSet = (dataSetId, resourcesAddress, maxInstDrawFaceNum) => {
    if (!reModule.value) return;
    reModule.value.realEngineRender(
        {
            name: 'uni-app',
            dataSetList: [
                {
                    type: 0,
                    dataSetId: dataSetId,
                    resourcesAddress: resourcesAddress,
                },
            ],
            maxInstDrawFaceNum: maxInstDrawFaceNum,
        },
        (ret) => {
            // uni.showToast({ title: '调用异步方法' + ret.code, icon: 'none' });
        }
    );
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
            scanQRCode();
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
            console.log('扫码内容：' + res.result);
            scan_dataSetId.value = '扫码分享数据集标识';
            scan_resourcesAddress.value = res.result;
            ref_customInput_dialog.value.show_dialog();
        },
        fail: (err) => {
            console.log('扫码失败', err);
            uni.showToast({ title: err.errMsg, icon: 'none' });
        },
    });
};

// MARK uni-app 打印信息
const uniapp_log = (logStr) => {
    if (!reModule.value) return;
    reModule.value.unipluginLog(logStr);
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-home-page {
    position: relative;
    display: flex;
    flex: 1;
    background-color: var(--color-main-bg);
    flex-direction: column;
    overflow-y: auto;
}
.scene-box {
    position: relative;
    margin: 28rpx 30rpx 0 30rpx;
    background-color: var(--color-white);
    height: 316rpx;
    box-shadow: 0rpx 6rpx 12rpx rgba(174, 209, 235, 0.16);
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}
.modules-box {
    position: relative;
    margin: 28rpx 30rpx 28rpx 30rpx;
    background-color: var(--color-white);
    // height: 420rpx;
    box-shadow: 0rpx 6rpx 12rpx rgba(174, 209, 235, 0.16);
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;

    .modules-top-box,
    .modules-bottom-box {
        position: relative;
        width: 100%;
        height: 50%;
        background-color: var(--color-white);
        box-shadow: 0rpx 6rpx 12rpx rgba(174, 209, 235, 0.16);
        border-radius: 8rpx;
        display: flex;
        justify-content: space-between;

        .modules-item {
            position: relative;
            width: 168rpx;
            height: 168rpx;
            box-shadow: 0rpx 6rpx 12rpx rgba(93, 146, 219, 0.16);
            border-radius: 8rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 30rpx 10rpx 20rpx 10rpx;
            box-sizing: border-box;
        }
        .modules-item-empty {
            box-shadow: unset !important;
            border-radius: unset !important;
        }
    }

    .modules-top-box {
        box-sizing: border-box;
        .modules-item {
            margin: 30rpx 30rpx 15rpx 30rpx;
        }
    }

    .modules-bottom-box {
        .modules-item {
            margin: 15rpx 30rpx 30rpx 30rpx;
        }
    }
    .modules-item-icon {
        position: relative;
        width: 56rpx !important;
        height: 56rpx !important;
    }

    .modules-item-text {
        font-weight: normal;
        font-size: 28rpx;
        color: var(--color-main-black);
    }
}
.other-box {
    position: relative;
    margin: 0 30rpx 28rpx 30rpx;
    background-color: transparent;
    height: 434rpx;
    display: flex;
    justify-content: space-between;

    .cad-item {
        position: relative;
        width: calc(50% - 12rpx);
        height: 100%;
    }

    .other-right-box {
        position: relative;
        width: calc(50% - 12rpx);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .point-cloud-item {
            position: relative;
            width: 100%;
            height: calc(50% - 13rpx);
        }

        .panorama-item {
            position: relative;
            width: 100%;
            height: calc(50% - 13rpx);
        }
    }

    .other-item-bg {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .other-item-text {
        position: absolute;
        top: 40rpx;
        left: 32rpx;
        font-weight: normal;
        font-size: 36rpx;
        color: var(--color-main-black);
    }
}
</style>
