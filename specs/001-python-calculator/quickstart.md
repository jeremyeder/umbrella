# Quickstart Guide: Python Calculator

**Feature**: 001-python-calculator
**Target Audience**: Developers implementing the calculator
**Estimated Time**: 2-4 hours of development

## Overview

This guide walks you through implementing the Python Calculator application from scratch, following the implementation plan and contracts defined in this specification.

---

## Prerequisites

**Required**:
- Python 3.11 or higher
- pip (Python package manager)
- Basic understanding of Python classes and functions
- Git (for version control)

**Recommended**:
- pytest knowledge (for testing)
- Virtual environment familiarity
- IDE with Python support (VS Code, PyCharm, etc.)

---

## Project Setup

### 1. Create Project Structure

```bash
# From repository root
mkdir -p calculator tests

# Create Python package files
touch calculator/__init__.py
touch calculator/operations.py
touch calculator/parser.py
touch calculator/calculator.py
touch calculator/cli.py
touch calculator/models.py
touch calculator/exceptions.py

# Create test files
touch tests/__init__.py
touch tests/test_operations.py
touch tests/test_parser.py
touch tests/test_calculator.py
touch tests/test_integration.py

# Create configuration files
touch requirements.txt
touch setup.py
touch README.md
```

### 2. Set Up Virtual Environment

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Verify Python version
python --version  # Should show Python 3.11+
```

### 3. Install Dependencies

**requirements.txt**:
```
pytest>=7.4.0
pytest-cov>=4.1.0
```

```bash
pip install -r requirements.txt
```

---

## Implementation Order

Follow this order for a smooth development experience:

### Phase 1: Core Data Models (30 minutes)

**File**: `calculator/models.py`

Implement:
1. `Operator` enum (ADD, SUBTRACT, MULTIPLY, DIVIDE)
2. `Expression` dataclass (left_operand, operator, right_operand)
3. `CalculationResult` dataclass (value, error, expression)

**Reference**: See [data-model.md](./data-model.md)

**Testing**: Create basic tests in `tests/test_models.py`

---

### Phase 2: Custom Exceptions (15 minutes)

**File**: `calculator/exceptions.py`

Implement:
1. `CalculatorError` (base exception)
2. `InvalidInputError` (parsing errors)
3. `DivisionByZeroError` (division by zero)
4. `InvalidOperatorError` (unsupported operators)

**Reference**: See [contracts/operations-api.md](./contracts/operations-api.md), [contracts/parser-api.md](./contracts/parser-api.md)

---

### Phase 3: Arithmetic Operations (45 minutes)

**File**: `calculator/operations.py`

Implement (in order):
1. `add(a: Decimal, b: Decimal) -> Decimal`
2. `subtract(a: Decimal, b: Decimal) -> Decimal`
3. `multiply(a: Decimal, b: Decimal) -> Decimal`
4. `divide(a: Decimal, b: Decimal) -> Decimal` (with zero check)

**Reference**: See [contracts/operations-api.md](./contracts/operations-api.md)

**Testing**: Write comprehensive tests in `tests/test_operations.py`
- Test all operations with positive/negative/decimal numbers
- Test division by zero raises exception
- Test edge cases (zero, large numbers)

**Run tests**: `pytest tests/test_operations.py -v`

---

### Phase 4: Input Parser (60 minutes)

**File**: `calculator/parser.py`

Implement (in order):
1. Define regex pattern for expression matching
2. `parse_expression(input_str: str) -> Expression`
3. `validate_input(input_str: str) -> bool` (optional helper)

**Reference**: See [contracts/parser-api.md](./contracts/parser-api.md)

**Key Implementation Details**:
- Regex: `r'^\s*(-?\d+\.?\d*)\s*([+\-*/])\s*(-?\d+\.?\d*)\s*$'`
- Handle `decimal.InvalidOperation` when converting strings to Decimal
- Raise `InvalidInputError` with descriptive messages

**Testing**: Write extensive tests in `tests/test_parser.py`
- Valid expressions (integers, decimals, negatives)
- Invalid expressions (empty, malformed, unsupported operators)
- Edge cases (whitespace variations, leading/trailing spaces)

**Run tests**: `pytest tests/test_parser.py -v`

---

### Phase 5: Calculator Engine (60 minutes)

**File**: `calculator/calculator.py`

Implement:
1. `Calculator` class
2. `calculate(expression_str: str) -> CalculationResult` method
3. Operation dispatch logic (map operator to function)
4. Exception handling (catch all, map to CalculationResult)
5. `get_supported_operators() -> list[str]` helper

**Reference**: See [contracts/calculator-api.md](./contracts/calculator-api.md)

**Key Implementation Details**:
- Use try/except to catch all exceptions
- Map exceptions to user-friendly error messages
- Never let exceptions escape from `calculate()`
- Use operator dispatch dict: `{Operator.ADD: add, ...}`

**Testing**: Write tests in `tests/test_calculator.py`
- All successful calculations
- All error scenarios (div by zero, invalid input)
- Verify CalculationResult structure
- Verify error messages match specification

**Run tests**: `pytest tests/test_calculator.py -v`

---

### Phase 6: CLI Interface (45 minutes)

**File**: `calculator/cli.py`

Implement:
1. `display_welcome()` function
2. `display_goodbye()` function
3. `format_result(value: Decimal) -> str` function
4. `main()` REPL loop

**Reference**: See [contracts/cli-api.md](./contracts/cli-api.md)

**Key Implementation Details**:
- Use `input("> ")` for user prompts
- Handle `EOFError` (Ctrl+D/Ctrl+Z)
- Handle `KeyboardInterrupt` (Ctrl+C)
- Format results: remove trailing zeros, prefix with `= `
- Format errors: prefix with `Error: `
- Check for 'quit'/'exit' commands (case-insensitive)

**Testing**: Write integration tests in `tests/test_integration.py`
- Mock stdin/stdout
- Test complete user scenarios from spec
- Verify acceptance criteria (spec.md)

**Run tests**: `pytest tests/test_integration.py -v`

---

### Phase 7: Package Configuration (30 minutes)

**File**: `setup.py`

```python
from setuptools import setup, find_packages

