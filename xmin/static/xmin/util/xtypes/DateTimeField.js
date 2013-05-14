Ext.define('Xmin.util.xtypes.DateTimeField', {
    extend:'Ext.form.FieldContainer',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    requires: ['Ext.form.field.Base'],
    alias  : 'widget.DateTimeField',

    layout : 'hbox',

    initComponent: function(){
        var that = this;
        that.callParent(arguments);

        var name = that.initialConfig.name;
        that.add(
            {
                xtype  : 'datefield',
                format : 'Y-m-d',
                name   : name+'_0',
                flex   : 1
            },
            {
                xtype  : 'timefield',
                format : 'H:i:s',
                name   : name+'_1',
                flex   : 1
            }
        );
        that.initField();
    },

//    initValue: function() {
//        var me = this,
//            valueCfg = me.value;
//        me.originalValue = me.lastValue = valueCfg || me.getValue();
//        if (valueCfg) {
//            me.setValue(valueCfg);
//        }
//    },

    setValue: function(value){
        var datetime  = new Date(value)
            datefield = this.query('datefield')[0],
            timefield = this.query('timefield')[0];

        datefield.setValue(datetime);
        timefield.setValue(datetime);

        return this;
    },

    markInvalid: function(errors) {
        var datefield = this.query('datefield')[0],
            timefield = this.query('timefield')[0];

        datefield.markInvalid(errors);
        timefield.markInvalid(errors);

    },

    clearInvalid: function(){
        var datefield = this.query('datefield')[0],
            timefield = this.query('timefield')[0];

        datefield.clearInvalid();
        timefield.clearInvalid();
    },

    /*
     * Don't return any data for submit; the form will get the info from the individual checkboxes themselves.
     */
    getSubmitData: function() {
        return null;
    },

    /*
     * Don't return any data for the model; the form will get the info from the individual checkboxes themselves.
     */
    getModelData: function() {
        return null;
    }



//}, function() {
//
//    this.borrow(Ext.form.field.Base, ['setError']);
//
});
