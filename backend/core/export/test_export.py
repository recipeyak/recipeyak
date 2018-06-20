import pytest
from typing import Iterable, Dict

import yaml
from django.urls import reverse
from django.test import Client

pytestmark = pytest.mark.django_db


def fields_in(data: Dict, fields: Iterable) -> bool:
    if not isinstance(data, dict):
        return False
    for key, value in data.items():
        if key in fields:
            return True
        if isinstance(value, list):
            for x in value:
                if fields_in(x, fields=fields):
                    return True
        elif isinstance(value, dict):
            if fields_in(value, fields=fields):
                return True
    return False


def test_fields_in():
    d = {
        'id': 1,
    }
    assert fields_in(d, fields=('id',))

    d1 = {
        'blah': 1,
    }
    assert not fields_in(d1, fields=('id',))

    d2 = {
        'blah': 1,
        'hmm': [{
            'id': 1,
        }]
    }
    assert fields_in(d2, fields=('id',))

    d3 = {
        'blah': 1,
        'hmm': [{
            'blah': 1,
        }]
    }
    assert not fields_in(d3, fields=('id',))

    d4 = {
        'blah': 1,
        'hmm': [{
            'blah': 1,
        }],
        'owner': {
            'id': 1,
        }
    }
    assert fields_in(d4, fields=('id',))


def test_bulk_export_json(user, user2, recipe, recipe2):
    c = Client()
    url = reverse('export-recipes', kwargs={'filetype': 'json'})
    res = c.get(url)
    assert res.status_code == 302
    c.force_login(user)
    res = c.get(url)
    assert res.status_code == 200
    recipes = res.json()
    assert len(recipes) == 2, 'user should have two recipes'
    recipe2.move_to(user2)
    res = c.get(url)
    assert len(res.json()) == 1, 'user should only have their recipes'


def test_export_fields(user, user2, recipe, recipe2):
    """
    we don't want to return extraneous fields like position and id
    """
    c = Client()
    url = reverse('export-recipes', kwargs={'filetype': 'json'})
    c.force_login(user)
    res = c.get(url)
    assert res.status_code == 200
    recipes = res.json()
    assert not any(fields_in(r, fields=('id',)) for r in recipes)


def test_bulk_export_yaml(user, user2, recipe, recipe2):
    for filetype in ('yaml', 'yml'):
        recipe2.move_to(user)
        c = Client()
        url = reverse('export-recipes', kwargs={'filetype': filetype})
        res = c.get(url)
        assert res.status_code == 302
        c.force_login(user)
        res = c.get(url)
        assert res.status_code == 200
        assert '!!python/' not in res.content.decode('utf-8'), "we don't want python objects to be serialized"
        recipes = list(yaml.load_all(res.content))
        assert len(recipes) == 2, 'user should have two recipes'
        recipe2.move_to(user2)
        res = c.get(url)
        assert len(list(yaml.load_all(res.content))) == 1, 'user should only have their recipes'


def test_single_export_json(user, recipe):
    c = Client()
    url = reverse('export-recipe', kwargs={'id': recipe.id, 'filetype': 'json'})
    res = c.get(url)
    assert res.status_code == 302
    c.force_login(user)
    res = c.get(url)
    assert res.status_code == 200
    assert res.json().get('name') == recipe.name


def test_single_export_yaml(user, recipe):
    for filetype in ('yaml', 'yml'):
        c = Client()
        url = reverse('export-recipe', kwargs={'id': recipe.id, 'filetype': filetype})
        res = c.get(url)
        assert res.status_code == 302
        c.force_login(user)
        res = c.get(url)
        assert '!!python/' not in res.content.decode('utf-8'), "we don't want python objects to be serialized"
        assert res.status_code == 200
        assert next(yaml.load_all(res.content)).get('name') == recipe.name
