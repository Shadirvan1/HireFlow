import pyotp

def generate_mfa_secret(user):
    """
    Generates and stores a secret key for the user if not already present.
    Returns the secret key.
    """
    if not user.mfa_secret:
        user.mfa_secret = pyotp.random_base32()
        user.save()
    return user.mfa_secret

def get_provisioning_uri(user, issuer_name="HireFlow"):
    """
    Returns the OTP provisioning URI for apps like Google Authenticator.
    """
    if not user.mfa_secret:
        generate_mfa_secret(user)
    totp = pyotp.TOTP(user.mfa_secret)
    return totp.provisioning_uri(name=user.email, issuer_name=issuer_name)

def verify_otp(user, otp):
    """
    Verifies the OTP provided by the user.
    Returns True if valid, False otherwise.
    """
    if not user.mfa_secret:
        return False
    totp = pyotp.TOTP(user.mfa_secret)
    return totp.verify(otp)

def enable_mfa(user, otp):
    """
    Enables MFA after verifying the OTP.
    """
    if verify_otp(user, otp):
        user.mfa_enabled = True
        user.save()
        return True
    return False

def disable_mfa(user, otp):
    """
    Disables MFA after verifying the OTP.
    """
    if not user.mfa_enabled:
        return False
    if verify_otp(user, otp):
        user.mfa_enabled = False
        user.mfa_secret = None
        user.save()
        return True
    return False