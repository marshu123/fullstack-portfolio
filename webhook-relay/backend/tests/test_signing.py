from app.signing import compute_signature, parse_signature_header, sign, verify

BODY = b'{"amount":100,"currency":"inr"}'
SECRET = "whsec_test"


def test_signature_round_trip():
    header = sign(SECRET, BODY, timestamp=1_700_000_000)
    assert verify(SECRET, header, BODY, tolerance_seconds=300, now=1_700_000_010)


def test_rejects_tampered_body():
    header = sign(SECRET, BODY, timestamp=1_700_000_000)
    assert not verify(
        SECRET, header, BODY + b" ", tolerance_seconds=300, now=1_700_000_010
    )


def test_rejects_wrong_secret():
    header = sign(SECRET, BODY, timestamp=1_700_000_000)
    assert not verify(
        "whsec_other", header, BODY, tolerance_seconds=300, now=1_700_000_010
    )


def test_rejects_expired_timestamp():
    header = sign(SECRET, BODY, timestamp=1_700_000_000)
    assert not verify(SECRET, header, BODY, tolerance_seconds=300, now=1_700_001_000)


def test_rejects_missing_or_malformed_header():
    assert not verify(SECRET, None, BODY)
    assert not verify(SECRET, "", BODY)
    assert not verify(SECRET, "t=abc,v1=deadbeef", BODY)
    assert not verify(SECRET, "v1=deadbeef", BODY)
    assert not verify(SECRET, "just-a-string", BODY)


def test_parse_is_strict_about_version():
    assert parse_signature_header("t=1,v2=abc") is None
    assert parse_signature_header("t=1,v1=abc") == (1, "abc")


def test_compute_signature_is_stable():
    expected = compute_signature(SECRET, 10, b"{}")
    assert compute_signature(SECRET, 10, b"{}") == expected
    assert len(expected) == 64
