/*
 * @Author: Lemon C
 * @Date: 2024-09-13 15:14:00
 * @LastEditTime: 2024-09-24 14:05:41
 */
import { defineStore } from 'pinia'
import { type Share } from '@/types/class';


export const useCardStore = defineStore('card', {
    state: (): { cardList: Share[], collect_cardList: Share[] } => ({
        cardList: JSON.parse(uni.getStorageSync('RE_cardList') || '[]') || [],
        collect_cardList: [],
    }),
    actions: {
        addCard(shareData: Share) {
            if (this.checkRepeat(shareData)) {
                return;
            }
            this.cardList.push(shareData);
            this.saveToLocalStorage();
        },
        getCardList() {
            return this.cardList;
        },
        addCollect(shareData: Share, coollect: boolean) {
            let find = this.cardList.find((e: Share) => e.url === shareData.url || e.id === shareData.id);
            if (find) {
                find.collect = coollect;
            }
            this.saveToLocalStorage();
        },
        getCollectCardList() {
            return this.cardList.filter((e: Share) => e.collect === true);
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
        searchCard(search: string) {
            let findList = this.cardList.filter((e: Share) => e.projName.includes(search));
            return findList;
        },

        // MARK 重复校验
        checkRepeat(shareData: Share): boolean {
            return this.cardList.find((e: Share) => e.url === shareData.url || e.id === shareData.id) ? true : false;
        },
    },
});