import sib_api_v3_sdk
from django.core.mail.backends.base import BaseEmailBackend

class BrevoEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = os.environ.get('BREVO_API_KEY')
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )
        for message in email_messages:
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": r} for r in message.to],
                sender={"email": message.from_email},
                subject=message.subject,
                html_content=message.body
            )
            api_instance.send_transac_email(send_smtp_email)
        return len(email_messages)