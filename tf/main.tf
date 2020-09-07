terraform {
  backend "consul" {
    address = "consul.gleich.tech"
    scheme  = "https"
    path    = "tf/gke/resume-monitor"
  }
}

provider "google" {
  credentials = "main.json"

  project = "main-285019"
  region  = "us-west3"
}


resource "google_monitoring_uptime_check_config" "https" {
    display_name     = "gleich.tech"
    period           = "60s"
    project          = "main-285019"
    selected_regions = []
    timeout          = "5s"

    http_check {
        headers        = {}
        mask_headers   = false
        path           = "/"
        port           = 443
        request_method = "GET"
        use_ssl        = true
        validate_ssl   = true
    }

    monitored_resource {
        labels = {
            "host"       = "will.gleich.tech"
            "project_id" = "main-285019"
        }
        type   = "uptime_url"
    }

    timeouts {}
}

