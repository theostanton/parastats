resource "google_cloudfunctions2_function" "webhooks" {
  name     = "parastats-webhooks"
  location = local.region

  timeouts {
    create = "10m"
    update = "10m"
  }
  build_config {
    runtime     = "nodejs20"
    entry_point = "webhooksHandler"
    source {
      storage_source {
        bucket = google_storage_bucket.functions.name
        object = google_storage_bucket_object.functions_zip.name
      }
    }
  }

  service_config {
    available_memory   = "128Mi"
    timeout_seconds    = 60
    ingress_settings   = "ALLOW_ALL"
    max_instance_count = 1
    environment_variables = merge(local.functions_variables, {
      DATABASE_HOST = "/cloudsql/${google_sql_database_instance.instance.connection_name}"
    })
  }
}

resource "google_cloud_run_v2_service_iam_binding" "webhooks" {
  name     = google_cloudfunctions2_function.webhooks.name
  location = local.region
  role     = "roles/run.invoker"
  members = ["allUsers"]
}

output "webhooks_function_url" {
  value = google_cloudfunctions2_function.webhooks.url
}