setup(
    name="calculator",
    version="1.0.0",
    packages=find_packages(),
    python_requires=">=3.11",
    install_requires=[],
    entry_points={
        "console_scripts": [
            "calculator=calculator.cli:main",
        ],
    },
)
```

**File**: `calculator/__init__.py`

```python
"""Python Calculator Application"""
__version__ = "1.0.0"

from calculator.calculator import Calculator
from calculator.models import Expression, CalculationResult, Operator

__all__ = ["Calculator", "Expression", "CalculationResult", "Operator"]
```

**Install package**: `pip install -e .`

---

## Running the Application

### Development Mode

```bash
# Option 1: Run module directly
python -m calculator.cli

# Option 2: Use installed entry point (after pip install -e .)
calculator
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=calculator --cov-report=html

# Run specific test file
pytest tests/test_operations.py -v

# Run specific test
pytest tests/test_operations.py::test_add -v
```

---

## Verification Checklist

Use this checklist to verify implementation completeness:

### Functional Requirements (from spec.md)

- [ ] **FR-001**: Accept numeric input (integers and decimals) ✓
- [ ] **FR-002**: Support four operations (+, -, *, /) ✓
- [ ] **FR-003**: Display calculation results clearly ✓
- [ ] **FR-004**: Validate input and reject malformed expressions ✓
- [ ] **FR-005**: Prevent division by zero with error message ✓
- [ ] **FR-006**: Handle negative numbers correctly ✓
- [ ] **FR-007**: Display decimals with appropriate precision ✓
- [ ] **FR-008**: Allow multiple calculations in single session ✓
- [ ] **FR-009**: Provide clear exit method ✓
- [ ] **FR-010**: Handle errors gracefully without crashing ✓

### Success Criteria (from spec.md)

- [ ] **SC-001**: Complete calculation in < 10 seconds from launch
- [ ] **SC-002**: Mathematically accurate results (2+ decimal places)
- [ ] **SC-003**: 100% of division-by-zero caught and handled
- [ ] **SC-004**: 10+ consecutive calculations without restart
- [ ] **SC-005**: Clear error messages for invalid input

### Test Coverage

- [ ] Unit tests for all operations
- [ ] Unit tests for parser (valid and invalid inputs)
- [ ] Unit tests for calculator engine
- [ ] Integration tests for CLI
- [ ] All acceptance scenarios from spec tested
- [ ] Code coverage > 90%

---

## Example Usage Session

After implementation, verify with this test session:

```bash
$ calculator

