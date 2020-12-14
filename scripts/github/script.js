// テキスト
HIDE_TEXT = 'Hide Changes';
SHOW_TEXT = 'Show Changes';

// ロードイベント
$(document).ready(() => {
    const container = $('.js-breadcrumb-container');
    const button = $('<span>', { class: 'btn switch-diff-btn', text: HIDE_TEXT });
    $(container).removeClass('mr-sm-4');
    $(container).append(button);
});

// クリックイベント: 差分非表示ボタン
$(document).on('click', '.switch-diff-btn', (e) => {
    const preview = $('.commit-preview');
    const disabled = $(preview).attr('enabled') === undefined;
    disabled ? $(preview).attr('enabled', '') : $(preview).removeAttr('enabled');
    $(e.target).text(disabled ? SHOW_TEXT : HIDE_TEXT);
});
