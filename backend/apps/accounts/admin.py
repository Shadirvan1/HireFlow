from django.contrib import admin

from .models import CandidateProfile, Company, HRProfile, Invite, User

# Register your models
admin.site.register(HRProfile)
admin.site.register(CandidateProfile)
admin.site.register(User)
admin.site.register(Company)
admin.site.register(Invite)
