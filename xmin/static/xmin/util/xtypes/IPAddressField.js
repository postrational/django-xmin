Ext.define('Xmin.util.xtypes.IPAddressField', {
    extend:'Ext.form.field.Text',

    alias : 'widget.IPAddressField',

    validator : function(value){
        // Refer to ipv4_re in django/core/validators.py
        var re = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/;
        if(re.test(value)){
            return true;
        }
        return gettext('Enter a valid IPv4 address.');
    }
});