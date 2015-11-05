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
     * border布局,上，右，下，左的布局
     */
    layout: 'border',

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
                text: '',
                height: 0,
                dataIndex: 'text'
            }],
            defaults: {
                flex: 1
            }
        },
        //表格列配置
        gridColumns: {
            items: [{
                text: '',
                height: 0,
                dataIndex: 'text'
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
            xtype: 'panel',
            region: 'north',
            height: 40
        },{
            xtype: 'treepanel',
            title: 'tree',
            region: 'west',
            width: 200,
            store: me.treeStore,
            collapsible: true,
            useArrows: true,
            resizable: true,
            displayField: me.displayField,
            rootVisible: me.rootVisible,
            collapseDirection: 'left',
            animate: true,
            viewConfig: {
                overItemCls: '',
                getRowClass: me.getRowClass
            },
            columns: me.treeColumns,
            tbar: [
                {xtype: 'button', text: '新建'}
            ]
        }, {
            xtype: 'gridpanel',
            region: 'center',
            rowLines: false,
            layout: 'fit',
            collapsible: false,
            store: me.gridStore,
            title: 'grid',
            columns: me.gridColumns,
            tbar: [
                {xtype: 'button', text: '+'}
            ]
        }];
        me.callParent(arguments);

        me.getTreePanel().on('selectionchange', function(treePanel, selections){
            /*if(selections[0].data.leaf){
                return;
            }*/
            me.loadGridStore({node: selections[0].data.id});
        });
        me.getGridPanel().on('itemdblclick', function(gridPanel, record){
            //console.log(record);
            if(record.raw.leaf){
                return;
            }
            //console.log(record.raw.id);
            me.loadGridStore({node: record.raw.id});

            //与树形列表联动
            me.selectTreeNode(record.raw.id, record.raw.parentId);

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
    },

    /**
     * 获取树形列表组件
     * @returns {*}
     */
    getTreePanel: function(){
        var me = this;
        return me.down('treepanel');
    },

    /**
     * 获取列表组件
     * @returns {*}
     */
    getGridPanel: function(){
        var me = this;
        return me.down('gridpanel');
    },

    /**
     * 选中树形列表中的节点
     * @param nodeId
     * @param parentId
     */
    selectTreeNode: function(nodeId, parentId){
        var me = this,
            tree = me.getTreePanel(),
            node = me.treeStore.getNodeById(nodeId),
            parent;

        if(node){
            tree.selectPath(node.getPath());
            return;
        }
        console.log(parentId);
        //节点还没有加载进来则加载该节点再选中
        if(!parentId || !me.treeStore.getNodeById(parentId)){
            console.error('lost parent! can not load node..');
            return;
        }

        parent = me.treeStore.getNodeById(parentId);

        tree.expandNode(parent, false, function(){
            var node = parent.findChild('id', nodeId);
            tree.selectPath(node.getPath());
        });

    }
});