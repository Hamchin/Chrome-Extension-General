// カラーリスト
const ColorList = [
    'black',
    'brown',
    'purple',
    'blue',
    'red',
    'pink',
    'green',
    'lime',
    'orange',
    'yellow',
    'cyan',
    'white'
];

// カラーパネルを設置する
const setColorPanel = (reactid, top, left) => {
    $('.ext-color-panel').remove();
    const panel = $('<div>', { class: 'ext-color-panel' });
    ColorList.forEach((color) => {
        const item = $('<div>', { color });
        $(panel).append(item);
    });
    $(panel).data('reactid', reactid);
    $(panel).css({ top, left });
    $(panel).appendTo('body');
};

// クリックイベント: スキン
$(document).on('click', '.voice-state', (e) => {
    const reactid = $(e.currentTarget).data('reactid');
    if (!reactid) return;
    const top = window.pageYOffset + e.clientY;
    const left = window.pageXOffset + e.clientX;
    setColorPanel(reactid, top, left);
});

// マウスダウンイベント: ドキュメント
$(document).on('mousedown', (e) => {
    // カラーパネル以外の場合 -> カラーパネルを削除する
    if ($(e.target).closest('.ext-color-panel').length === 0) {
        $('.ext-color-panel').remove();
    }
});

// クリックイベント: カラー -> 対象スキンのカラーを設定する
$(document).on('click', '.ext-color-panel > [color]', (e) => {
    // カラーを取得する
    const color = $(e.currentTarget).attr('color');
    if (!ColorList.includes(color)) return;
    // カラーパネルを取得する
    const panel = $(e.currentTarget).closest('.ext-color-panel');
    if ($(panel).length === 0) return;
    // IDを取得する
    const reactid = $(panel).data('reactid');
    if (!reactid) return;
    // スキンのカラーを更新する
    $(`.voice-state[data-reactid="${reactid}"]`).attr('color', color);
    // メニューを削除する
    $(panel).remove();
});
