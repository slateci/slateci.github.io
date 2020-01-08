---
title: How to Post a Blog to the SLATE Website
overview: How to Post a Blog to the SLATE Website
published: true
permalink: blog/how-to-post-a-blog.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

Posting a blog to the slateci.io website is easy but there are a few steps to keep in mind. 

#### Step 1

Name the file with the following scheme: <code>YYYY-MM-DD-blog-title.md</code>. Posts dated in the future will not show up on the blog page until that future date.

#### Step 2

Place the blog in the _posts directory

#### Step 3

The markdown file must include the front matter required by Jekyll.

```
---
title: How to Post a Blog to the SLATE Website
overview: How to Post a Blog to the SLATE Website
published: true
permalink: blog/how-to-post-a-blog.html
attribution: The SLATE Team
layout: post
type: markdown
---
```

If you want to see the blog post as it would be published, but are not ready to publish to the webiste's blog page, you can add an additional entry in the front matter then view the post at [https://slateci.io/drafts/](https://slateci.io/drafts/). 

Add the following to the the front matter to view the blog in the drafts section: 

```
tag: draft
```

#### Images

To Include an image in the blog post, place the image in img/posts and link to it through markdown:

```
![Alt Text](/img/posts/image-name.png)
```
