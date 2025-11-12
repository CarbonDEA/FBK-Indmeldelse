"""
Configuration management
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration"""
    
    # SMTP Configuration
    SMTP_HOST: str = os.getenv('SMTP_HOST', 'localhost')
    SMTP_PORT: int = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USERNAME: Optional[str] = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD: Optional[str] = os.getenv('SMTP_PASSWORD')
    SMTP_USE_TLS: bool = os.getenv('SMTP_USE_TLS', 'True').lower() == 'true'
    
    # Email addresses
    APPROVAL_EMAIL: str = os.getenv('APPROVAL_EMAIL', 'approval@fbk.dk')
    MUNICIPALITY_EMAIL: str = os.getenv('MUNICIPALITY_EMAIL', 'kommune@example.dk')
    ADMIN_EMAIL: str = os.getenv('ADMIN_EMAIL', 'admin@fbk.dk')
    
    # Organization details
    ORG_NAME: str = os.getenv('ORG_NAME', 'FBK')
    ORG_EMAIL: str = os.getenv('ORG_EMAIL', 'info@fbk.dk')
    
    # Data storage
    DATA_FILE: str = os.getenv('DATA_FILE', 'members.json')
    
    # Base URL for approval links (if using web-based approval)
    BASE_URL: str = os.getenv('BASE_URL', 'http://localhost:8000')
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present"""
        required_fields = ['SMTP_HOST', 'SMTP_PORT', 'ORG_NAME', 'ORG_EMAIL']
        for field in required_fields:
            if not getattr(cls, field):
                raise ValueError(f"Required configuration field '{field}' is missing")
        return True


# Create a singleton config instance
config = Config()
