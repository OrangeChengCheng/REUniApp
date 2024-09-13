/*
 * @Author: Lemon C
 * @Date: 2022-11-08 12:03:13
 * @LastEditTime: 2024-09-13 17:27:02
 */
import axios from 'axios';
import { ElMessage as Message } from 'element-plus';
// import { useUserStore } from '@/stores/user';
// import { useRouterStore } from '@/stores/router';
// import globalObj from '@/utils/globalObj';

// 创建axios实例
const service = axios.create({
    // baseURL: uni.$window.serverBaseUrl, // api的base_url
    // timeout: uni.$window.commonTimeout, // 请求超时时间
    baseURL: "http://192.168.31.6:9202/api/developercenter", // api的base_url
    timeout: 30000, // 请求超时时间
});

service.interceptors.request.use((config) => {
    config.headers.Authorization = sessionStorage.getItem('token');
    return config;
});

service.interceptors.response.use(
    (response) => {
        if (response.status && response.status == 200) {
            let data = response.data;
            if (data.data === '{}') {
                data.data = {};
            }
            return new Promise((resolve) => {
                resolve(data);
            });
        }
    },
    (err) => {
        if (err.response.status == 504 || err.response.status == 404) {
            Message.error({ message: '服务器错误，请稍候再试!', offset: 100 });
        } else if (err.response.status == 403) {
            if (err.response && err.response.data && err.response.data.error && err.response.data.error.message) {
                Message.error({ message: err.response.data.error.message, offset: 100 });
            } else {
                Message.error({ message: '权限不足,请联系管理员!' });
            }
        } else if (err.response.status == 400) {
            if (err.response && err.response.data && err.response.data.error && err.response.data.error.details) {
                Message.error({ message: err.response.data.error.details, offset: 100 });
            } else {
                Message.error({ message: '权限不足,请联系管理员!', offset: 100 });
            }
        } else if (err.response.status == 401) {
            // const router_store = useRouterStore();
            // if (router_store.route.path && router_store.route.path.includes(globalObj.router_type.msg)) {
                Message({
                    message: '登录信息已过期，请重新登录!',
                    type: 'error',
                    duration: 3 * 1000,
                    offset: 100,
                });
            // }
            // const user_store = useUserStore();
            // user_store.clearLoginInfo();
        } else {
            Message.error({ message: '未知错误!', offset: 100 });
        }
        return Promise.resolve(err);
    }
);

export default service;
