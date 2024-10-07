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
        correctGroupMessages: ["Şarap çeşitleri", "____saray", "Sözdizimsel yinelenmelerinde kendinde olmayan bir harf ile belirlenenler", "R'leri söyleyemeyen insanların içecek siparişleri"],
        correctItems: [],
        selectedItems: [],
        previousGuesses: [],
        attemptsLeft: 4,
        wrongGuessMessage: "",
        nearMissMessage: "",
        successMessage: "",
        gameOverMessage: "",
        isWrong: false,
        wrongGuessItems: []
    },
    created() {
        this.shuffleItems();
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
        },
        shuffleItems() {
            this.shuffledItems = [...this.items].sort(() => Math.random() - 0.5);
        },
        revealAllGroups() {
            this.correctGroups.forEach(group => {
                if (group.some(item => !this.correctItems.includes(item))) {
                    this.correctItems.push(...group);
                }
            });
        },
        deselectAll() {
            this.selectedItems = [];
        }
    }
});
