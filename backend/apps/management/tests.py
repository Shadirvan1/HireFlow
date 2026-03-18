from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.accounts.models import HRProfile, Company, Notification

User = get_user_model()

class HireFlowAPITests(APITestCase):
    def setUp(self):
        # 1. Create a Company
        self.company = Company.objects.create(name="TechCorp")
        
        # 2. Create an HR User and Profile
        self.hr_user = User.objects.create_user(username="hr_user", password="password123", email="hr@tech.com")
        self.hr_profile = HRProfile.objects.create(user=self.hr_user, company=self.company, role="HR")
        
        # 3. Create an Employee in the SAME company
        self.emp_user = User.objects.create_user(username="emp_user", password="password123")
        self.emp_profile = HRProfile.objects.create(user=self.emp_user, company=self.company, role="INTERVIEWER")

        # 4. Global variables for reuse
        self.version = "v1"
        self.client.force_authenticate(user=self.hr_user)

    def test_get_all_employees_success(self):
        # Generate the URL dynamically
        url = reverse('all-employees', kwargs={'version': self.version})
        
        # Make the GET request
        response = self.client.get(url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return 1 employee (excludes the logged-in HR)
        self.assertEqual(len(response.data), 1)

    def test_toggle_employee_role_success(self):
        url = reverse('toggle-role', kwargs={'version': self.version, 'id': self.emp_profile.id})
        data = {"role": "HR"}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.emp_profile.refresh_from_db()
        self.assertEqual(self.emp_profile.role, "HR")

    def test_toggle_role_unauthorized_company(self):
        # Create a user from a different company
        other_comp = Company.objects.create(name="OtherCorp")
        other_user = User.objects.create_user(username="other_gui", password="password123")
        other_profile = HRProfile.objects.create(user=other_user, company=other_comp, role="INTERVIEWER")
        
        url = reverse('toggle-role', kwargs={'version': self.version, 'id': other_profile.id})
        response = self.client.patch(url, {"role": "HR"}, format='json')
        
        # Should fail because they aren't in the same company
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "This employee does not belong to your company")

    def test_notification_mark_as_read(self):
        # Create a notification for the HR user
        notif = Notification.objects.create(user=self.hr_user, message="Hello")
        url = reverse('notification-detail', kwargs={'version': self.version, 'pk': notif.pk})
        
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)