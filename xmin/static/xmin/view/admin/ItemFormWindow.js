Ext.define('Xmin.view.admin.ItemFormWindow', {
    extend : 'Ext.window.Window',
    mixins: ['Xmin.view.admin.RoutableWindow'],
    requires: ['Xmin.util.xtypes.Factory'],

    height   : 300,
    width    : 500,

    bodyPadding: 5,
    defaultType: 'textfield',

    items: [],

    initComponent: function(){
        this.callParent();

        var config  = this.initialConfig,
            form    = this.add({ xtype: 'form', layout: 'form', border: false });

        for (var i = 0; i < config.xmin_model.fields.length; i++) {
            var field = config.xmin_model.fields[i];

            if (field.name === 'id') continue;

            form.add(Xmin.util.xtypes.Factory.get_form_field_config(field));
        }
    }
});
