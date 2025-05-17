resource "google_cloud_run_v2_service" "site" {
  name     = "site"
  location = local.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  connection {
    port = 80
  }

  template {
    containers {
      image = "europe-west1-docker.pkg.dev/para-stats/parastats/parastats-site:${var.site_tag}"
    }
  }
}

resource "google_cloud_run_domain_mapping" "site" {
  name     = "parastats.info"
  location = google_cloud_run_v2_service.site.location
  metadata {
    namespace = local.project_id
  }
  spec {
    route_name = google_cloud_run_v2_service.site.name
  }
}

resource "google_cloud_run_v2_service_iam_binding" "site" {
  name     = google_cloud_run_v2_service.site.name
  location = local.region
  role     = "roles/run.invoker"
  members = ["allUsers"]
}
