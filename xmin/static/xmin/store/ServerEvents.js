Ext.define('Xmin.store.ServerEvents',{
    extend  : 'Ext.data.Store',
    model   : 'Xmin.model.ServerEvent',
    storeId : 'ServerEvents',

    proxy   : {
        type    : 'memory'
    },

    sorters  : [
        {
            property : 'id',
            direction: 'DESC'
        }
    ]
});