Welcome to Calculator!
Enter expressions like: 5 + 3
Type 'quit' or 'exit' to leave
Press Ctrl+D (Unix) or Ctrl+Z (Windows) to exit

> 5 + 3
= 8

> 10 - 4
= 6

> 7 * 6
= 42

> 15 / 3
= 5

> 10 / 4
= 2.5

> 10 / 0
Error: Cannot divide by zero

> abc + 5
Error: Invalid input: please enter valid numbers

> 5 +
Error: Incomplete expression: missing right operand

> -5 + 3
= -2

> 0.1 + 0.2
= 0.3

> quit
Goodbye!
```

---

## Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'calculator'`
- **Solution**: Run `pip install -e .` from repository root

**Issue**: Tests fail with import errors
- **Solution**: Ensure `__init__.py` files exist in all packages

**Issue**: Decimal precision issues (0.1 + 0.2 = 0.30000000004)
- **Solution**: Verify you're using `decimal.Decimal`, not `float`

**Issue**: Division by zero crashes instead of showing error
- **Solution**: Ensure `divide()` raises `DivisionByZeroError` and calculator catches it

**Issue**: Can't exit with Ctrl+D
- **Solution**: Ensure `main()` catches `EOFError`

---

## Next Steps

After completing implementation:

1. **Run full test suite**: `pytest --cov=calculator`
2. **Verify all acceptance criteria** from spec.md
3. **Test on multiple platforms** (Linux, Mac, Windows if available)
4. **Run the application** and perform manual testing
5. **Generate tasks.md** using `/speckit.tasks` command
6. **Begin implementation** following tasks.md

---

## Development Tips

### Best Practices

1. **Write tests first**: Implement TDD (test-driven development)
2. **Run tests frequently**: After each function implementation
3. **Commit often**: Small, atomic commits for each component
4. **Use type hints**: Leverage Python 3.11 type checking
5. **Add docstrings**: Document all public functions

### Code Quality Tools

```bash
# Type checking (optional)
pip install mypy
mypy calculator

# Code formatting (optional)
pip install black
black calculator tests

# Linting (optional)
pip install pylint
pylint calculator
```

### Git Workflow

```bash
# Commit after each phase
git add calculator/operations.py tests/test_operations.py
git commit -m "Implement arithmetic operations with tests"

# Push after major milestones
git push origin 001-python-calculator
```

---

## Reference Documents

- [spec.md](./spec.md) - Feature specification and requirements
- [plan.md](./plan.md) - Implementation plan (this document)
- [research.md](./research.md) - Technical decisions and architecture
- [data-model.md](./data-model.md) - Data structures and entities
- [contracts/operations-api.md](./contracts/operations-api.md) - Operations module contract
- [contracts/parser-api.md](./contracts/parser-api.md) - Parser module contract
- [contracts/calculator-api.md](./contracts/calculator-api.md) - Calculator engine contract
- [contracts/cli-api.md](./contracts/cli-api.md) - CLI interface contract

---

## Support

If you encounter issues during implementation:
1. Review the contracts documentation for the specific module
2. Check the data model for entity definitions
3. Review research.md for architecture decisions
4. Verify you're following the implementation order
5. Ensure all tests pass before moving to next phase

**Estimated Total Time**: 4-6 hours including testing and verification
