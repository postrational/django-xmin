Ext.define('Xmin.view.dashboard.RecentActions', {
    extend : 'Ext.view.View',
    alias  : 'widget.RecentActions',

    store: 'ServerEvents',

    tpl: [
        '<ul class="xmin-recent-actions-list">',
        '<tpl for=".">',
            '<li class="action {model}">',
                '{[Xmin.util.Text.capfirst(values.model_name)]} ',

                '<tpl if="object_name != undefined">',
                    '<tpl if="action == \'DELETION\'">',
                        '<span class="object_name">{object_name}</span> ',
                    '<tpl else>',
                        '<a href="#/admin/{token}"><span class="object_name">{object_name}</span></a> ',
                    '</tpl>',
                '</tpl>',

                '{[this.label_action(values.action)]} ',

                "<tpl if='this.checkUsersPanelPermission()'>",
                    '<a href="#/admin/auth/user/{user_id}/">{[this.getUsername(values.user_id, values.user_name)]}</a>',
                '<tpl else>',
                    '{[this.getUsername(values.user_id, values.user_name)]}',
                "</tpl>",

            '</li>',
        '</tpl>',
        '</ul>',
        {
            label_action: function(action_label){
                var action_texts = {
                    'ADDITION' : gettext('added by'),
                    'CHANGE'   : gettext('changed by'),
                    'DELETION' : gettext('deleted by')
                };
                return action_texts[action_label];
            },

            getUsername: function(user_id, user_name){
                if (user_id === Xmin.settings.user.id){
                    return gettext("me");
                }
                return user_name;
            },

            checkUsersPanelPermission: function(){
                return false;
            }

        }
    ],

    emptyText: gettext('No recent events...'),

    autoScroll  : true,

    border: true,
    cls: 'xmin-recent-actions',
    itemSelector: 'li.action',

    trackOver: true,
    overItemCls: 'x-item-over',


    plugins : [
        Ext.create('Ext.ux.DataView.Animated', {
            duration  : 250,
            idProperty: 'id'
        })
    ],

    listeners : {
        itemmouseenter: function(view, record, item) {
            Ext.fly(item).set({'data-qtip': record.get('message')});
        }
    },

    initComponent: function(){
        this.callParent();
    }

});