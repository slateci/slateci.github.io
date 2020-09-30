---
title: SLATE Change Management Policy 
overview: SLATE Change Management Policy

order: 10  

layout: docs2020
type: markdown
---

| Version | Comment | Effective Date |
|---|---|---|
|1.0|Initial Version|September 25, 2020|

All physical and virtual machines making up the SLATE platform should be managed with appropriate infrastructure automation software<sup>1</sup>, with the corresponding configuration stored so that its history is available for review and changes can be reverted if necessary<sup>2</sup>. 

Software packages critical to the function of those machines, or otherwise externally exposed must be promptly updated to patch known vulnerabilities. Otherwise, all such software should be periodically updated when new versions become available unless doing so interferes with the functionality of the platform, in which case the conflict should be corrected to allow updates to occur. 

<hr>

<sup>1</sup> Currently Puppet<br>
<sup>2</sup> Configuration is currently stored in MWT2's GitLab