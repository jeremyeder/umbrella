# Research: Python Calculator Application

**Feature**: 001-python-calculator
**Date**: 2025-10-28
**Status**: Complete

## Research Questions

### 1. Input Parsing Strategy

**Question**: How should we parse user input expressions like "5 + 3"?

**Decision**: Use regex-based parsing with the Python `re` module

**Rationale**:
- Simple expressions (two operands + one operator) don't require a full parser
- Regex can efficiently validate and extract components
- Pattern: `^(-?\d+\.?\d*)\s*([+\-*/])\s*(-?\d+\.?\d*)$`
- Handles negative numbers, decimals, and whitespace variations
- Clear error messages when pattern doesn't match

**Alternatives considered**:
1. **String splitting**: Too fragile for handling whitespace and negative numbers
2. **AST/eval()**: Security risk (arbitrary code execution), overengineered for simple expressions
3. **Parser library (pyparsing)**: Adds external dependency for minimal benefit

### 2. Error Handling Architecture

**Question**: What's the best way to handle errors without crashing?

**Decision**: Custom exception hierarchy with try-catch at CLI layer

**Rationale**:
- Define custom exceptions: `CalculatorError`, `InvalidInputError`, `DivisionByZeroError`
- Business logic layers raise typed exceptions
- CLI layer catches and displays user-friendly messages
- Allows calculator to continue running after errors
- Makes error handling testable

**Alternatives considered**:
1. **Return error codes/tuples**: Less Pythonic, harder to propagate errors through layers
2. **Print errors directly**: Couples business logic to I/O, untestable

### 3. Testing Strategy

**Question**: What testing approach will ensure reliability?

**Decision**: Pytest with unit tests + integration tests

**Rationale**:
- **Unit tests**: Test each operation function independently (add, subtract, multiply, divide)
- **Unit tests**: Test parser with valid/invalid inputs
- **Integration tests**: Test full user scenarios from spec (e.g., "5 + 3" → "8")
- **Edge cases**: Division by zero, large numbers, floating-point precision
- Target: >90% code coverage
- Pytest fixtures for reusable test data

**Alternatives considered**:
1. **Manual testing only**: Not reliable, can't catch regressions
2. **Unittest module**: Pytest is more modern, better assertions, less boilerplate

### 4. Decimal Precision Handling

**Question**: How to handle floating-point precision issues (e.g., 0.1 + 0.2)?

**Decision**: Use Python's `decimal.Decimal` module for arithmetic operations

**Rationale**:
- Avoids floating-point errors (0.1 + 0.2 = 0.3, not 0.30000000000000004)
- Configurable precision (default to 10 decimal places)
- Spec requires "appropriate precision" and "decimal results with minimum 2 decimal places"
- Slightly slower than float, but acceptable for interactive calculator
- Format output to hide trailing zeros while preserving precision

**Alternatives considered**:
1. **Standard float**: Fast but imprecise, causes user confusion with decimal arithmetic
2. **Round at display time**: Hides the problem but doesn't solve underlying precision
3. **Fractions module**: More accurate but doesn't match typical calculator UX

### 5. CLI/REPL Implementation

**Question**: How should the interactive loop work?

**Decision**: Simple REPL (Read-Eval-Print Loop) with prompt-based input

**Rationale**:
```
Welcome to Calculator!
Enter expressions like: 5 + 3
Type 'quit' or 'exit' to leave

> 5 + 3
= 8

> 10 / 4
= 2.5

> 10 / 0
Error: Cannot divide by zero

> quit
Goodbye!
```

- Clear instructions on startup
- Simple prompt (`>`) for input
- Display result with `=` prefix
- Show errors with `Error:` prefix
- Accept 'quit', 'exit', or Ctrl+D to exit gracefully
- Handle Ctrl+C with graceful shutdown message

**Alternatives considered**:
1. **Single-shot execution**: Less user-friendly (spec requires "continuous calculations")
2. **GUI using tkinter**: Out of scope per spec (CLI only)
3. **Rich terminal UI**: Overengineered, adds dependencies

## Technology Stack Summary

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Language | Python 3.11+ | Spec requirement, modern features, type hints |
| Parsing | re (regex) | Standard library, sufficient for simple expressions |
| Arithmetic | decimal.Decimal | Precision handling per spec requirements |
| CLI | Built-in input() | Simple REPL, no dependencies needed |
| Testing | pytest | Industry standard, excellent assertions |
| Type hints | typing module | Code quality, IDE support, documentation |

## Architecture Patterns

### Layered Architecture

```
┌─────────────────────┐
│   CLI Layer         │  ← User interaction, REPL loop
│   (cli.py)          │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ Calculator Engine   │  ← Orchestration, state management
│ (calculator.py)     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Parser Layer       │  ← Input validation, extraction
│  (parser.py)        │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ Operations Layer    │  ← Pure arithmetic functions
│ (operations.py)     │
└─────────────────────┘
```

**Benefits**:
- Each layer has single responsibility
- Easy to test in isolation
- Clear dependency direction (top to bottom)
- Business logic separated from I/O

### Error Handling Flow

```
User Input → Parser (raises InvalidInputError)
           → Calculator (catches, forwards)
           → Operations (raises DivisionByZeroError)
           → Calculator (catches, forwards)
           → CLI (catches all, displays friendly message)
```

## Implementation Best Practices

1. **Type Hints**: Use throughout for clarity and type checking
2. **Docstrings**: Document all public functions with examples
3. **Immutability**: Operations are pure functions (no side effects)
4. **Separation of Concerns**: I/O separate from business logic
5. **Fail Fast**: Validate input early, raise exceptions immediately
6. **User-Friendly Errors**: Convert technical errors to plain language
7. **Testability**: Design for easy mocking and testing

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Floating-point precision confuses users | High | Use Decimal module |
| Regex parsing fails edge cases | Medium | Comprehensive test suite |
| Poor error messages frustrate users | Medium | User test all error scenarios |
| Code not extensible for future features | Low | Modular design allows easy extension |

## Open Questions (None)

All technical unknowns have been resolved. Ready to proceed to Phase 1 (Design).
