// テキストの整形処理
function convertText(text) {
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

// 以前のセンテンス + 今回のセンテンス -> ローカルストレージへ保存
function setStorage(inSentences) {
    // 以前のセンテンス
    let localSentences = JSON.parse(localStorage.getItem('sentences'));
    // 以前のセンテンス + 今回のセンテンス
    let sentences = localSentences.concat(inSentences);
    // センテンスの最大数を指定数以下に制限
    const start = sentences.length - 20;
    if (start > 0) sentences = sentences.slice(start);
    // センテンスをローカルストレージへ保存
    localStorage.setItem('sentences', JSON.stringify(sentences));
}

// 英語から日本語へ翻訳
function getAjaxData(sentence) {
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
    return data;
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
        alert("Overflow Error!!");
        return;
    }
    // それぞれのセンテンスを翻訳してリストへ格納
    let outputList = [];
    for(let i = 0; i < sentences.length; i++) {
        const data = getAjaxData(sentences[i]);
        outputList.push($.ajax(data));
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

// ロード時
window.onload = () => {
    // ローカルストレージ内のセンテンスの初期化
    localStorage.setItem('sentences', JSON.stringify([]));
}

// マウスダウン時
$('body').on('mousedown', (e) => {
    // PDF外の場合はスキップ
    const classList = e.target.parentNode.classList;
    if (!classList.contains('_3ndj83M4eq')) return;
    startTime = performance.now();
});

// マウスアップ時
$('body').on('mouseup', (e) => {
    // PDF外の場合はスキップ
    const classList = e.target.parentNode.classList;
    if (!classList.contains('_3ndj83M4eq')) return;
    // マウスダウン〜マウスアップの時間が一定未満の場合はスキップ
    const endTime = performance.now();
    if (endTime - startTime < 100) return;
    // 選択中の文章を取得
    const selectedText = window.getSelection().toString();
    const convertedText = convertText(selectedText);
    // 文章が空の場合はスキップ
    if (convertedText === '') return;
    // アノテーションボタンを非表示
    $('.sc-add-annotation-highlight-button').hide();
    // 文章からセンテンスの配列へ変換
    let sentences = convertedText.split('\n');
    setStorage(sentences);
    translate(sentences);
});

// キーダウン時
$('body').on('keydown', (e) => {
    // 何もフォーカスされていない場合
    if ($(':focus').length === 0) {
        // Enterキーでローカルストレージのセンテンスを翻訳
        if (e.keyCode === 13) {
            // ローカルストレージからセンテンスを取得
            let sentences = JSON.parse(localStorage.getItem('sentences'));
            // 複数のセンテンスを1つの文章へ変換
            let text = sentences.join(' ');
            text = convertText(text);
            // 文章からセンテンスの配列へ変換
            sentences = text.split('\n');
            translate(sentences);
            // ローカルストレージにてセンテンスの初期化
            localStorage.setItem('sentences', JSON.stringify([]));
        }
    }
});
