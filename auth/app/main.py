from fastapi import FastAPI, Query, Form, Depends, HTTPException
from starlette.responses import Response, FileResponse
from starlette.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED
from fastapi.security import OAuth2PasswordRequestForm

import pytest
from zipfile import ZipFile
from datetime import timedelta

from auth_functions import verify_api_token, create_user, change_user_password, UserInfo, authenticate_user, create_access_token, get_current_user, SECRET_KEY, ALGORITHM

# THIS SERVICE VERIFYS USERS AND HANDLES USER REGISTRATION

app = FastAPI()
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class Token(BaseModel):
    access_token: str
    token_type: str
    status: str


class Message(BaseModel):
    status: int
    message: str

class VerifyAPITokenResponse(Message):
    token_type: str


@app.get("/user/info", response_model=UserInfo)
async def get_user(current_user: UserInfo = Depends(get_current_user)):
    return current_user


@app.post("/user/change_password")
def user_change_password(password: str = Form(
                                    ...,
                                    title="New User Password",
                                    description="",
                                    min_length=4),
                         current_user: UserInfo = Depends(get_current_user)):
    return change_user_password(password, current_user)


@app.get("/verify-api-token", response_model=VerifyAPITokenResponse)
def verify_api_key(api_token: str = Query(
                    ...,
                    title="API Token",
                    description="The public_api service checks this endpoint on every request to verify the given api token",
                    min_length=32),
                  endpoint: str = Query(
                    ...,
                    title="Endpoint",
                    description="The endpoint request to be recorded with the verification")
):
    return verify_api_token(api_token, endpoint)


@app.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                                 response: Response = Response()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    response.status_code = 200
    return {"access_token": access_token, "token_type": "bearer", "status": 200}


@app.post("/register", response_model=Message, status_code=201)
async def register_user(form_data: OAuth2PasswordRequestForm = Depends(),
                        response: Response = Response()):
    resp = create_user(form_data.username, form_data.password)
    response.status_code = resp['status']
    return resp


###################################################################
########################## MISC REQUESTS ##########################
###################################################################


@app.get("/test/xml")
def run_xml_tests():
    pytest_args = [
        'auth_tests/',
        '--junitxml=auth_tests/results/auth_results.xml',
        '--cov-report=xml:auth_tests/results/auth_coverage.xml',
        '--cov=coverage'
    ]
    pytest.main(pytest_args)
    # zip results
    with ZipFile('auth_tests/results/archive.zip', 'w') as archive:
        archive.write('auth_tests/results/auth_results.xml')
        archive.write('auth_tests/results/auth_coverage.xml')
    # return zipped results
    return FileResponse('auth_tests/results/archive.zip', media_type="application/zip")


@app.get("/test")
def run_tests():
    pytest.main(['auth_tests/', '--html', 'auth_tests/results/report.html', '--self-contained-html'])
    with open('auth_tests/results/report.html', 'r') as file:
        data = file.read()
    return Response(data)