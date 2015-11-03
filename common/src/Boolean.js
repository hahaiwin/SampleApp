Boolean.TrueStringValue = 'TRUE';
Boolean.FalseStringValue = 'FALSE';

Boolean.toBoolean = function (v) {
    if (v == undefined || v == null)
        return false;

    v = v.toUpperCase();
    if (v == Boolean.TrueStringValue)
        return true;

    return false;
};
Boolean.toNullEnableBoolean = function (v) {
    if (v == undefined || v == null || v == '')
        return null;

    v = v.toUpperCase();
    if (v == Boolean.TrueStringValue)
        return true;

    return false;
};
Boolean.render = function (v) {
    return v ? '是' : '否';
};
Boolean.nullAbleRender = function (v) {
    if (v == true)
        return '是';
    if (v == false)
        return '否';

    return '未知';
};
Boolean.showAsCheckbox = function (value) {
    return "<input type=checkbox />";
};
Boolean.TureOrFalseToYesOrNo = function (v) {
    v = v.toUpperCase();
    if (v == Boolean.TrueStringValue)
        return '是';
    return '否';
};
