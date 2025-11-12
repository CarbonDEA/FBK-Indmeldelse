"""
Main membership service that orchestrates registration and de-registration
"""
from datetime import datetime
from typing import Optional
from .models import Member, MembershipRequest, MembershipAction, MembershipStatus
from .storage import MemberStorage
from .email_service import EmailService


class MembershipService:
    """
    Main service for handling membership operations
    Orchestrates registration, de-registration, and email workflows
    """
    
    def __init__(self, storage: Optional[MemberStorage] = None, email_service: Optional[EmailService] = None):
        self.storage = storage or MemberStorage()
        self.email_service = email_service or EmailService()
    
    def request_registration(self, member: Member) -> MembershipRequest:
        """
        Request a new member registration
        
        Args:
            member: Member data
            
        Returns:
            MembershipRequest with approval token
        """
        # Check if member already exists
        existing = self.storage.get_member_by_email(member.email)
        if existing:
            if existing.status == MembershipStatus.ACTIVE:
                raise ValueError(f"Member with email {member.email} is already registered")
            elif existing.status == MembershipStatus.PENDING:
                raise ValueError(f"Registration request for {member.email} is already pending")
        
        # Create membership request
        request = MembershipRequest(
            member=member,
            action=MembershipAction.REGISTER
        )
        
        # Save request
        request = self.storage.add_request(request)
        
        # Send approval email
        self.email_service.send_approval_request(request)
        
        return request
    
    def request_deregistration(self, email: str) -> MembershipRequest:
        """
        Request member de-registration
        
        Args:
            email: Member's email address
            
        Returns:
            MembershipRequest with approval token
        """
        # Find the member
        member = self.storage.get_member_by_email(email)
        if not member:
            raise ValueError(f"No member found with email {email}")
        
        if member.status != MembershipStatus.ACTIVE:
            raise ValueError(f"Member with email {email} is not active (status: {member.status})")
        
        # Create deregistration request
        request = MembershipRequest(
            member=member,
            action=MembershipAction.DEREGISTER
        )
        
        # Save request
        request = self.storage.add_request(request)
        
        # Send approval email
        self.email_service.send_approval_request(request)
        
        return request
    
    def approve_request(self, approval_token: str) -> Member:
        """
        Approve a membership request
        
        Args:
            approval_token: The approval token from the request
            
        Returns:
            The approved member
        """
        # Get the request
        request = self.storage.get_request(approval_token)
        if not request:
            raise ValueError(f"No request found with token {approval_token}")
        
        if request.approved:
            raise ValueError("Request has already been approved")
        
        # Mark request as approved
        request.approved = True
        request.approved_date = datetime.now()
        self.storage.update_request(request)
        
        # Process the request based on action
        if request.action == MembershipAction.REGISTER:
            member = self._process_registration(request.member)
        else:
            member = self._process_deregistration(request.member)
        
        return member
    
    def _process_registration(self, member: Member) -> Member:
        """Process an approved registration"""
        # Update member status
        member.status = MembershipStatus.ACTIVE
        member.approval_date = datetime.now()
        
        # Check if member already exists (update) or create new
        existing = self.storage.get_member_by_email(member.email)
        if existing:
            member.id = existing.id
            member = self.storage.update_member(member)
        else:
            member = self.storage.add_member(member)
        
        # Send emails
        self.email_service.send_municipality_notification(member, MembershipAction.REGISTER)
        self.email_service.send_welcome_email(member)
        
        return member
    
    def _process_deregistration(self, member: Member) -> Member:
        """Process an approved de-registration"""
        # Update member status
        member.status = MembershipStatus.CANCELLED
        member.cancellation_date = datetime.now()
        
        # Update member in storage
        member = self.storage.update_member(member)
        
        # Send emails
        self.email_service.send_municipality_notification(member, MembershipAction.DEREGISTER)
        self.email_service.send_cancellation_confirmation(member)
        
        return member
    
    def get_member(self, member_id: str) -> Optional[Member]:
        """Get a member by ID"""
        return self.storage.get_member(member_id)
    
    def get_member_by_email(self, email: str) -> Optional[Member]:
        """Get a member by email"""
        return self.storage.get_member_by_email(email)
    
    def list_members(self, status: Optional[MembershipStatus] = None):
        """List all members, optionally filtered by status"""
        return self.storage.list_members(status)
    
    def get_pending_requests(self):
        """Get all pending requests"""
        data = self.storage._load_data()
        return [
            MembershipRequest(**req) 
            for req in data.get('requests', []) 
            if not req.get('approved', False)
        ]
