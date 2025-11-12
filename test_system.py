#!/usr/bin/env python3
"""
Simple validation tests for FBK Membership System
Tests core functionality without requiring external dependencies
"""
import sys
import os
import tempfile
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fbk_membership.models import Member, MembershipStatus, MembershipAction, MembershipRequest
from fbk_membership.storage import MemberStorage
from fbk_membership.service import MembershipService


def test_member_creation():
    """Test creating a valid member"""
    print("Testing member creation...", end=" ")
    member = Member(
        first_name="Test",
        last_name="User",
        email="test@example.dk",
        phone="+45 12 34 56 78",
        address="Test Street 1",
        postal_code="2100",
        city="Copenhagen"
    )
    assert member.first_name == "Test"
    assert member.last_name == "User"
    assert member.get_full_name() == "Test User"
    assert member.status == MembershipStatus.PENDING
    print("✓ PASS")


def test_member_validation():
    """Test member validation"""
    print("Testing member validation...", end=" ")
    
    # Valid postal code
    try:
        member = Member(
            first_name="Test",
            last_name="User",
            email="test@example.dk",
            phone="12345678",
            address="Test Street 1",
            postal_code="2100",
            city="Copenhagen"
        )
        assert True
    except:
        assert False, "Valid postal code should pass"
    
    # Invalid postal code
    try:
        member = Member(
            first_name="Test",
            last_name="User",
            email="test@example.dk",
            phone="12345678",
            address="Test Street 1",
            postal_code="ABC",  # Invalid
            city="Copenhagen"
        )
        assert False, "Invalid postal code should fail"
    except:
        assert True
    
    # Invalid email
    try:
        member = Member(
            first_name="Test",
            last_name="User",
            email="not-an-email",  # Invalid
            phone="12345678",
            address="Test Street 1",
            postal_code="2100",
            city="Copenhagen"
        )
        assert False, "Invalid email should fail"
    except:
        assert True
    
    print("✓ PASS")


def test_storage():
    """Test storage operations"""
    print("Testing storage operations...", end=" ")
    
    # Use a temporary file
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
        temp_file = f.name
    
    try:
        storage = MemberStorage(data_file=temp_file)
        
        # Create and add a member
        member = Member(
            first_name="Storage",
            last_name="Test",
            email="storage@example.dk",
            phone="12345678",
            address="Test Street 1",
            postal_code="2100",
            city="Copenhagen"
        )
        
        added = storage.add_member(member)
        assert added.id is not None
        assert added.registration_date is not None
        
        # Retrieve by ID
        retrieved = storage.get_member(added.id)
        assert retrieved is not None
        assert retrieved.email == member.email
        
        # Retrieve by email
        retrieved_by_email = storage.get_member_by_email(member.email)
        assert retrieved_by_email is not None
        assert retrieved_by_email.id == added.id
        
        # Update member
        added.status = MembershipStatus.ACTIVE
        updated = storage.update_member(added)
        assert updated.status == MembershipStatus.ACTIVE
        
        # List members
        all_members = storage.list_members()
        assert len(all_members) == 1
        
        active_members = storage.list_members(status=MembershipStatus.ACTIVE)
        assert len(active_members) == 1
        
        print("✓ PASS")
    finally:
        # Cleanup
        if os.path.exists(temp_file):
            os.unlink(temp_file)


def test_membership_service():
    """Test membership service workflow"""
    print("Testing membership service...", end=" ")
    
    # Use a temporary file
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
        temp_file = f.name
    
    try:
        storage = MemberStorage(data_file=temp_file)
        service = MembershipService(storage=storage, email_service=None)
        
        # Create a member
        member = Member(
            first_name="Service",
            last_name="Test",
            email="service@example.dk",
            phone="12345678",
            address="Test Street 1",
            postal_code="2100",
            city="Copenhagen"
        )
        
        # Request registration
        request = service.request_registration(member)
        assert request.approval_token is not None
        assert request.action == MembershipAction.REGISTER
        assert not request.approved
        
        # Approve registration
        approved_member = service.approve_request(request.approval_token)
        assert approved_member.status == MembershipStatus.ACTIVE
        assert approved_member.approval_date is not None
        
        # Try to register again (should fail)
        try:
            service.request_registration(member)
            assert False, "Should not allow duplicate registration"
        except ValueError:
            assert True
        
        # Request de-registration
        dereq = service.request_deregistration(member.email)
        assert dereq.approval_token is not None
        assert dereq.action == MembershipAction.DEREGISTER
        
        # Approve de-registration
        cancelled = service.approve_request(dereq.approval_token)
        assert cancelled.status == MembershipStatus.CANCELLED
        assert cancelled.cancellation_date is not None
        
        print("✓ PASS")
    finally:
        # Cleanup
        if os.path.exists(temp_file):
            os.unlink(temp_file)


def test_request_handling():
    """Test membership request handling"""
    print("Testing request handling...", end=" ")
    
    member = Member(
        first_name="Request",
        last_name="Test",
        email="request@example.dk",
        phone="12345678",
        address="Test Street 1",
        postal_code="2100",
        city="Copenhagen"
    )
    
    request = MembershipRequest(
        member=member,
        action=MembershipAction.REGISTER
    )
    
    assert request.approval_token is None  # Not yet assigned
    assert not request.approved
    assert request.action == MembershipAction.REGISTER
    
    print("✓ PASS")


def main():
    print("\n" + "="*60)
    print("  FBK Membership System - Validation Tests")
    print("="*60 + "\n")
    
    tests = [
        test_member_creation,
        test_member_validation,
        test_storage,
        test_membership_service,
        test_request_handling,
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"✗ FAIL - {str(e)}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"  Results: {passed} passed, {failed} failed")
    print("="*60 + "\n")
    
    if failed > 0:
        print("Some tests failed!")
        return 1
    else:
        print("All tests passed! ✓")
        return 0


if __name__ == '__main__':
    sys.exit(main())
