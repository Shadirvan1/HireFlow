from rest_framework import serializers
from .models import Job
from django.utils import timezone
from apps.accounts.serializers import CompanySerializer,CandidateProfileSerializer
class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    

    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["company", "created_at", "updated_at"]

    # 1. Experience Validation (Already existing, slightly improved)
    def validate_experience_required(self, value):
        if value < 0:
            raise serializers.ValidationError("Experience cannot be negative.")
        if value > 45: # Adjusted to a more realistic cap
            raise serializers.ValidationError("Please enter a valid experience range (0-45).")
        return value

    # 2. Deadline Validation (New)
    def validate_deadline(self, value):
        if value and value < timezone.now().date():
            raise serializers.ValidationError("The application deadline cannot be in the past.")
        return value

    def validate(self, data):
        
        salary_min = data.get("salary_min")
        salary_max = data.get("salary_max")

        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError({
                "salary_max": "Maximum salary must be greater than minimum salary."
            })

        is_automatic = data.get("is_automatic")
        is_interviewer = data.get("is_interviewer")
        ats_ascore = data.get("ats_ascore")

        if is_automatic:

            
         
            if ats_ascore is None:
                raise serializers.ValidationError({
                    "ats_ascore": "An ATS threshold score is required for automatic scheduling."
                })
            if not (29 <= ats_ascore <= 100):
                raise serializers.ValidationError({
                    "ats_ascore": "ATS score must be between 30 and 100."
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
        
        try:
            candidate = request.user.candidate_profile
        except AttributeError:
            raise serializers.ValidationError("User does not have a Candidate Profile.")

       
        job_id = data['job'].id 

        if JobApplication.objects.filter(job_id=job_id, applicant=candidate).exists():
            raise serializers.ValidationError("You have already applied for this position.")
        
        return data

from rest_framework import serializers

class CandidateRankSerializer(serializers.Serializer):
    application_id = serializers.IntegerField()
    applicant_id = serializers.IntegerField()
    applicant_name = serializers.CharField()
    email = serializers.EmailField()
    status = serializers.CharField()
    vector_score = serializers.FloatField(required=False, allow_null=True)
    llm_score = serializers.FloatField(required=False, allow_null=True)

class JobRankResponseSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()
    job_title = serializers.CharField()
    total_candidates = serializers.IntegerField()
    candidates = CandidateRankSerializer(many=True)

class AllJobsRankSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    total_jobs = serializers.IntegerField()
    jobs = JobRankResponseSerializer(many=True)

class UpdateApplicationStatusSerializer(serializers.Serializer):
    application_id = serializers.CharField()
    status = serializers.CharField(max_length=50)

    def validate_application_id(self, value):
        if not JobApplication.objects.filter(id=int(value)).exists():
            raise serializers.ValidationError("Application not found")
        return value