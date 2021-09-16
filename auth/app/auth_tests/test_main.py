from starlette.testclient import TestClient
import unittest
import redis
from influxdb import InfluxDBClient

from ..main import app

client = TestClient(app)

test_username = "test@test.test"
test_password = "test"


class Auth(unittest.TestCase):
    access_token = ""
    api_token = ""
    influx = None

    @classmethod
    def setUpClass(self):
        # Create influx client
        self.influx = InfluxDBClient(host='influxdb',
                                     port=8086,
                                     database='api_access',
                                     username='admin',
                                     password='jefSfPub487y2Kj3r874rbn87b3ewWGU')

        # Register test user
        data = {"username": test_username,
                "password": test_password}
        client.post("/register",
                    data=data,
                    headers={"content-type": "application/x-www-form-urlencoded"})

        # login to get test access_token
        data = {"username": test_username,
                "password": test_password}
        response = client.post("/login",
                               data=data,
                               headers={"content-type": "application/x-www-form-urlencoded"})
        self.access_token = response.json()['access_token']

        # retrieve API token
        response = client.get("/user/info",
                              headers={"Authorization": "Bearer {}".format(self.access_token)})
        self.api_token = response.json()['api_token']


    @classmethod
    def tearDownClass(self):
        # remove test user
        r = redis.Redis(
            host='redis',
            port=6379,
            password='eed63a437bb9e3218990a18f01781e3c87d8ab1a1f628cb9cecef4845cafb5e8')
        r.execute_command('JSON.DEL', test_username)
        # remove test user api requests
        self.influx.drop_measurement('requests.{}'.format(self.api_token))


    def test_auth_user_registration_duplicate_user(self):
        data = {"username": test_username,
                "password": test_password}
        response = client.post("/register",
                               data=data,
                               headers={"content-type": "application/x-www-form-urlencoded"})
        assert response.status_code == 409
        assert response.json()['message'] == "Username already exists"


    def test_auth_user_registration_invalid_email(self):
        data = {"username": "test",
                "password": test_password}
        response = client.post("/register",
                               data=data,
                               headers={"content-type": "application/x-www-form-urlencoded"})
        assert response.status_code == 400
        assert response.json()['message'] == "Username is not a valid email"


    def test_auth_user_login(self):
        data = {"username": test_username,
                "password": test_password}
        response = client.post("/login",
                               data=data,
                               headers={"content-type": "application/x-www-form-urlencoded"})
        assert response.status_code == 200
        keys = ['access_token', 'token_type', 'status']
        assert all([x in keys for x in response.json()])


    def test_auth_incorrect_username_user_login(self):
        data = {"username": "test@tesefsest.test",
                "password": test_password}
        response = client.post("/login",
                               data=data,
                               headers={"content-type": "application/x-www-form-urlencoded"})
        assert response.status_code == 401
        assert response.json()['detail'] == "Incorrect username or password"


    def test_auth_incorrect_password_user_login(self):
        data = {"username": test_username,
                "password": "sefbk"}
        response = client.post("/login",
                               data=data,
                               headers={"content-type": "application/x-www-form-urlencoded"})
        assert response.status_code == 401
        assert response.json()['detail'] == "Incorrect username or password"


    def test_auth_invalid_username_user_login(self):
        data = {"username": "notAnEmail",
                "password": test_password}
        response = client.post("/login",
                               data=data,
                               headers={"content-type": "application/x-www-form-urlencoded"})
        assert response.status_code == 401
        assert response.json()['detail'] == "Incorrect username or password"


    def test_auth_get_user_info(self):
        response = client.get("/user/info",
                              headers={"Authorization": "Bearer {}".format(self.access_token)})
        assert response.status_code == 200
        keys = ['username', 'hashed_password', 'api_token', 'premium', 'verified']
        assert all([x in keys for x in response.json()])


    def test_auth_get_user_info_invalid_token(self):
        response = client.get("/user/info",
                              headers={"Authorization": "Bearer thisIsAnInvalidToken"})
        assert response.status_code == 401


    def test_auth_change_password(self):
        data = {"password": "test2"}
        response = client.post("/user/change_password",
                                data=data,
                                headers={"Authorization": "Bearer {}".format(self.access_token)})
        assert response.status_code == 200
        # test user login with new password
        data = {"username": test_username,
                "password": "test2"}
        response = client.post("/login",
                               data=data,
                               headers={"content-type": "application/x-www-form-urlencoded"})
        assert response.status_code == 200
        # reset the password
        data = {"password": test_password}
        response = client.post("/user/change_password",
                               data=data,
                               headers={"Authorization": "Bearer {}".format(self.access_token)})
        assert response.status_code == 200


    def test_auth_verify_api_token(self):
        # get previous influx entries
        result = self.influx.query('select * from "requests.{}";'.format(self.api_token), database="api_requests")
        previous_len = len(list(result.get_points()))

        data = {"api_token": self.api_token,
                "endpoint": "/testEndpoint"}
        response = client.get("/verify-api-token",
                               params=data)
        assert response.status_code == 200

        # Ensure a new entry is added to influx
        result = self.influx.query('select * from "requests.{}";'.format(self.api_token), database="api_requests")
        assert previous_len == len(list(result.get_points())) - 1

        # ensure that the added entry has endpoint "/testEndpoint"
        assert list(result.get_points())[-1]['endpoint'] == "/testEndpoint"


    def test_auth_verify_invalid_api_token(self):
        data = {"api_token": "fVGtMs9uuZPSlpB26eLUPfWOuoWTnw9b",
                "endpoint": "/testInvalidToken"}
        response = client.get("/verify-api-token",
                              params=data)
        assert response.status_code == 401


    def test_auth_verify_invalid_short_api_token(self):
        data = {"api_token": "invalidToken",
                "endpoint": "/testInvalidShortToken"}
        response = client.get("/verify-api-token",
                              params=data)
        assert response.status_code == 422





