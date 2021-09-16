from fastapi import HTTPException
import requests, json


def validate_api_token(token):
    payload = ("token", token)
    res = requests.get('http://auth/verify-api-token', params=payload).json()
    if(res.status != 200):
        raise HTTPException(status_code=401,
                            detail="INVALID API_TOKEN")
    else:
        return res

