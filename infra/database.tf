resource "random_password" "database" {
  length  = 16
  special = true
}

resource "google_sql_database_instance" "instance" {
  name             = "instance"
  region           = local.region
  database_version = "POSTGRES_14"
  root_password    = random_password.database.result
  settings {
    availability_type = "ZONAL"
    ip_configuration {
      ipv4_enabled                                  = true
      authorized_networks {
        name  = "Chamonix"
        value = "83.204.51.218/32"
      }
    }
    tier = data.google_sql_tiers.tiers.tiers[0].tier
  }
  deletion_protection = false
}

resource "google_sql_database" "database" {
  name     = "database"
  instance = google_sql_database_instance.instance.name
}

resource "google_sql_user" "functions" {
  name     = "functions"
  instance = google_sql_database_instance.instance.name
  password = random_password.database.result
}

data "google_sql_tiers" "tiers" {
  project = local.project_id
}