import smtplib
from email.mime.text import MIMEText

sender = 'francis.weate@gmail.com'
gmail_password = 'jimh pedd mvtr nugb'


def email_user(email,url):
    e = []
    e.append(email)
    msg = MIMEText("Here are your results :\n"+url)
    msg['Subject'] = 'Test mail'
    msg['From'] = sender
    msg['To'] = email

    try:
        smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        smtp_server.ehlo()
        smtp_server.login(sender, gmail_password)
        smtp_server.sendmail(sender, e, msg.as_string())
        smtp_server.close()
        print ("Email sent successfully!")
    except Exception as ex:
        print ("Something went wrong….",ex)
    