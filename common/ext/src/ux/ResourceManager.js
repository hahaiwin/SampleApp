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

        //根节点是否可见
        rootVisible: false,

        //列表的数据集合
        gridStore: null,

        //树形列表列配置
        treeColumns: {
            items: [{
                xtype: 'treecolumn',
                text: "Column A",
                dataIndex: "text"
            }],
            defaults: {
                flex: 1
            }
        },
        //表格列配置
        gridColumns: {
            items: [{
                text: "Column A",
                dataIndex: "text"
            }],
            defaults: {
                flex: 1
            }
        },
        //单元格样式
        cellStyle: {
            backgroundColor: '#fff'
        },

        displayField: 'text'
    },

    /**
     * 组件初始化
     */
    initComponent: function() {
        var me = this;

        //defaults应用于子元素
        me.defaults =  {
            autoScroll: true,
            height: me.height,
            selType: 'rowmodel',
            bodyStyle: me.cellStyle
        };

        me.loadGridStore({
            node: 'root'
        });

        me.items = [{
            xtype: 'treepanel',
            title: 'tree',
            columnWidth: 0.25,
            store: me.treeStore,
            collapsible: true,
            useArrows: true,
            displayField: me.displayField,
            rootVisible: me.rootVisible,
            collapseDirection: 'left',
            animate: true,
            viewConfig: {
                overItemCls: '',
                getRowClass: me.getRowClass
            },
            columns: me.treeColumns
        }, {
            xtype: 'gridpanel',
            columnWidth: 0.75,
            collapsible: true,
            store: me.gridStore,
            title: 'grid',
            columns: me.gridColumns
        }];
        me.callParent(arguments);

        //console.log(me.down('treepanel'));
        me.down('treepanel').on('selectionchange', function(treePanel, selections){
            if(selections[0].data.leaf){
                return;
            }
            me.loadGridStore({node: selections[0].data.id});
        });
        me.down('gridpanel').on('itemdblclick', function(gridPanel, record){
            console.log(record);
            if(record.raw.leaf){
                return;
            }

            console.log(record.raw.id);
            me.loadGridStore({node: record.raw.id});
        });
    },

    /**
     * 加载grid的数据集
     * @param param
     */
    loadGridStore: function(param){
        var me = this;

        if(me.gridStore){
            me.gridStore.load({params:param});
        }
    }
});