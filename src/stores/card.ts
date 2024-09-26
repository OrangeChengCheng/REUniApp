/*
 * @Author: Lemon C
 * @Date: 2024-09-13 15:14:00
 * @LastEditTime: 2024-09-26 17:48:58
 */
import { defineStore } from 'pinia'
import { type Share } from '@/types/class';


export const useCardStore = defineStore('card', {
    state: (): { cardList: Share[], sample_cardList: Share[] } => ({
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
                find.worldCRS = shareData.worldCRS;
                this.saveToLocalStorage();
            }
        },
        getCardList(search?: string) {
            if (search) {
                return this.cardList.filter((e: Share) => e.projName.includes(search));
            } else {
                return this.cardList;
            }
        },
        addCollect(shareData: Share, coollect: boolean) {
            let find = this.cardList.find((e: Share) => e.url === shareData.url || e.id === shareData.id);
            if (find) {
                find.collect = coollect;
            }
            this.saveToLocalStorage();
        },
        getCollectCardList(search?: string) {
            if (search) {
                return this.cardList.filter((e: Share) => e.collect === true && e.projName.includes(search));
            } else {
                return this.cardList.filter((e: Share) => e.collect === true);
            }
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
        updateSample(e: any) {
            let sampleCardList_json = JSON.stringify(e);
            let sampleCardList_obj = JSON.parse(sampleCardList_json);
            this.sample_cardList = sampleCardList_obj;
            uni.setStorageSync('RE_sample_cardList', JSON.stringify(this.sample_cardList));
        },

        // MARK 重复校验
        checkRepeat(shareData: Share): boolean {
            return this.cardList.find((e: Share) => e.url === shareData.url || e.id === shareData.id) ? true : false;
        },
    },
});