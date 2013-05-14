/**
 * @class Xmin.store.Manager
 * <p>Provides a way access all data stores used by the Admin controller.</p>
 *
 * <p>
 *     The admin stores are divided into the following types:
 *     <ul>
 *         <li>buffered - buffered stores with data from all fields defined in a given admin's list_display tuple</li>
 *         <li>simple - unbuffered stores (load all instances from database to memory) with access to only 2 fields
 *         (id and repr - string representation of object)</li>
 *     </ul>
 * </p>
 *
 * @singleton
 */
Ext.define('Xmin.store.Manager', {
    singleton: true,

    requires : [
    ],

    /**
     * Checks if a buffered store identified by a given administrative token is already defined and returns it.
     * @param {string} xmin token of the object e.g. /admin/myapp/mymodel/
     * @return {Ext.data.Store}
     */
    lookup_buffered: function(token) {

    },


    /**
     * Checks if a buffered store identified by a given administrative token is already defined and returns it.
     * @param {string} xmin token of the object e.g. /admin/myapp/mymodel/
     * @return {Ext.data.Store}
     */
    lookup_buffered: function(token) {

    },


    /**
     * Creates and returns a buffered store identified by a given administrative token
     * @param {string} xmin token of the object e.g. /admin/myapp/mymodel/
     * @return {Ext.data.Store}
     */
    get_buffered: function(token) {

    },



});