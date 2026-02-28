from django.db import models

class Message(models.Model):
    
    room_name = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    
    sender_id = models.PositiveBigIntegerField(db_index=True)
    receiver_id = models.PositiveBigIntegerField(db_index=True)
    
    message = models.TextField()
    
  
    message_type = models.CharField(max_length=20, default='text',null=True,blank=True)
    
    
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True) 

    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['room_name']),
            models.Index(fields=['sender_id', 'receiver_id']),
        ]

    def __str__(self):
        return f"{self.room_name}: {self.sender_id} -> {self.message[:20]}"