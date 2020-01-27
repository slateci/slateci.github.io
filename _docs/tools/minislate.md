---
title: MiniSLATE 
overview: 
layout: docs2020
type: markdown
---

<div id="minislate-content">

</div>

<script src='https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js'></script>
<script>
    $(document).ready(function(){

        $.get("https://raw.githubusercontent.com/slateci/minislate/master/README.md", function(data) {
            

                var converter = new showdown.Converter(),
                html = converter.makeHtml(data);
                console.log(html);
                html = html.replace(/<h1.+<\/h1>/, "");
                $("#minislate-content").html(html);

          

        });

    });
</script>