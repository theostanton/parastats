variable "site_tag" {
  type = string
}

variable "ffvl_key" {
  type = string
}

variable "mapbox_token" {
  type = string
}

variable "strava_webhook_secret" {
  type      = string
  sensitive = true
}

variable "strava_webhook_verify_token" {
  type      = string
  sensitive = true
}