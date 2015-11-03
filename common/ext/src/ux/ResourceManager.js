Ext.define('Ext.ux.ResourceManager',{

    /**
     * 扩展自基础的panel组件
     */
    extend: 'Ext.panel.Panel',

    /**
     * 别名，应用于xtype
     */
    alias: 'widget.resourcemanager',

    /**
     * 依赖组件
     */
    uses: [
        'Ext.grid.Panel',
        'Ext.tree.Panel'
    ],

    /**
     * 基础样式
     */
    //baseCls : Ext.baseCSSPrefix + 'grouptabpanel',

    /**
     * 暴露出去的组件配置项
     */
    config: {
        treeStore: null,
        gridStore: null
    },

    /**
     * 组件初始化
     */
    initComponent: function() {
        var me = this;

        me.defaults = {
            border: false
        };

        me.items = [{
            xtype: 'treepanel',
            width: 150,
            rootVisible: false,
            store: me.treeStore,
            hideHeaders: true,
            animate: false,
            processEvent: Ext.emptyFn,
            border: false,
            viewConfig: {
                overItemCls: '',
                getRowClass: me.getRowClass
            },
            columns: [{
                xtype: 'treecolumn',
                sortable: false,
                dataIndex: 'text',
                flex: 1,
                renderer: function () {}

            }]
        }, {
            xtype: 'container',
            flex: 1,
            layout: 'card',
            activeItem: me.mainItem,
            baseCls: Ext.baseCSSPrefix + 'grouptabcontainer',
            items: me.cards
        }];

        me.addEvents(
            /**
             * @event beforetabchange
             * Fires before a tab change (activated by {@link #setActiveTab}). Return false in any listener to cancel
             * the tabchange
             * @param {Ext.ux.GroupTabPanel} grouptabPanel The GroupTabPanel
             * @param {Ext.Component} newCard The card that is about to be activated
             * @param {Ext.Component} oldCard The card that is currently active
             */
            'beforetabchange',

            /**
             * @event tabchange
             * Fires when a new tab has been activated (activated by {@link #setActiveTab}).
             * @param {Ext.ux.GroupTabPanel} grouptabPanel The GroupTabPanel
             * @param {Ext.Component} newCard The newly activated item
             * @param {Ext.Component} oldCard The previously active item
             */
            'tabchange',

            /**
             * @event beforegroupchange
             * Fires before a group change (activated by {@link #setActiveGroup}). Return false in any listener to cancel
             * the groupchange
             * @param {Ext.ux.GroupTabPanel} grouptabPanel The GroupTabPanel
             * @param {Ext.Component} newGroup The root group card that is about to be activated
             * @param {Ext.Component} oldGroup The root group card that is currently active
             */
            'beforegroupchange',

            /**
             * @event groupchange
             * Fires when a new group has been activated (activated by {@link #setActiveGroup}).
             * @param {Ext.ux.GroupTabPanel} grouptabPanel The GroupTabPanel
             * @param {Ext.Component} newGroup The newly activated root group item
             * @param {Ext.Component} oldGroup The previously active root group item
             */
            'groupchange'
        );

        me.callParent(arguments);
        me.setActiveTab(me.activeTab);
        me.setActiveGroup(me.activeGroup);
        me.mon(me.down('treepanel').getSelectionModel(), 'select', me.onNodeSelect, me);
    }
});