"""
Blood Bridge AI — Create All DynamoDB Tables
Run: python create_tables.py
Requirements: pip install boto3
"""

import boto3
import time

# ── Config ────────────────────────────────────────────────────────────────────
AWS_REGION = "us-east-1"

dynamodb = boto3.client(
    "dynamodb",
    region_name=AWS_REGION,
)

# ── Table Definitions ─────────────────────────────────────────────────────────
TABLES = [
    {
        "TableName": "Users",
        "KeySchema": [
            {"AttributeName": "user_id", "KeyType": "HASH"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "user_id", "AttributeType": "S"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": "BloodRequests",
        "KeySchema": [
            {"AttributeName": "request_id", "KeyType": "HASH"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "request_id", "AttributeType": "S"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": "TransfusionCycles",
        "KeySchema": [
            {"AttributeName": "patient_id", "KeyType": "HASH"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "patient_id", "AttributeType": "S"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": "DonorMatches",
        "KeySchema": [
            {"AttributeName": "request_id", "KeyType": "HASH"},
            {"AttributeName": "donor_id",   "KeyType": "RANGE"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "request_id", "AttributeType": "S"},
            {"AttributeName": "donor_id",   "AttributeType": "S"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": "Notifications",
        "KeySchema": [
            {"AttributeName": "notification_id", "KeyType": "HASH"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "notification_id", "AttributeType": "S"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": "DonationHistory",
        "KeySchema": [
            {"AttributeName": "donation_id", "KeyType": "HASH"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "donation_id", "AttributeType": "S"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
    },
]

# ── Create Tables ─────────────────────────────────────────────────────────────
def create_tables():
    print("\n🩸 Blood Bridge AI — DynamoDB Table Setup")
    print("=" * 50)

    for table_def in TABLES:
        table_name = table_def["TableName"]
        try:
            # Check if already exists
            dynamodb.describe_table(TableName=table_name)
            print(f"  ⚠️  {table_name} already exists — skipping")
        except dynamodb.exceptions.ResourceNotFoundException:
            # Create it
            dynamodb.create_table(**table_def)
            print(f"  ✅ Creating {table_name}...")

    # Wait for all tables to become ACTIVE
    print("\n⏳ Waiting for all tables to become ACTIVE...")
    waiter = dynamodb.get_waiter("table_exists")
    for table_def in TABLES:
        table_name = table_def["TableName"]
        waiter.wait(
            TableName=table_name,
            WaiterConfig={"Delay": 2, "MaxAttempts": 30}
        )
        print(f"  ✅ {table_name} is ACTIVE")

    print("\n🎉 All 6 tables created successfully!")
    print("=" * 50)

    # Print summary
    print("\n📋 Table Summary:")
    for table_def in TABLES:
        table_name = table_def["TableName"]
        response = dynamodb.describe_table(TableName=table_name)
        status = response["Table"]["TableStatus"]
        item_count = response["Table"].get("ItemCount", 0)
        print(f"  • {table_name:<25} Status: {status:<10} Items: {item_count}")

    print("\n✅ Ready for data loading!\n")


if __name__ == "__main__":
    create_tables()