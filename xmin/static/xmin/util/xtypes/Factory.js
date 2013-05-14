Ext.define('Xmin.util.xtypes.Factory', {
    singleton: true,

    requires : [
        'Xmin.util.xtypes.CustomType',
        'Xmin.util.xtypes.DateTimeField',
        'Xmin.util.xtypes.IPAddressField'
    ],

    django_app_model_field_to_ext_class_map_forms : {
        'testapp.simpletestmodel.name' : {
            xtype : 'xmincustomfield',
            cls   : 'Xmin.util.xtypes.CustomType'
        }
    },


    get_form_field_config : function(field){
        // * Number fields
        // BigIntegerField
        // DecimalField
        // FloatField
        // IntegerField (done)
        // SmallIntegerField
        // PositiveIntegerField
        // PositiveSmallIntegerField
        //
        // * String fields
        // CharField
        // CommaSeparatedIntegerField
        // TextField
        // EmailField
        // IPAddressField
        // GenericIPAddressField
        // URLField
        //
        // * Select fields
        // BooleanField (done)
        // NullBooleanField
        //
        // * Date/Time
        // DateField
        // DateTimeField
        // TimeField
        //
        // AutoField
        // FileField
        // FilePathField
        // ImageField
        // SlugField
        //
        // * Relationship fields
        // ForeignKey
        // ManyToManyField
        // OneToOneField

        var config  = this.get_form_field_config_standard(field),
            mapping = this.django_app_model_field_to_ext_class_map_forms[field.app + "." + field.model + "." + field.name];

        if(mapping) {
            Ext.require(mapping.cls);
            config.xtype = mapping.xtype;
        }
        else {
            switch (field.field_class) {
                case 'django.db.models.fields.IntegerField':
                    config.xtype = 'numberfield';
                    break;
                case 'django.db.models.fields.BooleanField':
                    config.xtype = 'checkboxfield';
                    break;
                case 'django.db.models.fields.IPAddressField':
                    config.xtype = 'IPAddressField';
                    break;
                case 'django.db.models.fields.DateTimeField':
                    config.xtype = 'DateTimeField';
                    break;
                case 'django.db.models.fields.related.ForeignKey':
                    config = Ext.apply(config, this.get_form_field_config_foreignkey(field));
                    break;
                default:
                    config.xtype = 'textfield';
                    break;
            }
        }

        if (field.choices.length) {
            config = Ext.apply(config, this.get_form_field_config_choices(field));
        }

        return config;
    },

    get_form_field_config_standard : function(field){
        // FIELD OPTIONS (and default values)
        // max_length=None,
        // default=NOT_PROVIDED,
        // blank=False,
        // verbose_name=None,
        // editable=True,
        // choices=None,

        // error_messages=None
        // help_text='',

        // primary_key=False,
        // serialize=True,
        // rel=None,
        // name=None,
        // auto_created=False,
        // unique=False,
        // unique_for_date=None,
        // unique_for_month=None,
        // unique_for_year=None,
        // null=False,
        // validators=[],

        var config,
            label = Xmin.util.Text.capfirst(field.verbose_name);


        if (field.allow_blank === false) {
            label = '<b>'+label+'</b>';
        }

        config = {
            fieldLabel : label,
            name       : field.name,
            disabled   : !field.editable,
            allowBlank : field.allow_blank,

            value      : field.default,
            maxLength  : field.max_length || Number.MAX_VALUE
        }

        return config;
    },

    get_form_field_config_choices : function(field){
        // Refer to Select.render_options function in django/forms/widgets.py
        var config = {
            xtype          : 'combo',
            store          : Ext.create('Ext.data.Store', {
                fields     : ['id', 'description', 'type'],
                data       : field.choices
            }),
            queryMode      : 'local',
            displayField   : 'description',
            valueField     : 'id',
            editable       : false,
            forceSelection : true,
            maxLength      : Number.MAX_VALUE,

            tpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                '<tpl if="type ===\'header\'">',
                '<div class="xmin-boundlist-header xmin-boundlist-disabled x-boundlist-item">{description}</div>',
                '<tpl elseif="type ===\'header_item\'">',
                '<div class="xmin-boundlist-header x-boundlist-item">{description}</div>',
                '<tpl else>',
                '<div class="x-boundlist-item">&nbsp;&nbsp;{description}</div>',
                '</tpl>',
                '</tpl>'
            ),

            listeners      : {
                beforeselect : function(combo, record, index) {
                    return record.get('type') !== 'header';
                }
            }
        };
        return config;
    },

    get_form_field_config_foreignkey : function(field){
        var config, store,
            store_id = '/store/simple' + (field.related.admin_url ? field.related.admin_url : field.related.class);

        store = Ext.data.StoreManager.lookup(store_id);

        if (store === undefined){
            store = Ext.create('Ext.data.ArrayStore', {
                storeId    : store_id,
                autoLoad   : true,

                fields     : [
                    {name: 'id',   type: 'int'},
                    {name: 'name', type: 'string'}
                ],

                proxy: {
                    type: 'ajax',
                    url: Xmin.settings.data_path + '/choices/',
                    extraParams: {
                        'app'   : field.app,
                        'model' : field.model,
                        'field' : field.name
                    },
                    reader: {
                        type: 'array',
                        root: 'data'
                    }
                }
            });
        }

        config = {
            xtype          : 'combo',
            store          : store,
            queryMode      : 'local',
            displayField   : 'name',
            valueField     : 'id',
            editable       : false,
            forceSelection : true,
            maxLength      : Number.MAX_VALUE
        };

        if (field.related.add_url) {
            Ext.apply(config, {
                trigger2Cls    : 'xmin-form-add-trigger',

                onTrigger2Click: function () {
                    var router = Xmin.application.getController('Router');
                    router.navigate(field.related.add_url);
                }
            })

        }

        return config;
    }
});