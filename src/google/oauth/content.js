// 許可ボタンをクリックする
if (location.pathname === '/signin/oauth/consent') {
    $('#submit_approve_access').click();
}

// 認証コードをコピーしてタブを閉じる
if (location.pathname === '/o/oauth2/approval/v2/approvalnativeapp') {
    $('.qBHUIf').select();
    document.execCommand('copy');
    window.close();
}
