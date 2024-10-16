<!--
 * @Author: Lemon C
 * @Date: 2024-08-14 10:24:21
 * @LastEditTime: 2024-10-16 11:33:58
-->
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useCardStore } from '@/stores/card';
import { useDeviceStore } from '@/stores/device';
import uniApi from '@/utils/uniApi';

onLaunch(() => {
    console.log('App Launch');
    uni.onNetworkStatusChange(function (res) {
        const device_store = useDeviceStore();
        device_store.update_networkInfo(res);
    });
    const card_store = useCardStore();
    card_store.updateSample();
    uniApi.get_deviceInfo();
});
onShow(() => {
    console.log('App Show');
    uni.getNetworkType({
        success: function (res) {
            const device_store = useDeviceStore();
            device_store.update_networkInfo(res);
        },
    });
});
onHide(() => {
    console.log('App Hide');
});
</script>
<style lang="scss">
@import url('./static/common/iconfont.css');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html,
body {
    width: 100vw;
    height: 100vh;
    position: relative;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
    }
}
#app {
    font-family: SourceHanSansCN, SourceHanSansCN;
    font-weight: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100vw;
    height: 100vh;
}
:root {
    --color-white: #ffffff;
    --color-main-bg: #ffffff;
    --color-main-blue: #0e6bfe;
    --color-main-black: #1d2129;
    --color-main-gray: #86909c;
    --animation-transform-style: transform 0.3s linear;
    --animation-opacity-style: opacity 0.5s ease-in-out;
}
</style>
