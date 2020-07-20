// テキストを整形する
const formatText = (text) => {
    text = text.trim(); // 両端の空白を削除する
    text = text.replace(/-[ \n]/g, ''); // 単語の分裂を修正する
    text = text.replace(/\n/g, ' '); // 改行を空白へ置換する
    text = text.replace(/[ ]+/g, ' '); // 冗長な空白を削除する
    text = text.replace(/Fig\./g, 'Fig'); // Fig. -> Fig
    text = text.replace(/Figs\./g, 'Figs'); // Figs. -> Figs
    text = text.replace(/et al\./g, 'et al'); // et al. -> et al
    text = text.replace(/e\.g\. /g, 'e.g., '); // e.g. -> e.g.,
    text = text.replace(/i\.e\. /g, 'i.e., '); // i.e. -> i.e.,
    text = text.replace(/([0-9]+)[ ]*\.[ ]*([0-9]+)/g, '$1.$2'); // 12 . 34 -> 12.34
    text = text.replace(/\.[ ]+/g, '.\n'); // ピリオド後の空白を改行へ置換する
    return (text === '') ? [] : text.split('\n');
};

module.exports = formatText;
