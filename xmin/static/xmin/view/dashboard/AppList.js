Ext.define('Xmin.view.dashboard.AppList', {
    extend : 'Ext.panel.Panel',
    alias  : 'widget.AppList',

    title  : gettext('Control Panel'),
    border : false,
    layout:'fit',
    autoScroll: true,

    tbar:[
        {
            xtype       : 'textfield',
            name        : 'filter_name',
            fieldLabel  : gettext('Search model'),
            labelAlign  : 'right'
        },
        '->'
    ],

    initComponent: function(){
        this.callParent(arguments);

        var model_list = [],
            app_list   = [{name: gettext('-- All Applications --'), app: 'xmin_every_app'}],
            toolbar    = this.down('toolbar');

        for (var i=0; i < Xmin.settings.app_list.length; i++) {
            var app = Xmin.settings.app_list[i];
            if(app.has_module_perms){

                app_list.push({
                    app: app.app,
                    name: app.name
                });

                for (var j=0; j < app.models.length; j++) {
                    var model = app.models[j];
                    model_list.push(model);
                }
            }
        }

        this.add(
            {
                xtype  : 'ModelList',
                border : false,
                xmin_data   : model_list
            }
        );

        toolbar.insert(1,
            {
                xtype       : 'combobox',
                name        : 'filter_app',
                fieldLabel  : gettext('Application'),
                labelAlign  : 'right',
                displayField: 'name',
                valueField  : 'app',
                value       : 'xmin_every_app',
                store       : Ext.create('Ext.data.Store', {
                    fields  : ['app', 'name'],
                    data    : app_list
                })
            }
        );
    }
});