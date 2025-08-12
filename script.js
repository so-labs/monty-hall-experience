// ==========================================================
// HTML要素の取得
// ==========================================================
// 'message' IDを持つ<p>要素を取得。ゲームの進行状況をユーザーに伝えるメッセージを表示するのに使う。
const messageElement = document.getElementById('message');
// 'numDoors' IDを持つ<select>要素を取得。ドアの数を選択するためのプルダウンメニュー。
const numDoorsSelect = document.getElementById('numDoors');
// 'doorButtons' IDを持つ<div>要素を取得。ここにドアのボタンが動的に生成される。
const doorButtonsContainer = document.getElementById('doorButtons');
// 'resetDoorsButton' IDを持つ<button>要素を取得。統計データをリセットするボタン。
const resetButton = document.getElementById('resetDoorsButton');

// ==========================================================
// ゲームの状態を管理する変数
// ==========================================================
// ドアの番号（1, 2, 3...）を格納する配列。ゲームのロジックで使われる。
let doors = [];
// 正解のドアの番号を格納する変数。
let correctDoor = 0;
// プレイヤーが最初に選んだドアの番号を格納する変数。
let playerChoice = 0;
// 司会者が開けるドアの番号を格納する変数。
let hostOpenDoor = 0;
// ゲームのフェーズ（段階）を管理する変数。
// 'initial': 最初の選択
// 'final': 最終的な選択
// 'end': ゲーム終了
let gamePhase = 'initial';

// ==========================================================
// 統計データを管理する変数
// ==========================================================
// 選択を変えなかった場合の勝利数をカウント。
let stayWins = 0;
// 選択を変えた場合の勝利数をカウント。
let switchWins = 0;
// 選択を変えなかった場合の試行回数をカウント。
let stayTrials = 0;
// 選択を変えた場合の試行回数をカウント。
let switchTrials = 0;

// ==========================================================
// ページの初期化
// ==========================================================
window.onload = () => {
    // プルダウンメニューのオプションを動的に生成する関数を呼び出す
    generateNumDoorsOptions();
    
    // ドア数のプルダウンメニューの初期値を3に設定。
    numDoorsSelect.value = 3;
    // 選択されたドアの数で、ドアボタンを生成する。
    generateDoors(parseInt(numDoorsSelect.value));
    // ゲームの状態を初期化する。
    resetGame();
    // 画面上の統計情報を初期化して表示する。
    updateResults();
};

// ==========================================================
// イベントリスナーの設定
// ==========================================================
// ドアの数を選択するプルダウンが変更されたときの処理。
numDoorsSelect.addEventListener('change', (event) => {
    // 変更されたドアの数を取得し、整数に変換して定数に代入。
    const newNumDoors = parseInt(event.target.value);
    // 新しいドアの数でドアを再生成。
    generateDoors(newNumDoors);
    // ゲームをリセットし、統計データも一緒にリセットする（引数にtrueを渡す）。
    resetGame(true);
});
// 統計リセットボタンがクリックされたときの処理。
resetButton.addEventListener('click', () => {
    // ゲームをリセットし、統計データも一緒にリセットする。
    resetGame(true);
});

// ==========================================================
// ドアの動的生成
// ==========================================================
// 指定された数のドアボタンを動的に生成する関数。
function generateDoors(num) {
    // 既存のドアボタンをすべてクリアする。
    doorButtonsContainer.innerHTML = '';
    // ドアの番号を格納する配列を新しく作成する（例: num=3の場合、[1, 2, 3]）。
    doors = Array.from({ length: num }, (_, i) => i + 1);

    // 指定された数だけループしてドアボタンを作成。
    for (let i = 1; i <= num; i++) {
        // ドアのコンテナとなる<div>要素を作成。
        const doorContainer = document.createElement('div');
        // 各ドアに一意のIDを設定する（例: 'door1', 'door2'）。
        doorContainer.id = `door${i}`;
        // CSSクラスを追加してスタイルを適用する。
        doorContainer.classList.add('door');

        // ドアの画像となる<img>要素を作成。
        const doorImage = document.createElement('img');
        // 画像のパスを設定。
        doorImage.src = 'images/door.svg';
        // 画像の代替テキストを設定。
        doorImage.alt = `ドア${i}`;
        
        // ドアの番号を表示する<p>要素を作成。
        const doorLabel = document.createElement('p');
        // ドアのテキストを設定。
        doorLabel.textContent = `ドア${i}`;

        // ドアコンテナに画像とラベルを追加。
        doorContainer.appendChild(doorImage);
        doorContainer.appendChild(doorLabel);
        // ドアがクリックされたときにhandleDoorClick関数が実行されるように設定。
        doorContainer.addEventListener('click', () => handleDoorClick(i));
        // 作成したドアをHTMLに追加する。
        doorButtonsContainer.appendChild(doorContainer);
    }
}

