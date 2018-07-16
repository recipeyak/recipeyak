terraform {
  backend "s3" {
    bucket         = "tf-state-942253978651"
    key            = "recipeyak-prod"
    region         = "us-east-1"
    dynamodb_table = "tf-lock"
  }
}

variable "domain" {
  default = "recipeyak.com"
}

provider "digitalocean" {
  version = "~> 0.1"
}

provider "cloudflare" {
  version = "~> 1.0"
}

resource "cloudflare_record" "root" {
  domain  = "${var.domain}"
  name    = "${var.domain}"
  value   = "159.65.46.220"
  type    = "A"
  proxied = true
}

resource "cloudflare_record" "www" {
  domain  = "${var.domain}"
  name    = "www"
  value   = "159.65.46.220"
  type    = "A"
  proxied = true
}

resource "cloudflare_record" "local" {
  domain  = "${var.domain}"
  name    = "local"
  value   = "127.0.0.1"
  type    = "A"
}

resource "cloudflare_record" "mx-a" {
  domain  = "${var.domain}"
  name    = "${var.domain}"
  value   = "mxa.mailgun.org"
  type    = "MX"
  priority = 10
}

resource "cloudflare_record" "mx-b" {
  domain  = "${var.domain}"
  name    = "${var.domain}"
  value   = "mxb.mailgun.org"
  type    = "MX"
  priority = 10
}

resource "cloudflare_record" "mailgun_dkim" {
  domain  = "${var.domain}"
  name    = "k1._domainkey"
  value   = "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxrk5KS8ZpO3aOGeyBwXeNfB58syAnbvQmCpdiEq/TpqzmhKfX3hffIHX6af8zA90m/bLCJw+rofVhgq+ihz9LvOyp9A8iUUyLOiwLINsy2Ip3qOtzqmOfz0aZoiDSuY5tRPQOF3NCFnJt9Pioj7lzIyVjjHsVaNchmeV3yJLD/QIDAQAB"
  type    = "TXT"
}

resource "cloudflare_record" "spf" {
  domain  = "${var.domain}"
  name    = "${var.domain}"
  value   = "v=spf1 include:mailgun.org ~all"
  type    = "TXT"
}

resource "digitalocean_droplet" "docker-machine" {
  image = ""
  name = "do-recipeyak"
  region = "nyc3"
  size = "s-1vcpu-1gb"
  resize_disk = false
}

resource "digitalocean_firewall" "docker" {
  name = "Docker"

  droplet_ids = ["${digitalocean_droplet.docker-machine.id}"]

  inbound_rule = [
    {
      port_range = "22"
      protocol = "tcp"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      port_range = "80"
      protocol = "tcp"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      port_range = "443"
      protocol = "tcp"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      port_range = "2376"
      protocol = "tcp"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
  ]

  outbound_rule = [
    {
      port_range = "all"
      protocol = "icmp"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      port_range = "all"
      protocol = "tcp"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      port_range = "all"
      protocol = "udp"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
  ]
}
