appUrl = "/Application";
extLibUrl = "/Application";

Ext.Loader.setConfig({ enabled: true });//, disableCaching: false，是否禁用js缓存
//设置插件路径
Ext.Loader.setPath('Ext.ux', extLibUrl + '/common/ext/src/ux');
Ext.Loader.setPath('WMC.common', extLibUrl + '/common/src');

Ext.Tools = function () {
    var msgCt;
    function MessageBox(t, m, v,f,s,b) {
        var Type;
        if (v == "E")
            Type = Ext.MessageBox.ERROR;
        else if (v == "I")
            Type = Ext.MessageBox.INFO;
        else if (v == "Q")
            Type = Ext.MessageBox.QUESTION;
        else if (v == "W")
            Type = Ext.MessageBox.WARNING;
        Ext.MessageBox.show({
            title: t,
            msg: m,
            buttons: b || Ext.MessageBox.OK,
            fn: f,
            scope: s,
            icon: Type
        });
    }
    return {
        Alert: function (title, msg, type, fn, scope, btns) {
            MessageBox(title, msg, type.toUpperCase(), fn, scope,btns);
        },
        Msg: function (msg, type) {
            if (msg == undefined) return;
            if (!msgCt) {
                msgCt = Ext.DomHelper.insertFirst(document.body, { id: 'msg-div' }, true);
            }
            content = "";
            delayTime = 1000;
            if (type == 0)
                content = '<div class="msgOk"><h3>完成</h3><p>' + msg + '</p></div>';
            else if (type == 1) {
                delayTime = 5000;
                content = '<div class="msgError"><h3>失败</h3><p>' + msg + '</p></div>';
            }
            else if (type == 9) {
                delayTime = 5000;
                content = '<div class="msgException"><h3>警告</h3><p>' + msg + '</p></div>';
            }
            var m = Ext.DomHelper.append(msgCt, content, true);
            m.hide();
            m.slideIn('t').ghost("t", { delay: delayTime, remove: true });
        },
        Confirm: function (t, m, callback, scope) {
            Ext.MessageBox.confirm(t, m, callback,scope);
        },
        //格式化时间，例如2013-12-20或者/Date(139xxxxx)/等
        FormatDate: function (value) {
            if (value == null) return "";
            var argv = arguments;
            var argc = argv.length;
            var format = (argc > 1) ? argv[1] : "Y-m-d H:i:s";
            if (value instanceof Date) {
                return Ext.util.Format.date(value, format);
            }
            if (value.indexOf("Date") <= 0) {
                return Ext.util.Format.date(dt, format);
            }
            var dt = eval("new " + value.substr(1, value.length - 2)).toString();
            return Ext.util.Format.date(dt, format);
        },
        //根据权限控制页面按钮显隐,module:页面,grid:按钮位于的panel,hide:true隐藏按钮，false禁用按钮（灰色）
        CtrlButtonsByPermession: function (module,grid,hide) {
            Ext.Ajax.request({
                url: '/Admin/Main/GetModuleButtons',
                method: 'GET',
                params: { module: module },
                success: function (response) {
                    btns = Ext.JSON.decode(response.responseText);
                    Ext.each(btns, function (item) {
                        btn = grid.query("button[action=" + item.ModuleKey + "]")[0];
                        if (hide == true)
                            btn.hide();
                        else
                            btn.setDisabled(true);
                    });
                },
                failure: function (response) {
                    Ext.Tools.Msg('请求超时或网络故障,错误编号：' + response.status, 9);
                }
            });
        },
        init: function () {
            if (!msgCt) {
                msgCt = Ext.DomHelper.insertFirst(document.body, { id: 'msg-div' }, true);
            }
        }
    };
}();
Ext.onReady(Ext.Tools.init, Ext.Tools);

/*****************************************************************/
/* VType自定义校验 */
/*****************************************************************/
Ext.apply(Ext.form.VTypes, {
    number: function (val, field) {
        return /^\d+$/.test(val);
    },
    numberText: '只能输入数字',
    amount: function (val, field) {
        return /^(([1-9]\d*)|\d)(\.\d{1,2})?$/.test(val);
    },
    amountText: '金额格式错误',
    passwordConfirm: function (value, field) {
        if (!(field.confirmTo instanceof Ext.form.Field)) {
            field.confirmTo = Ext.getCmp(field.confirmTo);
        }
        return (value == field.confirmTo.getValue());
    },
    passwordConfirmText: '两次新密码输入不一致'
});
/**********************************************************
图标选择回调函数
***********************************************************/
function setIconFieldValue(comId, iconName) {
    cmp = Ext.getCmp(comId);
    cmp.triggerEl.elements[0].removeCls(cmp.getValue());
    cmp.setValue(iconName);
    cmp.triggerEl.elements[0].addCls(iconName);
    Ext.getCmp('Wms_Icon_Win').close();
}