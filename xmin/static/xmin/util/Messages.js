Ext.define('Xmin.util.Messages', {
    singleton: true,


    levels: {
        10: 'DEBUG',
        20: 'INFO',
        25: 'SUCCESS',
        30: 'WARNING',
        40: 'ERROR'
    },

    constructor: function() {
        // Start the Xmin messaging framework
        Ext.Ajax.on('requestcomplete',  this.display);
        Ext.Ajax.on('requestexception', this.onServerError);

    },

    display: function(){
        var that = Xmin.util.Messages,
            messages = that.fetch_and_decode(),
            message_html = "",
            highest_level = 0;

        if(messages && messages.length) {
            for (var i=0; i < messages.length; i++) {

                var message_level = messages[i][1],
                    message_text  = messages[i][2];

                highest_level = Math.max(highest_level, message_level);
                message_html = '<p>' + message_text + '</p>';
            }
            that.userMessage(that.levels[highest_level], '', message_html);
        }
    },

    fetch_and_decode: function(){
        var cookie   = Ext.util.Cookies.get('messages');

        if(cookie) {
            var encoded  = Ext.JSON.decode(cookie),
                bits     = encoded.split('$'),
                messages = Ext.JSON.decode(bits[1]);

            Ext.util.Cookies.clear('messages');
            return messages;
        }
    },

    onServerError: function(conn, response, options, eOpts){
        Xmin.util.Messages.serverError(response);
    },

    serverError: function(response){
        if (response.status==200) {
            var app_response = Ext.JSON.decode(response.responseText);

            this.userMessage("WARNING", gettext('Server warning'), app_response.msg);
        }
        else {
            this.userMessage("ERROR", gettext('Server error') + ' (' + response.status + ')',
                gettext('An error occured on the server. <br> Please try again later.'));
        }
    },

    userMessage: function(level, title, msg){
        if(level=="WARNING"){
            Ext.Msg.show({
                title   : title,
                msg     : msg,
                icon    : Ext.Msg.WARNING,
                buttons : Ext.Msg.OK
            });
            return;
        }
        if(level=="ERROR"){
            Ext.Msg.show({
                title   : title,
                msg     : msg,
                icon    : Ext.Msg.ERROR,
                buttons : Ext.Msg.CANCEL
            });
            return;
        }
        if(level=="SUCCESS" || level=="INFO" || level=="DEBUG"){
            Ext.Msg.show({
                title   : title,
                msg     : msg,
                icon    : Ext.Msg.INFO,
                buttons : Ext.Msg.OK
            });
            return;
        }
    }
});
