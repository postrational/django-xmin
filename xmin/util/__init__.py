from xmin.util.json import JSONSerializer
from django.utils import simplejson as json

def json_serialize(obj, **options):
    json_serializer = JSONSerializer()
    return json_serializer.serialize(obj, **options)


def json_deserialize(obj, **options):
    return json.loads(obj)