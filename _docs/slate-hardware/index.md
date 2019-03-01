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
| SLATE Reference | Dell   | 2S/24C/48T            | 384GB RDIMM | 10 Gb | 8x8 TB, 1x1.6 TB NVME, 2x16 GB microSD           |      |
| ATLAS Tier 2    | Dell   | 2S/16C/32T            | 192GB RDIMM | 10 Gb | 12x12 TB, BOSS controller 240 GB M.2, 4x2 TB M.2 |      |


The reference platform includes dedicated network measurement hardware (a PerfSONAR node) and an out-of-band management node that is able to bootstrap a SLATE cluster.

| Configuration         | Vendor | Sockets/Cores/Threads | DRAM (GiB) | NICs  | Storage    | Year |
|-----------------------|:------:|:---------------------:|------------|-------|------------|------|
| SLATE Management Node | Dell   | 1S/10C/20T            | 32GB RDIMM | 10 Gb | 480 GB SSD |      |
| SLATE perfSONAR Node  | Dell   | 1S/10C/20T            | 32GB RDIMM | 10 Gb | 480 GB SSD |      |



<!--  {% include section-index.html %} -->
