<!--
 * @Author: Lemon C
 * @Date: 2024-08-14 10:24:21
 * @LastEditTime: 2024-09-26 16:02:49
-->
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useCardStore } from '@/stores/card';
import uniApi from '@/utils/uniApi';

onLaunch(() => {
    console.log('App Launch');
    uni.request({
        url: 'https://demo.bjblackhole.com/BlackHole3.0/app/json/re_sample_res.json',
        success: (res) => {
            const card_store = useCardStore();
            card_store.updateSample(res.data);
            uni.$re.unipluginLog('服务端示例数据获取成功！ ' + JSON.stringify(res));
        },
        fail: (err) => {
            console.error('服务端示例数据获取失败！', err);
            uni.$re.unipluginLog('服务端示例数据获取失败！ ' + JSON.stringify(err));
        },
    });
    uniApi.get_deviceInfo();
});
onShow(() => {
    console.log('App Show');
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
