// 状態
const state = {
    enableTakeOver: false,
    text: ""
};

// テキストの整形処理
function getConvertedText(text) {
    text = text.replace(/-[ \n]/g, ''); // 単語の分裂を修正
    text = text.replace(/\n/g, ' '); // 改行を空白へ変換
    text = text.replace(/[ ]+/g, ' '); // 冗長な空白を削除
    text = text.replace(/Fig\./g, 'Fig'); // Fig. -> Fig
    text = text.replace(/et al\./g, 'et al'); // et al. -> et al
    text = text.replace(/e\.g\. /g, 'e.g., '); // e.g. -> e.g.,
    text = text.replace(/i\.e\. /g, 'i.e., '); // i.e. -> i.e.,
    text = text.replace(/([0-9]+)[ ]*\.[ ]*([0-9]+)/g, '$1.$2'); // 12 . 34 -> 12.34
    text = text.replace(/\.[ ]+/g, '.\n'); // ピリオド後の空白を改行へ変換
    return text;
}

// 英語から日本語へ翻訳
function getTranslatedData(sentence) {
    let data = {
        text: sentence,     // 翻訳対象(英文)
        source: "en",       // 英語
        target: "ja"        // 日本語
    };
    data = {
        url: "https://script.google.com/macros/s/AKfycbzzNETfBv_sIEe7WKO6t5jk0JIBLYwkxOMtNbjNs3uhruHjAMal/exec",
        dataType: "json",
        type: "GET",
        data: data
    };
    return $.ajax(data);
}

// 翻訳結果をスレッドへ表示
function printResult(source, target) {
    // センテンスのCSS
    const childStyle = 'font-size: 14px; margin: 10px;';
    // 翻訳前(英語)の段落
    const sourceContent = `<p style="${childStyle}">${source}</p>`;
    // 翻訳後(日本語)の段落
    const targetContent = `<p style="${childStyle}">${target}</p>`;
    // コンテナのCSS
    const parentStyle = 'border: 2px solid #AAAAAA; margin: 10px;';
    // 英文＋和文を含むコンテナ
    const parentContent = `<li style="${parentStyle}">${sourceContent}${targetContent}</li>`;
    // コンテナをスレッドへ追加
    $('.sc-comment-stream-threads').append(parentContent);
}

// 文章の翻訳
function translate(sentences) {
    // センテンスの数が1つの場合は空文字を追加
    if (sentences.length === 1) sentences.push('');
    // センテンスの数が一定以上の場合は処理を中断
    if (sentences.length > 20) {
        alert("Too many sentences.");
        return;
    }
    // それぞれのセンテンスを翻訳してリストへ格納
    let outputList = [];
    for(let i = 0; i < sentences.length; i++) {
        const data = getTranslatedData(sentences[i]);
        outputList.push(data);
    }
    // 翻訳処理が全て完了した時点で結果をスレッドへ表示
    $.when.apply($, outputList).done(function() {
        // スレッドの内容を空にする
        $('.sc-comment-stream-threads').empty();
        for(let i = 0; i < arguments.length; i++) {
            // 翻訳に失敗したセンテンスはスキップ
            if (arguments[i][0].code !== 200) continue;
            // センテンスの表示処理
            const text = arguments[i][0].text;
            printResult(sentences[i], text);
        }
    });
}

// マウスダウンイベント
$('body').on('mousedown', (e) => {
    // PDF外の場合はスキップ
    const classList = e.target.parentNode.classList;
    if (!classList.contains('_3ndj83M4eq')) return;
    startTime = performance.now();
});

// マウスアップイベント
$('body').on('mouseup', (e) => {
    // PDF外の場合はスキップ
    const classList = e.target.parentNode.classList;
    if (!classList.contains('_3ndj83M4eq')) return;
    // マウスダウンの時間が一定未満の場合はスキップ
    const endTime = performance.now();
    if (endTime - startTime < 100) return;
    // 選択中の文章を取得
    let selectedText = window.getSelection().toString();
    if (state.enableTakeOver) selectedText = state.text + ' ' + selectedText;
    // 文章の整形
    const convertedText = getConvertedText(selectedText);
    if (state.enableTakeOver) state.text = convertedText;
    // 文章が空の場合はスキップ
    if (convertedText === '') return;
    // アノテーションボタンを非表示
    $('.sc-add-annotation-highlight-button').hide();
    // 文章からセンテンスの配列へ変換
    let sentences = convertedText.split('\n');
    translate(sentences);
});

// キーダウンイベント
$('body').on('keydown', (e) => {
    // フォーカスされている場合は中断
    if ($(':focus').length > 0) return;
    // Enterキーでテキスト保持/解除
    if (e.keyCode === 13) {
        if (state.enableTakeOver) {
            state.enableTakeOver = false;
            alert("Disable translation by taking over text.");
        }
        else {
            state.enableTakeOver = true;
            alert("Enable translation by taking over text.");
        }
        state.text = "";
    }
    // 左キーでページアップ
    if (e.keyCode === 37) {
        $('[data-test="page-up"]').click();
        $(':focus').blur();
    }
    // 右キーでページダウン
    if (e.keyCode === 39) {
        $('[data-test="page-down"]').click();
        $(':focus').blur();
    }
});

// オブザーバー
const observer = new MutationObserver(() => {
    // サジェスト非表示
    $('.sc-suggested-comments').hide();
});
const target = window.document;
const config = {childList: true, subtree: true};
observer.observe(target, config);
