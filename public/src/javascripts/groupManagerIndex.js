Ext.application({
    name: "SampleApp",
    appFolder: '',
    launch: function () {
        var panel = Ext.create('Ext.panel.Panel',{
            height: 500,
            renderTo: Ext.getBody(),
            //border: false,
            items: [{
                xtype: 'resourcemanager',
                width: 800,
                height: 800,
                resizable: true
            }]
        });
    }
});