Ext.define('Xmin.view.admin.ChangeListWindow', {
    extend : 'Ext.window.Window',
    alias  : 'widget.ChangeListWindow',
    mixins: ['Xmin.view.admin.RoutableWindow'],

    require: ['Ext.grid.PagingScroller'],

    height : 400,
    width  : 600,
    layout : 'fit',

    closeAction : 'hide',

    items: [],

    dockedItems: [
        {
            xtype: 'toolbar',
            dock: 'top',
            items  : [
                {
                    xtype : 'button',
                    text  : gettext('Add new...'),
                    name  : 'add_button'
                },
                {
                    xtype : 'tbfill'
                },
                {
                    xtype : 'textfield',
                    name  : 'search_query'
                },
                {
                    xtype : 'button',
                    text  : gettext('Search'),
                    name  : 'search_button'
                }
            ]
        },
        {
            xtype: 'toolbar',
            dock: 'bottom',
            items  : [
                {
                    xtype : 'tbtext',
                    name  : 'status_field',
                    text  : '&nbsp;'
                },
                {
                    xtype   : 'button',
                    text    : gettext('Select an action'),
                    name    : 'actions_menu',
                    menu    : [
                    ]
                },
                {
                    xtype : 'tbfill'
                }
            ]
        }
    ],

    initComponent: function(){
        this.callParent();

        var store, grid, model_fields, columns,
            fields_by_name = {},
            config   = this.initialConfig,
            token    = config.xmin_model.admin_url,
            store_id = '/store/buffered' + token,
            status_field   = this.down('[name="status_field"]'),
            actions_button = this.down('[name="actions_menu"]'),
            add_button     = this.down('[name="add_button"]');

        // Update add_button label
        add_button.setText(gettext('Add new') + ' ' + config.xmin_model.verbose_name + '...');

        // Create actions buttons
        for (var i=0; i < config.xmin_model.actions.length; i++) {
            var action = config.xmin_model.actions[i];
            if(action[0]){
                actions_button.menu.add({
                    text    : action[1],
                    name    : action[0]
                })
            }
        };

        // Create model fields config
        model_fields = [{
            xtype : 'field',
            name  : '__str__'
        }];

        for (var i = 0; i < config.xmin_model.fields.length; i++) {
            var field = config.xmin_model.fields[i];

            model_fields.push({
                xtype : 'field',
                name  : field.name
            });

            fields_by_name[field.name] = field;
        }

        // Create grid columns config
        columns = [{
            text : '&nbsp;',
            flex : 1
        }];
        for (var i = config.xmin_model.list_display.length - 1; i >= 0; i--){
            var display_field_name = config.xmin_model.list_display[i],
                field = fields_by_name[display_field_name];

            if (display_field_name == '__str__') {
                columns.push({
                    xtype      : 'gridcolumn',
                    dataIndex  : display_field_name,
                    text       : Xmin.util.Text.capfirst(config.xmin_model.verbose_name),
                    sortable   : false

                });
            }

            if(field !== undefined) {
                columns.push({
                    xtype      : 'gridcolumn',
                    dataIndex  : field.name,
                    text       : Xmin.util.Text.capfirst(field.verbose_name)
                });
            }
        };
        columns.reverse();

        // Create store
        store = Ext.create('Ext.data.Store', {
            storeId    : store_id,
            xmin_token : token,

            fields     : model_fields,
            buffered   : true,
            leadingBufferZone: 300,
            pageSize   : config.xmin_model.list_per_page,
            remoteSort : true,
            autoLoad   : true,

            proxy: {
                type: 'ajax',
                url: Xmin.settings.data_path + token,
                reader: {
                    type: 'json',
                    root: 'data',
                    totalProperty: 'totalCount'
                }
            }
        });

        store.on("load", function (store, records, successful, eOpts) {
            var total_count    = store.getTotalCount(),
                selected_count = grid.getSelectionModel().getCount();

            status_field.setText(interpolate(
                ngettext('%(sel)s of %(cnt)s selected', '%(sel)s of %(cnt)s selected', selected_count),
                {sel: selected_count, cnt: total_count}, true));
        });

        // Create grid
        grid = Ext.create('Ext.grid.Panel', {
            xtype    : 'grid',
            itemId   : 'ChangeListGrid',
            border   : false,
            columns  : columns,
            store    : store,
            // http://www.sencha.com/forum/showthread.php?232898-Selection-disappears-when-scolling-in-an-infinite-grid
            selModel : Ext.create('Ext.selection.CheckboxModel', {
                mode : "MULTI",
                pruneRemoved: false
            })
        });

        // Add Grid to window
        this.add(grid);
    }
});
