from pathlib import Path

import boto3
from botocore.client import Config

from app.core.config import settings
from app.providers.interfaces import ObjectStorageProvider


class LocalStorageProvider(ObjectStorageProvider):
    def __init__(self, base_path: str | None = None) -> None:
        self.base_path = Path(base_path or settings.local_storage_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def upload_bytes(self, *, key: str, content: bytes, content_type: str) -> None:
        file_path = self.base_path / key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        encrypted = self._encrypt_placeholder(content)
        file_path.write_bytes(encrypted)

    def download_bytes(self, *, key: str) -> bytes:
        file_path = self.base_path / key
        return self._decrypt_placeholder(file_path.read_bytes())

    @staticmethod
    def _encrypt_placeholder(content: bytes) -> bytes:
        return content

    @staticmethod
    def _decrypt_placeholder(content: bytes) -> bytes:
        return content


class VultrObjectStorageProvider(ObjectStorageProvider):
    def __init__(self) -> None:
        if not all(
            [
                settings.vultr_object_storage_endpoint,
                settings.vultr_bucket_name,
                settings.vultr_access_key,
                settings.vultr_secret_key,
            ]
        ):
            raise RuntimeError("Missing Vultr Object Storage settings")

        self.bucket_name = settings.vultr_bucket_name
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.vultr_object_storage_endpoint,
            region_name=settings.vultr_object_storage_region,
            aws_access_key_id=settings.vultr_access_key,
            aws_secret_access_key=settings.vultr_secret_key,
            config=Config(signature_version="s3v4"),
        )

    def upload_bytes(self, *, key: str, content: bytes, content_type: str) -> None:
        encrypted = self._encrypt_placeholder(content)
        self.client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=encrypted,
            ContentType=content_type,
            Metadata={"encryption": "placeholder"},
        )

    def download_bytes(self, *, key: str) -> bytes:
        response = self.client.get_object(Bucket=self.bucket_name, Key=key)
        encrypted = response["Body"].read()
        return self._decrypt_placeholder(encrypted)

    @staticmethod
    def _encrypt_placeholder(content: bytes) -> bytes:
        return content

    @staticmethod
    def _decrypt_placeholder(content: bytes) -> bytes:
        return content
