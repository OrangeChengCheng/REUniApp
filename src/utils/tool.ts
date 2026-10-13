/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2026-10-13 10:44:38
 */

const RE_AppVersion = "2.0.5";
const RE_NeedUpdate = true;

import { useCardStore } from '@/stores/card';
import { useDeviceStore } from '@/stores/device';
import { useStateStore } from '@/stores/state';
import uniApi from '@/utils/uniApi';


interface ApiMethods {
    url_base(url: string): string;
    url_handle(url: string, priority?: number): Promise<any>;
    time_compare(frontTime: Date, backTime: Date): string;
    time_To_IOSDate(timeStr: string): string;
    time_format(utcTime: Date): string;
    time_pad2(n: any): any;
    update_data(): void;
    del_data(): void;
    generateUUID(): string;
    utf8ByteLength(str: string): number;
    splitStringByByteLength(str: string, maxByte: number): string[];
    formatByte(bytes: number, fixed?: number): string;
    compareVersions(version1: string, version2: string): number;
    getAppVersion(): string;
    initializeData(): void;
}

const api: ApiMethods = {
    url_base: (url: string): string => {
        if (url.length <= 0) return "";
        url = url.trim();

        // 定义需要忽略的路径关键词数组
        // const ignorePathKeywords = ["BlackHole", "StarRiver"];
        const ignorePathKeywords: Array<string> = [];

        // 步骤1：截断 # 及之后的hash部分（如#/dataSetShare/...）
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
            url = url.substring(0, hashIndex);
        }

        // 步骤2：截断 index.html 及之后的内容
        const indexHtmlStr = "index.html";
        const indexHtmlIndex = url.indexOf(indexHtmlStr);
        if (indexHtmlIndex !== -1) {
            url = url.substring(0, indexHtmlIndex);
        }

        // 步骤3：提取协议（http:///https://）
        const protocolEndIndex = url.indexOf('://');
        if (protocolEndIndex === -1) return ""; // 无合法协议，返回空
        const protocol = url.substring(0, protocolEndIndex + 3); // 如 "https://"

        // 步骤4：提取协议后的部分（域名/端口+路径）
        const afterProtocol = url.substring(protocolEndIndex + 3);
        // 找到协议后第一个 "/" 的位置（区分域名/端口和路径）
        const firstSlashAfterProtocol = afterProtocol.indexOf('/');

        let baseUrl = "";
        if (firstSlashAfterProtocol === -1) {
            // 无路径，直接返回 协议+域名/端口
            baseUrl = protocol + afterProtocol;
        } else {
            // 拆分 域名/端口 和 后续路径
            const domainAndPort = afterProtocol.substring(0, firstSlashAfterProtocol); // 如 "test.com" 或 "192.168.31.7:9012"
            const pathPart = afterProtocol.substring(firstSlashAfterProtocol); // 如 "/StarRiver/sub" 或 "/bimhlw"

            // 步骤5：判断路径中是否包含需要忽略的关键词（任意层级都匹配）
            const isIgnorePath = ignorePathKeywords.some(keyword =>
                pathPart.includes(keyword)
            );

            if (isIgnorePath) {
                // 包含忽略关键词，仅保留 协议+域名/端口
                baseUrl = protocol + domainAndPort;
            } else {
                // 不包含忽略关键词，保留 协议+域名/端口+路径（清理末尾/）
                const cleanPath = pathPart.endsWith('/') ? pathPart.slice(0, -1) : pathPart;
                baseUrl = protocol + domainAndPort + cleanPath;
            }
        }

        // 步骤6：最终清理末尾多余的 /（保证格式统一）
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }

        return baseUrl;
    },
    // MARK tool 处理分享链接
    // 使用IIFE立即执行函数，创建独立闭包环境
    // 闭包内私有变量 taskQueue / isProcessing 外部无法访问，保证状态私有化
    url_handle: (() => {
        // 单个url处理任务的类型定义
        type UrlHandleTask = {
            url: string;                // 需要解析的分享链接
            priority: number;           // 任务优先级，数值越大优先级越高
            resolve: (v: any) => void;  // 任务对应的Promise resolve回调，用于返回结果给调用方
        };

        // 任务队列：存放等待执行的url解析任务
        let taskQueue: UrlHandleTask[] = [];
        // 任务执行锁：标记当前是否正在处理任务，保证同一时间只跑1个任务（串行执行）
        let isProcessing = false;

        async function runNextTask() {
            // 如果当前正在处理任务 或者 任务队列为空，直接退出，不执行
            if (isProcessing || taskQueue.length === 0) return;
            // 标记：开始处理任务，防止并发进入
            isProcessing = true;

            // 遍历队列，找出优先级最高任务的下标（数值越大优先级越高）
            const highestIdx = taskQueue.reduce((maxIdx, item, idx, arr) => {
                // 当前任务优先级 > 已记录最大优先级，则更新最大下标为当前idx
                return item.priority > arr[maxIdx].priority ? idx : maxIdx;
            }, 0);

            // 从队列中移除该最高优先级任务，并取出任务对象
            const task = taskQueue.splice(highestIdx, 1)[0];

            try {
                // 执行url解析业务逻辑
                const result = await execUrlHandleLogic(task.url);
                // 任务成功，把结果返回给调用方Promise
                task.resolve(result);
            } catch (e) {
                // 捕获异常，不向外抛出，直接resolve返回null
                task.resolve(null);
            } finally {
                // 无论成功失败，都标记处理结束
                isProcessing = false;
                // 递归调用，继续处理下一个任务
                runNextTask();
            }
        }

        // 业务逻辑处理
        async function execUrlHandleLogic(url: string): Promise<any> {
            try {
                url = url.trim();
                uni.$re.unipluginLog('url = ' + url);
                if (url.length <= 0) return null;

                // 处理app外部数据连接，兼容老版本的url形式，只获取其中的连接后续操作一致
                const targetPrefix = 'https://developer.bjblackhole.com/AppWakeup';
                // const targetPrefix = 'http://192.168.31.197';
                if (url.startsWith(targetPrefix)) {
                    let match = url.match(/[?&]shareUrl=([^&]*)/);
                    if (!(match && match[1])) { return null; }
                    const realShareUrl = decodeURIComponent(match[1]);
                    url = realShareUrl;
                }
                //提取baseUrl（域名和端口号）
                let baseUrl = api.url_base(url);
                // 短链接分享数据
                if (url.includes("#/shareViews/") || url.includes("#/shareView/")) {
                    // 提取短链接中的ID（适配两种格式）
                    const shareViewIndex = url.includes('#/shareViews/')
                        ? url.indexOf('#/shareViews/')
                        : url.indexOf('#/shareView/');
                    // 计算基础路径长度（根据实际格式取对应的长度）
                    const basePathLength = url.includes('#/shareViews/')
                        ? '#/shareViews/'.length
                        : '#/shareView/'.length;
                    const idStartIndex = shareViewIndex + basePathLength;
                    let idEndIndex = url.indexOf('?', idStartIndex); // 处理可能的查询参数
                    const _shareId = idEndIndex !== -1
                        ? url.substring(idStartIndex, idEndIndex)
                        : url.substring(idStartIndex);
                    const state_store = useStateStore();
                    state_store.updateCurrBaseUrl(baseUrl);
                    try {
                        const urlData = await uni.$service.getSharedUrlInfo(_shareId);
                        if (!urlData || !urlData.token) return null;
                        let _shareType: number = 0; // 判断分享链接类型 0：无 1：模型 2：场景
                        if (urlData.viewMode.length > 0) {
                            _shareType = 2;
                        } else if (urlData.viewMode == "") {
                            _shareType = 1;
                        }
                        // 解构urlData，分离出需要替换的字段和剩余字段
                        const {
                            resourceId,
                            viewMode,
                            dataType,
                            ...restUrlData
                        } = urlData;
                        // 构造最终的params，只保留你指定的参数名，无原始冲突字段
                        const params = {
                            url: url,
                            shareId: _shareId,
                            baseUrl: baseUrl,
                            shareType: _shareType,
                            id: urlData.resourceId,
                            shareViewMode: urlData.viewMode,
                            shareDataType: urlData.dataType,
                            ...restUrlData
                        }
                        // 获取项目名称
                        state_store.updateCurrToken(urlData.token);
                        const projName = await uni.$dataTool.card_getProjName(params);
                        params.projName = projName || '';
                        uni.$re.unipluginLog('params = ' + JSON.stringify(params));
                        return params;
                    } catch (error) {
                        return null;
                    }
                } else {
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
                    let valueEndIndex = url.indexOf('?', valueStartIndex + 1);
                    let _id = url.substring(valueStartIndex, valueEndIndex); // 截取所需的值
                    let tokenStartIndex = url.indexOf('token=') + 'token='.length; // 计算token的起始位置（即"token="之后的位置）
                    let tokenEndIndex = url.indexOf('&', tokenStartIndex); // 如果URL中有其他查询参数，找到"&"字符的位置，作为token的结束位置
                    let _token = tokenEndIndex !== -1 ? url.substring(tokenStartIndex, tokenEndIndex) : url.substring(tokenStartIndex); // 截取并输出token的
                    // 解析viewMode和dataType
                    let viewModeIndex = url.indexOf('viewMode=');
                    let dataTypeIndex = url.indexOf('dataType=');
                    let _viewMode = "", _dataType = "";
                    if (viewModeIndex !== -1) {
                        let viewModeEndIndex = url.indexOf('&', viewModeIndex + 'viewMode='.length);
                        _viewMode = viewModeEndIndex !== -1 ? url.substring(viewModeIndex + 'viewMode='.length, viewModeEndIndex) : url.substring(viewModeIndex + 'viewMode='.length);
                    }
                    if (dataTypeIndex !== -1) {
                        let dataTypeEndIndex = url.indexOf('&', dataTypeIndex + 'dataType='.length);
                        _dataType = dataTypeEndIndex !== -1 ? url.substring(dataTypeIndex + 'dataType='.length, dataTypeEndIndex) : url.substring(dataTypeIndex + 'dataType='.length);
                    }
                    const state_store = useStateStore();
                    state_store.updateCurrToken(_token);
                    state_store.updateCurrBaseUrl(baseUrl);
                    try {
                        const shareData = await uni.$service.getSharedInfo(false);
                        const params = {
                            url: url,
                            baseUrl: baseUrl,
                            shareType: shareType,
                            id: _id,
                            token: _token,
                            shareViewMode: _viewMode,
                            shareDataType: _dataType,
                            shareItem: shareData,
                        };
                        uni.$re.unipluginLog('params = ' + JSON.stringify(params));
                        return params;
                    } catch (error: any) {
                        if (error.statusCode == 404) {
                            const params = {
                                url: url,
                                baseUrl: baseUrl,
                                shareType: shareType,
                                id: _id,
                                token: _token,
                                shareViewMode: _viewMode,
                                shareDataType: _dataType,
                            };
                            uni.$re.unipluginLog('params = ' + JSON.stringify(params));
                            return params;
                        } else {
                            return null;
                        }
                    }
                }
            } catch (error) {
                throw null;
            }
        }

        // 对外暴露的url_handle方法
        // 接收分享链接url和可选优先级参数，将任务推入队列，返回Promise等待任务执行完成
        return async function (url: string, priority?: number): Promise<any> {
            // 优先级默认值为2；使用??空值合并，传入0/1这类低优先级数字会保留原值，不会被覆盖
            const p = priority ?? 2;
            return new Promise((resolve) => {
                // 构造任务对象，加入任务等待队列
                taskQueue.push({ url, priority: p, resolve });
                // 启动任务调度，尝试消费队列中的任务
                runNextTask();
            });
        }

    })(),

    // MARK tool 时间对比
    time_compare: (frontTime: Date, backTime: Date): string => {
        let diff = Math.abs(backTime.getTime() - frontTime.getTime());
        let days = Math.floor(diff / (1000 * 60 * 60 * 24));
        let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        let minutes = Math.floor((diff / (1000 * 60)) % 60);

        if (days > 0) {
            return `${days}天`;
        } else if (hours > 0) {
            return `${hours}小时`;
        } else {
            return `${minutes}分钟`;
        }
    },

    //  MARK tool 处理时间对象，iOS 原生只兼容 yyyy/MM/dd HH:mm:ss 或 ISO 标准格式（yyyy-MM-dd'T'HH:mm:ss）
    time_To_IOSDate: (timeStr: string): string => {
        if (!timeStr || !timeStr.length) return '';
        return timeStr.replace(/-/g, '/');
    },

    // MARK tool 时间格式化
    time_format: (utcTime: any): string => {
        // 空值直接返回空
        if (!utcTime || utcTime === 'null' || utcTime === 'undefined') return "";

        let date = new Date(Date.parse(utcTime));

        let year = date.getFullYear();
        let month = api.time_pad2(date.getMonth() + 1);
        let day = api.time_pad2(date.getDate());
        let hour = api.time_pad2(date.getHours());
        let minute = api.time_pad2(date.getMinutes());
        let second = api.time_pad2(date.getSeconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },

    time_pad2: (n: any): any => {
        return n < 10 ? "0" + n : n;
    },


    // MARK tool 提示更新数据
    update_data: (): void => {
        const device_store = useDeviceStore();
        if (RE_NeedUpdate) {
            const card_store = useCardStore();

            if (!card_store.cardList || card_store.cardList.length <= 0) return;
            let needUpdata = false;
            const appVersion = device_store.appVersion;
            if (appVersion.length) {
                if (api.compareVersions(RE_AppVersion, appVersion) > 0) {
                    needUpdata = true;
                }
            } else {
                needUpdata = true;
            }
            device_store.update_appVersion(RE_AppVersion);
            if (needUpdata) {
                uni.showModal({
                    title: '更新提示',
                    content: '版本更新后旧分享数据无法使用，请删除后重新扫码获取（取消后可以在设置中重新删除）',
                    success: function (res) {
                        if (res.confirm) {
                            api.initializeData();
                        }
                    }
                });
            }
        } else {
            device_store.update_appVersion(RE_AppVersion);
        }
    },

    compareVersions: (version1: string, version2: string): number => {
        // 拆分版本号为数字数组
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);

        // 取最长的数组长度进行比较
        const maxLength = Math.max(v1.length, v2.length);

        for (let i = 0; i < maxLength; i++) {
            // 若某一版本号长度不足，用 0 补位
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;

            if (num1 > num2) return 1; // version1 更大
            if (num1 < num2) return -1; // version2 更大
        }

        return 0; // 版本号相等
    },

    // MARK tool 生成分片消息唯一 msgId
    // 生成简单UUID v4
    generateUUID: (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // MARK tool 按 UTF-8 字节截断
    /**
     * 计算字符串的 UTF-8 字节长度（不依赖 Blob）
     */
    utf8ByteLength: (str: string): number => {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if (code <= 0x7f) {
                len += 1;
            } else if (code <= 0x7ff) {
                len += 2;
            } else if (code >= 0xd800 && code <= 0xdbff) {
                // 高位代理项，与低位代理项组成一个4字节字符
                len += 4;
                i++;
            } else {
                len += 3;
            }
        }
        return len;
    },

    /**
     * 按UTF8字节长度切割字符串，保证不会切断多字节字符
     * @param str 原始完整字符串
     * @param maxByte 每片最大字节数
     * @returns 分片数组
     */
    splitStringByByteLength: (str: string, maxByte: number): string[] => {
        const chunks: string[] = [];
        const totalLength = str.length;
        let start = 0;
        let byteCount = 0;
        let i = 0;

        while (i < totalLength) {
            const code = str.charCodeAt(i);
            let charBytes = 1;
            let charLen = 1; // UTF-16 码元个数
            if (code <= 0x7f) {
                charBytes = 1;
            } else if (code <= 0x7ff) {
                charBytes = 2;
            } else if (code >= 0xd800 && code <= 0xdbff) {
                charBytes = 4; // 代理对
                charLen = 2;
            } else {
                charBytes = 3;
            }

            if (byteCount + charBytes > maxByte) {
                // 当前片已满，切断
                chunks.push(str.slice(start, i));
                start = i;
                byteCount = 0;
            }
            byteCount += charBytes;
            i += charLen;
        }

        if (start < totalLength) {
            chunks.push(str.slice(start));
        }

        return chunks;
    },

    /**
     * 格式化字节数为可读字符串
     * @param bytes 字节数
     * @param fixed 小数位数，默认 2
     * @returns 如 "272.51 KB" / "9.04 MB" / "512 B"
     */
    formatByte: (bytes: number, fixed: number = 2): string => {
        if (!bytes || bytes < 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(fixed) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(fixed) + ' MB';
        return (bytes / 1024 / 1024 / 1024).toFixed(fixed) + ' GB';
    },



    // MARK tool 提示删除数据
    del_data: (): void => {
        uni.showModal({
            title: '提示',
            content: '是否清除所有的存储数据（卡片列表和配置信息）',
            success: function (res) {
                if (res.confirm) {
                    api.initializeData();
                }
            }
        });
    },

    // MARK config 获取AppVersion
    getAppVersion: (): string => {
        const info = uniApi.get_SystemInfo();
        return info.appVersion || RE_AppVersion;
    },

    // MARK config 初始化数据
    initializeData: (): void => {
        const card_store = useCardStore();
        uni.$service.updateServerWhiteList([]);//清空白名单数据
        card_store.clearCardList();//清空卡片列表
    },

}


export default api;