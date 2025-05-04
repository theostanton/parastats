data "archive_file" "functions" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/functions"
  output_path = "${path.module}/../dist/functions.zip"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "google_storage_bucket" "functions" {
  name          = "parastats-functions-${random_id.bucket_suffix.hex}"
  location      = "EU"
  force_destroy = true
}

resource "google_storage_bucket_object" "functions_zip" {
  name   = "tasks-function-${data.archive_file.functions.output_md5}.zip"
  bucket = google_storage_bucket.functions.name
  source = data.archive_file.functions.output_path
}

locals {
  functions_variables = {
    DATABASE_HOST             = google_sql_database_instance.instance.public_ip_address
    DATABASE_NAME             = google_sql_database.database.name
    DATABASE_PORT             = 5432
    DATABASE_USER             = google_sql_user.functions.name
    DATABASE_PASSWORD         = random_password.database.result
    CLIENT_ID                 = local.CLIENT_ID
    CLIENT_SECRET             = local.CLIENT_SECRET
    QUEUE_ID_FETCH_ACTIVITIES = google_cloud_tasks_queue.fetch_activities.id
    QUEUE_ID_WING_ACTIVITY    = google_cloud_tasks_queue.wing_activity.id
    TASKS_URL                 = "https://tasks.parastats.info"
  }
}


resource "local_file" "functions_envs" {
  content = join("\n", flatten([
    for key, value in local.functions_variables :[
      "${key}=${value}"
    ]
  ]))
  filename = "${path.module}/../functions/.env"
}