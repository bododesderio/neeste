import base64
import json
import os
import time
import uuid
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


MOMO_BASE_URL = os.getenv("MOMO_BASE_URL", "https://sandbox.momodeveloper.mtn.com")
MOMO_TARGET_ENV = os.getenv("MOMO_TARGET_ENV", "sandbox")
MOMO_COLLECTION_SUB_KEY = os.getenv("MOMO_COLLECTION_SUB_KEY", "")
MOMO_API_USER = os.getenv("MOMO_API_USER", "")
MOMO_API_KEY = os.getenv("MOMO_API_KEY", "")

# Used by your backend webhook endpoint (must be public if MoMo calls it)
MOMO_CALLBACK_URL = os.getenv("MOMO_CALLBACK_URL", "")

# Token cache
_token = {"value": None, "exp": 0}


def _http(method: str, url: str, headers=None, data: dict | None = None):
    headers = headers or {}
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = Request(url, data=body, method=method)
    for k, v in headers.items():
        req.add_header(k, v)

    try:
        with urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8") if resp.readable() else ""
            try:
                return resp.status, json.loads(raw) if raw else {}
            except json.JSONDecodeError:
                return resp.status, {"raw": raw}
    except HTTPError as e:
        raw = e.read().decode("utf-8") if hasattr(e, "read") else ""
        return e.code, {"error": True, "raw": raw}
    except URLError as e:
        return 0, {"error": True, "raw": str(e)}


def get_access_token() -> str:
    global _token
    now = int(time.time())
    if _token["value"] and _token["exp"] > now + 30:
        return _token["value"]

    if not (MOMO_API_USER and MOMO_API_KEY and MOMO_COLLECTION_SUB_KEY):
        raise RuntimeError("MoMo env vars missing: MOMO_API_USER/MOMO_API_KEY/MOMO_COLLECTION_SUB_KEY")

    url = f"{MOMO_BASE_URL}/collection/token/"
    basic = base64.b64encode(f"{MOMO_API_USER}:{MOMO_API_KEY}".encode("utf-8")).decode("utf-8")
    status, payload = _http(
        "POST",
        url,
        headers={
            "Authorization": f"Basic {basic}",
            "Ocp-Apim-Subscription-Key": MOMO_COLLECTION_SUB_KEY,
        },
        data=None,
    )
    if status not in (200, 201):
        raise RuntimeError(f"Failed to get MoMo token: {status} {payload}")

    token = payload.get("access_token")
    expires_in = int(payload.get("expires_in", 3600))
    _token = {"value": token, "exp": now + expires_in}
    return token


def request_to_pay(*, amount: str, currency: str, phone: str, external_id: str, payer_message: str, payee_note: str):
    """
    Initiates a MoMo sandbox request-to-pay.
    Returns (reference_id, http_status, response_payload)
    """
    reference_id = str(uuid.uuid4())
    token = get_access_token()

    url = f"{MOMO_BASE_URL}/collection/v1_0/requesttopay"
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Reference-Id": reference_id,
        "X-Target-Environment": MOMO_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MOMO_COLLECTION_SUB_KEY,
    }
    if MOMO_CALLBACK_URL:
        headers["X-Callback-Url"] = MOMO_CALLBACK_URL

    payload = {
        "amount": str(amount),
        "currency": currency,
        "externalId": external_id,
        "payer": {"partyIdType": "MSISDN", "partyId": phone},
        "payerMessage": payer_message[:160],
        "payeeNote": payee_note[:160],
    }

    status, resp = _http("POST", url, headers=headers, data=payload)
    return reference_id, status, resp


def get_request_status(reference_id: str):
    """
    Queries status for a request-to-pay.
    Returns (http_status, response_payload)
    """
    token = get_access_token()
    url = f"{MOMO_BASE_URL}/collection/v1_0/requesttopay/{reference_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Target-Environment": MOMO_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MOMO_COLLECTION_SUB_KEY,
    }
    status, resp = _http("GET", url, headers=headers, data=None)
    return status, resp
