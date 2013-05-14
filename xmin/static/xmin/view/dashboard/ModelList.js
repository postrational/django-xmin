Ext.define('Xmin.view.dashboard.ModelList', {
    extend : 'Ext.view.View',
    alias  : 'widget.ModelList',

    requires  : [
        'Xmin.util.Text'
    ],

    deferInitialRefresh: false,

    tpl  : Ext.create('Ext.XTemplate',
        '<ul class="xmin-modellist-buttons">',
        '<tpl for=".">',
            '<li>',
                '<a class="{model}">{[Xmin.util.Text.capfirst(values.verbose_name_plural)]}</a>',
            '</li>',
        '</tpl>',
        '</ul>'
    ),

    plugins : [
        Ext.create('Ext.ux.DataView.Animated', {
            duration  : 250,
            idProperty: 'model'
        })
    ],

    cls: 'xmin-modellist',
    itemSelector: 'a',
    autoScroll  : true,

    initComponent: function(){
        var that = this;

        Ext.applyIf(that, {
            store : Ext.create('Ext.data.Store', {
                fields : [
                    'app',
                    'model',
                    'verbose_name_plural',
                    'add_url',
                    'admin_url',
                    'perms'
                ],
                data : that.initialConfig.xmin_data
            })
        });

        that.callParent(arguments);
    }
});

//Ext.define('Xmin.view.dashboard.ModelList', {
//    extend : 'Ext.view.View',
//    alias  : 'widget.ModelList',
//
//    requires  : [
//        'Xmin.util.Text'
//    ],
//
//    deferInitialRefresh: false,
//
//    tpl  : Ext.create('Ext.XTemplate',
//        '<tpl for=".">',
//            '<div class="phone">',
////                (!Ext.isIE6? '<img width="64" height="64" src="images/phones/{[values.name.replace(/ /g, "-")]}.png" />' :
////                 '<div style="width:74px;height:74px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'images/phones/{[values.name.replace(/ /g, "-")]}.png\',sizingMethod=\'scale\')"></div>'),
//                '<img width="64" height="64" src="http://dev.sencha.com/deploy/ext-4.1.0-gpl/examples/view/images/phones/Nokia-5310-XpressMusic.png">',
//                '<strong>{[Xmin.util.Text.capfirst(values.verbose_name_plural)]}</strong>',
//            '</div>',
//        '</tpl>'
//    ),
//
//    plugins : [
//        Ext.create('Ext.ux.DataView.Animated', {
//            duration  : 550,
//            idProperty: 'name'
//        })
//    ],
//
//    cls: 'phones',
//
//    itemSelector: 'div.phone',
//    overItemCls : 'phone-hover',
////    multiSelect : false,
//    autoScroll  : true,
//
//
//    initComponent: function(){
//        var that = this;
//
//        Ext.applyIf(that, {
//            store : Ext.create('Ext.data.Store', {
//                fields : [
//                    'verbose_name_plural',
//                    'add_url',
//                    'admin_url',
//                    'perms'
//                ],
//                data : that.initialConfig.xmin_data
//            })
//        });
//
//        that.callParent(arguments);
//    }
//});