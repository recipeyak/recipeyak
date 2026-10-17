//! S3 presigned URLs, matching `recipeyak.storage.s3`.
//!
//! boto3 isn't configured with a region, so it signs for us-east-1, which is
//! where the bucket lives.

use std::time::Duration;

use aws_credential_types::Credentials;
use aws_sdk_s3::config::Region;
use aws_sdk_s3::presigning::PresigningConfig;

/// boto3's default `ExpiresIn`.
const EXPIRES_IN: Duration = Duration::from_secs(3600);

#[derive(Clone, Debug)]
pub struct S3 {
    pub bucket: String,
    client: aws_sdk_s3::Client,
}

impl S3 {
    pub fn new(bucket: String, access_key_id: &str, secret_access_key: &str) -> Self {
        let config = aws_sdk_s3::Config::builder()
            .behavior_version_latest()
            .region(Region::new("us-east-1"))
            .credentials_provider(Credentials::new(
                access_key_id,
                secret_access_key,
                None,
                None,
                "recipeyak",
            ))
            .build();
        Self {
            bucket,
            client: aws_sdk_s3::Client::from_conf(config),
        }
    }

    /// A URL the browser can `PUT` the file to. It has to send the same
    /// `Content-Length`, `Content-Type`, and `x-amz-meta-*` headers.
    pub async fn presign_put_object(
        &self,
        key: &str,
        content_length: i64,
        content_type: &str,
        db_id: &str,
    ) -> Result<String, String> {
        let presigning = PresigningConfig::expires_in(EXPIRES_IN).map_err(|err| err.to_string())?;
        let request = self
            .client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .content_length(content_length)
            .content_type(content_type)
            .metadata("db_id", db_id)
            .presigned(presigning)
            .await
            .map_err(|err| err.to_string())?;
        Ok(request.uri().to_string())
    }
}
