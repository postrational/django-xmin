Ext.define('Xmin.controller.Admin', {
    extend: 'Ext.app.Controller',

    requires  : [
        'Xmin.util.Text',
        'Xmin.util.Messages'
    ],

    views: [
        'admin.RoutableWindow',
        'admin.ChangeListWindow',
        'admin.ItemFormWindow',
        'admin.ItemAddWindow',
        'admin.ItemChangeWindow'
    ],

    stores: [
    ],

    models: [
    ],

    refs: [
    ],

    init: function() {
        this.registerAdminUrls();

        this.control({
            'ChangeListWindow button[name="add_button"]':{
                click : this.onChangeListAdd
            },

            'ChangeListWindow button[name="search_button"]':{
                click : this.onChangeListSearch
            },

            'ChangeListWindow textfield[name="search_query"]':{
                specialkey : function(field, e, eOpts){
                    if (e.getKey() == e.ENTER) {
                        this.onChangeListSearch(field, e, eOpts);
                    }
                }
            },

            'ChangeListWindow button[name="actions_menu"] menuitem':{
                click: this.onChangeListSelectAction
            },

            '#ChangeListGrid':{
                itemdblclick : this.onChangeListItemEdit,
                selectionchange : this.onChangeListSelectionChange
            },

            'ItemAddWindow button[name="save_button"]':{
                click : this.onAddItemSave
            },

            'ItemAddWindow button[name="save_and_edit_button"]':{
                click : this.onAddItemSaveAndContinueEditing
            },

            'ItemChangeWindow button[name="save_button"]':{
                click : this.onChangeItemSave
            },

            'ItemChangeWindow button[name="save_and_edit_button"]':{
                click : this.onChangeItemSaveAndContinueEditing
            }
        });

        this.application.on({
            server_event   : this.onServerEvent,
            scope: this
        });
    },

    registerAdminUrls: function() {
        var router = this.getController('Router'),
            urls   = [],
            that   = this;

        Ext.Array.forEach(Xmin.settings.app_list, function(item, index, allItems){
            urls.push({
                pattern  : '^'+item.app_url+'$',
                callback : that.appIndexFactory(item)
            });

            Ext.Array.forEach(item.models, function(item, index, allItems){

//                url(r'^$',
//                    wrap(self.changelist_view),
//                    name='%s_%s_changelist' % info),
//                url(r'^add/$',
//                    wrap(self.add_view),
//                    name='%s_%s_add' % info),
//                url(r'^(.+)/history/$',
//                    wrap(self.history_view),
//                    name='%s_%s_history' % info),
//                url(r'^(.+)/delete/$',
//                    wrap(self.delete_view),
//                    name='%s_%s_delete' % info),
//                url(r'^(.+)/$',
//                    wrap(self.change_view),
//                    name='%s_%s_change' % info),

                urls.push(
                    {
                        pattern  : '^'+item.admin_url+'$',
                        callback : that.changeListWindowFactory(item)
                    },
                    {
                        pattern  : '^'+item.admin_url+'add/$',
                        callback : that.itemAddWindowFactory(item)
                    },
                    {
                        pattern  : '^'+item.admin_url+'(?!add).*/$',
                        callback : that.itemChangeWindowFactory(item)
                    }
                );
            });
        });

        router.registerUrls(urls);
    },

    routableWindowFactory: function(model_config, class_path, window_config) {
        Ext.require(class_path);

        return function openRoutableWindow(token){
            var routable_window = Ext.ComponentQuery.query('window[xmin_token="'+token+'"]')[0];

            if (routable_window){
                routable_window.show().focus();
            }
            else {
                var window_title = window_config ? window_config.title : gettext('Window');

                Ext.create(class_path, {
                    title : window_title,

                    xmin_token : token,
                    xmin_model : model_config

                }).show();
            }
        }
    },

    appIndexFactory: function(config) {
        return function(token){
            console.log('appIndex for', config.app, 'token is', token);
        }
    },

    changeListWindowFactory: function(config) {
        var window_config = {
            title : Xmin.util.Text.capfirst(config.verbose_name_plural)
        }

        return this.routableWindowFactory(config, 'Xmin.view.admin.ChangeListWindow', window_config);
    },

    onChangeListSearch : function(widget, event, eOpts) {
        var this_window = widget.up('window'),
            query_field = this_window.down('textfield[name="search_query"]'),
            grid  = this_window.down('grid'),
            store = grid.getStore(),
            proxy = store.getProxy();

        proxy.extraParams['q'] = query_field.getValue();
        store.reload();
    },

    onChangeListAdd : function(button, event, eOpts) {
        var this_window    = button.up('window'),
            model_token    = this_window.xmin_model.admin_url,
            add_item_token = model_token + 'add/',
            router         = this.getController('Router');

        router.navigate(add_item_token);
    },

    onChangeListItemEdit: function(view, record, item, index, e, eOpts) {
        var this_window       = view.up('window'),
            model_token       = this_window.xmin_model.admin_url,
            change_item_token = model_token + record.get('id') + '/',
            router            = this.getController('Router');

        router.navigate(change_item_token);
    },

    onChangeListSelectionChange: function(selection_model, selected, eOpts) {
        var store          = selection_model.getStore(),
            total_count    = store.getTotalCount(),
            token          = store.xmin_token,
            list_window    = Ext.ComponentQuery.query('window[xmin_token="'+token+'"]')[0],
            status_field   = list_window.down('[name="status_field"]'),
            selected_count = selected.length;

        status_field.setText(interpolate(
            ngettext('%(sel)s of %(cnt)s selected', '%(sel)s of %(cnt)s selected', selected_count),
            {sel: selected_count, cnt: total_count}, true));
    },

    onChangeListSelectAction: function(menu_item, e, eOpts, confirm) {
        var action      = menu_item.name,
            this_window = menu_item.up('window'),
            token       = this_window.xmin_token,
            grid        = this_window.down('grid'),
            store       = grid.getStore(),
            selection   = grid.getSelectionModel().getSelection(),
            selected    = Ext.Array.map(selection, function(item) { return item.get('id') }),
            req_params  = { action   : action, _selected_action : selected  },
            that = this;

        if(confirm === 'YES') {
            req_params.post = 'yes'
        }

        Ext.Ajax.request({
            url: Xmin.settings.data_path + token + 'action/',
            method: 'POST',
            params: req_params,
            success: function(response){
                var app_response = Ext.JSON.decode(response.responseText);
                if (app_response.success){
                    if(app_response.confirmation){
                        var confirmation = app_response.confirmation.replace(/a href="\/admin/g, 'a href="#/admin');

                        Ext.Msg.show({
                            title   : gettext('Are you sure?'),
                            msg     : confirmation,
                            icon    : Ext.Msg.QUESTION,
                            buttons : Ext.Msg.YESNO,
                            fn      : function(buttonId, text, opt){
                                if (buttonId === 'yes') {
                                    that.onChangeListSelectAction(menu_item, e, eOpts, 'YES');
                                }
                            }
                        });
                    }
                    else{
                        store.reload();
                    }
                }
                else {
                    Xmin.util.Messages.serverError(response);
                }
            }
        });
    },

    itemAddWindowFactory: function(config) {
        var window_config = {
            title : Xmin.util.Text.capfirst(config.verbose_name)
        }
        return this.routableWindowFactory(config, 'Xmin.view.admin.ItemAddWindow', window_config);
    },

    onItemSave: function(button, method, continue_editing){
        var item_window = button.up('window'),
            form        = item_window.down('form').getForm(),
            values      = form.getValues(),
            token       = item_window.xmin_token,
            that        = this;

        item_window.setLoading('Saving...');

        Ext.Ajax.request({
            url: Xmin.settings.data_path + token,
            method: method,
            params: Ext.JSON.encode(values),
            success: function(response){
                var app_response = Ext.JSON.decode(response.responseText);
                item_window.setLoading(false);

                if (app_response.success){
//                    success_callback(app_response, item_window);
                    app_response.event.item_window = item_window;
                    app_response.event.continue_editing = continue_editing;
                    that.getController('ServerEvents').recieveEvent(app_response.event);
                }
                else {
                    Ext.Object.each(app_response.data, function(key, value, obj){
                        var field = form.findField(key);
                        field.markInvalid(value.join('<br/>'));
                    });
                    Xmin.util.Messages.userMessage("WARNING", gettext('Item not saved'), app_response.msg);
                }
            }
        });
    },

    onAddItemSave: function(button, continue_editing) {
        var method = 'POST';
        this.onItemSave(button, method, continue_editing);
    },

    onAddItemSaveAndContinueEditing: function(button) {
        var continue_editing = true;
        this.onAddItemSave(button, continue_editing);
    },

    itemChangeWindowFactory: function(config) {
        var window_config = {
            title : Xmin.util.Text.capfirst(config.verbose_name)
        }
        return this.routableWindowFactory(config, 'Xmin.view.admin.ItemChangeWindow', window_config);
    },

    onChangeItemSave: function(button, continue_editing) {
        var method = 'PUT';
        this.onItemSave(button, method, continue_editing);
    },

    onChangeItemSaveAndContinueEditing: function(button) {
        var continue_editing = true;
        this.onChangeItemSave(button, continue_editing);
    },

    onServerEvent: function(event){
        if(event.action === 'ADDITION') {
            this.handleServerAddEvent(event);
        }

        if(event.action === 'CHANGE') {
            this.handleServerChangeEvent(event);
        }

    },

    handleServerAddEvent: function(event){
        var token = event.token,
            change_list_token    = token.split('/').slice(0,-2).join('/') + '/',
            change_list_store_id = '/store/buffered' + change_list_token,
            simple_list_store_id = '/store/simple' + change_list_token,
            change_list_store    = Ext.data.StoreManager.lookup(change_list_store_id),
            simple_list_store    = Ext.data.StoreManager.lookup(simple_list_store_id);

        // Update the List window store (if loaded)
        if(change_list_store){
            change_list_store.add(event.object);
//            change_list_store.update();
            change_list_store.sort();
        }

        // Update the List window store (if loaded)
        if(simple_list_store){
            simple_list_store.add(event.object);
//            change_list_store.update();
            simple_list_store.sort();
        }


        if(event.item_window) {
            // The event originated in a local window
            var form  = event.item_window.down('form').getForm(),
                router = this.getController('Router');

            //Xmin.util.Messages.userMessage("INFO", gettext('Item saved'), app_response.msg);
            form.setValues(event.object);
            event.item_window.close();
            if(event.continue_editing === true) {
                router.navigate(change_list_token + event.object.id + '/');
            }
        }
    },

    handleServerChangeEvent: function(event){
        var token = event.token,
            change_list_token    = token.split('/').slice(0,-2).join('/') + '/',
            change_list_store_id = '/store/buffered' + change_list_token,
            change_list_store    = Ext.data.StoreManager.lookup(change_list_store_id);

        // Update the List window store (if loaded)
        if(change_list_store){
            var change_list_entry = change_list_store.getById(event.object.id);
            if(change_list_entry){
                change_list_entry.set(event.object);
                change_list_entry.commit();
            }
        }

        if(event.item_window) {
            // The event originated in a local window
            var form  = event.item_window.down('form').getForm();
            form.setValues(event.object);
            if(event.continue_editing !== true) {
                event.item_window.hide();
            }
        }
    }


});
