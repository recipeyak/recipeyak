from django.contrib.sites.models import Site
my_site = Site.objects.get(pk=1)
my_site.domain = 'recipeyak.com'
my_site.name = 'RecipeYak'
my_site.save()
