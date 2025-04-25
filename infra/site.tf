resource "google_storage_bucket" "site" {
  name                        = "parastats.info"
  location                    = "EU"
  force_destroy               = true
  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_storage_bucket_iam_member" "public_rule" {
  bucket = google_storage_bucket.site.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_storage_bucket_object" "indexpage" {
  name         = "index.html"
  source       = "../dist/site/index.html"
  content_type = "text/html"
  bucket       = google_storage_bucket.site.id
}



# Create backend bucket
resource "google_compute_backend_bucket" "site_backend" {
  name        = "site-backend"
  bucket_name = google_storage_bucket.site.name
  enable_cdn  = true
}

# Create HTTPS certificate
resource "google_compute_managed_ssl_certificate" "ssl_cert" {
  name = "parastats-cert"

  managed {
    domains = ["parastats.info"]
  }
}

# Global URL map
resource "google_compute_url_map" "static_map" {
  name            = "static-map"
  default_service = google_compute_backend_bucket.site_backend.id
}

# Target HTTPS proxy
resource "google_compute_target_https_proxy" "https_proxy" {
  name             = "static-https-proxy"
  ssl_certificates = [google_compute_managed_ssl_certificate.ssl_cert.id]
  url_map          = google_compute_url_map.static_map.id
}

# Global forwarding rule for HTTPS
resource "google_compute_global_forwarding_rule" "https_forwarding" {
  name        = "https-forwarding-rule"
  target      = google_compute_target_https_proxy.https_proxy.id
  port_range  = "443"
  ip_protocol = "TCP"

  load_balancing_scheme = "EXTERNAL"
  # address               = google_compute_global_address.site_ip.address
}

# Reserve a static global IP
resource "google_compute_global_address" "site_ip" {
  name = "static-site-ip"
}
