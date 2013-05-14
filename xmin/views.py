from django.contrib import admin
from django.contrib import messages
from django.contrib.admin.models import LogEntry
from django.contrib.admin.util import unquote
from django.contrib.admin.views.main import PAGE_VAR, ORDER_VAR, SEARCH_VAR
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import PermissionDenied, ObjectDoesNotExist
from django.http import HttpResponse, HttpResponseNotFound, Http404, HttpResponseBadRequest
from django.shortcuts import render_to_response
from django.utils.encoding import force_unicode
from django.utils.html import escape
from django.utils.translation import ugettext as _
from django.views.generic import View
from xmin import settings
from xmin.settings import XMIN_RECENT_ACTIONS
from xmin.util import json_serialize, json_deserialize
from xmin.util.admin import get_app_list, get_model_and_admin, get_model_and_admin_or_404
from django.core import urlresolvers


class StartXmin(View):

    def get(self, request, *args, **kwargs):
        user_has_permission = admin.site.has_permission(request)

        print 'user_has_permission', user_has_permission
#        print 'app_list', get_app_list(request)

        xmin_settings = {
            'site_title' : settings.XMIN_TITLE,
            'app_list'   : get_app_list(request),
            'data_path'  : urlresolvers.reverse('xmin-data'),
            'poll_interval' : settings.XMIN_POLLING_INTERVAL,
            'user'       : {
                'name'   : request.user.get_full_name() or request.user.username,
                'id'     : request.user.id,
            }
        }

        context = {
            'settings' : json_serialize(xmin_settings)
        }

        return render_to_response('xmin_start.html', context)


class ChangeList(View):

    def get(self, request, app_label, module_name, action=None):
        """
        Returns a list of items defined in the database for the specified model (module) and app

        Paging, Sorting and Search parameters are passed as GET values.

        """
        self.init(request, app_label, module_name)

        # @TODO: Check permissions

        request.GET._mutable = True

        # Parse Ext-generated params and convert them to Django Admin params
#        del request.GET['app']
#        del request.GET['model']
        del request.GET['_dc'] #@TODO: Prevent 500 when _dc is missing

        # Paging
        page = request.GET['page']
        if page:
            del request.GET['start']
            del request.GET['limit']
            del request.GET['page']
            request.GET[PAGE_VAR] = int(page)-1

        # Sorting
        sort = request.GET.get('sort')
        order = ""
        if sort:
            sort = json_deserialize(sort)
            for sort_field in sort:
                try:
                    field_index = str(self.model_admin.list_display.index(sort_field['property']))
                    if sort_field['direction'] == 'DESC':
                        field_index = '-' + field_index
                    order += str(field_index) + '.'
                except ValueError, e:
                    pass

            del request.GET['sort']
            request.GET[ORDER_VAR] = order



        # Searching
        search = request.GET.get('q')
        if search:
            del request.GET['q']
            request.GET[SEARCH_VAR] = search


        # Filtering


        change_list = self.get_change_list(request)

        # @TODO: Populate dynamic values into change_list.result_list, such as __str__ from list_display

        response = {
            'totalCount' : change_list.result_count,
            'data'       : change_list.result_list
        }

        return HttpResponse(json_serialize(response))

    def post(self, request, app_label, module_name, action=None):
        self.init(request, app_label, module_name)

        if not action:
            return HttpResponseBadRequest()
        elif action == 'add':
            return self.add_item(request)
        elif action == 'bulk_update':
            return self.bulk_update(request)

    def init(self, request, app_label, module_name):
        (self.app_label, self.module_name)= (app_label, module_name)
        (self.model, self.model_admin) = get_model_and_admin_or_404(app_label, module_name)
        self.token = request.path[len(urlresolvers.reverse('xmin-data'))-1:]


    def get_change_list(self, request):
        (model, model_admin) = (self.model, self.model_admin)

        list_display = model_admin.get_list_display(request)
        list_display_links = model_admin.get_list_display_links(request, list_display)

        ChangeList = model_admin.get_changelist(request)
        return ChangeList(request, model_admin.model, list_display,
            list_display_links, model_admin.list_filter, model_admin.date_hierarchy,
            model_admin.search_fields, model_admin.list_select_related,
            model_admin.list_per_page, model_admin.list_max_show_all, model_admin.list_editable,
            model_admin)

    def add_item(self, request):
        """
        CREATE - Add a new object based on values from form.
        """
        if not self.model_admin.has_add_permission(request):
            raise PermissionDenied

        # Validate input
        new_values = json_deserialize(request.read())
        ModelForm = self.model_admin.get_form(request)
        form = ModelForm(new_values)

        if form.is_valid():
            new_item = form.save()
            self.model_admin.log_addition(request, new_item)
            response = {
                'success' : True,
                'msg'     : _('Item saved'),
                'data'    : new_item,
                'event'   : ServerEvents.get_latest_event_for(request.user, new_item)
            }

        else:
            response = {
                'success' : False,
                'msg'     : _('Item was not saved due to errors.'),
                'data'    : form.errors
            }

        return HttpResponse(json_serialize(response))


    def bulk_update(self, request):
        if not self.model_admin.has_change_permission(request):
            raise PermissionDenied

        change_list = self.get_change_list(request)
        self.model_admin.delete_selected_confirmation_template = 'delete_selected_confirmation.html'
        action_response = self.model_admin.response_action(request, queryset=change_list.get_query_set(request))

        if action_response and action_response.status_code == 302:
            response = { 'success' :  True }
            return HttpResponse(json_serialize(response))
        if action_response and action_response.status_code == 200:
            response = {
                'success' :  True,
                'confirmation' : action_response.render().content
            }
            return HttpResponse(json_serialize(response))
        else:
            messages.error(request, _("Action failed to complete..."))
            return HttpResponseBadRequest()


