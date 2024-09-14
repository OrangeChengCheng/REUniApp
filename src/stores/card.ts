/*
 * @Author: Lemon C
 * @Date: 2024-09-13 15:14:00
 * @LastEditTime: 2024-09-14 15:13:18
 */
import { defineStore } from 'pinia'


interface Card {
    shearUrl: string;
}

export const useCardStore = defineStore('card', {
    state: (): { cardList: Card[] } => ({
        cardList: JSON.parse(uni.getStorageSync('RE_cardList') || '[]') || []
    }),
    actions: {
        addCard(shearUrl: string) {
            if (this.cardList.some((c) => c.shearUrl === shearUrl)) {
                return;
            }
            this.cardList.push({ shearUrl });
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
    },
});