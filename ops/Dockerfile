FROM hashicorp/terraform:latest

ADD ../terraform.tf .

ENTRYPOINT ["sh"]
CMD ["-c", "sleep 15s && terraform init && terraform apply -input=false -auto-approve"]