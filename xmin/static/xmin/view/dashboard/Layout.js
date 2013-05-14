Ext.define('Xmin.view.dashboard.Layout', {
    extend : 'Ext.panel.Panel',
    alias  : 'widget.Dashboard',

    layout : 'border',

    items  : [
        {
            xtype  : 'AppList',
            region : 'center'
        },
        {
            xtype       : 'panel',
            title       : gettext('Recent Actions'),
            region      : 'east',
            width       : 220,
            collapsible : true,
            layout      : 'fit',
//            border      : false,
            items : [{
                xtype : 'RecentActions'
            }]
        }
    ],

    dockedItems: [{
        xtype: 'MainMenu',
        dock: 'top'
    }],

//    listeners: {
//        click:{
//            element: '*', //bind to the underlying el property on the panel
//            fn:function(window, e, eOpts){
//                console.log('layout focus');
//                Ext.util.History.add(window.xmin_token);
//            }
//        }
//    },

    initComponent: function(){
        this.callParent(arguments);
    }
});