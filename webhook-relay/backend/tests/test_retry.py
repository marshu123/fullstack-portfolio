import pytest

from app.delivery import retry_delay_seconds


def test_exponential_backoff_sequence():
    delays = [
        retry_delay_seconds(
            attempt, base=2, max_delay=100, jitter=0
        )
        for attempt in range(1, 6)
    ]
    assert delays == [2, 4, 8, 16, 32]


def test_delay_is_capped():
    assert retry_delay_seconds(20, base=2, max_delay=30, jitter=0) == 30


def test_jitter_stays_within_bounds():
    for roll in (0.0, 0.5, 1.0):
        delay = retry_delay_seconds(
            3, base=10, max_delay=100, jitter=0.2, rand=roll
        )
        assert 32 <= delay <= 48


@pytest.mark.parametrize("attempt", [0, -1])
def test_bad_attempt_numbers_do_not_produce_negative_delays(attempt):
    assert retry_delay_seconds(attempt, base=5, max_delay=10, jitter=0) >= 5
