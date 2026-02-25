from django.contrib import admin
from .models import HRProfile, CandidateProfile, User, Company,Invite

# Register your models
admin.site.register(HRProfile)
admin.site.register(CandidateProfile)
admin.site.register(User)
admin.site.register(Company)
admin.site.register(Invite)
