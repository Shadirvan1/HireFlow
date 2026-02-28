from rest_framework import serializers
from .models import Job
from apps.accounts.serializers import CompanySerializer,CandidateProfileSerializer
class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["company", "created_at", "updated_at"]


    
    def validate_experience_required(self, value):
        if value < 0:
            raise serializers.ValidationError("Experience cannot be negative.")
        if value > 50:
            raise serializers.ValidationError("Please enter correct experiance")
        return value

    
    def validate(self, data):
        salary_min = data.get("salary_min")
        salary_max = data.get("salary_max")

        if salary_min and salary_max:
            if salary_min > salary_max:
                raise serializers.ValidationError({
                    "salary_max": "Maximum salary must be greater than minimum salary."
                })

        return data


class JobApplySerializer(serializers.Serializer):
    job = JobSerializer()
    candidate = CandidateProfileSerializer()

from .models import JobApplication

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['job', 'resume', 'cover_letter', 'status', 'applied_at']
        read_only_fields = ['status', 'applied_at']

    def validate(self, data):
        
        request = self.context.get('request')
        candidate = request.user.candidate_profile 
        
        if JobApplication.objects.filter(job=data['job'], applicant=candidate).exists():
            raise serializers.ValidationError("You have already applied for this position.")
        
        return data