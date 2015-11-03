Ext.override(Ext.form.Basic, {
    setValues: function (values) {
        var me = this, cancelVerify = me.owner.cancelVerify,
            v, vLen, val, field;

        function setVal(fieldId, val) {
            var field = me.findField(fieldId);
            if (field) {
                /** form加载数据的时候不验证*/
                if (cancelVerify) {
                    var d = field.disabled;
                    field.disabled = true;
                    field.setValue(val);
                    field.disabled = d;
                } else {
                    field.setValue(val);
                }


                if (me.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
        }
        Ext.suspendLayouts();
        if (Ext.isArray(values)) {
            vLen = values.length;
            for (v = 0; v < vLen; v++) {
                val = values[v];
                setVal(val.id, val.value);
            }
        } else {
            Ext.iterate(values, setVal);
        }
        Ext.resumeLayouts(true);
        return this;
    },
    /**
    * 解决Form下面包含grid CellEditor的情况下，
    *    Form被update，但是editor会影响Form的isValid和isDirty
    * 
    * 参考http://www.sencha.com/forum/archive/index.php/t-279876.html?s=8633abd6266531666ee4c2be06a16f1a
    */
    hasInvalidField: function () {
        return !!this.getFields().findBy(function (field) {
            var preventMark = field.preventMark,isValid;
            field.preventMark = true;
            // this line was replaced
            //isValid = field.isValid();
            isValid = (Ext.grid.CellEditor && field.ownerCt && field.ownerCt instanceof Ext.grid.CellEditor) ? true : field.isValid();
            field.preventMark = preventMark;
            return !isValid;
        });
    },
    isValid: function () {
        var me = this,invalid;
        Ext.suspendLayouts();
        invalid = me.getFields().filterBy(function (field) {
            // this line was replaced
            //return !field.validate();
            return (Ext.grid.CellEditor && field.ownerCt && field.ownerCt instanceof Ext.grid.CellEditor) ? false : !field.validate();
        });
        Ext.resumeLayouts(true);
        return invalid.length < 1;
    },
    isDirty: function () {
        return !!this.getFields().findBy(function (f) {
            // this line was replaced
            //return f.isDirty();
            return (Ext.grid.CellEditor && f.ownerCt && f.ownerCt instanceof Ext.grid.CellEditor) ? false : f.isDirty();
        });
    }
});