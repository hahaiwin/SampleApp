Ext.define('Ext.ux.form.InputField', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.inputfield',

    uses: [
        'Ext.tree.Panel',
        'Ext.window.Window'
    ],

    triggerCls: Ext.baseCSSPrefix + 'form-arrow-trigger',

    matchFieldWidth: false,

    config: {
        /**
        * @cfg {Ext.data.TreeStore} store
        * A tree store that the tree picker will be bound to
        */
        store: null,

        /**
        * @cfg {String} displayField
        * The field inside the model that will be used as the node's text.
        * Defaults to the default value of {@link Ext.tree.Panel}'s `displayField` configuration.
        */
        displayField: 'text',

        /**
        * @cfg {Array} columns
        * An optional array of columns for multi-column trees
        */
        columns: [
            {
                header: '分取方案',
                xtype: 'treecolumn',
                dataIndex: 'text',
                flex: 1
            }, {
                header: '分取间距',
                flex: 1,
                renderer: function (value, metaData, record) {
                    var me = this.up('window').parent;
                    if (record.data.checked) {
                        return '<input type = "text" class="gridText"' + 'id = "textBoxspacing' + record.get('id') + '"' + '/>';
                    }
                }
            }, {
                header: '分取间隔',
                flex: 1,
                renderer: function (value, metaData, record) {
                    var me = this.up('window').parent;
                    if (record.data.checked && record.get(me.displayField) === '间隔分取') {
                        return '<input type = "text" class="gridText"' + 'id = "textBoxinterval' + record.get('id') + '"'  + '/>';
                    }
                }
            }],

        /**
        * @cfg {Boolean} selectOnTab
        * Whether the Tab key should select the currently highlighted item. Defaults to `true`.
        */
        selectOnTab: true,

        /**
        * @cfg {Number} maxPickerHeight
        * The maximum height of the tree dropdown. Defaults to 300.
        */
        maxPickerHeight: 300,

        /**
        * @cfg {Number} minPickerHeight
        * The minimum height of the tree dropdown. Defaults to 100.
        */
        minPickerHeight: 100
    },

    editable: false,


    showDirty: function (dom) {
        dom.style.borderColor = 'red';
    },

    clearDirty: function (dom) {
        dom.style.borderColor = 'black';
    },

    onChanged: function () {
        var me = this;
        return function () {
            //console.log('a');
            if (!this.value) {
                me.showDirty(this);
                //me.valid = false;
            } else {
                me.clearDirty(this);
                //me.valid = true;
            }
        }
    },

    initComponent: function () {
        var me = this;
        me.callParent(arguments);

        me.addEvents(
        /**
        * @event select
        * Fires when a tree node is selected
        * @param {Ext.ux.TreePicker} picker        This tree picker
        * @param {Ext.data.Model} record           The selected record
        */
            'selectionchange',

            'afterdetermine',

            'beforecreatepicker'
        );

        me.mon(me.store, {
            scope: me,
            load: me.onLoad
        });
    },

    /**
    * Creates and returns the tree panel to be used as this field's picker.
    */
    createPicker: function () {
        var me = this;

        var picker = new Ext.window.Window({
            renderTo: Ext.getBody(),
            parent: me,
            resizable: false,
            title: me.pickerTitle,
            closable: false,
            width: 400,
            height: 280,
            items: {
                xtype: 'treepanel',
                shrinkWrapDock: 2,
                store: me.store,
                autoShow: true,
                rootVisible: false,
                displayField: me.displayField,
                columns: me.columns,
                height: 200,
                shadow: false,
                listeners: {
                    scope: me,
                    checkchange: me.onCheckchange
                },
                viewConfig: {
                    listeners: {
                        scope: me,
                        render: me.onViewRender
                    }
                }
            },
            buttons: [{
                text: '确定',
                xtype: 'button',
                itemId: 'determine',
                handler: me.onDetermine
            }, {
                text: '取消',
                xtype: 'button',
                itemId: 'cancel',
                handler: me.onCancel
            }]
        });
        var view = picker.down('panel').getView();

        if (Ext.isIE9 && Ext.isStrict) {
            // In IE9 strict mode, the tree view grows by the height of the horizontal scroll bar when the items are highlighted or unhighlighted.
            // Also when items are collapsed or expanded the height of the view is off. Forcing a repaint fixes the problem.
            view.on({
                scope: me,
                highlightitem: me.repaintPickerView,
                unhighlightitem: me.repaintPickerView,
                afteritemexpand: me.repaintPickerView,
                afteritemcollapse: me.repaintPickerView
            });
        }
        return picker;
    },

    expand: function () {
        var me = this,
            bodyEl, picker, collapseIf;

        if (me.rendered && !me.isExpanded && !me.isDestroyed) {
            me.expanding = true;
            bodyEl = me.bodyEl;
            picker = me.getPicker();
            collapseIf = me.collapseIf;

            // show the picker and set isExpanded flag
            if (!picker) {
                delete me.expanding;
                return;
            }
            picker.show();
            me.isExpanded = true;
            me.alignPicker();
            bodyEl.addCls(me.openCls);

            // monitor clicking and mousewheel
            me.mon(Ext.getDoc(), {
                mousewheel: collapseIf,
                mousedown: collapseIf,
                scope: me
            });
            Ext.EventManager.onWindowResize(me.alignPicker, me);
            me.fireEvent('expand', me);
            me.onExpand();
            delete me.expanding;
        }
    },

    onViewRender: function (view) {
        //view.getEl().on('keypress', this.onPickerKeypress, this);
        //console.log('gggg');
        //view.on('groupclick', function (grid, groupField, groupValue, hd, e) {
    },

    /**
    * repaints the tree view
    */
    repaintPickerView: function () {
        var style = this.picker.getView().getEl().dom.style;

        // can't use Element.repaint because it contains a setTimeout, which results in a flicker effect
        style.display = style.display;
    },

    /**
    * Handles a click even on a tree node
    * @private
    * @param {Ext.tree.View} view
    * @param {Ext.data.Model} record
    * @param {HTMLElement} node
    * @param {Number} rowIndex
    * @param {Ext.EventObject} e
    */
    //    onItemClick: function (view, record, node, rowIndex, e) {
    //        if (record.data.checked) {
    //            record.set('checked', false);
    //        } else {
    //            record.set('checked', true);
    //        }
    //    },

    //第一列checkedchange事件勾选处理
    onCheckchange: function (record, checked) {
        var me = this,
            root = me.store.getRootNode();
        if (record.get(me.displayField) == '间隔分取') {
            var t1 = document.getElementById('textBoxspacing' + record.get('id'));
            var t2 = document.getElementById('textBoxinterval' + record.get('id'));
            if (t1) {
                t1.onchange = me.onChanged();
                t1.onblur = me.onChanged();
            }
            if (t2) {
                t2.onchange = me.onChanged();
                t2.onblur = me.onChanged();
            }
        } else {
            var t1 = document.getElementById('textBoxspacing' + record.get('id'));
            if (t1) {
                t1.onchange = me.onChanged();
                t1.onblur = me.onChanged();
            }
        }
        me.cancelOthersChecked(root, record);
    },
    //取消其他节点的勾选状态
    cancelOthersChecked: function (node, chkNode) {
        var me = this;
        if (node !== chkNode) {
            node.set('checked', false);
        }
        if (node.isNode) {
            node.eachChild(function (child) {
                me.cancelOthersChecked(child, chkNode);
            }, me);
        }
    },

    //确定按钮按下
    onDetermine: function (button, e) {
        var me = button.up('window').parent;
        var panel = me.picker.down('panel');
        var records = panel.getView().getChecked();
        if (records) {
            me.selectItems(records[0]);
        } else {
            me.windowHide();
        }
    },
    //取消按钮按下
    onCancel: function (button, e) {
        var me = button.up('window').parent;
        me.windowHide();
    },

    /**
    * Changes the selection to a given record and closes the picker
    * @private
    * @param {Ext.data.Model} record
    */
    selectItems: function (rec) {
        var me = this,
            value = '',
             oldValue = me.value,
             valid = true;
        if (rec) {
            if (rec.get(me.displayField) == '间隔分取') {
                var t1 = document.getElementById('textBoxspacing' + rec.get('id'));
                var t2 = document.getElementById('textBoxinterval' + rec.get('id'));
                if (!t1.value) {
                    me.showDirty(t1);
                    return false;
                }
                if (!t2.value) {
                    me.showDirty(t2);
                    return false;
                }
                value = value + rec.getId() + ',' + t1.value.replace(',', '.') + ',' + t2.value.replace(',', '.') + ',';
                rec.parentNode.data.loaded = false;
            } else {
                var t1 = document.getElementById('textBoxspacing' + rec.get('id'));
                if (!t1.value) {
                    me.showDirty(t1);
                    return false;
                }
                value = value + rec.getId() + ',' + t1.value.replace(',', '.') + ',';
            }

            value = value.replace(/,$/g, '');
        } else {
            value = '';
        }
        me.setValue(value);
        me.fireEvent('afterdetermine', me, me.value, oldValue);
        me.windowHide();
    },
    //隐藏picker
    windowHide: function () {
        var me = this;
        me.picker.hide();
        me.inputEl.focus();
    },
    /**
    * Runs when the picker is expanded.  Selects the appropriate tree node based on the value of the input element,
    * and focuses the picker so that keyboard navigation will work.
    * @private
    */
    onExpand: function () {
        var me = this,
            picker = me.picker.down('panel'),
            value = me.value,
            store = picker.store,
            node,
            recs,
            arrValue = [];

        node = store.getRootNode();

        me.checkedChild(node, false);

        if (value) {
            arrValue = value.split(',');
        }
        if (arrValue[0]) {
            var rec = me.checkedById(arrValue[0]);

            var t1 = document.getElementById('textBoxspacing' + rec.get('id'));
            var t2 = document.getElementById('textBoxinterval' + rec.get('id'));
            if (t1) {
                t1.value = arrValue[1] ? arrValue[1] : '';
            }
            if (t2) {
                t2.value = arrValue[2] ? arrValue[2] : '';
            }
        }

        Ext.defer(function () {
            picker.getView().focus();
        }, 1);
    },
    //子节点勾选
    checkedChild: function (root, check) {
        var me = this;
        root.eachChild(function (child) {
            child.set('checked', check);
        }, me);
    },
    //勾选id节点
    checkedById: function (id) {
        var me = this,
            picker = me.picker.down('panel'),
            store = picker.store,
            node;

        node = store.getNodeById(id);
        if (node) {
            node.set('checked', true);
            picker.fireEvent('checkchange', node);
            return node;
        }
    },
    /**
    * Sets the specified value into the field
    * @param {Mixed} value
    * @return {Ext.ux.TreePicker} this
    */
    setValue: function (value) {
        var me = this,
            arrValue = [],
            arrOther = [],
            oldValue = me.value,
            flg = [true],
            root = me.store.getRootNode(),
            display = '';

        me.value = value;
        //console.log(value);
        if (me.store.loading) {
            // Called while the Store is loading. Ensure it is processed by the onLoad method.
            return me;
        }
        //console.log(me.store);
        if (value) {
            arrValue = value.split(',');
        }
        if (arrValue[0]) {
            record = me.store.getNodeById(arrValue[0]);
            if (record) {
                display = record.get(me.displayField);
            } else {
                me.store.load({ node: root });
            }
            if (arrValue[1] && arrValue[1].trim()) {
                display = display + ':' + '间距:' + arrValue[1];
            }
            if (arrValue[2] && arrValue[2].trim()) {
                display = display + '间隔:' + arrValue[2];
            }
        }

        // set the raw value to the record's display field if a record was found
        me.setRawValue(display);

        //console.log(me.value);
        me.fireEvent('selectionchange', me, me.value, oldValue);

        return me;
    },

    getName: function () {
        return this.name;
    },

    //用于form的getValues方法
    getSubmitValue: function () {
        return this.value;
    },

    getSubmitData: function () {
        var me = this,
            data = null;

        if (!me.disabled && !me.isFileUpload()) {
            data = {};
            data[me.getName()] = me.getValue();
        }
        return data;
    },
    //用于form的getRecord方法
    getModelData: function () {
        var me = this,
            data = null;
        if (!me.disabled && !me.isFileUpload()) {
            data = {};
            data[me.getName()] = me.getValue();
        }
        return data;
    },

    /**
    * Returns the current data value of the field (the idProperty of the record)
    * @return {Number}
    */
    getValue: function () {
        return this.value;
    },
    //获取Store
    getStore: function () {
        return this.store;
    },
    /**
    * Handles the store's load event.
    * @private
    */
    onLoad: function (store, node, recs, successful) {
        var me = this,
            value = me.value;

        if (value && successful) {
            this.setValue(value);
        }
    },

    /**
    * Aligns the picker to the input element
    * @protected
    */
    alignPicker: function () {
        var me = this,
            picker = me.getPicker();

        if (me.isExpanded) {
            if (me.matchFieldWidth) {
                // Auto the height (it will be constrained by min and max width) unless there are no records to display.
                picker.setWidth(me.bodyEl.getWidth());
            }
            if (picker.isFloating()) {
                me.doAlign();
            }
        }
    },
    collapseIf: function (e) {
        var me = this;
        if (!me.isDestroyed && !e.within(me.bodyEl, false, true) && !e.within(me.picker.el, false, true) && !me.isEventWithinPickerLoadMask(e)) {
            me.collapse();
        }
    }
});
