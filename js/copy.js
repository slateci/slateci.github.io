let codeBlocks = document.querySelectorAll('[data-add-copy-button]');
let count = 0;

codeBlocks.forEach((block) => {
  let code = block.querySelector('code');

  // Ensure we're in a code block.
  if (block.tagName != 'PRE' || code == null) {
    return;
  }

  code.setAttribute("id", "copycode" + count);

  // Create the div that holds the copy button.
  let div = document.createElement('div');
  div.className = "copy-btn-container";

  let btn = document.createElement('button');
  btn.innerHTML = "Copy";
  btn.className = "copy-btn";
  btn.setAttribute("data-clipboard-action", "copy");
  btn.setAttribute("data-clipboard-target", "#copycode" + count);
  div.appendChild(btn);

  // Remove padding from code block.
  block.style.paddingTop = "0";
  block.style.marginTop = "0";
  block.parentNode.insertBefore(div, block);

  count++;
});

let clipboard = new ClipboardJS('.copy-btn');

clipboard.on('success', function(e) {
    e.clearSelection();
    e.trigger.innerHTML = "Copied!";
    setTimeout(() => {
      e.trigger.innerHTML = "Copy";
    }, 1000);
});
