data "archive_file" "functions" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/functions"
  output_path = "${path.module}/../dist/functions.zip"
}

resource "random_id" "session_secret" {
  byte_length = 16
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