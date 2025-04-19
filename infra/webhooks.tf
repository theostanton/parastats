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
    environment_variables = {
      DATABASE_USER     = google_sql_user.webhooks.name
      DATABASE_PASSWORD = google_sql_user.webhooks.password
    }
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

locals {
  webhhoks_env_file_variables = {
    DATABASE_HOST     = google_sql_database_instance.instance.public_ip_address
    DATABASE_NAME     = google_sql_database.database.name
    DATABASE_PORT     = 5432
    DATABASE_USER     = google_sql_user.webhooks.name
    DATABASE_PASSWORD = random_password.database.result
    DATABASE_CONNECTION_URL = "postgresql://${google_sql_user.webhooks.name}:${google_sql_user.webhooks.password}@${google_sql_database_instance.instance.public_ip_address}:5432/${google_sql_database.database.name}"
  }
}

resource "local_file" "webhook_envs" {
  content = join("\n", flatten([
    for key, value in local.webhhoks_env_file_variables :[
      "${key}=${value}"
    ]
  ]))
  filename = "${path.module}/../webhooks/.env"
}

output "webhooks_function_url" {
  value = google_cloudfunctions2_function.webhooks.service_config[0].uri
}