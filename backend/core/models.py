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
    REQUIRED_FIELDS = []

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

class CommonInfo(models.Model):
    """Abstract model for storing common model info"""
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Recipe(CommonInfo):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    source = models.CharField(max_length=255)
    time = models.CharField(max_length=255)

    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)

    @property
    def ingredients():
        """Return recipe ingredients ordered by creation date"""
        return Ingredient.objects.filter(recipe=self).order_by('created')

    @property
    def steps():
        """Return recipe steps ordered by creation date"""
        return Step.objects.filter(recipe=self).order_by('created')

    @property
    def tags():
        """Return recipe tags ordered by creation date"""
        return Tag.objects.filter(recipe=self).order_by('created')

class Ingredient(CommonInfo):
    """Recipe ingredient"""
    text = models.CharField(max_length=255)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

class Step(CommonInfo):
    """Recipe step"""
    text = models.TextField()
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

class Tag(CommonInfo):
    """Recipe tag"""
    text = models.CharField(max_length=255)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

class Cart(CommonInfo):
    """Aggregation of recipe cart items"""
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)

    @property
    def items():
        """Return cart items ordered by title"""
        return CartItem.objects.filter(cart=self).order_by('recipe__title')

class CartItem(CommonInfo):
    """Model for recipe and cart count"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    count = models.IntegerField()
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
