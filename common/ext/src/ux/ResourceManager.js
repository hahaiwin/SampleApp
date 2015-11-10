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

        displayField: 'text',

        id: 'id',

        allowMemoryLength: 10
    },

    /**
     * 组件初始化
     */
    initComponent: function() {
        var me = this;

        me.paths = [];

        me.needRemember = true;

        //defaults应用于子元素
        me.defaults =  {
            autoScroll: true,
            height: me.height,
            selType: 'rowmodel',
            bodyStyle: me.cellStyle
        };

        me.items = [{
            xtype: 'panel',
            region: 'north',
            layout: 'column',
            height: 30,
            items:[{
                xtype: 'button',
                margin: '3 0 0 5',
                itemId: 'back152752',
                text: '←',
                width: 40,
                textAlign: 'center'
            },{
                xtype: 'button',
                margin: '3 0 0 5',
                itemId: 'next152752',
                text: '→',
                width: 40,
                textAlign: 'center'
            },{
                xtype: 'textfield',
                margin: '2 0 0 5',
                itemId: 'pathipt152752',
                height: 23,
                width: me.width - 100
            }]

        },{
            xtype: 'treepanel',
            title: 'tree',
            region: 'west',
            width: 200,
            store: me.treeStore,
            collapsible: true,
            useArrows: true,
            resizable: {
                handles: 'e w'
            },
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

        me.loadGridStore({
            node: me.treeStore.defaultRoodId
        });

        me.addPath(me.getLoadedNodePath(me.treeStore.defaultRoodId, me.displayField));

        me.bnBtnController();

        me.getTreePanel().on('selectionchange', function(selModel, selections){
            var path,
                id = selections.length === 0 ? me.treeStore.defaultRoodId : selections[0].data[me.id];

            me.loadGridStore({node: id});

            path = me.getLoadedNodePath(id, me.displayField);

            if(me.needRemember) {
                me.addPath(path);
            }

            me.getPathIpt().setValue(path);

            me.bnBtnController();

            console.log(me.paths);
        });
        me.getGridPanel().on('itemdblclick', function(gridPanel, record){
            if(record.raw.leaf){
                return;
            }
            me.loadGridStore({node: record.raw[me.id]});
            //与树形列表联动
            me.selectTreeNode(record.raw[me.id], record.raw.parentId);

        });
        me.getBackBtn().on('click', function(btn, e){
            me.backSelect();
            me.bnBtnController();
        });
        me.getNextBtn().on('click', function(btn, e){
            me.nextSelect();
            me.bnBtnController();
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
     * 获取返回按钮
     * @returns {*}
     */
    getBackBtn: function(){
        var me = this;
        return me.down('#back152752');
    },

    /**
     * 获取前进按钮
     * @returns {*}
     */
    getNextBtn: function(){
        var me = this;
        return me.down('#next152752');
    },

    /**
     * 获取路径展示框
     * @returns {*}
     */
    getPathIpt: function(){
        var me = this;
        return me.down('#pathipt152752');
    },

    /**
     * 获取节点的路径
     * @param nodeId
     * @param field
     * @returns {*|string|String}
     */
    getLoadedNodePath: function(nodeId, field){
        var me = this;
        return me.treeStore.getNodeById(nodeId).getPath(field);
    },

    /**
     * 添加路径到记忆数组里
     * @param path
     */
    addPath: function(path){
        var me = this,
            i;

        if(me.paths.length === 0){
            me.paths.focusIndex =  me.paths.push(path);
            return;
        }

        for(i = 0; i < me.paths.length - me.paths.focusIndex; i++){
            me.paths.pop();
        }

        if(me.paths.length >= me.allowMemoryLength){
            me.paths.shift();
        }

        me.paths.focusIndex =  me.paths.push(path);
    },

    /**
     * 前进后退键可不可用控制
     */
    bnBtnController: function(){
        var me = this;

        if(me.paths.length === 1){
            me.getBackBtn().setDisabled(true);
            me.getNextBtn().setDisabled(true);
        }else{
            if(me.paths.focusIndex > 1){
                me.getBackBtn().setDisabled(false);
            }

            if(me.paths.focusIndex === 1){
                me.getBackBtn().setDisabled(true);
            }

            if(me.paths.focusIndex ===  me.paths.length){
                me.getNextBtn().setDisabled(true);
            }

            if(me.paths.focusIndex < me.paths.length){
                me.getNextBtn().setDisabled(false);
            }
        }

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
            tree.selectPath(node.getPath(me.id), me.id);
            return;
        }

        //节点还没有加载进来则加载该节点再选中
        if(!parentId || !me.treeStore.getNodeById(parentId)){
            console.error('lost parent! can not load node..');
            return;
        }

        parent = me.treeStore.getNodeById(parentId);

        tree.expandNode(parent, false, function(){
            var node = parent.findChild(me.id, nodeId);
            tree.selectPath(node.getPath(me.id), me.id);
        });
    },

    /**
     * 回退到上一次选中状态
     */
    backSelect: function(){
        var me = this,
            root = me.treeStore.getRootNode().getPath(me.displayField);

        me.needRemember = false;

        me.paths.focusIndex = me.paths.focusIndex - 1;

        if(me.paths[me.paths.focusIndex - 1] === root ){
            me.getTreePanel().getSelectionModel().deselectAll();
        }else{
            me.getTreePanel().selectPath(me.paths[me.paths.focusIndex - 1], me.displayField);
        }

        me.needRemember = true;
    },

    /**
     * 进入下一个选中状态
     */
    nextSelect: function(){
        var me = this,
            root = me.treeStore.getRootNode().getPath(me.displayField);

        me.needRemember = false;

        me.paths.focusIndex = me.paths.focusIndex + 1;

        if(me.paths[me.paths.focusIndex - 1] === root ){
            me.getTreePanel().getSelectionModel().deselectAll();
        }else{
            me.getTreePanel().selectPath(me.paths[me.paths.focusIndex - 1], me.displayField);
        }

        me.needRemember = true;
    }

});