import math
from typing import Iterable

START_CHAR_CODE = 32
END_CHAR_CODE = 126
FIRST_POSITION = chr(START_CHAR_CODE + 1)


def assert_dev(expr):
    if not expr:
        raise Exception("Assertion Error")


def avg(a: float, b: float) -> int:
    return math.trunc((a + b) / 2)


def iter_char_codes(x: str) -> Iterable[int]:
    for char in x:
        yield ord(char)


def compare_positions(first_pos: str, second_pos: str) -> int:
    return (first_pos < second_pos) - ((first_pos > second_pos))


def is_valid_position(pos: str) -> bool:
    if pos == "" or ord(pos[-1]) == START_CHAR_CODE:
        return False
    for char_code in iter_char_codes(pos):
        if char_code < START_CHAR_CODE or char_code > END_CHAR_CODE:
            return False
    return True


def position_before(pos: str) -> str:
    assert_dev(0 != len(pos))
    i = len(pos) - 1
    for i in reversed(range(len(pos))):
        cur_char_code = ord(pos[i])
        if cur_char_code > START_CHAR_CODE + 1:
            position = pos[0:i] + chr(cur_char_code - 1)
            assert_dev(is_valid_position(position))
            return position
    position = pos[0 : len(pos) - 1] + chr(START_CHAR_CODE) + chr(END_CHAR_CODE)
    assert_dev(is_valid_position(position))
    return position


def position_after(pos: str) -> str:
    assert_dev(0 != len(pos))
    for i in reversed(range(len(pos))):
        cur_char_code = ord(pos[i])
        if cur_char_code < END_CHAR_CODE:
            position = pos[0:i] + chr(cur_char_code + 1)
            assert_dev(is_valid_position(position))
            return position
    position = pos + chr(START_CHAR_CODE + 1)
    assert_dev(is_valid_position(position))
    return position


def position_between(first_pos: str, second_pos: str) -> str:
    assert_dev(first_pos < second_pos)
    flag = False
    position = ""
    max_length = max(len(first_pos), len(second_pos))
    for i in range(max_length):
        lower = ord(first_pos[i]) if i < len(first_pos) else START_CHAR_CODE
        upper = (
            ord(second_pos[i]) if i < len(second_pos) and not flag else END_CHAR_CODE
        )
        if lower == upper:
            position += chr(lower)
        elif upper - lower > 1:
            position += chr(avg(lower, upper))
            flag = False
            break
        else:
            position += chr(lower)
            flag = True
    if flag:
        position += chr(avg(START_CHAR_CODE, END_CHAR_CODE))
    assert_dev(first_pos < position)
    assert_dev(position < second_pos)
    assert_dev(is_valid_position(position))
    return position
