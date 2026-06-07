"""
Blood Bridge AI — Lambda Deployment Package Creator
Run: python create_deploy.py
This creates a proper deploy.zip ready for AWS Lambda upload
"""

import os
import shutil
import subprocess
import zipfile
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
BACKEND_DIR = Path(__file__).parent
DEPLOY_DIR  = BACKEND_DIR / "deploy"
ZIP_NAME    = BACKEND_DIR / "deploy.zip"

def run(cmd):
    print(f"\n▶ {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout: print(result.stdout)
    if result.stderr: print(result.stderr)
    return result.returncode

def create_deploy():
    print("\n" + "=" * 60)
    print("  🩸 Blood Bridge AI — Lambda Deploy Package Creator")
    print("=" * 60)

    # Step 1: Clean old deploy folder
    if DEPLOY_DIR.exists():
        print("\n🗑️  Removing old deploy folder...")
        shutil.rmtree(DEPLOY_DIR)
    DEPLOY_DIR.mkdir()
    print("✅ Deploy folder created")

    # Step 2: Install dependencies into deploy folder
    print("\n📦 Installing dependencies...")
    code = run(
        f'pip install --target "{DEPLOY_DIR}" '
        f'fastapi mangum boto3 pydantic python-jose '
        f'passlib python-multipart uvicorn'
    )
    if code != 0:
        print("❌ pip install failed!")
        return
    print("✅ Dependencies installed")

    # Step 3: Copy main files
    print("\n📋 Copying source files...")
    files_to_copy = ["main.py", "lambda_handler.py"]
    for f in files_to_copy:
        src = BACKEND_DIR / f
        dst = DEPLOY_DIR / f
        if src.exists():
            shutil.copy2(src, dst)
            print(f"  ✅ Copied {f}")
        else:
            print(f"  ❌ Missing {f} — make sure it exists in backend/")

    # Step 4: Copy routes folder
    routes_src = BACKEND_DIR / "routes"
    routes_dst = DEPLOY_DIR / "routes"
    if routes_src.exists():
        shutil.copytree(routes_src, routes_dst)
        print(f"  ✅ Copied routes/")
    else:
        print("  ❌ Missing routes/ folder!")

    # Step 5: Copy services folder
    services_src = BACKEND_DIR / "services"
    services_dst = DEPLOY_DIR / "services"
    if services_src.exists():
        shutil.copytree(services_src, services_dst)
        print(f"  ✅ Copied services/")
    else:
        print("  ❌ Missing services/ folder!")

    # Step 6: Verify critical files exist
    print("\n🔍 Verifying deploy package...")
    critical = [
        "lambda_handler.py",
        "main.py",
        "routes/__init__.py",
        "routes/auth.py",
        "routes/donors.py",
        "routes/requests.py",
        "routes/ai.py",
        "routes/notifications.py",
        "services/__init__.py",
        "services/dynamodb.py",
        "services/bedrock.py",
        "fastapi",
        "mangum",
        "boto3",
    ]
    all_good = True
    for item in critical:
        path = DEPLOY_DIR / item
        if path.exists():
            print(f"  ✅ {item}")
        else:
            print(f"  ❌ MISSING: {item}")
            all_good = False

    if not all_good:
        print("\n❌ Some files are missing! Fix before zipping.")
        return

    # Step 7: Create zip
    print(f"\n📦 Creating {ZIP_NAME.name}...")
    if ZIP_NAME.exists():
        ZIP_NAME.unlink()

    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zf:
        for file_path in DEPLOY_DIR.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(DEPLOY_DIR)
                zf.write(file_path, arcname)

    size_mb = ZIP_NAME.stat().st_size / (1024 * 1024)
    print(f"✅ deploy.zip created — {size_mb:.1f} MB")

    print("\n" + "=" * 60)
    print("  ✅ DEPLOY PACKAGE READY!")
    print("=" * 60)
    print(f"\n📁 Location: {ZIP_NAME}")
    print("\n🚀 Next steps:")
    print("  1. Go to AWS Console → Lambda → blood-bridge-api")
    print("  2. Code tab → Upload from → .zip file")
    print(f"  3. Upload: {ZIP_NAME}")
    print("  4. Click Save")
    print("  5. Test: https://yaoejwpmpa.execute-api.us-east-1.amazonaws.com/")
    print()

if __name__ == "__main__":
    create_deploy()