---
title: automate-wildcard-ssl-certs-via-letsencrypt
tags:
---



Process of making wildcard certificate renewal:
- Create dedicated account for calling aliyun api to add/update dns TXT records
- Saving the access key somewhere in company scope.
- Create python script for the renewal host before renewal with `certbot renew --manual --manual-auth-hook [path-to-authenticator.sh] [path-to-cleanup.sh] --deploy-hook [path-to-deploy-hook.sh]`.
    - Authenticator script will cover:
        - Computing aliyun api signature.
        - Call api to add dns TXT record.
        - Wait for 25-30 seconds to make sure the change has time to propagate over to DNS
        - Save `$zoneId` and `$recordId` locally for later use from clean up script.
        - Send email to it@vspace-tec.com when anything failed.
    - Cleanup script will cover:
        - Computing aliyun api signature.
        - Call api to delete added TXT record by `$zoneId` and `$recordId`.
        - Send email to it@vspace-tec.com when anything failed.
    - Deploy-hook will cover:
        - Check the creation date and modified date if they are 89 days longer before today
        - If yes, assume the renewal failed and send email to it@vspace-tec.com.
        - If no, upload the certificates to aliyun oss.
        - Reload the nginx configuration.
        - Send email to it@vspace-tec.com when anything failed.
- Test the script around and add it to crontab.
- Create python script for consumer hosts to download the certificates form aliyun oss which will cover:
    - Maintain a variable called `$certsLastDownloadedDate` somewhere in the host temp file.
    - Be aware of the experation amount of time 89 days.
    - Be aware of the renewable time 30 days.
    - Check if today is in the time window to download the newer certificates.
    - If no, do nothing.
    - If yes, download the certs files into a local temp foler.
    - Compare each downloaded cert file the MD5 value with the current ones.
    - If all of them are different, replace the current certs with downloaded ones, update `$certsLastDownloadedDate`, reload nginx configuration and send email to administrator.
    - If any of them stays the same, send the email to administrator.
    - Delete the temp folder.

There are 4 files staying in one folder for the wildcard certificate but only 2 of them get actually used. Still need time to decide which files should be really taken into account. 