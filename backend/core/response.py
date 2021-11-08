from collections import OrderedDict

import yaml
from django.http import HttpResponse


def represent_ordereddict(dumper, data):
    value = []
    for item_key, item_value in data.items():
        node_key = dumper.represent_data(item_key)
        node_value = dumper.represent_data(item_value)
        value.append((node_key, node_value))
    return yaml.nodes.MappingNode("tag:yaml.org,2002:map", value)


yaml.add_representer(OrderedDict, represent_ordereddict)


class YamlResponse(HttpResponse):
    """
    An HTTP response class that consumes data to be serialized to YAML.
    :param data: Data to be dumped into yaml.
    """

    def __init__(self, data, **kwargs):
        kwargs.setdefault("content_type", "text/x-yaml")
        if isinstance(data, list):
            data = yaml.dump_all(data, default_flow_style=False, allow_unicode=True)
        else:
            # we wrap in an OrderedDict since PyYaml sorts dict keys for some odd reason!
            data = yaml.dump(OrderedDict(data), default_flow_style=False, allow_unicode=True)

        super().__init__(content=data, **kwargs)
