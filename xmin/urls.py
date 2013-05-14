from django.conf.urls import patterns, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from xmin.views import *

urlpatterns = patterns('',
#    url(r'data/ChangeList.json$', ChangeList.as_view()),


    url(r'data/admin/(?P<app_label>\w+)/(?P<module_name>\w+)/$', ChangeList.as_view()),
    url(r'data/admin/(?P<app_label>\w+)/(?P<module_name>\w+)/add/$', ChangeList.as_view(), {'action': 'add' }),
    url(r'data/admin/(?P<app_label>\w+)/(?P<module_name>\w+)/action/$', ChangeList.as_view(), {'action': 'bulk_update'}),
    url(r'data/admin/(?P<app_label>\w+)/(?P<module_name>\w+)/(?P<object_id>.+)/$', ItemRestApi.as_view()),
    url(r'data/events/(?P<event_id>.+)/$', ServerEvents.as_view()),
    url(r'data/choices/$', ChoiceList.as_view()),
    url(r'data$', StartXmin.as_view(), name='xmin-data'),
    url(r'^$', StartXmin.as_view(), name='xmin-index'),
)