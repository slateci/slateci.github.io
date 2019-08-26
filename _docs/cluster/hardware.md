SLATE works with a variety of cluster configurations, from single-node SLATELite virtual machines to large clusters of dedicated hardware. The following reference configurations are known to work as SLATE edge servers:

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
   <td><a href="{{home}}/docs/cluster/edge-node.html">SLATE Reference</a></td>
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
   <td><a href="{{home}}/docs/cluster/atlas-node.html">ATLAS Tier 2</a></td>
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
Some sites may opt to acquire some additional support hardware, such as a Management node to be used as a dedicated Kubernetes master, or a perfSonar node for dedicated testing:

| Configuration         | Vendor | Sockets/Cores/Threads | DRAM (GiB) | NICs  | Boot/Other Storage    | Year |
|-----------------------|:------:|:---------------------:|------------|-------|------------|------|
| [SLATE Management Node]({{home}}/docs/docs/cluster/management-node.html) | Dell | 1S/10C/20T | 32GB | 2x10 Gbps | 480 GB SSD | 2018 |
| [SLATE perfSONAR Node]({{home}}/docs/cluster/perfsonar-node.html)  | Dell | 1S/10C/20T | 32GB | 2x10 Gbps | 480 GB SSD | 2018 |

<!--  {% include section-index.html %} -->
