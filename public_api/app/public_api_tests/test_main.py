import pytest
from starlette.testclient import TestClient

from ..main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200


def test_pass():
    assert 2 + 2 == 4
