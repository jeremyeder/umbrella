# Data Model: Python Calculator Application

**Feature**: 001-python-calculator
**Date**: 2025-10-28
**Status**: Complete

## Overview

This document defines the core data structures and entities used in the calculator application. The calculator is a stateless, session-based application with minimal data persistence requirements.

## Entities

### 1. Expression

Represents a parsed mathematical expression ready for evaluation.

**Attributes**:
- `left_operand`: Decimal - The first number in the operation
- `operator`: str - The arithmetic operator ('+', '-', '*', '/')
- `right_operand`: Decimal - The second number in the operation

**Validation Rules**:
- `left_operand` and `right_operand` must be valid Decimal numbers
- `operator` must be one of: '+', '-', '*', '/'
- `right_operand` cannot be zero when operator is '/'

**Example**:
```python
Expression(
    left_operand=Decimal('5'),
    operator='+',
    right_operand=Decimal('3')
)
```

**State Transitions**: Immutable (no state changes after creation)

**Relationships**: None (standalone value object)

---

### 2. CalculationResult

Represents the outcome of a calculation attempt.

**Attributes**:
- `value`: Decimal | None - The calculated result (None if error occurred)
- `error`: str | None - Error message if calculation failed (None if successful)
- `expression`: str - Original user input for reference

**Validation Rules**:
- Either `value` or `error` must be set, but not both
- `expression` must not be empty

**Example (Success)**:
```python
CalculationResult(
    value=Decimal('8'),
    error=None,
    expression='5 + 3'
)
```

**Example (Error)**:
```python
CalculationResult(
    value=None,
    error='Cannot divide by zero',
    expression='5 / 0'
)
```

**State Transitions**: Immutable (no state changes after creation)

**Relationships**: Contains reference to original expression string

---

### 3. CalculatorSession

Represents the runtime state of an active calculator session.

**Attributes**:
- `history`: list[CalculationResult] - List of all calculations performed (optional feature for P3)
- `is_running`: bool - Whether the session is active

**Validation Rules**:
- `is_running` starts as True
- `history` can be empty list

**State Transitions**:
```
[Created] → is_running=True, history=[]
    ↓
[Running] → process calculations, append to history
    ↓
[Exiting] → is_running=False
```

**Relationships**: Contains multiple CalculationResult objects in history

**Note**: History feature is P3 priority and may be implemented later. Initial version may omit persistent history.

---

## Value Objects

### Operation

Represents a supported arithmetic operation (not a class, but an enum or constant).

**Values**:
- `ADD`: '+'
- `SUBTRACT`: '-'
- `MULTIPLY`: '*'
- `DIVIDE`: '/'

**Properties**:
- Symbol representation
- Human-readable name
- Precedence level (all equal for this calculator)

---

## Type Definitions (Python)

```python
from decimal import Decimal
from dataclasses import dataclass
from typing import Optional
from enum import Enum

class Operator(str, Enum):
    """Supported arithmetic operators"""
    ADD = '+'
    SUBTRACT = '-'
    MULTIPLY = '*'
    DIVIDE = '/'

@dataclass(frozen=True)
class Expression:
    """Parsed mathematical expression"""
    left_operand: Decimal
    operator: Operator
    right_operand: Decimal

    def validate(self) -> None:
        """Validate expression constraints"""
        if self.operator == Operator.DIVIDE and self.right_operand == 0:
            raise ValueError("Cannot divide by zero")

@dataclass(frozen=True)
class CalculationResult:
    """Result of a calculation attempt"""
    expression: str
    value: Optional[Decimal] = None
    error: Optional[str] = None

    def __post_init__(self):
        """Ensure exactly one of value or error is set"""
        if (self.value is None) == (self.error is None):
            raise ValueError("Exactly one of value or error must be set")

    @property
    def is_success(self) -> bool:
        return self.value is not None

@dataclass
class CalculatorSession:
    """Runtime session state"""
    is_running: bool = True
    history: list[CalculationResult] = None

    def __post_init__(self):
        if self.history is None:
            self.history = []
```

---

## Data Flow

```
User Input (string)
    ↓
Parser extracts → Expression (left, operator, right)
    ↓
Validator checks → Expression.validate()
    ↓
Calculator evaluates → Decimal result
    ↓
Result wrapped → CalculationResult (value or error)
    ↓
Session stores → CalculatorSession.history (optional)
    ↓
CLI displays → formatted string to user
```

---

## Constraints & Invariants

### Global Constraints
1. All numeric values use `Decimal` type for precision
2. All data classes are immutable (frozen) except `CalculatorSession`
3. No data persists beyond session lifetime (in-memory only)

### Operator Constraints
- Division by zero is **always** invalid
- All operators require exactly two operands
- Operator must be one of the four supported types

### Numeric Constraints
- Numbers can be negative, positive, or zero
- Decimals supported with arbitrary precision (configurable, default 10 places)
- Numbers must fit within Python Decimal limits

### Input Constraints (from spec)
- Expression format: `<number> <operator> <number>`
- Whitespace is optional and flexible
- Invalid format triggers `InvalidInputError`

---

## Error States

| Error Type | Trigger | Entity |
|------------|---------|--------|
| `InvalidInputError` | Malformed input string | Expression |
| `DivisionByZeroError` | right_operand=0 with '/' | Expression |
| `InvalidOperatorError` | operator not in {+,-,*,/} | Expression |
| `NumericOverflowError` | Result exceeds Decimal limits | CalculationResult |

---

## Future Extensions (Out of Scope)

The following are **not** in the current data model but could be added later:

- **Multi-operand expressions**: Would require Expression tree structure
- **Parentheses**: Would need precedence and grouping in Expression
- **Variables**: Would require variable storage in Session
- **Functions**: Would need Function entity and lookup table
- **History persistence**: Would need serialization format
- **Undo/Redo**: Would need command pattern and stack structure

---

## Validation Summary

All entities include validation at construction time:

✓ **Expression**: Validates operator and division by zero
✓ **CalculationResult**: Validates value XOR error constraint
✓ **CalculatorSession**: Validates history initialization
✓ **Operator**: Enum ensures only valid operators exist

Validation follows "fail fast" principle - errors raised immediately at creation, not during use.
