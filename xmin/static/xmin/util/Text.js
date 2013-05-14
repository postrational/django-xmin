Ext.define('Xmin.util.Text', {
    singleton: true,
    capfirst : function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
