// テキストを整形する
const formatText = (text) => {
    // 両端の空白を削除する
    text = text.trim();
    // 単語の分裂を修正する
    text = text.replace(/-\s+/g, '');
    // 空白文字を単一の空白へ置換する
    text = text.replace(/\s+/g, ' ');
    // 小数点前後の空白を削除する
    text = text.replace(/(\d)\s*\.\s*(\d)/g, '$1.$2');
    return text;
};

// テキストを分割する
const splitText = (text) => {
    const words = [
        'Mr\\.',
        'Ms\\.',
        'Mrs\\.',
        'Dr\\.',
        'Prof\\.',
        'Jr\\.',
        'Sr\\.',
        'Inc\\.',
        'Ltd\\.',
        'Co\\.',
        'Fig\\.',
        'Figs\\.',
        'et al\\.',
        'e\\.g\\.',
        'i\\.e\\.',
        'cf\\.'
    ];
    const lookbehind = words.map(word => `(?<!${word})`).join('');
    const regex = RegExp(`${lookbehind}(?<=\\.|\\?|\\!)\\s`, 'g');
    text = text.replace(regex, '\n');
    return (text === '') ? [] : text.split('\n');
};
