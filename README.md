
# slate.github.io

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Integration Tests](https://github.com/slateci/slateci.github.io/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/slateci/slateci.github.io/actions/workflows/integration-tests.yml)
[![Website Deployment](https://github.com/slateci/slateci.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/slateci/slateci.github.io/actions/workflows/pages/pages-build-deployment)

This repository contains the source code for the [slateci.io](https://slateci.io) web site. It is modeled after the [istio.io](https://istio.io) website.

## How to contribute

You can contribute to the website simply by modifying the markdown in the places.

### How to modify a page that already exists

Each page on the website as a link "Edit This Page on GitHub". This will open the corresponding markdown page in the repository. Edit and commit.

### How to add a post on the blog

Blog posts are in the directory [posts](https://github.com/slateci/slateci.github.io/tree/master/_posts). Add a file there following the format of the others.

# Technical details

The website uses [Jekyll](https://jekyllrb.com/) templates and is hosted on GitHub Pages.

To run the site locally with Docker, use the following command:

```bash
docker run --rm --label=jekyll --volume=$(pwd):/srv/jekyll  -it -p 127.0.0.1:4000:4000 jekyll/jekyll jekyll serve
```

Make sure you are not introducing html errors or bad links:
```bash
$ docker run --rm --label=jekyll --volume=$(pwd):/srv/jekyll  -it  jekyll/jekyll sh -c "bundle install && rake test"
...
HTML-Proofer finished successfully.
```

#### Side note for those on non-linux machines
 
If you're developing locally but not on a Linux machine, you have a couple options. 

1. You can opt to use [Docker for Mac](https://docs.docker.com/docker-for-mac/) / [Docker for Windows](https://docs.docker.com/docker-for-windows/). This will give you a docker environment from which to run the above docker container (which has all the of the correct Jekyll dependencies and Ruby versions installed).
1. Alternatively, you can try installing Jekyll locally. You may need to install other prerequisites manually (which is where using the docker image shines). Here's an example of doing so for Mac OS X:

   ```shell
   $ xcode-select --install
   $ brew install ruby
   $ sudo gem install bundler
   $ sudo gem install jekyll
   $ cd slateci.github.io
   $ bundle install
   $ bundle exec jekyll build
   $ bundle exec jekyll serve
   ```
   