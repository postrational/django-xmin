Ext.define('Xmin.controller.Dashboard', {
    extend: 'Ext.app.Controller',

    requires  : [
        'Xmin.controller.ServerEvents',
        'Ext.ux.DataView.Animated'
    ],

    views: [
        'dashboard.Layout',
        'dashboard.MainMenu',
        'dashboard.AppList',
        'dashboard.ModelList',
        'dashboard.RecentActions'
    ],

    stores: [
    ],

    models: [
    ],

    refs: [
        {
            selector: 'ModelList',
            ref: 'modelListView'
        },
        {
            selector: 'AppList',
            ref: 'appListPanel'
        }
    ],

    init: function() {
        this.control({
            'ModelList':{
                itemclick   : this.onModelAdminOpen,
                itemcontextmenu : this.onModelListItemContextMenu
//                selectionchange : function(){ console.log('selectionchange'); },
//                itemdblclick : function(){ console.log('itemdblclick'); }
            },

            'menuitem[name=xmin-modellist-context-menu-item-add-new]' : {
                click: this.onModelListItemContextMenuItemClick
            },

            'menuitem[name=xmin-modellist-context-menu-item-list-all]' : {
                click: this.onModelListItemContextMenuItemClick
            },


            'AppList field':{ // field[name^=filter] <- should be written like this, but Ext fails here
                'change' : this.onModelListFilter
            }
        });
    },

    onModelAdminOpen : function(view, record, item, index, e, eOpts){
        var router = this.getController('Router');
        router.navigate(record.get('admin_url'));
    },
    
    onModelListFilter: function(field, newValue, oldValue, eOpts){
        var view     = this.getModelListView(),
            app_list = this.getAppListPanel(),
            store    = view.getStore(),
            filter_name = app_list.down('field[name=filter_name]').getValue(),
            filter_app  = app_list.down('field[name=filter_app]').getValue();

        store.suspendEvents();
        store.clearFilter();
        store.resumeEvents();
        store.filter([{
            fn: function(record) {
                var verbose_name_plural = record.get('verbose_name_plural'),
                    app = record.get('app');

                if(filter_name && verbose_name_plural.match(RegExp(filter_name)) === null){
                    return false; // No match on name
                }

                if(filter_app !== 'xmin_every_app' && app !== filter_app){
                    return false; // No match on app
                }

                return true;
            }
        }]);

        store.sort('name', 'ASC');
        
    },
    
    onModelListItemContextMenu: function(view, record, item, index, e, eOpts) {
        e.stopEvent();
        if (item.xminContextMenu == undefined) {
            item.xminContextMenu = Ext.create('Ext.menu.Menu', {
                items: [
                    {
                        text        : Xmin.util.Text.capfirst(record.get('verbose_name_plural')),
                        canActivate : false,
                        iconCls     : 'xmin-modellist-context-menu-item-default-icon',
                        cls         : 'xmin-modellist-context-menu-title'
                    },
                    '-',
                    {
                        text    : gettext('Add new'),
                        cls     : 'xmin-modellist-context-menu-item-routable',
                        iconCls : 'xmin-modellist-context-menu-item-add-new-icon',
                        name    : 'xmin-modellist-context-menu-item-add-new',
                        token   : record.get('add_url')
                    },
                    {
                        text    : gettext('Show all'),
                        cls     : 'xmin-modellist-context-menu-item-routable',
                        iconCls : 'xmin-modellist-context-menu-item-list-all-icon',
                        name    : 'xmin-modellist-context-menu-item-list-all',
                        token   : record.get('admin_url')
                    }
                ]
            });
        }
        item.xminContextMenu.showAt(e.getXY());
    },


    onModelListItemContextMenuItemClick: function(menuitem, e, eOpts) {
        var router = this.getController('Router');
        router.navigate(menuitem.token);
    }

});
