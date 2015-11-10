Ext.application({
    name: "SampleApp",
    appFolder: '',
    launch: function () {

        Ext.define('SampleApp.store.TreeStore',{
            extend: 'Ext.data.TreeStore',
            defaultRoodId: 'root',
            fields: [
                {name: 'text', type: 'string'}
            ],
            proxy:{
                type: 'ajax',
                url: '/leftTreeStore',
                reader: 'json',
                autoLoad: true
            }
        });
        Ext.define('SampleApp.store.GridStore',{
            extend: 'Ext.data.TreeStore',
            defaultRoodId: 'root',
            fields: [
                {name: 'text', type: 'string'}
            ],
            proxy:{
                type: 'ajax',
                url: '/rightTreeStore',
                reader: 'json'
            }
        });
        var treeStore = Ext.create('SampleApp.store.TreeStore');
        var gridStore = Ext.create('SampleApp.store.GridStore');
        //gridStore.load();
        Ext.create('Ext.panel.Panel',{
                    height: 500,
                    border: true,
                    width: 800,
                    renderTo: Ext.getBody(),
                    margin: '40 0 0 40',
                    //border: false,
                    items: [{
                        xtype: 'resourcemanager',
                        width: 800,
                        leftTreeStore: treeStore,
                        rightTreeStore: gridStore,
                        height: 500,
                        resizable: true
                    }]
        });

    }
});