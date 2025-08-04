/*
 * @Author: Lemon C
 * @Date: 2024-09-13 15:14:00
 * @LastEditTime: 2025-08-04 16:02:58
 */
import { defineStore } from 'pinia'
import { type Share } from '@/types/class';



interface CardMold {
    cardList: Array<Share>,
    sample_cardList: Array<any>,
}




export const useCardStore = defineStore('card', {
    state: (): CardMold => ({
        cardList: JSON.parse(uni.getStorageSync('RE_cardList') || '[]') || [],
        sample_cardList: JSON.parse(uni.getStorageSync('RE_sample_cardList') || '[]') || [],
    }),
    actions: {
        addCard(shareData: Share) {
            if (this.checkRepeat(shareData)) {
                console.log("已覆盖原有数据");
                this.updateCard(shareData);
                return;
            }
            this.cardList.push(shareData);
            this.saveToLocalStorage();
        },
        updateCard(shareData: Share) {
            let find = this.cardList.find((e: Share) => e.id === shareData.id);
            if (find) {
                find.dataSetList = shareData.dataSetList;
                find.entityList = shareData.entityList;
                find.waterList = shareData.waterList;
                find.extrudeList = shareData.extrudeList;
                find.worldCRS = shareData.worldCRS;
                find.camDefaultDataSetId = shareData.camDefaultDataSetId;
                find.shareType = shareData.shareType;
                find.shareViewMode = shareData.shareViewMode;
                find.defaultCamLoc = shareData.defaultCamLoc;
                find.endTime = shareData.endTime;
                find.shareFormUserExpirationTime = shareData.shareFormUserExpirationTime;
                find.url = shareData.url;
                find.token = shareData.token;
                find.baseUrl = shareData.baseUrl;
                find.source = shareData.source;
                find.projName = shareData.projName;
                find.id = shareData.id;
                find.appVersion = shareData.appVersion;
                this.saveToLocalStorage();
            }
        },
        getCardList(search?: string) {
            let result = this.cardList;

            if (search) {
                result = result.filter((e: Share) => e.projName.includes(search));
            }

            // 按 lastTime 降序排序（最新的在前）
            return result.sort((a, b) => {
                const lastTime_a = new Date(a.lastTime);
                const lastTime_b = new Date(b.lastTime);
                return lastTime_b.getTime() - lastTime_a.getTime();
            });
        },
        addCollect(shareData: Share, coollect: boolean) {
            let find = this.cardList.find((e: Share) => e.url === shareData.url || e.id === shareData.id);
            if (find) {
                find.collect = coollect;
            }
            this.saveToLocalStorage();
        },
        getCollectCardList(search?: string) {
            let result = this.cardList;

            if (search) {
                result = result.filter((e: Share) => e.collect === true && e.projName.includes(search));
            } else {
                result = result.filter((e: Share) => e.collect === true);
            }

            // 按 lastTime 降序排序（最新的在前）
            return result.sort((a, b) => {
                const lastTime_a = new Date(a.lastTime);
                const lastTime_b = new Date(b.lastTime);
                return lastTime_b.getTime() - lastTime_a.getTime();
            });
        },
        saveToLocalStorage() {
            uni.setStorageSync('RE_cardList', JSON.stringify(this.cardList));
        },
        clearCardList() {
            this.cardList = [];
            this.saveToLocalStorage();
        },

        reviseProjName(shareData: Share, projName: string) {
            let find = this.cardList.find((e: Share) => e.url === shareData.url || e.id === shareData.id);
            if (find) {
                find.projName = projName;
            }
            this.saveToLocalStorage();
        },

        removeCard(id: string) {
            let find = this.cardList.find((e: Share) => e.id === id);
            if (find) {
                let index = this.cardList.findIndex(obj => obj.id === find.id);
                this.cardList.splice(index, 1);
                this.saveToLocalStorage();
            }
        },
        getSampleCardList(search?: string) {
            if (search) {
                return this.sample_cardList.filter((e: Share) => e.projName.includes(search));
            } else {
                return this.sample_cardList;
            }
        },
        updateSample(): Promise<any> {
            return new Promise<any>((resolve, reject) => {
                uni.request({
                    url: 'https://demo.bjblackhole.com/BlackHole3.0/app/json/re_sample_res.json',
                    success: (res) => {
                        this.sample_cardList = [];
                        uni.setStorageSync('RE_sample_cardList', JSON.stringify(this.sample_cardList));
                        let sampleCardList_json = JSON.stringify(res.data);
                        let sampleCardList_obj = JSON.parse(sampleCardList_json);
                        this.sample_cardList = sampleCardList_obj;
                        uni.setStorageSync('RE_sample_cardList', JSON.stringify(this.sample_cardList));
                        uni.$re.unipluginLog('getSampleList: ' + JSON.stringify(res.data));
                        resolve("示例获取成功");
                    },
                    fail: (err) => {
                        uni.$re.unipluginLog('getSampleList: ' + JSON.stringify(err));
                        reject(new Error("示例获取失败"));
                    },
                });
            });
        },

        // MARK 重复校验
        checkRepeat(shareData: Share): boolean {
            return this.cardList.find((e: Share) => e.url === shareData.url || e.id === shareData.id) ? true : false;
        },
    },
});