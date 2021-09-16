import string

def valid_email(email:str):
    # regex can be a little too strict for email checking
    # This application will rely on email confirmation, so email validation can be a little lenient
    if any(x in email for x in list(string.ascii_lowercase)) or any(x in email for x in list(string.ascii_uppercase)):
        # contains an alpha character
        if '@' in email and '.' in email:
            if email.find("@") < email.find("."):
                # '@' is before '.'
                if email.find(".") - email.find("@") > 1:
                    # '@' and '.' are not beside eachother
                    if email[0] != '@' and email[-1] != '.':
                        # '@' is not first and '.' is not last
                        return True
    return False