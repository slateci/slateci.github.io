---
title: MiniSLATE 
overview: 
layout: docs2020
type: markdown
---

Minislate is a self-contained SLATE cluster that runs locally on your computer. We use it as an application development tool because it allows running local helm charts and access to the underlying Kubernetes cluster via kubectl, which is unavailable in production. 

To get started, clone or download the [Minislate repository](https://github.com/slateci/minislate) in Github: https://github.com/slateci/minislate

<hr>

<div id="minislate-content">
    
</div>

<script src='{{home}}/js/showdown.min.js'></script>
<script>
$(document).ready(function() {
    $.get("https://raw.githubusercontent.com/slateci/minislate/master/README.md", function(data) {
            var converter = new showdown.Converter({ghCompatibleHeaderId: true}),
            html = converter.makeHtml(data);
            console.log(html);
            html = html.replace(/<h1.+<\/h1>/, "");
            $("#minislate-content").html(html);
            /* Rerun Prism syntax highlighting on the current page */
            Prism.highlightAll();
    });
});

</script>
