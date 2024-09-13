/*
 * @Author: Lemon C
 * @Date: 2024-09-13 15:14:00
 * @LastEditTime: 2024-09-13 15:35:04
 */
import { defineStore } from 'pinia'


interface Card {
    shearUrl: string;
}

export const useCardStore = defineStore('card', {
    state: (): { cardList: Card[] } => ({
        cardList: JSON.parse(localStorage.getItem('RE_cardList') || '[]') || []
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
            localStorage.setItem('RE_cardList', JSON.stringify(this.cardList));
        },
        clearCardList() {
            this.cardList = [];
            this.saveToLocalStorage();
        },
    },
});