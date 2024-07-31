new Vue({
    el: '#app',
    data: {
        items: ["1921", "1924", "1961", "1982", "1960", "1971", "1980", "2016", "1920", "0912", "2019", "2901", "0001", "0010", "0011", "0100"],
        shuffledItems: [],
        correctGroups: [
            ["1921", "1924", "1961", "1982"],
            ["1960", "1971", "1980", "2016"],
            ["1920", "0912", "2019", "2901"],
            ["0001", "0010", "0011", "0100"]
        ],
        correctGroupMessages: [
            "20. yüzyıldaki anayasal gelişmeler",
            "Darbeler ve darbe girişimleri",
            "Sayısal anagramlar",
            "İkili sayı sisteminde 1'den 4'e kadar sayılar"
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
        showCookieConsent: true,
        guessedGroups: [] // Add this to keep track of guessed groups
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
            return this.guessedGroups;
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

            let isCorrect = this.correctGroups.some(group => {
                return this.arraysEqual(group.sort(), this.selectedItems.sort());
            });

            if (isCorrect) {
                this.correctItems.push(...this.selectedItems);
                this.guessedGroups.push({ items: [...this.selectedItems], message: this.getGroupMessage(this.selectedItems) }); // Track guessed groups
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
                guessedGroups: this.guessedGroups // Store guessed groups
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
                this.guessedGroups = gameState.guessedGroups || []; // Restore guessed groups
            } else {
                this.shuffleItems();
            }
        },
        getGroupMessage(selectedItems) {
            for (let i = 0; i < this.correctGroups.length; i++) {
                let group = this.correctGroups[i];
                if (this.arraysEqual(group.sort(), selectedItems.sort())) {
                    return this.correctGroupMessages[i];
                }
            }
            return "";
        },
        acceptCookies() {
            this.showCookieConsent = false;
            localStorage.setItem('cookieConsent', true);
        }
    }
});
