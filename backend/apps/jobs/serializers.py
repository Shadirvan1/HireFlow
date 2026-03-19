from rest_framework import serializers
from .models import Job,SavedJob
from django.utils import timezone
from apps.accounts.serializers import CompanySerializer,CandidateProfileSerializer
class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["company", "created_at", "updated_at"]

    # 1. Experience Validation (Already existing, slightly improved)
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Replace 'SavedJob' with your actual model name for saved jobs
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False
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

from rest_framework import serializers
from .models import JobApplication

class UpdateApplicationStatusSerializer(serializers.Serializer):
    application_id = serializers.IntegerField() # Use IntegerField if your ID is a number
    status = serializers.CharField(max_length=50)
    meeting_link = serializers.URLField(required=False, allow_blank=True)
    scheduled_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate_application_id(self, value):
        try:
            # Check if the application exists
            application = JobApplication.objects.get(id=value)
            return application # Returning the object saves a DB hit in the view
        except (JobApplication.DoesNotExist, ValueError):
            raise serializers.ValidationError("Application not found")

    def update_application(self):
        """
        Helper method to save the data once validated
        """
        application = self.validated_data['application_id']
        application.status = self.validated_data['status']
        
        # Only update these if they are provided in the request
        if 'meeting_link' in self.validated_data:
            application.meeting_link = self.validated_data['meeting_link']
        if 'scheduled_at' in self.validated_data:
            application.scheduled_at = self.validated_data['scheduled_at']
            
        application.save()
        return application

# In your serializers.py

class JobApplicationReadSerializer(serializers.ModelSerializer):
    # We reuse your existing JobSerializer to get Title, Location, and Company
    job = JobSerializer(read_only=True) 
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'resume', 'cover_letter', 
            'status', 'applied_at', 'scheduled_at', 'meeting_link'
        ]


from rest_framework import serializers
from .models import JobApplication

class ScheduledInterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.ReadOnlyField(source='applicant.user.get_full_name')
    candidate_email = serializers.ReadOnlyField(source='applicant.user.email')
    job_title = serializers.ReadOnlyField(source='job.title')
    company_name = serializers.ReadOnlyField(source='job.company.name')

    class Meta:
        model = JobApplication
        fields = [
            'id', 'candidate_name', 'candidate_email', 'job_title', 
            'company_name', 'status', 'scheduled_at', 'meeting_link', 'resume'
        ]


from rest_framework import serializers
from .models import JobApplication, Job
from apps.accounts.models import CandidateProfile

class FullCandidateDetailSerializer(serializers.ModelSerializer):
    # Joining data from CandidateProfile and the Auth User
    applicant_name = serializers.CharField(source='applicant.user.username', read_only=True)
    first_name = serializers.CharField(source='applicant.first_name', read_only=True)
    last_name = serializers.CharField(source='applicant.last_name', read_only=True)
    email = serializers.EmailField(source='applicant.user.email', read_only=True)
    phone = serializers.CharField(source='applicant.user.phone_number', read_only=True)
    
    # Candidate Profile specific fields
    location = serializers.CharField(source='applicant.current_location', read_only=True)
    experience = serializers.FloatField(source='applicant.total_experience', read_only=True)
    linkedin = serializers.URLField(source='applicant.linkedin_url', read_only=True)
    github = serializers.URLField(source='applicant.github_url', read_only=True)
    
    # Job details
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'applicant_name', 'first_name', 'last_name', 'email', 'phone',
            'location', 'experience', 'linkedin', 'github', 'job_title',
            'status', 'resume', 'cover_letter', 'applied_at', 
            'scheduled_at', 'meeting_link'
        ]

class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['status', 'scheduled_at', 'meeting_link']

    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in JobApplication.status.field.choices]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Choose from: {valid_statuses}")
        return value