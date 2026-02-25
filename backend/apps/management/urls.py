from django.urls import path
from . import views
urlpatterns = [
    path("get/all/employees/",views.AllCompanyEmployeesView.as_view()),
    path("user/<int:id>/toggle-activity/",views.ToggleEmployeesView.as_view()),
    path("user/<int:id>/change/role/",views.ToggleEmployeeRoleView.as_view()),
    
]
