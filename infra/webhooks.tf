data "archive_file" "webhooks" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/webhooks"
  output_path = "${path.module}/../dist/webhooks.zip"
}


resource "google_storage_bucket" "webhooks" {
  name          = "parastats-webhooks-${random_id.bucket_suffix.hex}"
  location      = "US"
  force_destroy = true
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "google_storage_bucket_object" "webhooks_zip" {
  name   = "webhook-function-${data.archive_file.webhooks.output_md5}.zip"
  bucket = google_storage_bucket.webhooks.name
  source = data.archive_file.webhooks.output_path
}

resource "google_cloudfunctions2_function" "webhooks" {
  name     = "parastats-webhooks"
  location = local.region
  build_config {
    runtime     = "nodejs20"
    entry_point = "webhookHandler"
    source {
      storage_source {
        bucket = google_storage_bucket.webhooks.name
        object = google_storage_bucket_object.webhooks_zip.name
      }
    }
  }
  service_config {
    available_memory   = "128Mi"
    timeout_seconds    = 60
    ingress_settings   = "ALLOW_ALL"
    max_instance_count = 1
  }
}

resource "google_cloud_run_v2_service_iam_binding" "webhooks" {
  name     = google_cloudfunctions2_function.webhooks.name
  location = local.region
  role     = "roles/run.invoker"
  members = ["allUsers"]
}

output "webhooks_function_url" {
  value = google_cloudfunctions2_function.webhooks.service_config[0].uri
}