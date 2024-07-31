new Vue({
    el: '#app',
    data: {
        items: [
            "Çember", "Tam", "Keçi", "Top",
            "Çeşitlilik", "Tehlike", "Sfer", "Mühendislik",
            "Ardıç", "Hepileri", "Akyürek", "Günaydın",
            "Topuz", "Kılıç", "Mızrak", "Pala"
        ],
        shuffledItems: [],
        correctGroups: [
            ["Çember", "Tam", "Keçi", "Top"],
            ["Sfer", "Tehlike", "Çeşitlilik", "Mühendislik"],
            ["Ardıç", "Hepileri", "Akyürek", "Günaydın"],
            ["Topuz", "Kılıç", "Mızrak", "Pala"]
        ],
        correctGroupMessages: [
             "Sakal tipleri",
            "Biyo_____",
            "Tanınmış Engin'ler",
            "İlkel silahlar"
        ],
        correctItems: [],
        selectedItems: [],
        previousGuesses: [],
        attemptsLeft: 4,
        wrongGuessMessage: "",
        nearMissMessage: "",
        successMessage: "",
        gameOverMessage: "",
        isWrong: false,
        wrongGuessItems: [],
        correctGuessOrder: [], // New property to keep track of correct guess order
        showCookieConsent: true
    },
    created() {
        this.checkIfPlayedToday();
        if (this.shuffledItems.length === 0) {
            this.shuffleItems();
        }
        if (localStorage.getItem('cookieConsent')) {
            this.showCookieConsent = false;
        }
    },
    computed: {
        remainingItems() {
            return this.shuffledItems.filter(item => !this.correctItems.includes(item));
        },
        correctGroupsWithMessages() {
            let groupsWithMessages = [];
            for (let i = 0; i < this.correctGuessOrder.length; i++) {
                let groupIndex = this.correctGuessOrder[i];
                let groupItems = this.correctGroups[groupIndex];
                if (groupItems.every(item => this.correctItems.includes(item))) {
                    groupsWithMessages.push({
                        items: groupItems,
                        message: this.correctGroupMessages[groupIndex]
                    });
                }
            }
            return groupsWithMessages;
        }
    },
    methods: {
        toggleSelection(item) {
            if (this.selectedItems.includes(item)) {
                this.selectedItems = this.selectedItems.filter(i => i !== item);
            } else {
                if (this.selectedItems.length < 4) {
                    this.selectedItems.push(item);
                }
            }
        },
        checkResults() {
            if (this.selectedItems.length !== 4) {
                this.wrongGuessMessage = 'Lütfen dört öğe seçin.';
                return;
            }

            let currentGuess = [...this.selectedItems].sort().toString();
            if (this.previousGuesses.includes(currentGuess)) {
                this.wrongGuessMessage = 'Bu tahmini zaten yaptınız.';
                this.selectedItems = [];
                return;
            }

            this.previousGuesses.push(currentGuess);

            let correctGroupIndex = this.correctGroups.findIndex(group => {
                return this.arraysEqual(group.sort(), this.selectedItems.sort());
            });

            if (correctGroupIndex !== -1) {
                this.correctItems.push(...this.selectedItems);
                this.correctGuessOrder.push(correctGroupIndex); // Push the correct guess order
                this.wrongGuessMessage = "";
                this.nearMissMessage = "";
                if (this.correctItems.length === this.items.length) {
                    this.successMessage = "Tebrikler! Duvarı yendiniz! Her gün yeni bir duvar.";
                }
                this.storeGameState();
            } else {
                this.wrongGuessItems = [...this.selectedItems];
                this.wrongGuessMessage = "Yanlış tahmin!";
                this.isWrong = true;
                setTimeout(() => {
                    this.isWrong = false;
                    this.wrongGuessItems = [];
                }, 3000);
                this.attemptsLeft--;

                // Check for near miss
                let nearMiss = this.correctGroups.some(group => {
                    let intersection = group.filter(item => this.selectedItems.includes(item));
                    return intersection.length === 3;
                });
                if (nearMiss) {
                    this.nearMissMessage = "Bir yaklaşık!";
                } else {
                    this.nearMissMessage = "";
                }

                if (this.attemptsLeft === 0) {
                    this.revealAllGroups();
                    this.gameOverMessage = 'Bugün duvar galip geldi! Her gün yeni bir duvar.';
                }
                this.storeGameState();
            }

            this.selectedItems = [];
        },
        arraysEqual(a, b) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        },
        shuffleItems() {
            this.shuffledItems = [...this.items].sort(() => Math.random() - 0.5);
            this.storeGameState();
        },
        deselectAll() {
            this.selectedItems = [];
        },
        revealAllGroups() {
            for (let i = 0; i < this.correctGroups.length; i++) {
                let groupItems = this.correctGroups[i];
                if (!groupItems.every(item => this.correctItems.includes(item))) {
                    this.correctItems.push(...groupItems);
                }
            }
        },
        storeGameState() {
            localStorage.setItem('playedToday', true);
            localStorage.setItem('gameState', JSON.stringify({
                correctItems: this.correctItems,
                selectedItems: this.selectedItems,
                previousGuesses: this.previousGuesses,
                attemptsLeft: this.attemptsLeft,
                wrongGuessMessage: this.wrongGuessMessage,
                nearMissMessage: this.nearMissMessage,
                successMessage: this.successMessage,
                gameOverMessage: this.gameOverMessage,
                shuffledItems: this.shuffledItems,
                correctGuessOrder: this.correctGuessOrder // Store correct guess order
            }));
        },
        checkIfPlayedToday() {
            const playedToday = localStorage.getItem('playedToday');
            const gameState = JSON.parse(localStorage.getItem('gameState'));
            if (playedToday && gameState) {
                this.correctItems = gameState.correctItems;
                this.selectedItems = gameState.selectedItems;
                this.previousGuesses = gameState.previousGuesses;
                this.attemptsLeft = gameState.attemptsLeft;
                this.wrongGuessMessage = gameState.wrongGuessMessage;
                this.nearMissMessage = gameState.nearMissMessage;
                this.successMessage = gameState.successMessage;
                this.gameOverMessage = gameState.gameOverMessage;
                this.shuffledItems = gameState.shuffledItems || this.items;
                this.correctGuessOrder = gameState.correctGuessOrder || []; // Retrieve correct guess order
            } else {
                this.shuffleItems();
            }
        },
        acceptCookies() {
            this.showCookieConsent = false;
            localStorage.setItem('cookieConsent', true);
        }
    }
});
