---
title: Update Root Certificate (Let's Encrypt)
overview: Update certificate after Let's Encrypt root certicate expiration 
published: true
permalink: blog/update-root-cert.html
attribution: The SLATE Team 
layout: post
type: markdown
tag: draft

---

After the Let's Encrypt root certificate expired at the end of September 2021, a few people are still experiencing a certificate expired warning on our websites.  We have updated our websites with the current certificate; however, some users may need to update the certificate on their computers. Specifically, we have seen this issue with Mac OS.

<!--end_excerpt-->


Follow these steps to resolve ertificate warnings your the web browser. 

1. Download and open: https://letsencrypt.org/certs/lets-encrypt-r3.pem. The Add Certificates window will pop open. 
1. Under keychain, change the selection to System. 
1. Click Add. If prompted, enter your computer password. 
1. Restart the browser