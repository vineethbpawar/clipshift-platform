-- Function to check existing profile role by email
CREATE OR REPLACE FUNCTION get_existing_profile_role(input_email TEXT)
RETURNS TEXT AS $$
DECLARE
    existing_role TEXT;
BEGIN
    SELECT role INTO existing_role FROM profiles WHERE email = input_email LIMIT 1;
    RETURN existing_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
