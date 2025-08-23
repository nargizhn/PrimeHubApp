import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
import os
import json
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class FirebaseAuth:
    def __init__(self):
        self._app = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        if not firebase_admin._apps:
            try:
                # Try to load credentials from the configured path
                credentials_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
                
                if os.path.exists(credentials_path):
                    logger.info(f"Loading Firebase credentials from: {credentials_path}")
                    cred = credentials.Certificate(credentials_path)
                    self._app = firebase_admin.initialize_app(cred)
                    logger.info("Firebase Admin SDK initialized successfully")
                else:
                    logger.warning(f"Firebase credentials not found at: {credentials_path}")
                    self._app = None
            except Exception as e:
                logger.error(f"Firebase initialization error: {e}")
                self._app = None
    
    def is_initialized(self) -> bool:
        """Check if Firebase is properly initialized"""
        return self._app is not None
    
    def verify_id_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Firebase ID token and return user info
        """
        try:
            if not self._app:
                logger.warning("Firebase not initialized, cannot verify token")
                return None
            
            decoded_token = auth.verify_id_token(id_token)
            logger.info(f"Token verified for user: {decoded_token.get('email')}")
            return decoded_token
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return None
    
    def create_user(self, email: str, password: str, display_name: str = None) -> Optional[Dict[str, Any]]:
        """
        Create a new user in Firebase
        """
        try:
            if not self._app:
                logger.warning("Firebase not initialized, cannot create user")
                return None
            
            logger.info(f"Creating Firebase user: {email}")
            
            user_properties = {
                'email': email,
                'password': password,
                'email_verified': False
            }
            
            if display_name:
                user_properties['display_name'] = display_name
            
            user_record = auth.create_user(**user_properties)
            
            logger.info(f"Firebase user created successfully: {user_record.uid}")
            
            return {
                'uid': user_record.uid,
                'email': user_record.email,
                'display_name': user_record.display_name
            }
        except Exception as e:
            logger.error(f"Firebase user creation error: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email from Firebase
        """
        try:
            if not self._app:
                logger.warning("Firebase not initialized, cannot get user")
                return None
            
            user_record = auth.get_user_by_email(email)
            logger.info(f"Firebase user retrieved: {user_record.uid}")
            
            return {
                'uid': user_record.uid,
                'email': user_record.email,
                'display_name': user_record.display_name
            }
        except Exception as e:
            logger.error(f"Firebase user retrieval error: {e}")
            return None
    
    def update_user(self, uid: str, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Update user in Firebase
        """
        try:
            if not self._app:
                logger.warning("Firebase not initialized, cannot update user")
                return None
            
            user_record = auth.update_user(uid, **kwargs)
            logger.info(f"Firebase user updated: {uid}")
            
            return {
                'uid': user_record.uid,
                'email': user_record.email,
                'display_name': user_record.display_name
            }
        except Exception as e:
            logger.error(f"Firebase user update error: {e}")
            return None
    
    def delete_user(self, uid: str) -> bool:
        """
        Delete user from Firebase
        """
        try:
            if not self._app:
                logger.warning("Firebase not initialized, cannot delete user")
                return False
            
            auth.delete_user(uid)
            logger.info(f"Firebase user deleted: {uid}")
            return True
        except Exception as e:
            logger.error(f"Firebase user deletion error: {e}")
            return False
    
    def list_users(self, max_results: int = 1000) -> Optional[list]:
        """
        List all users in Firebase (for admin purposes)
        """
        try:
            if not self._app:
                logger.warning("Firebase not initialized, cannot list users")
                return None
            
            users = []
            page = auth.list_users(max_results=max_results)
            
            for user in page.users:
                users.append({
                    'uid': user.uid,
                    'email': user.email,
                    'display_name': user.display_name,
                    'email_verified': user.email_verified,
                    'disabled': user.disabled,
                    'created_at': user.user_metadata.creation_timestamp
                })
            
            logger.info(f"Retrieved {len(users)} Firebase users")
            return users
        except Exception as e:
            logger.error(f"Firebase list users error: {e}")
            return None


# Global Firebase auth instance
firebase_auth = FirebaseAuth() 