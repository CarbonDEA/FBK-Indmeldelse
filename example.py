#!/usr/bin/env python3
"""
Example usage of the FBK Membership System
Demonstrates the complete workflow from registration to approval
"""
from fbk_membership.models import Member
from fbk_membership.service import MembershipService


def main():
    # Initialize the service
    service = MembershipService()
    
    print("=== FBK Smart Membership System - Example ===\n")
    
    # Example 1: Register a new member
    print("1. Registering a new member...")
    member = Member(
        first_name="Anders",
        last_name="Nielsen",
        email="anders.nielsen@example.dk",
        phone="+45 12 34 56 78",
        address="Hovedgaden 42",
        postal_code="2100",
        city="København Ø",
        notes="Interested in youth activities"
    )
    
    try:
        request = service.request_registration(member)
        print(f"   ✓ Registration request created")
        print(f"   ✓ Approval token: {request.approval_token}")
        print(f"   ✓ Approval email sent to admin\n")
        
        # Example 2: Approve the registration
        print("2. Approving the registration...")
        approved_member = service.approve_request(request.approval_token)
        print(f"   ✓ Member approved: {approved_member.get_full_name()}")
        print(f"   ✓ Status: {approved_member.status}")
        print(f"   ✓ Welcome email sent to member")
        print(f"   ✓ Notification sent to municipality\n")
        
        # Example 3: List all active members
        print("3. Listing active members...")
        from fbk_membership.models import MembershipStatus
        active_members = service.list_members(status=MembershipStatus.ACTIVE)
        print(f"   Found {len(active_members)} active member(s):")
        for m in active_members:
            print(f"   - {m.get_full_name()} ({m.email})")
        print()
        
        # Example 4: Request de-registration
        print("4. Requesting de-registration...")
        deregister_request = service.request_deregistration(member.email)
        print(f"   ✓ De-registration request created")
        print(f"   ✓ Approval token: {deregister_request.approval_token}")
        print(f"   ✓ Approval email sent to admin\n")
        
        # Example 5: Approve de-registration
        print("5. Approving de-registration...")
        cancelled_member = service.approve_request(deregister_request.approval_token)
        print(f"   ✓ Member de-registered: {cancelled_member.get_full_name()}")
        print(f"   ✓ Status: {cancelled_member.status}")
        print(f"   ✓ Confirmation email sent to member")
        print(f"   ✓ Notification sent to municipality\n")
        
        print("=== Example completed successfully! ===")
        print("\nNote: Email sending may fail if SMTP is not configured.")
        print("Configure SMTP settings in .env file to enable actual email delivery.\n")
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())
