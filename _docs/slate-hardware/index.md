---
title: SLATE Hardware
overview: 
index: true

order: 60

layout: docs
type: markdown
---

SLATE can operate with various hardware configurations.  Below are known configurations that the SLATE project has tested and validated for a SLATE cluster node.

| Configuration   | Vendor | Sockets/Cores/Threads | DRAM (GiB)  | NICs  | Storage                                          | Year | 
|-----------------|:------:|:---------------------:|-------------|-------|--------------------------------------------------|------|
| [SLATE Reference](/docs/slate-hardware/container-host.html) | Dell   | 2S/24C/48T            | 384GB | 2x10 Gbps | 8x8 TB, 1x1.6 TB NVME, 2x16 GB microSD           | 2018 |
| [ATLAS Tier 2](/docs/slate-hardware/atlas-node.html)    | Dell   | 2S/16C/32T            | 192GB  | 2x10 Gbps | 12x12 TB, BOSS controller 240 GB M.2, 4x2 TB M.2 | 2019 |


The reference platform includes dedicated network measurement hardware (a PerfSONAR node) and an out-of-band management node that is able to bootstrap a SLATE cluster.

| Configuration         | Vendor | Sockets/Cores/Threads | DRAM (GiB) | NICs  | Storage    | Year |
|-----------------------|:------:|:---------------------:|------------|-------|------------|------|
| [SLATE Management Node](/docs/slate-hardware/management-node.html) | Dell   | 1S/10C/20T            | 32GB | 2x10 Gbps | 480 GB SSD | 2018 |
| [SLATE perfSONAR Node](/docs/slate-hardware/perfsonar-node.html)  | Dell   | 1S/10C/20T            | 32GB | 2x10 Gbps | 480 GB SSD | 2018 |




<!--  {% include section-index.html %} -->
