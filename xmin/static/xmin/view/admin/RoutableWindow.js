Ext.define('Xmin.view.admin.RoutableWindow', {
    extend : 'Ext.window.Window',

    closeAction : 'hide',

    items: [],

    listeners: {
        activate: function(window, e, eOpts){
            console.log('activate RoutableWindow');
            Ext.util.History.add(window.xmin_token);
        },

        deactivate: function(window, e, eOpts){
            console.log('deactivate RoutableWindow');
            Ext.util.History.add('');
        }
    },

    initComponent: function(){
        this.callParent();
    }
});
