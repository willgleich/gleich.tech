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
    display_name     = "will.gleich.tech"
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

resource "google_pubsub_topic" "gleich-tech" {
  name = "gleich-tech"
}

resource "google_monitoring_notification_channel" "pubsub" {
  display_name = "PubSub"
  type         = "pubsub"
  labels = {
    topic       = google_pubsub_topic.gleich-tech.id
  }
}

resource "google_pubsub_topic_iam_member" "member" {
  project = google_pubsub_topic.gleich-tech.project
  topic = google_pubsub_topic.gleich-tech.name
  role = "roles/pubsub.publisher"
  member = "serviceAccount:service-248394897420@gcp-sa-monitoring-notification.iam.gserviceaccount.com"
}