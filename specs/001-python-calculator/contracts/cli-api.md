# CLI API Contract

**Module**: `calculator.cli`
**Version**: 1.0.0
**Type**: Command-Line Interface (User-Facing)

## Overview

This contract defines the command-line interface for the calculator application. This is the user-facing interface that handles I/O, display formatting, and the REPL (Read-Eval-Print Loop).

---

## Main Entry Point

### `main() -> None`

Application entry point that runs the interactive calculator REPL.

**Parameters**: None

**Returns**: None

**Raises**: None (all errors handled internally)

**Behavior**:
1. Display welcome message
2. Enter REPL loop
3. Accept user input
4. Process calculations
5. Display results or errors
6. Repeat until user exits
7. Display goodbye message

**Example Session**:
```
$ python -m calculator.cli

Welcome to Calculator!
Enter expressions like: 5 + 3
Type 'quit' or 'exit' to leave
Press Ctrl+D (Unix) or Ctrl+Z (Windows) to exit

> 5 + 3
= 8

> 10 / 4
= 2.5

> 15 - 8
= 7

> 10 / 0
Error: Cannot divide by zero

> abc + 5
Error: Invalid input: please enter valid numbers

> quit
Goodbye!
```

---

## User Interface Specification

### Welcome Message

```
Welcome to Calculator!
Enter expressions like: 5 + 3
Type 'quit' or 'exit' to leave
Press Ctrl+D (Unix) or Ctrl+Z (Windows) to exit
```

**Requirements**:
- Clear instructions for usage
- Example expression shown
- Exit instructions for all platforms
- Professional, friendly tone

---

### Input Prompt

```
>
```

**Requirements**:
- Simple, unobtrusive prompt
- Clearly indicates waiting for input
- Consistent with Unix/shell conventions

---

### Success Output Format

```
= <result>
```

**Examples**:
```
> 5 + 3
= 8

> 10.5 * 2
= 21.0

> 1 / 3
= 0.3333333333
```

**Formatting Rules**:
- Result prefixed with `= ` (equals sign + space)
- Numbers displayed with trailing zeros removed (e.g., `21.0` not `21.00000`)
- Maximum 10 decimal places displayed
- No scientific notation (use standard decimal form)

---

### Error Output Format

```
Error: <user-friendly message>
```

**Examples**:
```
> 5 / 0
Error: Cannot divide by zero

> abc + 5
Error: Invalid input: please enter valid numbers

> 5 +
Error: Incomplete expression: missing right operand
```

**Formatting Rules**:
- Errors prefixed with `Error: `
- Message is user-friendly (no stack traces)
- Calculator remains operational after error
- No loud formatting (no ASCII art, no colors unless explicitly requested)

---

### Exit Message

```
Goodbye!
```

**Displayed when**:
- User types 'quit'
- User types 'exit' (case-insensitive)
- User presses Ctrl+D (EOF on Unix)
- User presses Ctrl+Z + Enter (EOF on Windows)
- User presses Ctrl+C (keyboard interrupt)

---

## Exit Conditions

### Normal Exit (Code 0)

User-initiated graceful exit:
- Input: `quit` or `exit` (case-insensitive)
- Input: EOF signal (Ctrl+D / Ctrl+Z)

**Behavior**:
1. Display "Goodbye!" message
2. Clean up resources (if any)
3. Exit with code 0

### Interrupt Exit (Code 0)

User presses Ctrl+C:
1. Catch KeyboardInterrupt
2. Display "\nGoodbye!" (newline before message)
3. Exit with code 0

**Note**: Ctrl+C is treated as a normal exit, not an error.

### Error Exit (Code 1)

Unrecoverable system errors only:
- File system errors
- Out of memory
- Critical Python runtime errors

**Behavior**:
1. Display error message to stderr
2. Exit with code 1

**Note**: Calculation errors (division by zero, invalid input) do **not** cause exit.

---

## Input Handling Specification

### Accepted Commands

| Input | Action | Example |
|-------|--------|---------|
| `quit` (any case) | Exit application | `quit`, `QUIT`, `Quit` |
| `exit` (any case) | Exit application | `exit`, `EXIT`, `Exit` |
| `<expression>` | Calculate result | `5 + 3`, `10 / 4` |
| Empty line / whitespace | Ignore, re-prompt | `   ` → prompt again |

### Input Validation

Before passing to calculator:
1. Strip leading/trailing whitespace
2. Check for exit commands
3. Check for empty input (skip if empty)
4. Pass to calculator for processing

---

## Output Formatting Specification

### Number Formatting

```python
def format_result(value: Decimal) -> str:
    """Format Decimal result for display"""
    # Remove trailing zeros and unnecessary decimal point
    # e.g., Decimal('8.00') → "8"
    # e.g., Decimal('2.5') → "2.5"
    # e.g., Decimal('0.333333') → "0.333333"
```

