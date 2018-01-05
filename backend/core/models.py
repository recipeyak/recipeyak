import hashlib
from typing import List

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class MyUserManager(BaseUserManager):
    def create_user(self, email, password=None):
        """
        Creates and saves a user with given email and password.
        """
        if not email:
            raise ValueError('User must have an email address')
        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)
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
    email = models.EmailField(unique=True)

    # required for admin
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    created = models.DateField(auto_now_add=True)
    last_updated = models.DateField(auto_now=True)

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

    # required for admin
    @property
    def is_staff(self):
        return self.is_admin

    @property
    def cart(self):
        return CartItem.objects.filter(recipe__user=self)

    @property
    def avatar_url(self):
        md5_email = hashlib.md5(self.email.encode('utf-8')).hexdigest()
        # indenticons by default `d=identicon`
        # Avatars with ratings of G only `r=g`
        # https://secure.gravatar.com/site/implement/images/
        return f'//www.gravatar.com/avatar/{md5_email}?d=identicon&r=g'

    def __str__(self):
        return self.email


class CommonInfo(models.Model):
    """Abstract model for storing common model info"""
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Recipe(CommonInfo):
    name = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    time = models.CharField(max_length=255, blank=True, null=True)
    servings = models.CharField(max_length=255, blank=True, null=True)

    edits = models.IntegerField(default=0, editable=False)

    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)

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

    @property
    def total_cart_additions(self):
        return self.cartitem.total_cart_additions

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
        super(Recipe, self).save(*args, **kwargs)
        if is_new:
            CartItem.objects.create(recipe=self)


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
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, primary_key=True)
    count = models.PositiveIntegerField(default=0)
    total_cart_additions = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'CartItem:: count: {self.count} total: {self.total_cart_additions} - {self.recipe}'

    def save(self, *args, **kwargs):
        old_cart = CartItem.objects.filter(recipe=self.recipe).first()
        if old_cart is not None and old_cart.count < self.count:
            count_increase = self.count - old_cart.count
            self.total_cart_additions += count_increase
        super(CartItem, self).save(*args, **kwargs)
