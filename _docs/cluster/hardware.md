SLATE is able to operate using a number of configurations, from the virtual machines used in SLATElite to large clusters with varied hardware specifications. The hardware configurations listed below have been tested and shown to operate either stable SLATE clusters or manage the operation of SLATE:

### Cluster Hardware

<style>
th {text-align: center; vertical-align: bottom;}
</style>

<table>
  <tr>
	<th rowspan="2">Configuration</th>
	<th rowspan="2">Vendor</th>
	<th rowspan="2">Sockets/Cores/Threads</th>
	<th rowspan="2">DRAM (GiB)</th>
	<th rowspan="2">NICs</th>
	<th colspan="3">Storage</th>
	<th rowspan="2">Year</th>
 </tr>
  <tr>
	<th>Capacity</th>
	<th>Performance</th>
	<th>Boot/Other</th>
 </tr>   
<tr>
   <td><a href="/docs/slate-hardware/container-host.html">SLATE Reference</a></td>
   <td>Dell</td>
   <td>2S/24C/48T</td>
   <td>384GB</td>
   <td>2x10 Gbps</td>
   <td>8x8TB</td>
   <td>1.6TB NVMe</td>
   <td>2x16GB microSD</td>
   <td>2018</td>
</tr>

<tr>
   <td><a href="/docs/slate-hardware/atlas-node.html">ATLAS Tier 2</a></td>
   <td>Dell</td>
   <td>2S/16C/32T</td>
   <td>192GB</td>
   <td>2x10 Gbps</td>
   <td>12x12TB</td>
   <td>4x2TB M.2</td>
   <td>BOSS Controller 240GB M.2</td>
   <td>2019</td>
</tr>
</table>

### Support Hardware

| Configuration         | Vendor | Sockets/Cores/Threads | DRAM (GiB) | NICs  | Boot/Other Storage    | Year |
|-----------------------|:------:|:---------------------:|------------|-------|------------|------|
| [SLATE Management Node](/docs/slate-hardware/management-node.html) | Dell | 1S/10C/20T | 32GB | 2x10 Gbps | 480 GB SSD | 2018 |
| [SLATE perfSONAR Node](/docs/slate-hardware/perfsonar-node.html)  | Dell | 1S/10C/20T | 32GB | 2x10 Gbps | 480 GB SSD | 2018 |

<!--  {% include section-index.html %} -->
