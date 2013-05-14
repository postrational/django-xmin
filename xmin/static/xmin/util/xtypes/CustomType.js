Ext.define('Xmin.util.xtypes.CustomType', {
    extend:'Ext.form.field.Text',

    alias : 'widget.xmincustomfield',

    validator : function(value){
        if (value !== "CustomType") {
            return true;
        }

        return gettext('This field must not be set to "CustomType".');
    }
});