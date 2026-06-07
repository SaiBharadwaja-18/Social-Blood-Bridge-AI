"""
Blood Bridge AI — AWS Lambda Handler
Wraps FastAPI app with Mangum for Lambda deployment
"""

from mangum import Mangum
from main import app

handler = Mangum(app, lifespan="off")