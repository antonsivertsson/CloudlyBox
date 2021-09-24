# CloudlyBox

A cloud connected file store, not all unlike Dropbox and other such services

## Getting started

### Prerequisites

* [Docker](https://docs.docker.com/get-docker/) (with *docker-compose*)
* [Terraform - v1.0.7](https://www.terraform.io/downloads.html)
* [git](https://git-scm.com/downloads)

### Starting application

1. Run `git clone https://github.com/antonsivertsson/CloudlyBox.git` in terminal
2. From project, run `docker-compose up --build`
3. Check logs to verify that Localstack is running (should be a line that says `localstack_main  | Ready.`)
4. From project, run `terraform init && terraform apply -auto-approve`
5. Open application at [http://localhost:3001](http://localhost:3001)

### Future changes

- [] Use DynamoDB instead of locally hosted LowDB
- [] Remove server and exchange for serverless AWS lambdas that negotiate S3 content (generate signing URLs) and metadata
- [] Update S3 ACL content to be private
- [] Add a layer of authentication for accessing content using the client