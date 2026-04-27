import { supabase } from './supabase';

// Default password for all parent accounts
export const DEFAULT_PARENT_PASSWORD = 'wccparent@@2026';

// Generate parent email from student email
// Example: 24csc54@wcc.edu.in -> 24csc54parent@wcc.edu.in
export const generateParentEmail = (studentEmail: string): string => {
  const [localPart, domain] = studentEmail.split('@');
  if (!localPart || !domain) {
    throw new Error('Invalid student email format');
  }
  return `${localPart}parent@${domain}`;
};

// Check if this is a parent email
export const isParentEmail = (email: string): boolean => {
  return email.toLowerCase().includes('parent@');
};

// Extract student email from parent email
// Example: 24csc54parent@wcc.edu.in -> 24csc54@wcc.edu.in
export const extractStudentEmail = (parentEmail: string): string => {
  const [localPart, domain] = parentEmail.split('@');
  if (!localPart || !domain) {
    throw new Error('Invalid parent email format');
  }
  // Remove 'parent' suffix from local part
  const studentLocalPart = localPart.replace(/parent$/i, '');
  return `${studentLocalPart}@${domain}`;
};

// Create parent account when admin adds student details
export const createParentAccount = async (studentEmail: string, parentName: string, phone: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const parentEmail = generateParentEmail(studentEmail);
    
    // Check if parent account already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users.some(u => u.email === parentEmail);
    
    if (userExists) {
      return { success: false, error: 'Parent account already exists' };
    }

    // Create parent account with default password
    const { data, error } = await supabase.auth.admin.createUser({
      email: parentEmail,
      password: DEFAULT_PARENT_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: parentName,
        phone: phone,
        is_parent: true,
        password_changed: false, // Track if password has been changed
        created_via_student_registration: true
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if parent needs to change password (first login)
export const checkParentPasswordStatus = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.admin.getUserByEmail(email);
    
    if (error || !data.user) {
      return false;
    }
    
    // Check user metadata for password_changed flag
    const userMetadata = data.user.user_metadata;
    return userMetadata?.password_changed === false;
  } catch (error) {
    console.error('Error checking parent password status:', error);
    return false;
  }
};

// Mark parent password as changed (after first password change)
export const markParentPasswordChanged = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.admin.getUserByEmail(email);
    
    if (error || !data.user) {
      return { success: false, error: 'User not found' };
    }

    // Update user metadata to mark password as changed
    const { error: updateError } = await supabase.auth.admin.updateUser(data.user.id, {
      user_metadata: {
        ...data.user.user_metadata,
        password_changed: true
      }
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, error: undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if parent can change password (returns false if already changed)
export const canParentChangePassword = async (email: string): Promise<{ canChange: boolean; reason?: string }> => {
  try {
    const { data, error } = await supabase.auth.admin.getUserByEmail(email);
    
    if (error || !data.user) {
      return { canChange: false, reason: 'User not found' };
    }
    
    const userMetadata = data.user.user_metadata;
    
    if (userMetadata?.password_changed === true) {
      return { canChange: false, reason: 'Password already changed. Please contact admin to reset password.' };
    }
    
    return { canChange: true, reason: undefined };
  } catch (error) {
    return { canChange: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
};