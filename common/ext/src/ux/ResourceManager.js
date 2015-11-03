/**
 * @author Liu Bing
 * A GroupManager.
 */
Ext.define('Ext.ux.ResourceManager', {
    /**
     * 扩展自panel
     */
    extend: 'Ext.panel.Panel',

    /**
     * 别名，可以通过xtype来配置
     */
    alias: 'widget.resourcemanager',

    /**
     * 列布局
     */
    layout: 'column',

    /**
     * 无边框
     */
    border: false,

    /**
     * 依赖树形列表和表格
     */
    requires:[
        'Ext.tree.Panel',
        'Ext.grid.Panel'
    ],

    /**
     * 基础样式
     */
    /*baseCls : Ext.baseCSSPrefix + 'grouptabpanel',*/

    /**
     *默认配置项
     */
    config:{
        //左边树的数据集合
        treeStore: null,

        //列表的数据集合
        gridStore: null
    },

    /**
     * 组件初始化
     */
    initComponent: function() {
        var me = this;

        //defaults应用于子元素
        me.defaults =  {
            autoScroll: true
        };

        me.items = [{
            xtype: 'treepanel',
            title: 'tree',
            columnWidth: 0.25,
            height: me.height,
            store: me.treeStore,
            collapsible: true,
            collapseDirection: 'left',
            bodyStyle: 'background:#ffc;',
            animate: false,
            processEvent: Ext.emptyFn,
            viewConfig: {
                overItemCls: '',
                getRowClass: me.getRowClass
            },
            columns: {
                items: [{
                    text: "Column A",
                    dataIndex: "field_A"
                }],
                defaults: {
                    flex: 1
                }
            },
            render: Ext.emptyFn
        }, {
            xtype: 'gridpanel',
            columnWidth: 0.75,
            height: me.height,
            collapsible: true,
            bodyStyle: 'background:#ffc;',
            store: me.gridStore,
            title: 'grid',
            columns: {
                items: [{
                    text: "Column A",
                    dataIndex: "field_A"
                }],
                defaults: {
                    flex: 1
                }
            }
        }];
        me.callParent(arguments);
    }
});