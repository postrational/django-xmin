Ext.define('Xmin.view.admin.ItemAddWindow', {
    extend   : 'Xmin.view.admin.ItemFormWindow',
    alias    : 'widget.ItemAddWindow',
    mixins   : ['Xmin.view.admin.RoutableWindow'],
    requires : ['Xmin.util.xtypes.Factory'],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items  : [
            {
                xtype : 'tbfill'
            },
            {
                xtype : 'button',
                text  : gettext('Save and add another'),
                name  : 'save_and_edit_button',
                disabled: true
            },
            {
                xtype : 'button',
                text  : gettext('Save and continue editing'),
                name  : 'save_and_edit_button'
            },
            {
                xtype : 'button',
                text  : gettext('Save'),
                name  : 'save_button'
            }
        ]
    }],

    initComponent: function(){
        this.callParent();
    }
});
