Ext.define('Xmin.view.dashboard.MainMenu', {
    extend : 'Ext.toolbar.Toolbar',
    alias  : 'widget.MainMenu',

    items  : [
        {
            xtype : 'tbtext',
            text  : '<b>' + Xmin.settings.site_title + '</b>'
        },
        {
            xtype : 'tbseparator'
        }
    ],

    initComponent: function(){
        this.callParent(arguments);
    }
});