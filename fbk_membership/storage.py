"""
Data storage and member management
"""
import json
import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict
from .models import Member, MembershipStatus, MembershipRequest
from .config import config


class MemberStorage:
    """Handles member data persistence"""
    
    def __init__(self, data_file: Optional[str] = None):
        self.data_file = data_file or config.DATA_FILE
        self._ensure_file_exists()
    
    def _ensure_file_exists(self):
        """Ensure the data file exists"""
        if not os.path.exists(self.data_file):
            self._save_data({'members': [], 'requests': []})
    
    def _load_data(self) -> Dict:
        """Load data from JSON file"""
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {'members': [], 'requests': []}
    
    def _save_data(self, data: Dict):
        """Save data to JSON file"""
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    
    def add_member(self, member: Member) -> Member:
        """Add a new member"""
        if not member.id:
            member.id = str(uuid.uuid4())
        if not member.registration_date:
            member.registration_date = datetime.now()
        
        data = self._load_data()
        data['members'].append(member.dict())
        self._save_data(data)
        return member
    
    def get_member(self, member_id: str) -> Optional[Member]:
        """Get a member by ID"""
        data = self._load_data()
        for member_data in data['members']:
            if member_data.get('id') == member_id:
                return Member(**member_data)
        return None
    
    def get_member_by_email(self, email: str) -> Optional[Member]:
        """Get a member by email"""
        data = self._load_data()
        for member_data in data['members']:
            if member_data.get('email') == email:
                return Member(**member_data)
        return None
    
    def update_member(self, member: Member) -> Member:
        """Update an existing member"""
        data = self._load_data()
        for i, member_data in enumerate(data['members']):
            if member_data.get('id') == member.id:
                data['members'][i] = member.dict()
                self._save_data(data)
                return member
        raise ValueError(f"Member with ID {member.id} not found")
    
    def list_members(self, status: Optional[MembershipStatus] = None) -> List[Member]:
        """List all members, optionally filtered by status"""
        data = self._load_data()
        members = [Member(**m) for m in data['members']]
        if status:
            members = [m for m in members if m.status == status]
        return members
    
    def add_request(self, request: MembershipRequest) -> MembershipRequest:
        """Add a membership request"""
        if not request.approval_token:
            request.approval_token = str(uuid.uuid4())
        
        data = self._load_data()
        data['requests'].append(request.dict())
        self._save_data(data)
        return request
    
    def get_request(self, approval_token: str) -> Optional[MembershipRequest]:
        """Get a request by approval token"""
        data = self._load_data()
        for request_data in data['requests']:
            if request_data.get('approval_token') == approval_token:
                return MembershipRequest(**request_data)
        return None
    
    def update_request(self, request: MembershipRequest) -> MembershipRequest:
        """Update a membership request"""
        data = self._load_data()
        for i, request_data in enumerate(data['requests']):
            if request_data.get('approval_token') == request.approval_token:
                data['requests'][i] = request.dict()
                self._save_data(data)
                return request
        raise ValueError(f"Request with token {request.approval_token} not found")
