#!/usr/bin/env python3
"""
Quick Start Guide for FBK Membership System
Run this script to see a complete demonstration
"""

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def main():
    print_section("FBK Smart Membership System - Quick Start")
    
    print("\n📋 What this system does:")
    print("  • Automates member registration (indmeldelse)")
    print("  • Automates member de-registration (udmeldelse)")
    print("  • Sends approval emails to admin")
    print("  • Sends welcome emails to new members")
    print("  • Sends notifications to municipality")
    print("  • Manages member data with validation")
    
    print_section("1. Setup")
    print("\n1. Install dependencies:")
    print("   pip install -r requirements.txt")
    print("\n2. Configure email (optional):")
    print("   cp .env.example .env")
    print("   # Edit .env with your SMTP settings")
    
    print_section("2. Register a New Member")
    print("\nCommand:")
    print("   python3 cli.py register \\")
    print('     --first-name "Anders" \\')
    print('     --last-name "Nielsen" \\')
    print('     --email "anders@example.dk" \\')
    print('     --phone "+45 12 34 56 78" \\')
    print('     --address "Hovedgaden 42" \\')
    print('     --postal-code "2100" \\')
    print('     --city "København Ø"')
    print("\nThis will:")
    print("  ✓ Validate the member data")
    print("  ✓ Create a registration request")
    print("  ✓ Generate an approval token")
    print("  ✓ Send approval email to admin")
    
    print_section("3. View Pending Requests")
    print("\nCommand:")
    print("   python3 cli.py pending")
    print("\nShows all requests waiting for approval")
    
    print_section("4. Approve a Request")
    print("\nCommand:")
    print("   python3 cli.py approve --token <approval-token>")
    print("\nThis will:")
    print("  ✓ Activate the member")
    print("  ✓ Send welcome email to member")
    print("  ✓ Send notification to municipality")
    
    print_section("5. List Members")
    print("\nAll members:")
    print("   python3 cli.py list")
    print("\nActive members only:")
    print("   python3 cli.py list --status active")
    
    print_section("6. Get Member Details")
    print("\nCommand:")
    print("   python3 cli.py get --email anders@example.dk")
    
    print_section("7. De-register a Member")
    print("\nCommand:")
    print("   python3 cli.py deregister --email anders@example.dk")
    print("\nThis will:")
    print("  ✓ Create a de-registration request")
    print("  ✓ Send approval email to admin")
    print("  ✓ After approval: send confirmation to member")
    print("  ✓ After approval: notify municipality")
    
    print_section("8. Run the Example")
    print("\nTo see a complete workflow demonstration:")
    print("   python3 example.py")
    print("\nThis runs through:")
    print("  1. Registration")
    print("  2. Approval")
    print("  3. Listing members")
    print("  4. De-registration")
    print("  5. Approval of de-registration")
    
    print_section("9. Use in Python Code")
    print("\nExample:")
    print("""
from fbk_membership.models import Member
from fbk_membership.service import MembershipService

# Initialize service
service = MembershipService()

# Create and register a member
member = Member(
    first_name="Maria",
    last_name="Jensen",
    email="maria@example.dk",
    phone="+45 98 76 54 32",
    address="Strandvejen 10",
    postal_code="2900",
    city="Hellerup"
)

# Request registration
request = service.request_registration(member)
print(f"Approval token: {request.approval_token}")

# Approve (normally done by admin clicking email link)
approved = service.approve_request(request.approval_token)
print(f"Member {approved.get_full_name()} is now active!")
    """)
    
    print_section("📖 Documentation")
    print("\nFor complete documentation, see README.md")
    print("\nFor help with CLI commands:")
    print("   python3 cli.py --help")
    print("   python3 cli.py register --help")
    
    print_section("🔒 Security Notes")
    print("\n• Never commit .env file (it's in .gitignore)")
    print("• All member data is validated")
    print("• Approval tokens are unique UUIDs")
    print("• Emails require proper SMTP configuration")
    
    print_section("✅ You're Ready to Go!")
    print("\nStart by running:")
    print("   python3 example.py")
    print("\nThen try the CLI commands above.\n")

if __name__ == '__main__':
    main()
