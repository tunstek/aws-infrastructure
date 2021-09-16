from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED

import json, jwt
from jwt import PyJWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
import string, random

import redis
from InfluxAccessSeries import InfluxAccessSeries

from utils import valid_email


SECRET_KEY = "43d8ae6aa895b40e8a39ee54f2d119ee0c7eecbe583fabe3bf832ed67bce93eb"
ALGORITHM = "HS256"

credentials_exception = HTTPException(
    status_code=HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

pwd_context = CryptContext.from_path("config.ini")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
redis_client = redis.Redis(host='redis',
                                  port=6379,
                                  password='eed63a437bb9e3218990a18f01781e3c87d8ab1a1f628cb9cecef4845cafb5e8')


class TokenData(BaseModel):
    username: str = None


class UserInfo(BaseModel):
    username: str
    hashed_password: str
    api_token: str
    premium: str
    verified: bool
    #disabled: bool = None # ???


def generate_id(size=32, chars=string.ascii_lowercase + string.ascii_uppercase + string.digits):
    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))


def generate_API_token():
    while(True):
        api_token = generate_id()
        res = redis_client.execute_command('JSON.GET', api_token)
        if res is None:
            # the token is not currently in use
            print("[generate_API_token] Token: {} generated".format(api_token))
            return api_token


def verify_api_token(token, endpoint):
    res = redis_client.execute_command('JSON.GET', token)
    if res is not None:
        try:
            token_data = json.loads(res.decode("utf-8"))
        except TypeError:
            token_data = None
        if token_data["type"] == "api_token":
            #request_count = token_data["api_token_requests"]
            # Increment API count
            #token_data["api_token_requests"] = token_data["api_token_requests"] + 1
            #redis_client.execute_command('JSON.SET', token, '.', json.dumps(token_data))

            # TODO: Add timestamps to this data + move off of redis and onto disk
            InfluxAccessSeries(api_token=token, endpoint=endpoint)
            InfluxAccessSeries.commit() # DEBUG ONLY

        else:
            request_count = -1
        return {"status": 200,
                "message": "success",
                "token_type": token_data["type"] }
    else:
        raise credentials_exception


def create_user(username: str, password: str):
    # check if user already exists
    user = get_user(username)
    if not user:
        # user does not already exist

        # verify username is a valid email address
        if not valid_email(username):
            return {"status": 400, "message": "Username is not a valid email"}

        hashed_password = get_password_hash(password)
        api_token = generate_API_token()
        new_user = {"username": username,
                    "hashed_password": hashed_password,
                    "api_token": api_token,
                    "verified": False }
        api_token_entry = {"username": username,
                           "type": "api_token",
                           "api_token_requests": 0 }

        pipe = redis_client.pipeline()
        pipe.execute_command('JSON.SET', username, '.', json.dumps(new_user))
        pipe.execute_command('JSON.SET', api_token, '.', json.dumps(api_token_entry))
        res = pipe.execute()

        if all([x==b"OK" for x in res]):
            return {"status": 201, "message": "success"}
        else:
            # unknown error
            return {"status": 500, "message": "error: {}".format(res)}
    else:
        # username already exists
        return {"status": 409, "message": "Username already exists"}


def get_user(username: str):
    res = redis_client.execute_command('JSON.GET', username)
    if res:
        user = json.loads(redis_client.execute_command('JSON.GET', username))
        if user['username'] == username:
            return UserInfo(**user)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def change_user_password(new_password, current_user):
    # user should already be authorised by now

    # get the current user, as it is in the DB
    user = json.loads(redis_client.execute_command('JSON.GET', current_user.username))

    # update the password
    hashed_password = get_password_hash(new_password)
    user['hashed_password'] = hashed_password

    # update user in DB
    res = redis_client.execute_command('JSON.SET', user['username'], '.', json.dumps(user))
    if res == b"OK":
        return {"status": 200, "message": "User password was updated"}
    else:
        # unknown error
        return {"status": 500, "message": "error: {}".format(res)}


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except PyJWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user
