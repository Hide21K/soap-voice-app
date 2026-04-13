const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert('お使いのブラウザは音声認識に対応していません。Chromeなどの対応ブラウザをご使用ください。');
}

const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const convertBtn = document.getElementById('convert-btn');
const transcriptDisplay = document.getElementById('transcript-display');
const statusDiv = document.getElementById('status');

// SOAPリストの要素
const listS = document.getElementById('list-s');
const listO = document.getElementById('list-o');
const listA = document.getElementById('list-a');
const listP = document.getElementById('list-p');
const listU = document.getElementById('list-u');

let fullTranscriptList = []; // 確定した文のリスト
let isRecording = false;

if (recognition) {
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
        isRecording = true;
        startBtn.classList.add('recording');
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusDiv.innerText = '音声認識中... 話しかけてください';
    };

    recognition.onend = () => {
        isRecording = false;
        startBtn.classList.remove('recording');
        startBtn.disabled = false;
        stopBtn.disabled = true;
        statusDiv.innerText = '録音停止中';
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        statusDiv.innerText = `エラーが発生しました: ${event.error}`;
        isRecording = false;
        startBtn.classList.remove('recording');
        startBtn.disabled = false;
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                // 確定したテキストをリストに追加
                fullTranscriptList.push(transcript.trim());
            } else {
                interimTranscript += transcript;
            }
        }

        // 画面表示の更新
        const displayText = [...fullTranscriptList, interimTranscript].join('\n');
        transcriptDisplay.innerText = displayText;
        // 下端へスクロール
        transcriptDisplay.scrollTop = transcriptDisplay.scrollHeight;
    };
}

startBtn.addEventListener('click', () => {
    if (recognition && !isRecording) {
        recognition.start();
    }
});

stopBtn.addEventListener('click', () => {
    if (recognition && isRecording) {
        recognition.stop();
    }
});

const rules = {
    s: [/痛い/, /つらい/, /しびれる/, /だるい/, /動かしにくい/, /不安/, /眠れない/, /訴え/],
    o: [/ROM/, /MMT/, /度/, /cm/, /kg/, /mmHg/, /回/, /秒/, /歩行/, /握力/, /バイタル/, /腫脹/, /熱感/, /発赤/],
    a: [/考えられる/, /原因/, /問題/, /改善/, /低下/, /制限/, /リスク/, /評価/],
    p: [/プログラム/, /目標/, /実施/, /継続/, /指導/, /週/, /回/, /セット/, /退院/, /自主トレ/]
};

convertBtn.addEventListener('click', () => {
    // リストのクリア
    [listS, listO, listA, listP, listU].forEach(list => list.innerHTML = '');

    fullTranscriptList.forEach(sentence => {
        if (!sentence) return;

        let categorized = false;

        // 優先順位: S -> O -> A -> P
        if (rules.s.some(regex => regex.test(sentence))) {
            addToList(listS, sentence);
            categorized = true;
        } else if (rules.o.some(regex => regex.test(sentence))) {
            addToList(listO, sentence);
            categorized = true;
        } else if (rules.a.some(regex => regex.test(sentence))) {
            addToList(listA, sentence);
            categorized = true;
        } else if (rules.p.some(regex => regex.test(sentence))) {
            addToList(listP, sentence);
            categorized = true;
        }

        if (!categorized) {
            addToList(listU, sentence);
        }
    });

    // 変換完了後に結果セクションへスクロール
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
});

function addToList(listElement, text) {
    const li = document.createElement('li');
    li.innerText = text;
    listElement.appendChild(li);
}
