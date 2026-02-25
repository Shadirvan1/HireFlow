class AuthRouter:
    """
    Redirects auth queries to the existing accounts_user table.
    """
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'auth':
            return 'default'
        return None

    def db_for_write(self, model, **hints):
        return 'default'

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # Prevent live_chat from ever trying to modify the auth tables
        if app_label == 'auth':
            return False
        return True