resource "google_dns_managed_zone" "parastats" {
  name          = "parastats-info"
  dns_name      = "parastats.info."
  description   = "parastats.info"
  force_destroy = "true"
}

# resource "google_dns_record_set" "default" {
#   name         = google_dns_managed_zone.parastats.dns_name
#   managed_zone = google_dns_managed_zone.parastats.name
#   type         = "A"
#   ttl          = 300
#   rrdatas = [
#     google_storage_bucket.site.url
#   ]
# }


# resource "google_dns_record_set" "functions" {
#   name         = "functions.${google_dns_managed_zone.parastats.dns_name}"
#   managed_zone = google_dns_managed_zone.parastats.name
#   type         = "CNAME"
#   ttl          = 300
#   rrdatas = ["parastats-functions-g5cggejw3q-ue.a.run.app"]
# }