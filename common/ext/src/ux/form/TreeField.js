Ext.define('Ext.ux.form.TreeField', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.treefield',

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

        //只选择子节点
        onlyCheckChild: false,

        //单选控制
        singleChecked: false,

        //一次性加载
        loadOnce: false,
        /**
        * @cfg {Array} columns
        * An optional array of columns for multi-column trees
        */
        columns: [
            {
                header: '名称',
                xtype: 'treecolumn',
                dataIndex: 'text',
                flex: 1
            }, {
                //header: '其他',
                flex: 1,
                dataIndex: 'ch',
                renderer: function (value, metaData, record) {
                    var me = this.up('window').parent;
                    if (!record.data.leaf) {
                        if (!me.singleChecked) {
                            var t = document.getElementById('checkBox' + record.get('id'));
                            if (!me.onlyCheckChild) {
                                if (t) {
                                    if (t.checked && record.data.checked) {
                                        return '<input type = "checkbox" class="gridCheckbox"' + 'id = "checkBox' + record.get('id') + '"' + 'checked = true' + '/>';
                                    } else if (record.data.checked) {
                                        var flg = [true];
                                        me.isChildChecked(record, flg);
                                        if (flg[0]) {
                                            return '<input type = "checkbox" class="gridCheckbox"' + 'id = "checkBox' + record.get('id') + '"' + 'checked = true' + '/>';
                                        } else {
                                            return '<input type = "checkbox" class="gridCheckbox"' + 'id = "checkBox' + record.get('id') + '"' + '/>';
                                        }
                                    } else {
                                        return '<input type = "checkbox" class="gridCheckbox"' + 'id = "checkBox' + record.get('id') + '"' + '/>';
                                    }
                                } else {
                                    return '<input type = "checkbox" class="gridCheckbox"' + 'id = "checkBox' + record.get('id') + '"' + '/>';
                                }
                            } else {
                                var flg = [true];
                                me.isChildChecked(record, flg);
                                if (flg[0]) {
                                    return '<input type = "checkbox" class="gridCheckbox"' + 'id = "checkBox' + record.get('id') + '"' + 'checked = true' + '/>';
                                } else {
                                    return '<input type = "checkbox" class="gridCheckbox"' + 'id = "checkBox' + record.get('id') + '"' + '/>';
                                }
                            }
                        }
                    } else if (record.get(me.displayField) == '其他' && record.data.checked) {
                        return '<input type = "text" class="gridText"' + 'id = "textBox' + record.get('id') + '"' + '/>';
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
        var me = this,
            f = true;

        f = me.fireEvent('beforecreatepicker', me);
        if (!f) {
            return false;
        }
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
                    checkchange: me.onCheckchange,
                    cellclick: me.onCellClick
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
        if (me.singleChecked) {
            me.cancelOthersChecked(root, record);
        } else {
            me.checkedParent(record.parentNode);
        }
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
    //第二列checkedchange事件勾选处理
    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e) {
        var me = this;
        var panel = me.picker.down('panel');
        var t = e.getTarget('.gridCheckbox');
        var rec = view.getSelectionModel().getSelection()[0];
        if (t) {
            me.checkedChild(rec, t.checked);
            me.checkedParent(rec.parentNode);
        } else {
            e.stopEvent();
        }
    },

    //子节点的选择改变方法(忽略其他)
    checkedChild: function (node, check, includeOther) {
        var me = this;
        if (includeOther || node.get(me.displayField) !== '其他') {
            if (!me.onlyCheckChild) {
                node.set('checked', check);
            } else {
                if (node.data.leaf === true) {
                    node.set('checked', check);
                }
            }
        } else {
            return;
        }
        if (!node.data.leaf) {
            me.checkedDomByNode(node, check);
        }
        if (node.isNode) {
            node.eachChild(function (child) {
                me.checkedChild(child, check, includeOther);
            }, me);
        }
    },

    //是否子节点全部选中
    isChildChecked: function (node, flg) {
        var me = this;
        if (node.isNode) {
            if (!me.onlyCheckChild) {
                node.eachChild(function (child) {
                    if (child.get(me.displayField) !== '其他' && !child.data.checked) {
                        flg[0] = false;
                    } else {
                        me.isChildChecked(child, flg);
                    }
                }, me);
            } else {
                node.eachChild(function (child) {
                    if (child.get(me.displayField) !== '其他' && !child.data.checked && child.data.leaf) {
                        flg[0] = false;
                    } else {
                        me.isChildChecked(child, flg);
                    }
                }, me);
            }
        }
    },

    //子节点是否全部选中
    nodep: function (node) {
        var me = this;
        var bnode = [true];
        if (!me.onlyCheckChild) {
            if (!node.data.checked) {
                bnode[0] = false;
                return;
            }
        } else {
            if (node.data.leaf) {
                if (!node.data.checked) {
                    bnode[0] = false;
                    return;
                }
            }
        }
        me.isChildChecked(node, bnode);
        return bnode[0];
    },

    //父节点的勾选操作
    checkedParent: function (node) {
        var me = this;
        if (node != null && node.get('id') != 0) {
            if (me.nodep(node)) {
                me.checkedDomByNode(node, true);
            } else {
                me.checkedDomByNode(node, false);
            }
            me.checkedParent(node.parentNode);
        }
    },
    //原生DOM勾选操作
    checkedDomByNode: function (node, check) {
        var me = this;
        var t = document.getElementById('checkBox' + node.get('id'));
        if (t != null) {
            t.checked = check;
        }
    },

    //确定按钮按下
    onDetermine: function (button, e) {
        var me = button.up('window').parent;
        var panel = me.picker.down('panel');
        //var record = panel.getSelectionModel().getSelection()[0];
        var records = panel.getView().getChecked();
        if (records !== undefined) {
            me.selectItems(records);
        } else {
            me.windowHide();
        }
        me.validate();
    },
    //取消按钮按下
    onCancel: function (button, e) {
        var me = button.up('window').parent;
        me.windowHide();
    },
    /**
    * Handles a keypress event on the picker element
    * @private
    * @param {Ext.EventObject} e
    * @param {HTMLElement} el
    */
    //    onPickerKeypress: function (e, el) {
    //        var key = e.getKey();

    //        if (key === e.ENTER || (key === e.TAB && this.selectOnTab)) {
    //            this.selectItem(this.picker.down('panel').getSelectionModel().getSelection()[0]);
    //        }
    //    },

    /**
    * Changes the selection to a given record and closes the picker
    * @private
    * @param {Ext.data.Model} record
    */
    selectItems: function (records) {
        var me = this,
            value = '',
             oldValue = me.value;

        Ext.Array.each(records, function (rec) {
            if (rec.get(me.displayField) == '其他') {
                var t = document.getElementById('textBox' + rec.get('id'));
                if (t && t.value && t.value.trim()) {
                    value = value + rec.getId() + '|' + t.value.replace('|', '.').replace(',', '.') + ',';
                    rec.parentNode.data.loaded = false;
                }
            } else {
                value = value + rec.getId() + ',';
            }
        });

        me.setValue(value);
        me.fireEvent('afterdetermine', me, me.value, oldValue);
        me.windowHide();
        //me.fireEvent('select', me, record)

    },
    //隐藏picker
    windowHide: function () {
        var me = this;
        me.collapse();
        //console.log(me.inputEl);
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

        me.checkedChild(node, false, true);

        if (value) {
            arrValue = value.split(',');
        }

        Ext.Array.each(arrValue, function (v) {
            if (v !== '') {
                var arrOther = v.split('|');
                me.checkedById(arrOther[0]);
                if (arrOther[1]) {
                    var t = document.getElementById('textBox' + arrOther[0]);
                    if (t) {
                        t.value = arrOther[1];
                    }
                }
            }
        });

        Ext.defer(function () {
            picker.getView().focus();
        }, 1);
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
        }
    },
    /**
    * Sets the specified value into the field
    * @param {Mixed} value
    * @return {Ext.ux.TreePicker} this
    */
    setValue: function (value, f) {
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

        Ext.Array.each(arrValue, function (v) {
            if (v !== '') {
                arrOther = v.split('|');
                var d = me.setEachValue(arrOther, flg);
                if (d !== '') {
                    display = display + '[' + d + ']';
                }
            }
        });
        if (!flg[0] && !f) {
            me.loadChild(root);
        }

        // set the raw value to the record's display field if a record was found
        me.setRawValue(display);
        if (!f) {
            if (f !== undefined) {
                oldValue = '';
            }
            //console.log(me.value);
            me.fireEvent('selectionchange', me, me.value, oldValue);
        }
        return me;
    },
    //获取id的displayField值
    setEachValue: function (values, flg) {
        var me = this,
            display = '',
            value = values[0],
            record;

        // try to find a record in the store that matches the value
        record = value ? me.store.getNodeById(value) : undefined;
        if (record) {
            if (record.get(me.displayField) == '其他') {
                var t = document.getElementById('textBox' + record.get('id'));
                if (t) {
                    display = t.value;
                } else {
                    display = values[1]
                }
            } else {
                display = record.get(me.displayField);
            }
        } else {
            flg[0] = false;
        }

        return display;
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

    //更新特定节点下的所有子节点
    loadChild: function (node) {
        var me = this;

        if (!node) {
            node = me.store.getRootNode();
            me.loadjust = true;
        }

        if (!me.loadOnce) {
            if (node.data.text == 'Root' && node.childNodes.length === 0) {
                me.store.load({ node: node });
            }
            node.eachChild(function (child) {
                if (!child.data.leaf && (me.loadjust || !child.data.loaded)) {
                    me.store.load({ node: child });
                }
            }, me);
        } else {
            me.store.load({ node: node });
        }
    },
    //清空根节点下子节点
    clearRootChilds: function () {
        var me = this;
        var node = me.store.getRootNode();

        node.removeAll();
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
            this.setValue(value, !node.data.root);
        }
        if (me.loadjust && node.data.root && !me.loadOnce) {
            me.loadChild();
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
    }
});
