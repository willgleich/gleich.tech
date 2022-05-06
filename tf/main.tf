terraform {
  backend "gcs" {
    bucket = "gleich-infra"
    prefix =  "tf/gke/resume"
  }
}

provider "google" {
  project = "main-285019"
  region  = "us-west3"
}

resource "google_storage_bucket" "static-site" {
  name          = "test-site.gleich.tech"
  location      = "US"
  force_destroy = true

  uniform_bucket_level_access = false

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
  #  cors {
  #    origin          = ["http://image-store.com"]
  #    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
  #    response_header = ["*"]
  #    max_age_seconds = 3600
  #  }
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

//resource "google_monitoring_alert_policy" "alert_policy" {
//  display_name = "gleich-tech-alert"
//  combiner     = "OR"
//  conditions {
//    display_name = "test condition"
//    condition_threshold {
//      filter     = "metric.type=\"compute.googleapis.com/instance/disk/write_bytes_count\" AND resource.type=\"gce_instance\""
//      duration   = "60s"
//      comparison = "COMPARISON_GT"
//      aggregations {
//        alignment_period   = "60s"
//        per_series_aligner = "ALIGN_RATE"
//      }
//    }
//  }
//
//  user_labels = {
//    foo = "bar"
//  }
//}

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

resource "google_cloud_run_service" "default" {
  name     = "gleich-tech"
  location = "us-central1"

  metadata {
    namespace = "main-285019"
  }

  template {
    spec {
      containers {
        image = "gcr.io/main-285019/resume:latest"
      }
    }
  }
}

resource "google_cloud_run_domain_mapping" "default" {
  location = "us-central1"
  name     = "will.iam.gleich.tech"

  metadata {
    namespace = "main-285019"
  }

  spec {
    route_name = google_cloud_run_service.default.name
  }
}