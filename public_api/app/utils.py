from fastapi import HTTPException
class RequestValidationError(HTTPException):
    def __init__(self, loc, msg, typ):
        super().__init__(422, [{'loc': loc, 'msg': msg, 'type': typ}])