// HTML要素の取得
const messageElement = document.getElementById('message');
const numDoorsSelect = document.getElementById('numDoors');
const doorButtonsContainer = document.getElementById('doorButtons');
const resetButton = document.getElementById('resetDoorsButton');

// ゲームの状態を管理する変数
let doors = [];
let correctDoor = 0;
let playerChoice = 0;
let hostOpenDoor = 0;
let gamePhase = 'initial'; // 'initial', 'final'

// 統計データを管理する変数
let stayWins = 0;
let switchWins = 0;
let stayTrials = 0;
let switchTrials = 0;

// ページが読み込まれたときにゲームを初期化
window.onload = () => {
    numDoorsSelect.value = 3;
    generateDoors(parseInt(numDoorsSelect.value));
    resetGame();
    updateResults();
};

// ドアの数を変更するイベントリスナー
numDoorsSelect.addEventListener('change', (event) => {
    const newNumDoors = parseInt(event.target.value);
    generateDoors(newNumDoors);
    resetGame(true);
});

// 統計リセットボタンのイベントリスナー
resetButton.addEventListener('click', () => {
    resetGame(true);
});

// 指定された数のドアボタンを動的に生成する関数
function generateDoors(num) {
    doorButtonsContainer.innerHTML = '';
    doors = Array.from({ length: num }, (_, i) => i + 1);

    for (let i = 1; i <= num; i++) {
        const doorContainer = document.createElement('div');
        doorContainer.id = `door${i}`;
        doorContainer.classList.add('door');

        const doorImage = document.createElement('img');
        doorImage.src = 'images/door.svg';
        doorImage.alt = `ドア${i}`;
        
        const doorLabel = document.createElement('p');
        doorLabel.textContent = `ドア${i}`;

        doorContainer.appendChild(doorImage);
        doorContainer.appendChild(doorLabel);
        doorContainer.addEventListener('click', () => handleDoorClick(i));
        doorButtonsContainer.appendChild(doorContainer);
    }
}

// ゲームの状態を初期化する関数
function resetGame(resetStats = false) {
    correctDoor = Math.floor(Math.random() * doors.length) + 1;
    playerChoice = 0;
    hostOpenDoor = 0;
    gamePhase = 'initial';
    messageElement.textContent = 'ドアを選んでください。';

    const allDoors = document.querySelectorAll('#doorButtons .door');
    allDoors.forEach(door => {
        const img = door.querySelector('img');
        if (img) {
            img.src = 'images/door.svg';
        }
        door.classList.remove('opened', 'correct', 'wrong', 'disabled', 'selected');
    });

    if (resetStats) {
        stayWins = 0;
        switchWins = 0;
        stayTrials = 0;
        switchTrials = 0;
    }

    const existingPlayAgainButton = messageElement.querySelector('button');
    if (existingPlayAgainButton) {
        messageElement.removeChild(existingPlayAgainButton);
    }
    updateResults();
}

// 司会者が開けるドアを決定する関数
function getHostOpenDoor(doors, correctDoor, playerChoice) {
    const possibleHostOpenDoors = doors.filter(door => door !== correctDoor && door !== playerChoice);
    const randomIndex = Math.floor(Math.random() * possibleHostOpenDoors.length);
    return possibleHostOpenDoors[randomIndex];
}

// ドアをクリックしたときの処理
function handleDoorClick(doorNumber) {
    const clickedDoor = document.getElementById(`door${doorNumber}`);
    
    if (clickedDoor.classList.contains('opened') || clickedDoor.classList.contains('disabled')) {
        return;
    }

    if (gamePhase === 'initial') {
        playerChoice = doorNumber;
        messageElement.textContent = `ドア${playerChoice}を選びました。`;
        
        const allDoors = document.querySelectorAll('#doorButtons .door');
        allDoors.forEach(door => {
            if (door.id !== `door${playerChoice}`) {
                door.classList.add('disabled');
            }
        });
        
        const selectedDoor = document.getElementById(`door${doorNumber}`);
        if (selectedDoor) {
            selectedDoor.classList.add('selected');
        }

        hostOpenDoor = getHostOpenDoor(doors, correctDoor, playerChoice);

        const hostOpenDoorButton = document.getElementById(`door${hostOpenDoor}`);
        if (hostOpenDoorButton) {
            const img = hostOpenDoorButton.querySelector('img');
            if (img) {
                img.src = 'images/bucket.svg';
            }
            hostOpenDoorButton.classList.add('opened');
        }

        allDoors.forEach(door => {
            if (door.id !== `door${hostOpenDoor}` && door.id !== `door${playerChoice}`) {
                door.classList.remove('disabled');
            }
        });

        messageElement.textContent = `ドア${hostOpenDoor}が開きました。ドア${playerChoice}のままとしますか？ それとも変更しますか？`;
        gamePhase = 'final';

    } else if (gamePhase === 'final') {
        let finalChoice = doorNumber;
        let isStay = (finalChoice === playerChoice);

        if (isStay) {
            stayTrials++;
        } else {
            switchTrials++;
        }

        const finalChoiceDoor = document.getElementById(`door${finalChoice}`);
        const correctDoorElement = document.getElementById(`door${correctDoor}`);

        const finalChoiceImg = finalChoiceDoor.querySelector('img');
        const correctDoorImg = correctDoorElement.querySelector('img');

        if (finalChoice === correctDoor) {
            messageElement.textContent = `正解です！あなたの勝ちです！`;
            if (finalChoiceImg) {
                finalChoiceImg.src = 'images/car.svg';
            }
            finalChoiceDoor.classList.add('correct');
            if (isStay) {
                stayWins++;
            } else {
                switchWins++;
            }
        } else {
            messageElement.textContent = `残念、ハズレです。正解はドア${correctDoor}でした。`;
            if (finalChoiceImg) {
                finalChoiceImg.src = 'images/bucket.svg';
            }
            finalChoiceDoor.classList.add('wrong');
            if (correctDoorImg) {
                correctDoorImg.src = 'images/car.svg';
            }
            correctDoorElement.classList.add('correct');
        }

        updateResults();

        gamePhase = 'end';

        const allDoors = document.querySelectorAll('#doorButtons .door');
        allDoors.forEach(door => {
            door.classList.add('disabled');
        });

        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = 'もう一度！';
        playAgainButton.onclick = () => {
            resetGame();
        };
        messageElement.appendChild(playAgainButton);
    }
}

// 結果を更新して画面に表示する関数
function updateResults() {
    const totalTrials = stayTrials + switchTrials;
    const stayWinRate = stayTrials > 0 ? (stayWins / stayTrials) * 100 : 0;
    const switchWinRate = switchTrials > 0 ? (switchWins / switchTrials) * 100 : 0;

    document.getElementById('totalTrials').textContent = totalTrials;
    document.getElementById('stayWinRate').textContent = stayWinRate.toFixed(2);
    document.getElementById('switchWinRate').textContent = switchWinRate.toFixed(2);
}