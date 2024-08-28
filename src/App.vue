<!--
 * @Author: Lemon C
 * @Date: 2024-08-14 10:24:21
 * @LastEditTime: 2024-08-26 17:50:14
-->
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
onLaunch(() => {
    console.log('App Launch');
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
    --color-main-bg: #f5f6f8;
    --color-main-blue: #4e7dff;
    --color-main-black: #333;
    --color-main-gray: #777;
    --animation-transform-style: transform 0.3s linear;
    --animation-opacity-style: opacity 0.5s ease-in-out;
}
</style>
