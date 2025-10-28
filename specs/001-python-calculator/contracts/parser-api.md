# Parser API Contract

**Module**: `calculator.parser`
**Version**: 1.0.0
**Type**: Python Module (Internal API)

## Overview

This contract defines the input parsing interface. The parser validates and extracts components from user input strings, converting them into structured Expression objects.

---

## Functions

### `parse_expression(input_str: str) -> Expression`

Parses a user input string into a structured Expression object.

**Parameters**:
- `input_str`: str - User input in format `"<number> <operator> <number>"`

**Returns**: Expression - Parsed expression with left_operand, operator, right_operand

**Raises**:
- `InvalidInputError` - If input format is invalid or malformed

**Examples**:
```python
parse_expression("5 + 3")
# Returns: Expression(left_operand=Decimal('5'), operator=Operator.ADD, right_operand=Decimal('3'))

parse_expression("10.5 * -2")
# Returns: Expression(left_operand=Decimal('10.5'), operator=Operator.MULTIPLY, right_operand=Decimal('-2'))

parse_expression("  15  /  3  ")
# Returns: Expression(left_operand=Decimal('15'), operator=Operator.DIVIDE, right_operand=Decimal('3'))

parse_expression("abc + 5")
# Raises: InvalidInputError("Invalid number format: 'abc'")

parse_expression("5 +")
# Raises: InvalidInputError("Incomplete expression: missing right operand")
```

**Contract Guarantees**:
- Handles flexible whitespace (leading, trailing, between components)
- Supports negative numbers (e.g., "-5", "5 + -3")
- Supports decimal numbers (e.g., "0.5", "3.14159")
- Validates operator is one of: +, -, *, /
- Validates numeric format for both operands
- Returns immutable Expression object

---

### `validate_input(input_str: str) -> bool`

Validates whether an input string matches the expected expression format without parsing.

**Parameters**:
- `input_str`: str - User input to validate

**Returns**: bool - True if valid format, False otherwise

**Raises**: None (returns False instead of raising exceptions)

**Examples**:
```python
validate_input("5 + 3")  # Returns True
validate_input("10 / 4")  # Returns True
validate_input("abc + 5")  # Returns False
validate_input("")  # Returns False
validate_input("5 +")  # Returns False
```

**Use Case**: Pre-flight validation before parsing (optional, for optimization)

---

## Type Signatures (Full Interface)

```python
from decimal import Decimal
from typing import Protocol
from calculator.models import Expression, Operator

class Parser(Protocol):
    """Protocol defining the parser interface"""

    def parse_expression(self, input_str: str) -> Expression:
        """Parse user input into Expression object"""
        ...

    def validate_input(self, input_str: str) -> bool:
        """Check if input matches expected format"""
        ...
```

---

## Error Handling Contract

### InvalidInputError

Custom exception raised when input cannot be parsed.

**Definition**:
```python
class InvalidInputError(Exception):
    """Raised when user input is invalid or malformed"""

    def __init__(self, message: str, input_str: str = None):
        self.message = message
        self.input_str = input_str
        super().__init__(self.message)
```

**Error Cases & Messages**:

| Input | Error Message |
|-------|---------------|
| `""` (empty) | "Input cannot be empty" |
| `"5 +"` | "Incomplete expression: missing right operand" |
| `"+ 3"` | "Incomplete expression: missing left operand" |
| `"abc + 5"` | "Invalid number format: 'abc'" |
| `"5 % 3"` | "Unsupported operator: '%'" |
| `"5 + 3 + 2"` | "Too many operands: expected format '<number> <operator> <number>'" |
| `"   "` (whitespace only) | "Input cannot be empty" |

**Expected Handling**:
- Caller (Calculator or CLI) catches and displays user-friendly message
- Original input should be logged for debugging
- Calculator continues running after error

---

## Input Format Specification

### Valid Expression Format

```
<expression> := <number> <whitespace>* <operator> <whitespace>* <number>
<number>     := [-]<digits>[.<digits>]
<digits>     := [0-9]+
<operator>   := + | - | * | /
<whitespace> := \s+ (optional, flexible)
```

### Regular Expression Pattern

```python
EXPRESSION_PATTERN = re.compile(
    r'^\s*'                    # Optional leading whitespace
    r'(-?\d+\.?\d*)'          # Left operand (optional negative, optional decimal)
    r'\s*'                     # Optional whitespace
    r'([+\-*/])'               # Operator
    r'\s*'                     # Optional whitespace
    r'(-?\d+\.?\d*)'          # Right operand
    r'\s*$'                    # Optional trailing whitespace
)
```

### Examples by Feature

**Negative numbers**:
- `"-5 + 3"` → Valid
- `"5 + -3"` → Valid
- `"-5 - -3"` → Valid

**Decimals**:
- `"0.5 * 2"` → Valid
- `"3.14159 + 2.71828"` → Valid
- `".5 + 3"` → Invalid (leading decimal point not supported)
- `"5. + 3"` → Valid (trailing decimal point allowed)

**Whitespace**:
- `"5+3"` → Valid (no spaces)
- `"5 + 3"` → Valid (standard spacing)
- `"  5  +  3  "` → Valid (flexible spacing)

**Invalid formats**:
- `"5 + 3 + 2"` → Invalid (too many operands)
- `"(5 + 3)"` → Invalid (parentheses not supported)
- `"5 ** 3"` → Invalid (power operator not supported)

---

## Testing Contract

### Unit Tests Required

✓ **Valid expressions**:
- Integer operands
- Decimal operands
- Negative operands
- All four operators
- Various whitespace patterns

✓ **Invalid expressions**:
- Empty input
- Malformed numbers
- Unsupported operators
- Missing operands
- Extra operands

✓ **Edge cases**:
- Leading/trailing whitespace
- Zero as operand
- Very large numbers
- Scientific notation (should be rejected)

### Test Coverage Target

- Minimum 95% code coverage
- All error paths must be tested
- All valid input patterns must be tested

---

## Performance Contract

**Complexity**: O(n) where n is input length (single regex match)
**Latency**: < 1ms per parse operation
**Memory**: O(n) for input string processing

---

## Dependency Contract

### Required Imports
```python
import re
from decimal import Decimal, InvalidOperation
from calculator.models import Expression, Operator
from calculator.exceptions import InvalidInputError
```

### No External Dependencies
- Uses only Python standard library
- No third-party parsing libraries required

---

## Implementation Notes

### Parsing Strategy
1. Strip leading/trailing whitespace
2. Apply regex pattern match
3. Extract three groups: left operand, operator, right operand
4. Convert operand strings to Decimal (catch InvalidOperation)
5. Map operator string to Operator enum
6. Construct and return Expression object

### Error Handling Strategy
- Fail fast: Raise exception as soon as invalid input detected
- Descriptive errors: Include what was invalid and why
- Preserve original input: Store in exception for debugging

### Validation Strategy
- Single regex pattern for all validation
- No multi-pass parsing required
- Atomic operation: either full parse or exception
