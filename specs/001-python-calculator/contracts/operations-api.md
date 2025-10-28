# Operations API Contract

**Module**: `calculator.operations`
**Version**: 1.0.0
**Type**: Python Module (Internal API)

## Overview

This contract defines the arithmetic operations interface. All functions are pure (no side effects) and operate on Decimal types for precision.

---

## Functions

### `add(a: Decimal, b: Decimal) -> Decimal`

Adds two numbers.

**Parameters**:
- `a`: Decimal - First operand
- `b`: Decimal - Second operand

**Returns**: Decimal - Sum of a and b

**Raises**: None

**Examples**:
```python
add(Decimal('5'), Decimal('3'))  # Returns Decimal('8')
add(Decimal('-5'), Decimal('3'))  # Returns Decimal('-2')
add(Decimal('0.1'), Decimal('0.2'))  # Returns Decimal('0.3')
```

**Contract Guarantees**:
- Result is mathematically accurate
- Commutative: `add(a, b) == add(b, a)`
- Handles negative numbers and decimals

---

### `subtract(a: Decimal, b: Decimal) -> Decimal`

Subtracts b from a.

**Parameters**:
- `a`: Decimal - Minuend (number to subtract from)
- `b`: Decimal - Subtrahend (number to subtract)

**Returns**: Decimal - Difference (a - b)

**Raises**: None

**Examples**:
```python
subtract(Decimal('10'), Decimal('4'))  # Returns Decimal('6')
subtract(Decimal('5'), Decimal('10'))  # Returns Decimal('-5')
subtract(Decimal('0.3'), Decimal('0.1'))  # Returns Decimal('0.2')
```

**Contract Guarantees**:
- Result is mathematically accurate
- Not commutative: `subtract(a, b) != subtract(b, a)` (generally)
- Handles negative results

---

### `multiply(a: Decimal, b: Decimal) -> Decimal`

Multiplies two numbers.

**Parameters**:
- `a`: Decimal - First factor
- `b`: Decimal - Second factor

**Returns**: Decimal - Product of a and b

**Raises**: None

**Examples**:
```python
multiply(Decimal('7'), Decimal('6'))  # Returns Decimal('42')
multiply(Decimal('-5'), Decimal('3'))  # Returns Decimal('-15')
multiply(Decimal('2.5'), Decimal('4'))  # Returns Decimal('10.0')
```

**Contract Guarantees**:
- Result is mathematically accurate
- Commutative: `multiply(a, b) == multiply(b, a)`
- Zero product rule: `multiply(a, Decimal('0')) == Decimal('0')`

---

### `divide(a: Decimal, b: Decimal) -> Decimal`

Divides a by b.

**Parameters**:
- `a`: Decimal - Dividend (number to be divided)
- `b`: Decimal - Divisor (number to divide by)

**Returns**: Decimal - Quotient (a / b)

**Raises**:
- `DivisionByZeroError` - If b is zero

**Examples**:
```python
divide(Decimal('15'), Decimal('3'))  # Returns Decimal('5')
divide(Decimal('10'), Decimal('4'))  # Returns Decimal('2.5')
divide(Decimal('1'), Decimal('3'))  # Returns Decimal('0.3333333333') (10 decimal places)
divide(Decimal('5'), Decimal('0'))  # Raises DivisionByZeroError
```

**Contract Guarantees**:
- Result is mathematically accurate to configured precision (default 10 decimal places)
- Not commutative: `divide(a, b) != divide(b, a)` (generally)
- **Always validates b != 0 before division**
- Error handling is caller's responsibility

---

## Type Signatures (Full Interface)

```python
from decimal import Decimal
from typing import Protocol

class ArithmeticOperations(Protocol):
    """Protocol defining the arithmetic operations interface"""

    def add(self, a: Decimal, b: Decimal) -> Decimal:
        """Add two numbers"""
        ...

    def subtract(self, a: Decimal, b: Decimal) -> Decimal:
        """Subtract b from a"""
        ...

    def multiply(self, a: Decimal, b: Decimal) -> Decimal:
        """Multiply two numbers"""
        ...

    def divide(self, a: Decimal, b: Decimal) -> Decimal:
        """Divide a by b (raises DivisionByZeroError if b=0)"""
        ...
```

---

## Error Handling Contract

### DivisionByZeroError

Custom exception raised by `divide()` when divisor is zero.

**Definition**:
```python
class DivisionByZeroError(Exception):
    """Raised when attempting to divide by zero"""
    pass
```

**When raised**:
- `divide(a, Decimal('0'))` for any value of `a`

**Expected handling**:
- Caller must catch and display user-friendly error message
- Calculator should remain operational after error

---

## Testing Contract

All operations must pass the following test scenarios:

### Unit Tests
- ✓ Positive integer operands
- ✓ Negative integer operands
- ✓ Decimal operands
- ✓ Zero as operand (except divisor)
- ✓ Large numbers (within Decimal limits)
- ✓ Commutative property (where applicable)
- ✓ Identity elements (e.g., `add(a, 0) == a`)

### Edge Cases
- ✓ Division by zero detection
- ✓ Floating-point precision (using Decimal)
- ✓ Negative number handling
- ✓ Mixed positive/negative operations

---

## Performance Contract

**Complexity**: O(1) for all operations
**Latency**: < 1ms per operation (on modern hardware)
**Memory**: Proportional to precision (negligible for default 10 decimal places)

---

## Versioning & Compatibility

**Current Version**: 1.0.0

**Breaking Changes**: Would include:
- Changing function signatures
- Changing exception types
- Modifying return value semantics

**Non-Breaking Changes**: Could include:
- Adding new operations
- Performance improvements
- Bug fixes in edge cases

---

## Implementation Notes

- All functions are **pure** (no side effects, no state)
- Operations use `decimal.Decimal` for precision
- No rounding unless explicitly requested
- Thread-safe (stateless functions)
- Can be tested in isolation without dependencies
