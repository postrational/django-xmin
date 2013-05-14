import datetime
from decimal import Decimal
from io import StringIO
from django.db.models import Model
from django.db.models.query import QuerySet
from django.utils.encoding import smart_unicode
from django.utils.simplejson import dumps

#######################################################################################################################
# With thanks to Stefan Lau (selaux)
# http://www.traddicts.org/webdevelopment/flexible-and-simple-json-serialization-for-django/

# from django.contrib.auth.models import Group, User
# from webgui.helpers import json_serialize
# users = User.objects.all()
# response = {}
# response['success'] = True
# response['users'] = users
# json_serialize(response)
# json_serialize(response, serialize_related=True)
# json_serialize(response, serialize_related=True, ignored=['users.groups'])
# json_serialize(response, serialize_related=True, ignored=['users.groups.permissions'])
# json_serialize(response, serialize_related=True, ignored=['users.groups.permissions.content_type'])


class UnableToSerializeError(Exception):
    """ Error for not implemented classes """
    def __init__(self, value):
        self.value = value
        Exception.__init__(self)

    def __str__(self):
        return repr(self.value)

class JSONSerializer():
    boolean_fields = ['BooleanField', 'NullBooleanField']
    datetime_fields = ['DatetimeField', 'DateField', 'TimeField']
    number_fields = ['IntegerField', 'AutoField', 'DecimalField', 'FloatField', 'PositiveSmallIntegerField']

    def serialize(self, obj, **options):
        self.options = options

        self.stream = options.pop("stream", StringIO())
        self.selectedFields    = options.pop("fields", None)
        self.ignoredFields     = options.pop("ignored", None)
        self.use_natural_keys  = options.pop("use_natural_keys",  False) # Natural keys support
        self.serialize_related = options.pop("serialize_related", False) # Recursively serialize related models
        self.simplify_related  = options.pop("simplify_related",  True)  # Simplify related models to their primary IDs
        self.currentLoc        = ''

        self.level = 0

        self.start_serialization()

        self.handle_object(obj)

        self.end_serialization()
        return self.getvalue()

    def get_string_value(self, obj, field):
        """Convert a field's value to a string."""
        return smart_unicode(field.value_to_string(obj))

    def start_serialization(self):
        """Called when serializing of the queryset starts."""
        pass

    def end_serialization(self):
        """Called when serializing of the queryset ends."""
        pass

    def start_array(self):
        """Called when serializing of an array starts."""
        self.stream.write(u'[')
    def end_array(self):
        """Called when serializing of an array ends."""
        self.stream.write(u']')

    def start_object(self):
        """Called when serializing of an object starts."""
        self.stream.write(u'{')

    def end_object(self):
        """Called when serializing of an object ends."""
        self.stream.write(u'}')

    def handle_object(self, object):
        """ Called to handle everything, looks for the correct handling """
        if isinstance(object, dict):
            self.handle_dictionary(object)
        elif isinstance(object, list):
            self.handle_list(object)
        elif isinstance(object, tuple):
            self.handle_list(object)
        elif isinstance(object, Model):
            self.handle_model(object)
        elif isinstance(object, QuerySet):
            self.handle_queryset(object)
        elif isinstance(object, bool):
            self.handle_simple(object)
        elif isinstance(object, int) or isinstance(object, float) or isinstance(object, long):
            self.handle_simple(object)
        elif isinstance(object, Decimal):
            self.handle_simple(float(object))
        elif isinstance(object, datetime.date) or isinstance(object, datetime.datetime):
            self.handle_datetime(object)
        elif isinstance(object, basestring):
            self.handle_simple(object)
        elif object.__class__.__name__ is '__proxy__':
            self.handle_simple(unicode(object))
        elif object is None:
            self.handle_simple(object)
        else:
            raise UnableToSerializeError(type(object))

    def handle_dictionary(self, d):
        """Called to handle a Dictionary"""
        i = 0
        self.start_object()
        for key, value in d.iteritems():
            self.currentLoc += key+'.'
            #self.stream.write(unicode(self.currentLoc))
            i += 1
            self.handle_simple(key)
            self.stream.write(u': ')
            self.handle_object(value)
            if i != len(d):
                self.stream.write(u', ')
            self.currentLoc = self.currentLoc[0:(len(self.currentLoc)-len(key)-1)]
        self.end_object()

    def handle_list(self, l):
        """Called to handle a list"""
        self.start_array()

        for value in l:
            self.handle_object(value)
            if l.index(value) != len(l) -1:
                self.stream.write(u', ')

        self.end_array()

    def handle_model(self, mod):
        """Called to handle a django Model"""
        self.start_object()
        self.stream.write(u'"__str__" : "%s", ' % mod.__str__())

        for field in mod._meta.local_fields:
            if field.rel is None:
                if self.selectedFields is None or field.attname in self.selectedFields or field.attname:
                    if self.ignoredFields is None or self.currentLoc + field.attname not in self.ignoredFields:
                        self.handle_field(mod, field)
            else:
                # print self.currentLoc + field.attname[:-3]
                if self.selectedFields is None or field.attname[:-3] in self.selectedFields:
                    if self.ignoredFields is None or self.currentLoc + field.attname[:-3] not in self.ignoredFields:
                        self.handle_fk_field(mod, field)
        for field in mod._meta.many_to_many:
            # print self.currentLoc + field.attname
            if self.selectedFields is None or field.attname in self.selectedFields:
                if self.ignoredFields is None or self.currentLoc + field.attname not in self.ignoredFields:
                    self.handle_m2m_field(mod, field)
        self.stream.seek(self.stream.tell()-2)
        self.end_object()

    def handle_queryset(self, queryset):
        """Called to handle a django queryset"""
        self.start_array()
        it = 0
        for mod in queryset:
            it += 1
            self.handle_model(mod)
            if queryset.count() != it:
                self.stream.write(u', ')
        self.end_array()

    def handle_field(self, mod, field):
        """Called to handle each individual (non-relational) field on an object."""
        self.handle_simple(field.name)
        if field.get_internal_type() in self.boolean_fields:
            if field.value_to_string(mod) == 'True':
                self.stream.write(u': true')
            elif field.value_to_string(mod) == 'False':
                self.stream.write(u': false')
            else:
                self.stream.write(u': undefined')
        else:
            self.stream.write(u': ')
            self.handle_simple(field.value_to_string(mod))
        self.stream.write(u', ')

    def handle_fk_field(self, mod, field):
        """Called to handle a ForeignKey field."""
        related = getattr(mod, field.name)
        if related is not None:
            self.handle_simple(field.name)
            self.stream.write(u': ')

            if field.rel.field_name == related._meta.pk.name:
                # Related to remote object via primary key
                pk = related._get_pk_val()
            else:
                # Related to remote object via other field
                pk = getattr(related, field.rel.field_name)


            if self.simplify_related:
                self.handle_simple(pk)
            elif self.serialize_related:
                self.currentLoc = self.currentLoc + field.name + "."
                self.handle_model(related)
                self.currentLoc = self.currentLoc[0:-len(field.name)-1]
            else:
                d = {
                        'pk': pk,
                    }
                if self.use_natural_keys and hasattr(related, 'natural_key'):
                    d.update({'natural_key': related.natural_key()})
                if type(d['pk']) == str and d['pk'].isdigit():
                    d.update({'pk': int(d['pk'])})
                self.handle_object(d)

            self.stream.write(u', ')

    def handle_m2m_field(self, mod, field):
        """Called to handle a ManyToManyField."""
        if field.rel.through._meta.auto_created:
            self.handle_simple(field.name)
            self.stream.write(u': ')
            self.start_array()
            hasRelationships = False
            for relobj in getattr(mod, field.name).iterator():
                hasRelationships = True
                if self.serialize_related:
                    self.currentLoc = self.currentLoc + field.name + "."
                    self.handle_model(relobj)
                    self.currentLoc = self.currentLoc[0:-len(field.name)-1]
                else:
                    pk = relobj._get_pk_val()
                    d = {
                            'pk': pk,
                        }
                    if self.use_natural_keys and hasattr(relobj, 'natural_key'):
                        d.update({'natural_key': relobj.natural_key()})
                    if type(d['pk']) == str and d['pk'].isdigit():
                        d.update({'pk': int(d['pk'])})

                    self.handle_simple(d)

                self.stream.write(u', ')
            if hasRelationships:
                self.stream.seek(self.stream.tell()-2)
            self.end_array()
            self.stream.write(u', ')

    def handle_simple(self, simple):
        """ Called to handle values that can be handled via simplejson """
        self.stream.write(unicode(dumps(simple)))

    def handle_datetime(self, datetime_object):
        """ Handle date and datetime objects """
        return self.handle_simple(datetime_object.isoformat())

    def handle_proxy(self, proxy_object):
        """ Handle lazy gettext proxy objects """
        return self.handle_simple(unicode(proxy_object))

    def getvalue(self):
        """Return the fully serialized object (or None if the output stream is  not seekable).sss """
        if callable(getattr(self.stream, 'getvalue', None)):
            return self.stream.getvalue()