class ChoiceList(View):

    def get(self, request):
        app   = request.GET.get('app', None)
        model = request.GET.get('model', None)
        field = request.GET.get('field', None)

        if not (app and model and field):
            raise HttpResponseBadRequest()

        #@TODO: Check permissions

        content_type = ContentType.objects.get_by_natural_key(app, model)
        model_class  = content_type.model_class()
        field        = model_class._meta.get_field_by_name(field)[0]
        choices      = field.get_choices()

        response = {
            'success' : True,
            'data'    : choices
        }
        return HttpResponse(json_serialize(response))



class ItemRestApi(View):
    def init(self, request, app_label, module_name, object_id):
        (self.model, self.model_admin) = get_model_and_admin_or_404(app_label, module_name)

        self.opts = self.model._meta
        self.object = self.model_admin.get_object(request, unquote(object_id))

        if self.object is None: # and method is not PUT
            raise Http404(_('%(name)s object with primary key %(key)r does not exist.') % {'name': force_unicode(self.opts.verbose_name), 'key': escape(object_id)})

    def get(self, request, app_label, module_name, object_id):
        """
        READ - Retrieve the object data in order to fill in the edit form.
        """
        self.init(request, app_label, module_name, object_id)



        # @TODO: Check read permission

        response = {
            'success' : True,
            'data'    : self.object
        }

        return HttpResponse(json_serialize(response))

    def put(self, request, app_label, module_name, object_id):
        """
        UPDATE - Save edit form values to update an existing object.
        """
        self.init(request, app_label, module_name, object_id)

        if not self.model_admin.has_change_permission(request, self.object):
            raise PermissionDenied

        # Validate input
        new_values = json_deserialize(request.read())
        ModelForm = self.model_admin.get_form(request)
        form = ModelForm(new_values, instance=self.object)

        if form.is_valid():
            new_item = form.save()
            formsets = None # Formsets for related objects @TODO: implement
            change_message = self.model_admin.construct_change_message(request, form, formsets)
            self.model_admin.log_change(request, new_item, change_message)

            response = {
                'success' : True,
                'msg'     : _('Item saved'),
                'data'    : new_item,
                'event'   : ServerEvents.get_latest_event_for(request.user, new_item)
            }

        else:
            response = {
                'success' : False,
                'msg'     : _('Item was not saved due to errors.'),
                'data'    : form.errors
            }

        return HttpResponse(json_serialize(response))


class ServerEvents(View):
    def get(self, request, event_id):
        events = []
        last_event_id = 0

        if event_id == 'recent':
            log_entries = LogEntry.objects.order_by('-pk')[:XMIN_RECENT_ACTIONS]
        else:
            last_event_id = int(event_id)
            log_entries = LogEntry.objects.order_by('-pk').filter(pk__gt=event_id)

        for entry in log_entries:
            events.insert(0, ServerEvents.make_event(entry))

        if len(log_entries):
            last_event = log_entries[0]
            last_event_id = last_event.id

        response = {
            'success' : True,
            'events'  : events,
            'last_id' : last_event_id
        }

        return HttpResponse(json_serialize(response))

    @staticmethod
    def make_event(log_entry):
        try:
            edited_object = log_entry.get_edited_object()
        except ObjectDoesNotExist, e:
            edited_object = None

        event = {
            'id'          : log_entry.id,
            'app'         : log_entry.content_type.app_label,
            'model'       : log_entry.content_type.model,
            'model_name'  : log_entry.content_type.name,
            'object_id'   : log_entry.object_id,
            'object'      : edited_object,
            'object_name' : log_entry.object_repr,
            'user_id'     : log_entry.user_id,
            'user_name'   : log_entry.user.get_full_name() or log_entry.user.username,
            'token'       : '/admin/' + log_entry.get_admin_url(),
            'action'      : { 1:'ADDITION', 2:'CHANGE', 3:'DELETION'}[log_entry.action_flag],
            'message'     : log_entry.change_message
        }
        return event

    @staticmethod
    def get_latest_event_for(user, item):
        log_entry = LogEntry.objects.filter(
            user=user,
            object_id = item.id,
            content_type__id__exact = ContentType.objects.get_for_model(item).id
        ).select_related().order_by('-pk')[0]
        return ServerEvents.make_event(log_entry)

