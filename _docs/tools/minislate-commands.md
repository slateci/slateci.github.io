---
title: MiniSLATE Commands
overview: 
layout: docs2020
type: markdown
---

<div id="minislate-content">

</div>

<script src='https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js'></script>
<script>

$(document).ready(function() {
    $.get("https://raw.githubusercontent.com/slateci/minislate/master/COMMANDS.md", function(data) {
            var converter = new showdown.Converter({ghCompatibleHeaderId: true}),
            html = converter.makeHtml(data);
            html = html.replace(/<h1.+<\/h1>/, "");
            $("#minislate-content").html(html);
            /* Rerun Prism syntax highlighting on the current page */
            Prism.highlightAll();
            
    });
});

</script>