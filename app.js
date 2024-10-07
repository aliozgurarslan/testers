new Vue({
    el: '#app',
    data: {
        items: ["Kırmızı", "Beyaz", "Turuncu", "Pembe", "Ak", "Galata", "Kervan", "Ayvan", "Kuru", "Açık", "Düz", "Mavi", "Vakı", "Şavap", "Kovuk", "Biva"],
        shuffledItems: [],
        correctGroups: [
            ["Kırmızı", "Beyaz", "Turuncu", "Pembe"],
            ["Ak", "Galata", "Kervan", "Ayvan"],
            ["Kuru", "Açık", "Düz", "Mavi"],
            ["Vakı", "Şavap", "Kovuk", "Biva"]
        ],
        correctGroupMessages: [
            "Şarap çeşitleri",
            "____saray",
            "Sözdizimsel yinelemelerinde kendinde olmayan bir harf ile belirenler",
            "R'leri söyleyemeyen insanların içecek siparişleri"
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

            let currentGuess = this.selectedItems.sort().toString();
            if (this.previousGuesses.includes(currentGuess)) {
                this.wrongGuessMessage = 'Bu tahmini zaten yaptınız.';
                this.selectedItems = [];
                return;
            }

            this.previousGuesses.push(currentGuess);
            let isCorrect = this.correctGroups.some(group => {
                return group.sort().toString() === currentGuess;
            });

            if (isCorrect) {
                this.correctItems.push(...this.selectedItems);
                if (this.correctItems.length === this.items.length) {
                    this.successMessage = "Tebrikler! Duvarı yendiniz! Her gün yeni bir duvar.";
                }
                this.wrongGuessMessage = "";
            } else {
                this.wrongGuessItems = [...this.selectedItems];
                this.wrongGuessMessage = "Yanlış tahmin!";
                this.isWrong = true;
                setTimeout(() => {
                    this.isWrong = false;
                    this.wrongGuessItems = [];
                }, 3000);
                this.attemptsLeft--;
                if (this.attemptsLeft === 0) {
                    this.gameOverMessage = 'Bugün duvar galip geldi! Her gün yeni bir duvar.';
                    this.revealAllGroups();
                }
            }

            this.selectedItems = [];
            this.storeGameState();
        },
        shuffleItems() {
            this.shuffledItems = [...this.items].sort(() => Math.random() - 0.5);
            this.storeGameState();
        },
        deselectAll() {
            this.selectedItems = [];
        },
        revealAllGroups() {
            this.correctGroups.forEach(group => {
                if (group.some(item => !this.correctItems.includes(item))) {
                    this.correctItems.push(...group);
                }
            });
        },
        storeGameState() {
            localStorage.setItem('gameState', JSON.stringify({
                correctItems: this.correctItems,
                selectedItems: this.selectedItems,
                previousGuesses: this.previousGuesses,
                attemptsLeft: this.attemptsLeft,
                wrongGuessMessage: this.wrongGuessMessage,
                nearMissMessage: this.nearMissMessage,
                successMessage: this.successMessage,
                gameOverMessage: this.gameOverMessage,
                shuffledItems: this.shuffledItems
            }));
        },
        checkIfPlayedToday() {
            const gameState = JSON.parse(localStorage.getItem('gameState'));
            if (gameState) {
                this.correctItems = gameState.correctItems;
                this.selectedItems = gameState.selectedItems,
                this.previousGuesses = gameState.previousGuesses;
                this.attemptsLeft = gameState.attemptsLeft;
                this.wrongGuessMessage = gameState.wrongGuessMessage;
                this.nearMissMessage = gameState.nearMissMessage;
                this.successMessage = gameState.successMessage;
                this.gameOverMessage = gameState.gameOverMessage;
                this.shuffledItems = gameState.shuffledItems;
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
