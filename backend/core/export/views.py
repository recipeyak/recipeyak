from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404

from core.response import YamlResponse

from core.views import user_and_team_recipes

from core.serializers import RecipeExportSerializer


@require_http_methods(["GET"])
@login_required(login_url='/login/')
def export_recipes(request, filetype, id=None):

    queryset = user_and_team_recipes(request.user)

    many = id is None

    if not many:
        queryset = get_object_or_404(queryset, pk=int(id))

    recipes = RecipeExportSerializer(
        queryset,
        many=many).data

    if filetype in ('yaml', 'yml'):
        return YamlResponse(recipes)

    if filetype == 'json':
        # we need safe=False so we can serializer both lists and dicts
        return JsonResponse(recipes, json_dumps_params={'indent': 2}, safe=False)

    raise Http404('unknown export filetype')
