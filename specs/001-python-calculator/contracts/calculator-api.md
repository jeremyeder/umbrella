# Calculator API Contract

**Module**: `calculator.calculator`
**Version**: 1.0.0
**Type**: Python Module (Internal API)

## Overview

This contract defines the main calculator engine interface. The calculator orchestrates parsing, operation execution, and result handling. It acts as the business logic layer between the CLI and the lower-level modules.

---

## Class: Calculator

### `__init__() -> Calculator`

Creates a new calculator instance.

**Parameters**: None

**Returns**: Calculator instance

**Example**:
```python
calc = Calculator()
```

**Contract Guarantees**:
- Creates fresh instance with no state
- Ready to process calculations immediately
- Thread-safe (if stateless implementation chosen)

---

### `calculate(expression_str: str) -> CalculationResult`

Processes a mathematical expression and returns the result.

**Parameters**:
- `expression_str`: str - User input expression (e.g., "5 + 3")

**Returns**: CalculationResult - Object containing either result value or error message

**Raises**: None (errors are captured in CalculationResult)

**Examples**:

**Success case**:
```python
calc = Calculator()
result = calc.calculate("5 + 3")
# result.value = Decimal('8')
# result.error = None
# result.is_success = True
```

**Error case (division by zero)**:
```python
result = calc.calculate("5 / 0")
# result.value = None
# result.error = "Cannot divide by zero"
# result.is_success = False
```

**Error case (invalid input)**:
```python
result = calc.calculate("abc + 5")
# result.value = None
# result.error = "Invalid input: please enter valid numbers"
# result.is_success = False
```

**Contract Guarantees**:
- Never raises exceptions (catches all and wraps in CalculationResult)
- Always returns CalculationResult object
- Result is immutable
- Original expression preserved in result
- User-friendly error messages (no technical stack traces)

---

### `get_supported_operators() -> list[str]`

Returns list of supported operator symbols.

**Parameters**: None

**Returns**: list[str] - List of operator symbols ['+', '-', '*', '/']

**Example**:
```python
calc = Calculator()
operators = calc.get_supported_operators()
# Returns: ['+', '-', '*', '/']
```

**Use Case**: CLI can display available operators to user

---

## Type Signatures (Full Interface)

```python
from decimal import Decimal
from calculator.models import CalculationResult
from typing import Protocol

class CalculatorEngine(Protocol):
    """Protocol defining the calculator engine interface"""

    def calculate(self, expression_str: str) -> CalculationResult:
        """Process expression and return result"""
        ...

    def get_supported_operators(self) -> list[str]:
        """Get list of supported operators"""
        ...
```

---

## Error Handling Contract

### Error Mapping

The calculator catches lower-level exceptions and maps them to user-friendly messages:

| Internal Exception | User-Facing Error Message |
|-------------------|---------------------------|
| `InvalidInputError` | "Invalid input: please enter valid numbers" |
| `DivisionByZeroError` | "Cannot divide by zero" |
| `InvalidOperatorError` | "Unsupported operator: [operator]" |
| `DecimalException` | "Number too large or too small to calculate" |
| `Any other exception` | "An error occurred while calculating" |

### Error Handling Flow

```
User Input String
    ↓
Parser.parse_expression()  → InvalidInputError
    ↓                          ↓
Operations.execute()       → DivisionByZeroError
    ↓                          ↓
Calculator catches all    → Maps to CalculationResult with error
    ↓
Returns CalculationResult (never raises)
```

**Key Principle**: Calculator is the exception boundary. No exceptions escape to CLI layer.

---

## Calculation Flow

### Successful Calculation

```
1. Receive expression string: "5 + 3"
2. Call parser.parse_expression("5 + 3")
   → Returns: Expression(Decimal('5'), Operator.ADD, Decimal('3'))
3. Validate expression (e.g., division by zero check)
4. Dispatch to appropriate operation:
   operations.add(Decimal('5'), Decimal('3'))
   → Returns: Decimal('8')
5. Wrap in CalculationResult:
   CalculationResult(value=Decimal('8'), error=None, expression="5 + 3")
6. Return to caller
```

### Failed Calculation

