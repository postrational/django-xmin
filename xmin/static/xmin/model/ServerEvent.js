Ext.define('Xmin.model.ServerEvent',{
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id'         ,  type: 'int' },
        { name: 'app'        ,  type: 'string' },
        { name: 'model'      ,  type: 'string' },
        { name: 'model_name' ,  type: 'string' },
        { name: 'object_id'  ,  type: 'int' },
        { name: 'object_name', type: 'string' },
//        { name: 'object'   ,  type: 'object' },
        { name: 'user_id'    ,  type: 'int' },
        { name: 'user_name'  ,  type: 'string' },
        { name: 'token'      ,  type: 'string' },
        { name: 'action'     ,  type: 'string' },
        { name: 'message'    ,  type: 'string' }
    ]
});
