/*
 * @Author: Lemon C
 * @Date: 2024-09-13 15:14:00
 * @LastEditTime: 2024-09-23 18:02:23
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
        getSortedCardList() {
            return this.cardList;
        },
        saveToLocalStorage() {
            uni.setStorageSync('RE_cardList', JSON.stringify(this.cardList));
        },
        clearCardList() {
            this.cardList = [];
            this.saveToLocalStorage();
        },

        // MARK 重复校验
        checkRepeat(shareData: Share): boolean {
            return this.cardList.find((e: Share) => e.url === shareData.url || e.id === shareData.id) ? true : false;
        },
    },
});