from django.core.management.base import BaseCommand
from authentication.firebase_auth import firebase_auth


class Command(BaseCommand):
    help = 'Manage Firebase users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--list',
            action='store_true',
            help='List all Firebase users',
        )
        parser.add_argument(
            '--create',
            type=str,
            help='Create a test user with email',
        )
        parser.add_argument(
            '--delete',
            type=str,
            help='Delete user by UID',
        )

    def handle(self, *args, **options):
        if not firebase_auth.is_initialized():
            self.stdout.write(
                self.style.ERROR('Firebase is not initialized. Check your credentials.')
            )
            return

        if options['list']:
            self.list_users()
        elif options['create']:
            self.create_test_user(options['create'])
        elif options['delete']:
            self.delete_user(options['delete'])
        else:
            self.stdout.write(
                self.style.WARNING('No action specified. Use --help for options.')
            )

    def list_users(self):
        """List all Firebase users"""
        self.stdout.write('Fetching Firebase users...')
        
        users = firebase_auth.list_users()
        if users:
            self.stdout.write(
                self.style.SUCCESS(f'Found {len(users)} Firebase users:')
            )
            
            for user in users:
                self.stdout.write(
                    f"  UID: {user['uid']}\n"
                    f"    Email: {user['email']}\n"
                    f"    Display Name: {user['display_name'] or 'N/A'}\n"
                    f"    Email Verified: {user['email_verified']}\n"
                    f"    Disabled: {user['disabled']}\n"
                    f"    Created: {user['created_at']}\n"
                    f"    ---"
                )
        else:
            self.stdout.write(
                self.style.WARNING('No Firebase users found or error occurred.')
            )

    def create_test_user(self, email):
        """Create a test user in Firebase"""
        self.stdout.write(f'Creating test user: {email}')
        
        try:
            result = firebase_auth.create_user(
                email=email,
                password='testpassword123',
                display_name='Test User'
            )
            
            if result:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'User created successfully!\n'
                        f'  UID: {result["uid"]}\n'
                        f'  Email: {result["email"]}\n'
                        f'  Display Name: {result["display_name"]}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR('Failed to create user.')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating user: {e}')
            )

    def delete_user(self, uid):
        """Delete a user from Firebase"""
        self.stdout.write(f'Deleting user: {uid}')
        
        try:
            if firebase_auth.delete_user(uid):
                self.stdout.write(
                    self.style.SUCCESS(f'User {uid} deleted successfully!')
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f'Failed to delete user {uid}.')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error deleting user: {e}')
            )
