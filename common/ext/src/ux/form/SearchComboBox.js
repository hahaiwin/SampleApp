Ext.define('Ext.ux.form.SearchComboBox', {
    extend: 'Ext.form.field.ComboBox',

    alias: 'widget.searchcombo',

    minChars: 0,

    triggerCls: Ext.baseCSSPrefix + 'form-search-trigger',

    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.validator = me.valid;
        me.eParams = this.eParams;
    },

    valid: function (value) {
        var me = this;
        if (me.getValue() === null) {
            return '该项为必输项';
        } else if (value === me.getValue()) {
            return '请选择与您的输入相匹配的数据';
        } else {
            return true;
        }
    },
    // store the last key and doQuery if relevant
    onKeyUp: function (e, t) {
        var me = this,
            key = e.getKey();

        if (!me.readOnly && !me.disabled && me.editable) {
            me.lastKey = key;
            // we put this in a task so that we can cancel it if a user is
            // in and out before the queryDelay elapses

            // perform query w/ any normal key or backspace or delete
            if (!e.isSpecialKey() || key == e.BACKSPACE || key == e.DELETE || key == e.ENTER) {
                if (me.getValue() !== null) {
                    if (me.getValue().trim() !== '') {
                        me.doQueryTask.delay(me.queryDelay);
                    }
                } else {
                    if (me.isExpanded) {
                        me.collapse();
                    }
                }
            }
        }

        if (me.enableKeyEvents) {
            me.callParent(arguments);
        }
    },
    // private
    getParams: function (queryString) {
        var me = this;
        var params = {},
            param = this.queryParam;

        if (param) {
            params[param] = queryString;
        }
        if (me.eParams != undefined) {
            Ext.apply(params, me.eParams);
        }
        return params;
    }
});