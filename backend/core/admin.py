from typing import Any

from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.contrib.auth.models import Group
from django.utils.html import format_html

from core.models import (
    Ingredient,
    Invite,
    Membership,
    User,
    Note,
    Recipe,
    ScheduledRecipe,
    Step,
    Team,
)


class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""

    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(
        label="Password confirmation", widget=forms.PasswordInput
    )

    class Meta:
        model = User
        fields = ("email",)

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """

    # https://stackoverflow.com/a/15630360/3555105
    password = ReadOnlyPasswordHashField(
        label="Password",
        help_text=(
            "Raw passwords are not stored, so there is no way to see "
            "this user's password, but you can change the password "
            "using <a href='../password/'>this form</a>."
        ),
    )

    class Meta:
        model = User
        fields = ("email", "password", "is_active", "is_admin")

    def clean_password(self):
        # Regardless of what the user provides, return the initial value.
        # This is done here, rather than on the field, because the
        # field does not have access to the initial value
        return self.initial["password"]


class UserAdmin(BaseUserAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    # https://stackoverflow.com/a/40715745/3555105
    def image_tag(self, obj):
        return format_html(f'<img src="{obj.avatar_url}" />')

    image_tag.short_description = "User Avatar"  # type: ignore

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ("email", "is_admin")
    list_filter = ("is_superuser", "is_admin", "is_active", "groups")
    readonly_fields = ("last_updated", "created", "image_tag")
    fieldsets = (
        (None, {"fields": ("email", "password", "image_tag")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_admin",
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "last_updated", "created")}),
    )
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )
    search_fields = ("email",)
    ordering = ("email",)
    filter_horizontal = ("groups", "user_permissions")


# Now register the new UserAdmin...
admin.site.register(User, UserAdmin)
# ... and, since we're not using Django's built-in permissions,
# unregister the Group model from admin.
admin.site.unregister(Group)


class IngredientsInLine(admin.TabularInline[Any]):
    model = Ingredient
    extra = 6


class StepsInLine(admin.TabularInline[Any]):
    model = Step
    extra = 1


class RecipeAdmin(admin.ModelAdmin[Any]):
    inlines = [IngredientsInLine, StepsInLine]


admin.site.register(Recipe, RecipeAdmin)
admin.site.register(Ingredient)
admin.site.register(Step)
admin.site.register(Note)
admin.site.register(Team)
admin.site.register(Invite)
admin.site.register(Membership)
admin.site.register(ScheduledRecipe)
