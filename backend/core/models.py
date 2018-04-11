import hashlib
from typing import List, Union
import logging

from django.db import models, transaction
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import CIEmailField
from django.db.models.query import QuerySet
from django.utils import timezone

from allauth.socialaccount.models import EmailAddress

logger = logging.getLogger(__name__)


class MyUserManager(BaseUserManager):
    def create_user(self, email, password=None):
        """
        Creates and saves a user with given email and password.
        """
        if not email:
            raise ValueError('User must have an email address')
        with transaction.atomic():
            user = self.model(email=self.normalize_email(email))
            user.set_password(password)
            user.save(using=self._db)
            EmailAddress.objects.create(user=user, email=email)
            logger.info(f'Created new user: {user}')
            return user

    def create_superuser(self, email, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(email=email, password=password)
        user.is_admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class MyUser(AbstractBaseUser, PermissionsMixin):
    """Custom user model that only requires an email and password"""
    email = CIEmailField(unique=True)

    # required for admin
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    created = models.DateField(auto_now_add=True)
    last_updated = models.DateField(auto_now=True)

    recipes = GenericRelation('Recipe', related_query_name='owner_user')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS: List[str] = []

    objects = MyUserManager()

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    # required for admin
    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        # TODO: Add permissions
        return True

    # required for admin
    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        # TODO: Add permissions
        return True

    def has_invite(self, team) -> bool:
        """
        Return if user has invite to team.
        """
        return self.membership_set.filter(team=team).exclude(invite=None).exists()  # type: ignore

    def has_team(self):
        return self.membership_set.filter(invite=None).count() > 0

    # required for admin
    @property
    def is_staff(self):
        return self.is_admin

    @property
    def avatar_url(self):
        md5_email = hashlib.md5(self.email.encode('utf-8')).hexdigest()
        # indenticons by default `d=identicon`
        # Avatars with ratings of G only `r=g`
        # https://secure.gravatar.com/site/implement/images/
        return f'//www.gravatar.com/avatar/{md5_email}?d=identicon&r=g'

    @property
    def cart_items(self):
        return CartItem.objects.filter(user=self)

    def __str__(self):
        return self.email


class CommonInfo(models.Model):
    """Abstract model for storing common model info"""
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeletionQuerySet(QuerySet):
    def delete(self):
        return super().update(deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()


class SoftDeletionManager(models.Manager):
    def __init__(self, *args, **kwargs):
        self.show_deleted = kwargs.pop('show_deleted', False)
        super().__init__(*args, **kwargs)

    def get_queryset(self):
        if self.show_deleted:
            return SoftDeletionQuerySet(self.model)
        return SoftDeletionQuerySet(self.model).filter(deleted_at=None)

    def hard_delete(self):
        return self.get_queryset().hard_delete()


class SoftDeletionModel(models.Model):
    deleted_at = models.DateTimeField(blank=True, null=True)

    objects = SoftDeletionManager()
    all_objects = SoftDeletionManager(show_deleted=True)

    class Meta:
        abstract = True

    def delete(self):
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self):
        super().delete()


class Recipe(CommonInfo, SoftDeletionModel):
    name = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    time = models.CharField(max_length=255, blank=True, null=True)
    servings = models.CharField(max_length=255, blank=True, null=True)

    edits = models.IntegerField(default=0, editable=False)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    owner = GenericForeignKey('content_type', 'object_id')

    def move_to(self, account):
        """
        Move recipe from current owner to another team or user

        All we need to do is change the owner for this one.
            - CartItem is OneToOne and will be fine.
            - Steps and Ingredients will be fine since we aren't changing pk's
        """
        with transaction.atomic():
            self.owner = account
            self.save()
            return self

    def copy_to(self, account):
        """
        Copy recipe to another team or user
        """
        with transaction.atomic():
            # clone top level recipe object
            recipe_copy = Recipe.objects.get(pk=self.pk)
            recipe_copy.pk = None
            recipe_copy.owner = account
            recipe_copy.save()
            # clone step objects
            for step in self.step_set.all():
                step.pk = None
                step.save()
                recipe_copy.step_set.add(step)
            # clone ingredient objects
            for ingredient in self.ingredient_set.all():
                ingredient.pk = None
                ingredient.save()
                recipe_copy.ingredient_set.add(ingredient)
            recipe_copy.save()
            return recipe_copy

    def set_cart_quantity(self, user: MyUser, count: float) -> None:
        cartitem, _ = self.cartitem_set.get_or_create(user=user, recipe=self)
        cartitem.count = count
        cartitem.save()

    @property
    def ingredients(self):
        """Return recipe ingredients ordered by creation date"""
        return Ingredient.objects.filter(recipe=self).order_by('created')

    @property
    def steps(self):
        """Return recipe steps ordered by creation date"""
        return Step.objects.filter(recipe=self).order_by('created')

    @property
    def tags(self):
        """Return recipe tags ordered by creation date"""
        return Tag.objects.filter(recipe=self).order_by('created')

    def __str__(self):
        return f'{self.name} by {self.author}'

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if not is_new:
            # we only want to increment the edits if we aren't setting the
            # edits field specifically
            edits_unchanged = Recipe.objects.get(pk=self.id).edits == self.edits
            if edits_unchanged:
                self.edits += 1
        super().save(*args, **kwargs)


class Ingredient(CommonInfo):
    """
    Recipe ingredient

    ex:
        1 medium tomato, diced

    quantity = 1 medium
    name = tomato
    description = diced

    """
    quantity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.quantity} {self.name} {self.description}'

    def __repr__(self):
        return f'<quantity={self.quantity} {self.name} description={self.description} recipe={self.recipe}>'


