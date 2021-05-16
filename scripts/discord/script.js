// カラー
const ColorList = [
    'black',
    'brown',
    'purple',
    'blue',
    'cyan',
    'green',
    'lime',
    'red',
    'pink',
    'orange',
    'yellow',
    'white'
];

// クラス
const SEPARATOR = 'separator-2I32lJ';
const ITEM = 'item-1tOPte';
const LABEL_CONTAINER = 'labelContainer-1BLJti';
const COLOR_DEFAULT = 'colorDefault-2K3EoJ';
const LABEL = 'label-22pbtT';

// 連想配列: ユーザーID -> カラー
const UserColorMap = new Map();

// 画像URLからユーザーIDを取得する
const getUserIdFromSrc = (src) => {
    const result = src.match('/(avatars|assets)/([a-zA-Z0-9]+)');
    if (result === null || result.length !== 3) return '';
    return result[2];
};

// ユーザーDOMからユーザーIDを取得する
const getUserIdFromUser = (user) => {
    const avatar = $(user).find('[class*="avatar-"]');
    if ($(avatar).length === 0) return '';
    const src = $(avatar).css('background-image');
    return getUserIdFromSrc(src);
};

// 背景DOMからユーザーIDを取得する
const getUserIdFromBackground = (background) => {
    const avatar = $(background).find('img[class*="avatar-"]');
    if ($(avatar).length === 0) return '';
    const src = $(avatar).attr('src');
    return getUserIdFromSrc(src);
};

// ユーザーDOMからユーザー名の色を変える
const changeUserNameColor = (user) => {
    const userId = getUserIdFromUser(user);
    if (userId === '') return;
    const color = UserColorMap.has(userId) ? UserColorMap.get(userId) : '';
    if (color === '') return;
    $(user).attr('color', color);
};

// 背景DOMから背景色を変える
const changeBackgroundColor = (background) => {
    const userId = getUserIdFromBackground(background);
    if (userId === '') return;
    const color = UserColorMap.has(userId) ? UserColorMap.get(userId) : '';
    if (color === '') return;
    $(background).attr('color', color);
};

// 全ユーザーの色を変える
const changeAllUserColor = () => {
    $('[class*="voiceUser-"]').each((_, user) => changeUserNameColor(user));
    $('[class*="tileChild-"]').each((_, tile) => {
        const background = $(tile).find('[class*="background-"]');
        if ($(background).length > 0) changeBackgroundColor(background);
        const video = $(tile).find('video');
        if ($(video).length > 0) $(tile).find('[class*="border-"]').remove();
    });
};

// 右クリックイベント: ユーザー -> メニューにカラーラベルを配置する
document.oncontextmenu = async (e) => {
    await new Promise(resolve => setTimeout(resolve, 1));
    // ユーザーIDを取得する
    const userId = (() => {
        const user = $(e.target).closest('[class*="voiceUser-"]');
        if ($(user).length > 0) return getUserIdFromUser(user);
        const background = $(e.target).closest('[class*="background-"]');
        if ($(background).length > 0) return getUserIdFromBackground(background);
        return '';
    })();
    if (userId === '') return;
    // メニューにユーザーIDをセットする
    const menu = $('[class*="menu-"]');
    if ($(menu).length === 0) return;
    $(menu).data('userId', userId);
    // メニューにカラーラベルを配置する
    const lastGroup = $(menu).find('[role="group"]').last();
    const separator = $('<div>', { role: 'separator', class: SEPARATOR });
    $(lastGroup).after(separator);
    const group = $('<div>', { role: 'group' });
    const container = $('<div>', { class: `${ITEM} ${LABEL_CONTAINER} ${COLOR_DEFAULT}` });
    ColorList.forEach((color) => {
        const label = $('<div>', { class: LABEL, color, text: '■' });
        $(container).append(label);
    });
    $(group).append(container);
    $(separator).after(group);
    // メニューの位置を調整する
    const layer = $(menu).closest('[class*=layer-]');
    if ($(layer).length === 0) return;
    const top = $(layer).css('top');
    $(layer).css('top', `calc(${top} - 40px)`);
};

// クリックイベント: カラーラベル -> 対象ユーザーのカラーを設定する
$(document).on('click', '[class*="label-"][color]', (e) => {
    // カラーを取得する
    const color = $(e.currentTarget).attr('color');
    if (!ColorList.includes(color)) return;
    // メニューを取得する
    const menu = $(e.currentTarget).closest('[class*="menu-"]');
    if ($(menu).length === 0) return;
    // ユーザーIDを取得する
    const userId = $(menu).data('userId');
    if (!userId) return;
    // 連想配列にユーザーIDとカラーをセットする
    UserColorMap.set(userId, color);
    // メニューを削除する
    $(menu).remove();
});

// クリックイベント: ドキュメント -> 全ユーザーの色を変える
$(document).on('click', () => setTimeout(changeAllUserColor, 1));
