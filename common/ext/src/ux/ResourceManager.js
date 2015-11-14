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
        'Ext.tree.Panel'
        /*'Ext.grid.Panel'*/
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
        leftTreeStore: null,

        //根节点是否可见
        rootVisible: false,

        //列表的数据集合
        rightTreeStore: null,

        //树形列表列配置
        leftTreeColumns: {
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
        rightTreeColumns: {
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
        //单元格样式
        cellStyle: {
            backgroundColor: '#fff'
        },

        displayField: 'text',

        id: 'id',

        allowMemoryLength: 10,

        level: 3
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
                enableKeyEvents: true,
                itemId: 'pathipt152752',
                height: 23,
                width: me.width - 150
            },{
                xtype: 'button',
                margin: '3 0 0 5',
                itemId: 'refresh152752',
                text: '刷新',
                width: 40,
                textAlign: 'center'
            }]

        },{
            xtype: 'treepanel',
            itemId: 'left152752',
            title: 'tree',
            region: 'west',
            width: 200,
            store: me.leftTreeStore,
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
            columns: me.leftTreeColumns,
            tbar: [
                {xtype: 'button', text: '新建'}
            ]
        }, {
            xtype: 'treepanel',
            itemId: 'right152752',
            region: 'center',
            rowLines: false,
            useArrows: true,
            layout: 'fit',
            collapsible: false,
            displayField: me.displayField,
            rootVisible: me.rootVisible,
            store: me.rightTreeStore,
            title: 'grid',
            columns: me.rightTreeColumns,
            tbar: [
                {xtype: 'button', text: '+'}
            ]
        }, {
            xtype: 'panel',
            region: 'south',
            layout: 'column',
            height: 25,
            items:[{
                xtype: 'panel',
                itemId: 'errerdisplaypanel152752',
                height: 20,
                border: false,
                width: me.width - 150,
                margin: '1 0 0 0',
                headerPosition: 'left'
            }]
        }];
        me.callParent(arguments);

        me.addPath(me.getLoadedNodePath(me.leftTreeStore.defaultRoodId, me.displayField));
        me.bnBtnController();

        me.getPathIpt().setValue(me.getLoadedNodePath(me.leftTreeStore.defaultRoodId, me.displayField));

        me.getTreePanel().on('selectionchange', function(selModel, selections){
            var path,
                id = selections.length === 0 ? me.leftTreeStore.defaultRoodId : selections[0].data[me.id];

            me.loadRightStore({node: id});

            path = me.getLoadedNodePath(id, me.displayField);

            if(me.needRemember) {
                me.addPath(path);
            }
            console.info('has trigger select');
            console.log(me.paths);
            me.getPathIpt().setValue(path);

            me.bnBtnController();
        });
        me.getGridPanel().on('itemdblclick', function(gridPanel, record){
            if(record.raw.expandable){
                return;
            }
            //与树形列表联动, 触发树形列表的selectchange事件
            me.selectTreeNodeById(record.raw[me.id], record.raw.parentId);
        });
        me.getBackBtn().on('click', function(btn, e){
            me.backSelect();
            me.bnBtnController();
        });
        me.getNextBtn().on('click', function(btn, e){
            me.nextSelect();
            me.bnBtnController();
        });
        me.getRefreshBtn().on('click', function(btn, e){
            me.refresh();
        });
        me.getPathIpt().on('keypress', function(ipt, e){
            var v;
            if(e.button === 12) {
                v = ipt.getValue();
                me.selectNodeByTextPath(v);
            }
        });
    },

    /**
     * 加载grid的数据集
     * @param param
     */
    loadRightStore: function(param){
        var me = this;

        if(me.rightTreeStore){
            me.rightTreeStore.load({params: param});
        }
    },

    /**
     * 获取树形列表组件
     * @returns {*}
     */
    getTreePanel: function(){
        var me = this;
        return me.down('#left152752');
    },

    /**
     * 获取列表组件
     * @returns {*}
     */
    getGridPanel: function(){
        var me = this;
        return me.down('#right152752');
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
     * 获取刷新按钮
     * @returns {*}
     */
    getRefreshBtn: function(){
        var me = this;
        return me.down('#refresh152752');
    },

    /**
     * 获取展示错误信息的区域
     * @returns {*}
     */
    getErrorDisplayPanel: function(){
        var me = this;
        return me.down('#errerdisplaypanel152752');
    },

    /**
     * 设置出错信息
     * @param info
     */
    setErrorMassage: function(info){
        var me = this,
            comp = Ext.create('Ext.Component', {
                html: info,
                margin: '2 0 0 5',
                height: 20,
                style: {
                    color: 'red'
                }
            });
        me.getErrorDisplayPanel().removeAll();
        me.getErrorDisplayPanel().add(comp);
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
        return me.leftTreeStore.getNodeById(nodeId).getPath(field);
    },

    /**
     * 刷新界面
     */
    refresh: function(){
        var me = this;
        me.paths.length = 0;
        me.needRemember = false;
        me.addPath(me.getLoadedNodePath(me.leftTreeStore.defaultRoodId, me.displayField));
        me.getPathIpt().setValue(me.getLoadedNodePath(me.leftTreeStore.defaultRoodId, me.displayField));
        me.leftTreeStore.load();
        me.needRemember = true;
        console.log(me.paths);
    },

    /**
     * 添加路径到记忆数组里
     * @param path
     */
    addPath: function(path){
        var me = this,
            i, diff;

        if(me.paths.length === 0){
            me.paths.focusIndex =  me.paths.push(path);
            return;
        }

        diff = me.paths.length -  me.paths.focusIndex;

        for(i = 0; i < diff; i++){
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
    selectTreeNodeById: function(nodeId, parentId){
        var me = this,
            tree = me.getTreePanel(),
            node = me.leftTreeStore.getNodeById(nodeId),
            parent;

        if(node){
            tree.selectPath(node.getPath(me.id), me.id);
            return;
        }

        //节点还没有加载进来则加载该节点再选中
        if(!parentId || !me.leftTreeStore.getNodeById(parentId)){
            console.warn('lost parent! can not load node..');
            me.setErrorMassage('lost parent! can not load node..');
            return;
        }

        parent = me.leftTreeStore.getNodeById(parentId);

        tree.expandNode(parent, false, function(){
            var node = parent.findChild(me.id, nodeId);
            tree.selectPath(node.getPath(me.id), me.id);
        });
    },

    /**
     * 通过路径选择一个节点
     * @param path
     */
    selectNodeByTextPath: function(path){
        var me = this,
            leftTree = me.getTreePanel(),
            rightTree = me.getGridPanel(),
            paths = path.split('/'),
            leftPaths = paths.slice(0, me.level + 2),
            rightPaths = paths.slice(me.level + 2, paths.length),
            leftPath = leftPaths.join('/'),
            rightPath = '/Root/' + rightPaths.join('/'),
            selectRight = function(){
                if(me.rightTreeStore.isLoading()){
                    setTimeout(selectRight, 1000);
                }else if(rightPaths.length > 0){
                    rightTree.selectPath(rightPath, me.displayField, '/', function (bSuccess) {
                        console.log(rightPaths);
                        if (!bSuccess) {
                            console.warn('not find ' + path);
                            me.setErrorMassage('not find ' + path + '!');
                        } else {
                            me.setErrorMassage(' ');
                        }
                    });
                }
            };
        //console.log(leftPath);
        //console.log(rightPath);

        if(!path || path === '/Root'){
            me.refresh();
            me.setErrorMassage(' ');
            return;
        }

        leftTree.selectPath(leftPath, me.displayField, '/', function(bSuccess, oLastNode){
            console.log('aaaa');
            if(!bSuccess){
                console.warn('not find ' + path);
                me.setErrorMassage('not find ' + path + '!');
                if(oLastNode) {
                    leftTree.selectPath(oLastNode.getPath());
                }
            }else{
                if(me.rightTreeStore.isLoading()){
                    setTimeout(selectRight, 1);
                }else{
                    selectRight();
                }
            }
        });
    },

    /**
     * 回退到上一次选中状态
     */
    backSelect: function(){
        var me = this,
            root = me.leftTreeStore.getRootNode().getPath(me.displayField);

        me.needRemember = false;

        me.paths.focusIndex = me.paths.focusIndex - 1;

        if(me.paths[me.paths.focusIndex - 1] === root ){
            me.getTreePanel().getSelectionModel().deselectAll();
        }else{
            me.selectNodeByTextPath(me.paths[me.paths.focusIndex - 1]);
        }

        me.needRemember = true;
    },

    /**
     * 进入下一个选中状态
     */
    nextSelect: function(){
        var me = this,
            root = me.leftTreeStore.getRootNode().getPath(me.displayField);

        me.needRemember = false;

        me.paths.focusIndex = me.paths.focusIndex + 1;

        if(me.paths[me.paths.focusIndex - 1] === root ){
            me.getTreePanel().getSelectionModel().deselectAll();
        }else{
            me.selectNodeByTextPath(me.paths[me.paths.focusIndex - 1]);
        }

        me.needRemember = true;
    }
});