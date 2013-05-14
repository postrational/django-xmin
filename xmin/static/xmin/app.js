Ext.BLANK_IMAGE_URL = '/static/xmin/images/s.gif';
Ext.tip.QuickTipManager.init();
Ext.Loader.setConfig({enabled:true});
Ext.Loader.setPath('Ext.ux', '/static/extjs-4/examples/ux');
Ext.Ajax.defaultHeaders = {
        'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
};

Ext.application({
    name: 'Xmin',

    appFolder: '/static/xmin',

    controllers: [
        'Dashboard',
        'Router',
        'ServerEvents',
        'Admin'
    ],

    launch: function() {
        Xmin.application = this;

        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: {
                xtype: 'Dashboard'
            }
        });
    }
});
