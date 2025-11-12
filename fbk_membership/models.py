"""
Member data models and validation
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator


class MembershipStatus(str, Enum):
    """Membership status enum"""
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"
    CANCELLED = "cancelled"


class MembershipAction(str, Enum):
    """Membership action types"""
    REGISTER = "register"
    DEREGISTER = "deregister"


class Member(BaseModel):
    """Member data model"""
    id: Optional[str] = None
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=8, max_length=20)
    address: str = Field(..., min_length=5, max_length=200)
    postal_code: str = Field(..., min_length=4, max_length=10)
    city: str = Field(..., min_length=2, max_length=100)
    status: MembershipStatus = MembershipStatus.PENDING
    registration_date: Optional[datetime] = None
    approval_date: Optional[datetime] = None
    cancellation_date: Optional[datetime] = None
    notes: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format"""
        # Remove spaces and common separators
        cleaned = v.replace(' ', '').replace('-', '').replace('+', '')
        if not cleaned.isdigit():
            raise ValueError('Phone number must contain only digits, spaces, hyphens, or plus sign')
        return v

    @validator('postal_code')
    def validate_postal_code(cls, v):
        """Validate postal code (Danish format)"""
        cleaned = v.replace(' ', '')
        if not cleaned.isdigit() or len(cleaned) != 4:
            raise ValueError('Postal code must be 4 digits (Danish format)')
        return v

    def get_full_name(self) -> str:
        """Get member's full name"""
        return f"{self.first_name} {self.last_name}"

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class MembershipRequest(BaseModel):
    """Membership registration/de-registration request"""
    member: Member
    action: MembershipAction
    request_date: datetime = Field(default_factory=datetime.now)
    approval_token: Optional[str] = None
    approved: bool = False
    approved_date: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
