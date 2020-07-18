// https://accounts.google.com/signin/oauth/*
const submitButton = $('#submit_approve_access');
if ($(submitButton).length > 0) {
    $(submitButton).click();
}

// https://accounts.google.com/o/oauth2/*
const copyButton = $('.U26fgb.mUbCce.fKz7Od.YYBxpf.NCTw7e');
if ($(copyButton).length > 0) {
    $(copyButton).click();
    $(document).on('copy', () => window.close());
}
