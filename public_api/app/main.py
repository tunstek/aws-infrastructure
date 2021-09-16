from fastapi import FastAPI
from starlette.responses import Response, JSONResponse, FileResponse
from starlette.middleware.cors import CORSMiddleware
import pytest
from zipfile import ZipFile


app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


@app.get("/")
def read_root():
    return {"msg": "Hello World. This is the public facing API"}


@app.get("/test/xml")
def run_xml_tests():
    pytest_args = [
        'public_api_tests/',
        '--junitxml=public_api_tests/public_api_results.xml',
        '--cov-report=xml:public_api_tests/public_api_coverage.xml',
        '--cov=coverage'
    ]
    pytest.main(pytest_args)

    with ZipFile('public_api_tests/archive.zip', 'w') as archive:
        archive.write('public_api_tests/public_api_results.xml')
        archive.write('public_api_tests/public_api_coverage.xml')
    return FileResponse('public_api_tests/archive.zip', media_type="application/zip")


@app.get("/test")
def run_tests():
    pytest.main(['./public_api_tests', '--html', 'public_api_tests/report.html', '--self-contained-html'])
    with open('public_api_tests/report.html', 'r') as file:
        data = file.read()
    return Response(data)