class Step(CommonInfo):
    """Recipe step"""
    text = models.TextField()
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

    def __str__(self):
        return self.text


class Tag(CommonInfo):
    """Recipe tag"""
    text = models.CharField(max_length=255)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

    def __str__(self):
        return self.text


class CartItem(CommonInfo):
    """Model for recipe and cart count"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    count = models.PositiveIntegerField(default=0)
    total_cart_additions = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = (('user', 'recipe'),)

    def __str__(self):
        return f'CartItem:: count: {self.count} total: {self.total_cart_additions} - {self.recipe}'

    def save(self, *args, **kwargs):
        old_cart = CartItem.objects.filter(recipe=self.recipe, user=self.user).first()
        if old_cart is not None and old_cart.count < self.count:
            count_increase = self.count - old_cart.count
            self.total_cart_additions += count_increase
            logger.info('Recipe added to cart')
        super().save(*args, **kwargs)


class InviteManager(models.Manager):
    def create_invite(self, email, team, level, creator) -> 'Invite':
        user = MyUser.objects.filter(email=email).first()
        if not user:
            user = MyUser.objects.create_user(email=email)
        m = Membership.objects.create(user=user, team=team, level=level, is_active=False)
        invite: Invite = self.model.objects.create(membership=m, creator=creator)
        return invite


class Invite(CommonInfo):
    membership = models.OneToOneField('Membership', on_delete=models.CASCADE)
    creator = models.ForeignKey(MyUser, on_delete=models.CASCADE)

    OPEN = 'open'
    DECLINED = 'declined'
    ACCEPTED = 'accepted'

    INVITE_STATUS = (
        (OPEN, OPEN),
        (DECLINED, DECLINED),
        (ACCEPTED, ACCEPTED),
    )

    status = models.CharField(
        max_length=11,
        choices=INVITE_STATUS,
        default=OPEN,
    )

    objects = InviteManager()

    def __str__(self):
        return f'<Invite • Membership: {self.membership}>'

    @property
    def user(self):
        return self.membership.user

    @property
    def active(self):
        return self.membership.is_active

    @property
    def team(self):
        return self.membership.team

    def accept(self):
        self.membership.set_active()
        self.status = self.ACCEPTED
        self.save()

    def decline(self):
        self.status = self.DECLINED
        self.save()


class Team(CommonInfo):
    name = models.CharField(max_length=255)
    is_public = models.BooleanField(default=False)
    recipes = GenericRelation('Recipe', related_query_name='owner_team')

    def __str__(self):
        return f'<Team • name: {self.name}, is_public: {self.is_public}>'

    def force_join(self, user, level=None):
        with transaction.atomic():
            if level is None:
                level = Membership.CONTRIBUTOR
            m, created = Membership.objects.get_or_create(team=self, user=user, defaults={'level': level, 'is_active': True})
            if not created:
                m.level = level
                m.is_active = True
                m.save()
            # remove existing invite
            if user.has_invite(self):
                user.membership_set.exclude(invite=None).get(team=self).invite.delete()
            return m

    def force_join_admin(self, user):
        return self.force_join(user, level=Membership.ADMIN)

    def invite_user(self, user, creator, level=None) -> Invite:
        """
        Invite user to team

        Adds member to team with is_active=False. Creates associated Invite.
        """
        if level is None:
            level = Membership.CONTRIBUTOR
        return Invite.objects.create_invite(email=user.email,
                                            team=self,
                                            level=level,
                                            creator=creator)

    def kick_user(self, user):
        """
        Remove user from team. If they have an invite, remove it as well.
        """
        membership = user.membership_set.get(team=self)
        # delete membership. By deleting, associated invites will be deleted.
        membership.delete()

    def set_public(self):
        self.is_public = True
        self.save()

    def set_private(self):
        self.is_public = False
        self.save()

    def admins(self):
        return self.membership_set.filter(is_active=True, level=Membership.ADMIN)

    def is_member(self, user) -> bool:
        return self.membership_set.filter(user=user, is_active=True).exists()  # type: ignore

    def is_contributor(self, user) -> bool:
        return self.membership_set.filter(user=user, is_active=True, level=Membership.CONTRIBUTOR).exists()  # type: ignore

    def is_admin(self, user) -> bool:
        return self.membership_set.filter(user=user, is_active=True, level=Membership.ADMIN).exists()  # type: ignore

    def invite_exists(self, email: Union[MyUser, str]) -> bool:
        return Membership.objects.filter(team=self, user__email=email).exists()  # type: ignore


class Membership(CommonInfo):
    ADMIN = 'admin'
    CONTRIBUTOR = 'contributor'
    READ_ONLY = 'read'

    MEMBERSHIP_CHOICES = (
        (ADMIN, ADMIN),
        (CONTRIBUTOR, CONTRIBUTOR),
        (READ_ONLY, READ_ONLY),
    )

    level = models.CharField(
        max_length=11,
        choices=MEMBERSHIP_CHOICES,
        default=CONTRIBUTOR,
    )

    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)

    class Meta:
        unique_together = (('user', 'team'),)

    # A user is activated once they accept their invite
    is_active = models.BooleanField(default=False)

    def set_active(self):
        self.is_active = True
        self.save()

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if not is_new:
            # NOTE: although we check inside the serializer to prevent demoting the
            # last admin, this forms a last line of defence
            current = Membership.objects.get(pk=self.pk)
            one_admin_left = len(self.team.admins()) == 1
            demoting_admin = current.level == self.ADMIN and self.level != self.ADMIN
            if one_admin_left and demoting_admin:
                raise ValueError('cannot demote self as last admin')
        super().save(*args, **kwargs)

    def delete(self):
        last_member = self.team.membership_set.count() == 1
        if last_member:
            raise ValueError('cannot delete last member of team')
        super().delete()

    def __str__(self):
        return f'<Membership • user_email: {self.user.email}, team: {self.team.id} level: {self.level}>'
