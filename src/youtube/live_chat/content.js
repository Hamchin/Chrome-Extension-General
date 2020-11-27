// チャットフレームを取得する
const getChatFrame = () => $(parent.document).find('ytd-live-chat-frame');

// チャットの表示タイプを設定する
const setChatType = (type) => {
    $('.chat-switch-btn').attr('type', type);
    $('.yt-live-chat-item-list-renderer').attr('type', type);
    const frame = getChatFrame();
    if ($(frame).length === 0) return;
    $(frame).attr('type', type);
};

// ロードイベント
$(document).ready(() => {
    const frame = getChatFrame();
    const type = $(frame).attr('type') || 'default';
    const refIconButton = $('yt-live-chat-header-renderer > yt-icon-button');
    if ($(refIconButton).length === 0) return;
    const icon = $('<yt-icon>');
    const iconButton = $('<yt-icon-button>', { class: 'chat-switch-btn', title: 'Switch Display of Chat' });
    $(iconButton).append(icon);
    $(refIconButton).first().before(iconButton);
    $(icon).html('<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"></path></svg>');
    setChatType(type);
});

// クリックイベント: チャットボタン (デフォルト)
$(document).on('click', '.chat-switch-btn[type="default"]', () => setChatType('member'));

// クリックイベント: チャットボタン (メンバー限定)
$(document).on('click', '.chat-switch-btn[type="member"]', () => setChatType('hidden'));

// クリックイベント: チャットボタン (非表示)
$(document).on('click', '.chat-switch-btn[type="hidden"]', () => setChatType('default'));
