Ext.define('Xmin.controller.ServerEvents', {
    extend: 'Ext.app.Controller',

    requires  : [],

    views: [],

    stores: [
        'ServerEvents'
    ],

    models: [
        'ServerEvent'
    ],

    refs: [],

    last_event_id: null,

    init: function() {
        this.addEvents('server_event');

        this.application.on({
            server_event   : this.onServerEvent,
            scope: this
        });

        this.loadRecentEvents();
        this.startPollingEvents();
    },

    loadRecentEvents: function(){
        this.pollEvents();
    },

    pollEvents: function() {
        /* During the initial setup phase, we only poll for events from recent past. */
        /* These will not create corresponding client events and will be only loaded to the store */
        var initial_setup = this.last_event_id === null,
            url   = Xmin.settings.data_path + '/events/',
            store = Ext.getStore('ServerEvents'),
            that  = this;

        url = url + (initial_setup ? 'recent' : this.last_event_id) + '/';

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            success: function(response){
                var app_response = Ext.JSON.decode(response.responseText);
                if (app_response.success){
                    that.last_event_id = app_response.last_id;

                    if(initial_setup){
                        store.loadData(app_response.events);
                    }
                    else {
                        if(app_response.events) {
                            that.recieveEvents(app_response.events);
                        }
                    }
                }
                else {
                    Xmin.util.Messages.serverError(response);
                }
            }
        });
    },

    startPollingEvents: function(){
        var controller = this;
        var poller =  function(){
            controller.pollEvents();
        };
        this.poller_id = window.setInterval(poller, Xmin.settings.poll_interval);
    },

    stopPollingEvents: function(){
        if(this.poller_id){
            this.poller_id = window.clearInterval(this.poller_id);
            this.poller_id = null;
        }
    },

    recieveEvent: function(event){
        this.recieveEvents([event]);
    },

    recieveEvents: function(events){
        var store = Ext.getStore('ServerEvents'),
            recieved_events = this.recieved_events;

        for (var i=0; i < events.length; i++) {
            var event = events[i];
            
            if(store.getById(event.id) === null){
                store.add(event);
                this.application.fireEvent('server_event', event);
            }
        };
    },

    onServerEvent: function(event){
        console.log('onServerEvent', event);
    }
});
