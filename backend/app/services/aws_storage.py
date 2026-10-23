import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.config import settings
from app.schemas import MemoryItem

logger = logging.getLogger(__name__)

class AWSStorageManager:
    def __init__(self):
        self.region = settings.AWS_REGION
        self.dynamo_table_name = settings.DYNAMODB_TABLE_MEMORIES
        self.s3_bucket_name = settings.S3_BUCKET_NAME
        self.aws_enabled = settings.AWS_ENABLED

    def get_status(self) -> Dict[str, Any]:
        """
        Returns honest AWS cloud persistence status.
        Never fakes active connection if credentials are unset.
        """
        if not self.aws_enabled:
            return {
                "active_storage": "SQLite (Local Primary Engine)",
                "cloud_persistence": "Not Configured",
                "dynamodb_connected": False,
                "s3_connected": False,
                "region": self.region,
                "message": (
                    "Local SQLite is active with complete persistence. "
                    "To enable optional cloud backup to Amazon DynamoDB and S3, "
                    "configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Settings or .env."
                )
            }
        
        # If enabled, test connection
        dynamo_ok = False
        s3_ok = False
        error_detail = None
        try:
            import boto3
            dynamodb = boto3.client(
                "dynamodb",
                region_name=self.region,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            dynamodb.describe_table(TableName=self.dynamo_table_name)
            dynamo_ok = True
        except Exception as e:
            error_detail = str(e)

        try:
            import boto3
            s3 = boto3.client(
                "s3",
                region_name=self.region,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            s3.head_bucket(Bucket=self.s3_bucket_name)
            s3_ok = True
        except Exception:
            pass

        return {
            "active_storage": "Hybrid (SQLite Local + AWS Cloud)",
            "cloud_persistence": "Configured",
            "dynamodb_connected": dynamo_ok,
            "s3_connected": s3_ok,
            "region": self.region,
            "table_name": self.dynamo_table_name,
            "s3_bucket": self.s3_bucket_name,
            "error_detail": error_detail,
            "message": "AWS credentials loaded." if dynamo_ok else f"AWS credentials configured but check returned: {error_detail}"
        }

    def sync_memory_to_dynamodb(self, memory: MemoryItem) -> Dict[str, Any]:
        """
        Syncs an approved memory item to Amazon DynamoDB.
        Safe against connection failures: logs and reports status without throwing unhandled exceptions.
        """
        if not self.aws_enabled:
            return {"synced": False, "reason": "AWS not configured. Stored in local SQLite only."}

        try:
            import boto3
            dynamodb = boto3.resource(
                "dynamodb",
                region_name=self.region,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            table = dynamodb.Table(self.dynamo_table_name)
            item = {
                "id": memory.id,
                "type": memory.type,
                "content": memory.content,
                "evidence": memory.evidence or "",
                "source_type": memory.source_type,
                "source_id": memory.source_id or "",
                "timestamp": memory.timestamp,
                "confidence": str(memory.confidence),
                "approval_status": memory.approval_status,
                "approved_at": memory.approved_at or "",
                "tags": memory.tags,
                "synced_at": datetime.now(timezone.utc).isoformat()
            }
            table.put_item(Item=item)
            return {"synced": True, "table": self.dynamo_table_name, "id": memory.id}
        except Exception as e:
            logger.warning(f"AWS DynamoDB sync skipped/failed: {e}")
            return {"synced": False, "reason": str(e)}

    def backup_archive_to_s3(self, export_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Uploads encrypted backup payload to Amazon S3.
        """
        if not self.aws_enabled:
            return {"uploaded": False, "reason": "AWS credentials not configured."}

        try:
            import boto3
            s3 = boto3.client(
                "s3",
                region_name=self.region,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            now_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            key = f"backups/everlife_backup_{now_str}.json"
            
            s3.put_object(
                Bucket=self.s3_bucket_name,
                Key=key,
                Body=json.dumps(export_data, indent=2).encode("utf-8"),
                ContentType="application/json",
                ServerSideEncryption="AES256"
            )
            return {"uploaded": True, "bucket": self.s3_bucket_name, "key": key}
        except Exception as e:
            return {"uploaded": False, "reason": str(e)}

aws_storage_manager = AWSStorageManager()
