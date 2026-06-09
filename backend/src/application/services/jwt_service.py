import base64
import hashlib
import hmac
import json
import time
from typing import Any, Dict


class JwtService:
    def __init__(self, secret: str, algorithm: str = 'HS256', expiration_seconds: int = 3600):
        self.secret = secret.encode('utf-8')
        self.algorithm = algorithm
        self.expiration_seconds = expiration_seconds

    def _base64url_encode(self, data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

    def _pad_b64(self, value: str) -> bytes:
        return value + '=' * ((4 - len(value) % 4) % 4)

    def _sign(self, message: bytes) -> str:
        if self.algorithm != 'HS256':
            raise ValueError('Solo se admite HS256.')
        signature = hmac.new(self.secret, message, hashlib.sha256).digest()
        return self._base64url_encode(signature)

    def generate_token(self, claims: Dict[str, Any]) -> str:
        header = {'alg': self.algorithm, 'typ': 'JWT'}
        payload = claims.copy()
        now = int(time.time())
        payload.setdefault('iat', now)
        payload.setdefault('exp', now + self.expiration_seconds)

        def encode_segment(segment: Dict[str, Any]) -> str:
            return self._base64url_encode(
                json.dumps(segment, separators=(',', ':'), sort_keys=True).encode('utf-8')
            )

        encoded_header = encode_segment(header)
        encoded_payload = encode_segment(payload)
        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        signature = self._sign(signing_input)
        return f"{encoded_header}.{encoded_payload}.{signature}"

    def decode_token(self, token: str) -> Dict[str, Any]:
        try:
            encoded_header, encoded_payload, signature = token.split('.')
        except ValueError:
            raise ValueError('Token inválido.')

        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_signature = self._sign(signing_input)
        if not hmac.compare_digest(expected_signature, signature):
            raise ValueError('Firma inválida.')

        payload_data = json.loads(base64.urlsafe_b64decode(self._pad_b64(encoded_payload)).decode('utf-8'))
        now = int(time.time())
        if payload_data.get('exp') and now > int(payload_data['exp']):
            raise ValueError('Token expirado.')

        return payload_data
