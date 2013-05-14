Ext.define('Xmin.view.admin.ItemChangeWindow', {
    extend   :  'Xmin.view.admin.ItemFormWindow',
    alias    : 'widget.ItemChangeWindow',
//    mixins   : ['Xmin.view.admin.RoutableWindow'],
    requires : ['Xmin.util.xtypes.Factory', 'Xmin.util.Messages'],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items  : [
            {
                xtype : 'button',
                text  : gettext('Delete...'),
                name  : 'delete_button'
            },
            {
                xtype : 'tbfill'
            },
            {
                xtype : 'button',
                text  : gettext('Save and add another'),
                name  : 'save_and_add_button',
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

        var config  = this.initialConfig,
            token   = config.xmin_token,
            form    = this.down('form').getForm(),
            that    = this;
        
        this.on('afterrender', function(that, eOpts){
            that.setLoading(gettext('Loading...'));
        });

        Ext.Ajax.request({
            url: Xmin.settings.data_path + token,
            method: 'GET',
            success: function(response){
                var app_response = Ext.JSON.decode(response.responseText);

                if (app_response.success){
                    form.setValues(app_response.data);
                    that.setLoading(false);
                }
                else {
                    Xmin.util.Messages.serverError(response);
                }
            }
        });
    }
});