**Examples**:
- `Decimal('8')` → `"8"`
- `Decimal('8.0')` → `"8"`
- `Decimal('2.5')` → `"2.5"`
- `Decimal('2.50')` → `"2.5"`
- `Decimal('0.3333333333')` → `"0.3333333333"`

**Requirements** (from spec):
- Minimum 2 decimal places for non-integer results (spec line 79)
- No scientific notation
- Remove trailing zeros for cleaner display
- Maximum 10 decimal places (internal precision)

---

## Error Handling

### User Input Errors

**Behavior**: Display error, continue running

```python
try:
    result = calculator.calculate(user_input)
    if result.is_success:
        print(f"= {format_result(result.value)}")
    else:
        print(f"Error: {result.error}")
except Exception as e:
    print(f"Error: An unexpected error occurred")
    # Log exception for debugging (optional)
```

### System Errors

**Behavior**: Display error to stderr, exit with code 1

```python
try:
    main()
except KeyboardInterrupt:
    print("\nGoodbye!")
    sys.exit(0)
except Exception as e:
    print(f"Fatal error: {e}", file=sys.stderr)
    sys.exit(1)
```

---

## Testing Contract

### Manual Testing Scenarios

✓ **User Story 1**: Basic Arithmetic Operations (spec lines 18-25)
- Test all 5 acceptance scenarios
- Verify output format matches specification

✓ **User Story 2**: Error Handling (spec lines 36-40)
- Test division by zero
- Test invalid input
- Test incomplete expression

✓ **User Story 3**: Continuous Calculations (spec lines 52-56)
- Test multiple sequential calculations
- Test exit commands
- Verify calculator continues after errors

### Automated Integration Tests

```python
def test_cli_integration():
    """Test CLI with simulated user input"""
    # Mock stdin with test input
    # Capture stdout output
    # Verify expected results
```

**Test Cases**:
- Valid calculation produces correct output
- Invalid input shows error and continues
- Exit commands terminate cleanly
- EOF signals handled gracefully
- Ctrl+C handled gracefully

---

## Performance Contract

**Latency**: < 100ms from input to output display (human perception threshold)
**Throughput**: Limited only by user typing speed
**Resource Usage**: < 10MB memory, negligible CPU

**Success Criterion**: Spec SC-001 states "users can complete a basic calculation in under 10 seconds from application launch" - includes CLI startup time.

---

## Accessibility & Usability

### Terminal Compatibility

- Works in any standard terminal (bash, zsh, PowerShell, cmd.exe)
- No special terminal features required (no colors, no cursor movement)
- UTF-8 encoding for symbols
- Works over SSH connections

### User Experience

- **Discoverability**: Welcome message explains usage
- **Forgiveness**: Errors don't crash application
- **Feedback**: Immediate result display
- **Clarity**: Clean, minimal output format

---

## Implementation Notes

### REPL Structure

```python
def main():
    display_welcome()
    calculator = Calculator()

    try:
        while True:
            try:
                user_input = input("> ").strip()

                if not user_input:
                    continue

                if user_input.lower() in ('quit', 'exit'):
                    break

                result = calculator.calculate(user_input)

                if result.is_success:
                    print(f"= {format_result(result.value)}")
                else:
                    print(f"Error: {result.error}")

            except EOFError:
                break

    except KeyboardInterrupt:
        print()  # newline after ^C

    finally:
        display_goodbye()
```

### Separation of Concerns

- **CLI layer**: I/O, formatting, user interaction only
- **Calculator layer**: Business logic, calculations
- **No business logic in CLI**: All validation/calculation delegated to Calculator

**Benefit**: CLI can be replaced with GUI/web interface without touching business logic.

---

## Dependency Contract

### Required Modules
```python
import sys
from calculator.calculator import Calculator
from decimal import Decimal
```

### Dependency Graph

```
CLI (cli.py)
    ↓ uses
Calculator (calculator.py)
    ↓ uses
[All other modules]
```

**CLI is top layer**: Depends on everything, but nothing depends on CLI.

---

## Platform Compatibility

### Supported Platforms

✓ Linux (all distributions)
✓ macOS (10.15+)
✓ Windows (10+)

### Exit Signal Handling

| Platform | Ctrl+D | Ctrl+Z | Ctrl+C |
|----------|--------|--------|--------|
| Linux/Mac | EOF (exit) | Suspend (ignore) | Interrupt (exit) |
| Windows | Ignored | EOF (exit) | Interrupt (exit) |

**Implementation**: Use try/except for EOFError and KeyboardInterrupt

---

## Versioning & Compatibility

**Current Version**: 1.0.0

**Future Enhancements** (backward compatible):
- Colored output (optional)
- Calculation history display
- Command-line arguments for batch mode
- Help command

**Breaking Changes** (would require version bump):
- Changing output format
- Changing exit behavior
- Removing accepted commands
