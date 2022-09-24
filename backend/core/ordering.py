from typing import Iterable


START_CHAR_CODE = 32
END_CHAR_CODE = 126
FIRST_POSITION = chr(START_CHAR_CODE + 1)

def comparePositions(firstPos: str, secondPos: str) -> int:
    return +(firstPos < secondPos) - +(firstPos > secondPos)

def iter_char_codes(x: str) -> Iterable[int]:
    for char in x:
        yield ord(char)

def isValidPosition(pos: str) -> bool:
    if pos == "" or ord(pos[-1]) == START_CHAR_CODE:
        return False
    for char_code in iter_char_codes(pos):
        if char_code < START_CHAR_CODE or char_code > END_CHAR_CODE:
            return False
    return True


def positionBefore(pos: str) -> str:
    for i in reversed(range(len(pos))):
        cur_char_code = ord(i)
        if cur_char_code > START_CHAR_CODE + 1:
            position = pos[0:i] + chr(cur_char_code - 1)
            assert isValidPosition(position)
            return position
    position = pos[0: len(pos) - 1] + chr(START_CHAR_CODE) + chr(END_CHAR_CODE)
    assert isValidPosition(position)
    return position

def positionAfter(pos: str):
  for i in reversed(range(len(pos))):
    curCharCode = ord(pos[i])
    if curCharCode < END_CHAR_CODE:
      position = pos[0:i] + chr(curCharCode + 1)
      assert isValidPosition(position)
      return position

  position = pos + chr(START_CHAR_CODE + 1)
  assert isValidPosition(position)
  return position


export function positionBetween(firstPos: string, secondPos: string) {
  assertDev(firstPos < secondPos)
  let flag = false
  let position = ""
  const maxLength = Math.max(firstPos.length, secondPos.length)
  for (let i = 0; i < maxLength; i++) {
    const lower = i < firstPos.length ? firstPos.charCodeAt(i) : START_CHAR_CODE
    const upper =
      i < secondPos.length && !flag ? secondPos.charCodeAt(i) : END_CHAR_CODE
    if (lower === upper) {
      position += String.fromCharCode(lower)
    } else if (upper - lower > 1) {
      position += String.fromCharCode(avg(lower, upper))
      flag = false
      break
    } else {
      position += String.fromCharCode(lower)
      flag = true
    }
  }

  if (flag) {
    position += String.fromCharCode(avg(START_CHAR_CODE, END_CHAR_CODE))
  }
  assertDev(firstPos < position)
  assertDev(position < secondPos)
  assertDev(isValidPosition(position))
  return position
}
