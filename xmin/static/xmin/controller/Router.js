Ext.define('Xmin.controller.Router', {
    extend: 'Ext.app.Controller',

    requires  : [
    ],

    views: [
    ],

    stores: [
    ],

    models: [
    ],

    refs: [
    ],

    urls:[],

    init: function() {
        Ext.util.History.init();
        Ext.util.History.on('change', this.onNavigate, this);

        this.registerUrls([
            { pattern: '^/test/$', callback: this.log }
        ]);
    },

    log: function(){
        console.log(arguments);
    },

    navigate: function(token){
        Ext.util.History.add(token);
    },

    onNavigate: function(token){
        console.log('react to token:', token);

        Ext.Array.forEach(this.urls, function(item, index, allItems){
            if(item.regexp.test(token)){
                console.log(item.pattern, 'matched token', token);
                item.callback(token);
            }
        });
    },

    registerUrls: function(urls){
        var that = this,
            active_token = Ext.util.History.getHash(),
            active_token_matched = false;


        Ext.Array.forEach(urls, function(item, index, allItems){
            item.regexp = RegExp(item.pattern);
            that.urls.push(item)

            if(item.regexp.test(active_token)){
                active_token_matched = true;
            }
        });

        if(active_token_matched){
            this.onNavigate(active_token);
        }
    }

});
