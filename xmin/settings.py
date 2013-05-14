from django.conf import settings

XMIN_TITLE = getattr(settings, "XMIN_TITLE", 'Django xmin')
XMIN_RECENT_ACTIONS = getattr(settings, "XMIN_RECENT_ACTIONS", 10)
XMIN_POLLING_INTERVAL = getattr(settings, "XMIN_POLLING_INTERVAL", 120000)