// ==========================================================
// プルダウンのオプションを生成
// ==========================================================
// ドアの数を選択するためのプルダウンメニューの選択肢を動的に生成する関数。
function generateNumDoorsOptions() {
    // 最小のドア数を定数として定義。
    const minDoors = 3;
    // 最大のドア数を定数として定義。
    const maxDoors = 9;

    // minDoorsからmaxDoorsまでの数値をiとしてループを回す。
    for (let i = minDoors; i <= maxDoors; i++) {
        // 新しい <option> HTML要素をメモリ上に作成する。
        const option = document.createElement('option');
        
        // 作成した <option> 要素の value 属性に、現在の i の値を設定する。
        // （例: <option value="3">）
        option.value = i;
        
        // <option> 要素に表示されるテキストに、現在の i の値を設定する。
        // （例: <option>3</option>）
        option.textContent = i;
        
        // numDoorsSelect（<select>要素）の子要素として、作成した <option> を追加する。
        // これにより、HTML上でプルダウンの選択肢として表示される。
        numDoorsSelect.appendChild(option);
    }
}

// ==========================================================
// ゲームのリセット
// ==========================================================
// ゲームの状態を初期化する関数。resetStatsがtrueの場合は統計データもリセット。
function resetGame(resetStats = false) {
    // 正解のドアをランダムに決定する。
    correctDoor = Math.floor(Math.random() * doors.length) + 1;
    // プレイヤーの選択、司会者の選択をリセット。
    playerChoice = 0;
    hostOpenDoor = 0;
    // ゲームフェーズを最初の状態に戻す。
    gamePhase = 'initial';
    // 画面上のメッセージを初期状態に戻す。
    messageElement.textContent = 'ドアを選んでください。';

    // すべてのドア要素を取得する。
    const allDoors = document.querySelectorAll('#doorButtons .door');
    // すべてのドアに対してループを実行。
    allDoors.forEach(door => {
        // ドアの中にある画像要素を取得。
        const img = door.querySelector('img');
        // 画像がある場合、初期のドア画像に戻す。
        if (img) {
            img.src = 'images/door.svg';
        }
        // ドアのクラスをすべて削除し、初期状態のスタイルに戻す。
        door.classList.remove('opened', 'correct', 'wrong', 'disabled', 'selected');
    });

    // 引数resetStatsがtrueの場合、統計データをリセット。
    if (resetStats) {
        stayWins = 0;
        switchWins = 0;
        stayTrials = 0;
        switchTrials = 0;
    }

    // 以前の「もう一度！」ボタンがあれば削除する。
    const existingPlayAgainButton = messageElement.querySelector('button');
    if (existingPlayAgainButton) {
        messageElement.removeChild(existingPlayAgainButton);
    }
    // 統計情報を画面に反映する。
    updateResults();
}

// ==========================================================
// 司会者が開けるドアの決定
// ==========================================================
// 司会者が開けるドアの番号を決定して返す関数。
function getHostOpenDoor(doors, correctDoor, playerChoice) {
    // 正解のドアとプレイヤーが選んだドアを除外した新しい配列を作成する。
    const possibleHostOpenDoors = doors.filter(door => door !== correctDoor && door !== playerChoice);
    // 残ったドアの中からランダムに一つ選ぶ。
    const randomIndex = Math.floor(Math.random() * possibleHostOpenDoors.length);
    // 選ばれたドアの番号を返す。
    return possibleHostOpenDoors[randomIndex];
}

