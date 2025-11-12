#!/usr/bin/env python3
"""
Command-line interface for FBK Membership System
"""
import sys
import argparse
from datetime import datetime
from fbk_membership.models import Member, MembershipStatus
from fbk_membership.service import MembershipService


def main():
    parser = argparse.ArgumentParser(
        description='FBK Smart Membership System - Automates member registration and de-registration'
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Register command
    register_parser = subparsers.add_parser('register', help='Register a new member')
    register_parser.add_argument('--first-name', required=True, help='First name')
    register_parser.add_argument('--last-name', required=True, help='Last name')
    register_parser.add_argument('--email', required=True, help='Email address')
    register_parser.add_argument('--phone', required=True, help='Phone number')
    register_parser.add_argument('--address', required=True, help='Street address')
    register_parser.add_argument('--postal-code', required=True, help='Postal code (4 digits)')
    register_parser.add_argument('--city', required=True, help='City')
    register_parser.add_argument('--notes', help='Additional notes')
    
    # Deregister command
    deregister_parser = subparsers.add_parser('deregister', help='Deregister a member')
    deregister_parser.add_argument('--email', required=True, help='Email address of member to deregister')
    
    # Approve command
    approve_parser = subparsers.add_parser('approve', help='Approve a pending request')
    approve_parser.add_argument('--token', required=True, help='Approval token')
    
    # List commands
    list_parser = subparsers.add_parser('list', help='List members')
    list_parser.add_argument('--status', choices=['pending', 'active', 'inactive', 'cancelled'], 
                           help='Filter by status')
    
    # Pending requests
    subparsers.add_parser('pending', help='Show pending approval requests')
    
    # Get member
    get_parser = subparsers.add_parser('get', help='Get member details')
    get_parser.add_argument('--email', required=True, help='Email address')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    # Initialize service
    service = MembershipService()
    
    try:
        if args.command == 'register':
            # Create member object
            member = Member(
                first_name=args.first_name,
                last_name=args.last_name,
                email=args.email,
                phone=args.phone,
                address=args.address,
                postal_code=args.postal_code,
                city=args.city,
                notes=args.notes
            )
            
            # Request registration
            request = service.request_registration(member)
            print(f"✓ Registration request created for {member.get_full_name()}")
            print(f"  Approval token: {request.approval_token}")
            print(f"  Approval email sent to admin")
            
        elif args.command == 'deregister':
            # Request de-registration
            request = service.request_deregistration(args.email)
            print(f"✓ De-registration request created for {request.member.get_full_name()}")
            print(f"  Approval token: {request.approval_token}")
            print(f"  Approval email sent to admin")
            
        elif args.command == 'approve':
            # Approve request
            member = service.approve_request(args.token)
            print(f"✓ Request approved for {member.get_full_name()}")
            print(f"  Status: {member.status}")
            print(f"  Emails sent to member and municipality")
            
        elif args.command == 'list':
            # List members
            status = MembershipStatus(args.status) if args.status else None
            members = service.list_members(status)
            
            if not members:
                print("No members found")
            else:
                print(f"\nFound {len(members)} member(s):\n")
                for member in members:
                    print(f"  • {member.get_full_name()}")
                    print(f"    Email: {member.email}")
                    print(f"    Status: {member.status}")
                    print(f"    ID: {member.id}")
                    if member.registration_date:
                        print(f"    Registered: {member.registration_date.strftime('%Y-%m-%d %H:%M')}")
                    print()
                    
        elif args.command == 'pending':
            # List pending requests
            requests = service.get_pending_requests()
            
            if not requests:
                print("No pending requests")
            else:
                print(f"\nFound {len(requests)} pending request(s):\n")
                for req in requests:
                    action = "Registration" if req.action.value == "register" else "De-registration"
                    print(f"  • {action}: {req.member.get_full_name()}")
                    print(f"    Email: {req.member.email}")
                    print(f"    Token: {req.approval_token}")
                    print(f"    Requested: {req.request_date.strftime('%Y-%m-%d %H:%M')}")
                    print()
                    
        elif args.command == 'get':
            # Get member by email
            member = service.get_member_by_email(args.email)
            
            if not member:
                print(f"No member found with email: {args.email}")
            else:
                print(f"\nMember Details:")
                print(f"  Name: {member.get_full_name()}")
                print(f"  Email: {member.email}")
                print(f"  Phone: {member.phone}")
                print(f"  Address: {member.address}, {member.postal_code} {member.city}")
                print(f"  Status: {member.status}")
                print(f"  ID: {member.id}")
                if member.registration_date:
                    print(f"  Registered: {member.registration_date.strftime('%Y-%m-%d %H:%M')}")
                if member.approval_date:
                    print(f"  Approved: {member.approval_date.strftime('%Y-%m-%d %H:%M')}")
                if member.notes:
                    print(f"  Notes: {member.notes}")
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