```
1. Receive expression string: "5 / 0"
2. Call parser.parse_expression("5 / 0")
   → Returns: Expression(Decimal('5'), Operator.DIVIDE, Decimal('0'))
3. Validate expression → Detects division by zero
4. Catch DivisionByZeroError
5. Map to user message: "Cannot divide by zero"
6. Wrap in CalculationResult:
   CalculationResult(value=None, error="Cannot divide by zero", expression="5 / 0")
7. Return to caller
```

---

## Testing Contract

### Unit Tests Required

✓ **Successful operations**:
- All four operators with valid inputs
- Negative numbers
- Decimal numbers
- Zero handling (except as divisor)

✓ **Error scenarios**:
- Division by zero
- Invalid input formats
- Malformed expressions
- Empty input

✓ **Result validation**:
- Verify result.value for successes
- Verify result.error for failures
- Verify result.is_success flag
- Verify expression preservation

### Integration Tests Required

✓ **End-to-end flows**:
- Complete calculation from string input to result
- All acceptance criteria from spec (spec.md lines 18-40)
- Error recovery (calculator continues after errors)

### Test Coverage Target

- Minimum 90% code coverage
- All error paths must be tested
- All operator paths must be tested

---

## Performance Contract

**Complexity**: O(n) where n is input string length
**Latency**: < 10ms per calculation (including parsing and operation)
**Memory**: O(1) constant space (no state accumulation)

**Rationale**: Spec requirement SC-001 states "users can complete a basic calculation in under 10 seconds" - our target is well under that threshold.

---

## State Management Contract

### Stateless Operation

The calculator maintains **no state** between calculations:

```python
calc = Calculator()
result1 = calc.calculate("5 + 3")  # Returns 8
result2 = calc.calculate("10 - 2")  # Returns 8 (independent of result1)
```

**Implications**:
- Thread-safe by design
- No need for state reset
- No side effects between calculations
- Can be reused indefinitely

### Session State (Optional P3 Feature)

If history tracking is implemented (P3 priority):

```python
class Calculator:
    def __init__(self):
        self.history: list[CalculationResult] = []

    def calculate(self, expression_str: str) -> CalculationResult:
        result = ...  # perform calculation
        self.history.append(result)  # store in history
        return result

    def get_history(self) -> list[CalculationResult]:
        return self.history.copy()  # return copy to prevent mutation
```

**Note**: History feature is lower priority and may be deferred to later version.

---

## Dependency Contract

### Required Modules
```python
from calculator.parser import parse_expression
from calculator.operations import add, subtract, multiply, divide
from calculator.models import Expression, CalculationResult, Operator
from calculator.exceptions import InvalidInputError, DivisionByZeroError
```

### Dependency Graph

```
Calculator
    ↓ uses
Parser (parse_expression)
    ↓ uses
Models (Expression, Operator)

Calculator
    ↓ uses
Operations (add, subtract, multiply, divide)
    ↓ uses
Models (Decimal types)
```

**No circular dependencies**: Clean unidirectional flow

---

## Implementation Notes

### Design Pattern: Facade

The Calculator acts as a **Facade** pattern:
- Simplifies complex subsystem (parser + operations)
- Provides unified interface to CLI
- Handles error mapping and result wrapping

### Design Pattern: Exception Translation

The Calculator implements **Exception Translation**:
- Catches low-level exceptions
- Translates to user-friendly messages
- Wraps in domain objects (CalculationResult)

### Operator Dispatch

```python
def _execute_operation(self, expr: Expression) -> Decimal:
    """Internal method to dispatch operation"""
    operations = {
        Operator.ADD: add,
        Operator.SUBTRACT: subtract,
        Operator.MULTIPLY: multiply,
        Operator.DIVIDE: divide,
    }
    operation_func = operations[expr.operator]
    return operation_func(expr.left_operand, expr.right_operand)
```

**Alternative**: Could use if/elif chain, but dict dispatch is cleaner and extensible.

---

## Versioning & Compatibility

**Current Version**: 1.0.0

**Future Enhancements** (backward compatible):
- Adding history tracking
- Adding more operators
- Adding precision configuration
- Adding calculation explanation/steps

**Breaking Changes** (would require version bump):
- Changing CalculationResult structure
- Changing calculate() signature
- Removing operators