// ==========================================================
// ドアクリック時の処理
// ==========================================================
// ドアがクリックされたときに実行される関数。
function handleDoorClick(doorNumber) {
    // クリックされたドアのHTML要素を取得。
    const clickedDoor = document.getElementById(`door${doorNumber}`);
    
    // ドアがすでに開いているか、無効な状態であれば何もしない。
    if (clickedDoor.classList.contains('opened') || clickedDoor.classList.contains('disabled')) {
        return;
    }

    // ゲームフェーズが最初の選択段階（initial）の場合。
    if (gamePhase === 'initial') {
        // プレイヤーの選択を記録。
        playerChoice = doorNumber;
        // メッセージを更新。
        messageElement.textContent = `ドア${playerChoice}を選びました。`;
        
        // すべてのドアを取得。
        const allDoors = document.querySelectorAll('#doorButtons .door');
        // プレイヤーが選んでいないドアを無効にする。
        allDoors.forEach(door => {
            if (door.id !== `door${playerChoice}`) {
                door.classList.add('disabled');
            }
        });
        
        // 選択されたドアにスタイルを適用。
        const selectedDoor = document.getElementById(`door${doorNumber}`);
        if (selectedDoor) {
            selectedDoor.classList.add('selected');
        }

        // 司会者が開けるドアを決定。
        hostOpenDoor = getHostOpenDoor(doors, correctDoor, playerChoice);

        // 司会者が開けるドアのHTML要素を取得。
        const hostOpenDoorButton = document.getElementById(`door${hostOpenDoor}`);
        if (hostOpenDoorButton) {
            // ドアの画像をヤギの画像に変更。
            const img = hostOpenDoorButton.querySelector('img');
            if (img) {
                img.src = 'images/bucket.svg';
            }
            // ドアに'opened'クラスを追加して開いた状態にする。
            hostOpenDoorButton.classList.add('opened');
        }

        // 司会者が開けたドアとプレイヤーが選んだドア以外を有効に戻す。
        allDoors.forEach(door => {
            if (door.id !== `door${hostOpenDoor}` && door.id !== `door${playerChoice}`) {
                door.classList.remove('disabled');
            }
        });

        // メッセージを更新して、最終選択を促す。
        messageElement.textContent = `ドア${hostOpenDoor}が開きました。ドア${playerChoice}のままとしますか？ それとも変更しますか？`;
        // ゲームフェーズを最終選択段階に変更。
        gamePhase = 'final';

    // ゲームフェーズが最終選択段階（final）の場合。
    } else if (gamePhase === 'final') {
        // プレイヤーの最終的な選択を記録。
        let finalChoice = doorNumber;
        // 最初の選択と同じかどうかを判定。
        let isStay = (finalChoice === playerChoice);

        // 統計情報を更新。
        if (isStay) {
            stayTrials++;
        } else {
            switchTrials++;
        }

        // 最終選択したドアと正解のドアのHTML要素を取得。
        const finalChoiceDoor = document.getElementById(`door${finalChoice}`);
        const correctDoorElement = document.getElementById(`door${correctDoor}`);

        // 各ドア内の画像要素を取得。
        const finalChoiceImg = finalChoiceDoor.querySelector('img');
        const correctDoorImg = correctDoorElement.querySelector('img');

        // 最終選択が正解の場合。
        if (finalChoice === correctDoor) {
            messageElement.textContent = `正解です！あなたの勝ちです！`;
            // 選んだドアの画像を車に変更。
            if (finalChoiceImg) {
                finalChoiceImg.src = 'images/car.svg';
            }
            // 正解のスタイルを適用。
            finalChoiceDoor.classList.add('correct');
            // 統計を更新。
            if (isStay) {
                stayWins++;
            } else {
                switchWins++;
            }
        // 最終選択が不正解の場合。
        } else {
            messageElement.textContent = `残念、ハズレです。正解はドア${correctDoor}でした。`;
            // 選んだドアの画像をヤギに変更。
            if (finalChoiceImg) {
                finalChoiceImg.src = 'images/bucket.svg';
            }
            // 不正解のスタイルを適用。
            finalChoiceDoor.classList.add('wrong');
            // 正解のドアを車の画像に変更して表示。
            if (correctDoorImg) {
                correctDoorImg.src = 'images/car.svg';
            }
            correctDoorElement.classList.add('correct');
        }

        // 統計情報を画面に反映。
        updateResults();

        // ゲームフェーズを終了状態に変更。
        gamePhase = 'end';

        // すべてのドアをクリックできないようにする。
        const allDoors = document.querySelectorAll('#doorButtons .door');
        allDoors.forEach(door => {
            door.classList.add('disabled');
        });

        // 「もう一度！」ボタンを作成し、メッセージエリアに追加。
        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = 'もう一度！';
        // クリックしたらゲームをリセットする。
        playAgainButton.onclick = () => {
            resetGame();
        };
        messageElement.appendChild(playAgainButton);
    }
}

// ==========================================================
// 統計情報の更新
// ==========================================================
// 結果を更新して画面に表示する関数。
function updateResults() {
    // 統計データから合計試行回数を計算。
    const totalTrials = stayTrials + switchTrials;
    // 選択を変えなかった場合の勝率を計算。0で割るのを避けるために三項演算子を使用。
    const stayWinRate = stayTrials > 0 ? (stayWins / stayTrials) * 100 : 0;
    // 選択を変えた場合の勝率を計算。
    const switchWinRate = switchTrials > 0 ? (switchWins / switchTrials) * 100 : 0;

    // HTMLの要素に計算した値を設定。
    document.getElementById('totalTrials').textContent = `${totalTrials}回 (変更なし: ${stayTrials}回 / 変更: ${switchTrials}回)`;
    // 小数点以下2桁に丸めて表示。
    document.getElementById('stayWinRate').textContent = stayWinRate.toFixed(2);
    document.getElementById('switchWinRate').textContent = switchWinRate.toFixed(2);
}