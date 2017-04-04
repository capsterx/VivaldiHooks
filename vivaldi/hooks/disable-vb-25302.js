//Disable "VB-25302 Populate Find in Page dialog with page text selection"

vivaldi.jdhooks.hookClass('FindInPage', function(reactClass) {
    vivaldi.jdhooks.hookMember(reactClass, 'focusFindInPageInput', function(hookData) {
        var e = this, t = this.refs.inputText;
        if (t) {
          t.focus();
          t.select();
        }
        hookData.abort();
    });
});
