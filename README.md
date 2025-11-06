# Python Calculator Application

A simple command-line calculator that supports basic arithmetic operations (addition, subtraction, multiplication, division) with proper error handling and continuous calculation capability.

## Features

- **Basic Arithmetic Operations**: Addition (+), Subtraction (-), Multiplication (*), Division (/)
- **Decimal Support**: Handles decimal numbers with high precision
- **Error Handling**: Clear error messages for invalid input and division by zero
- **Continuous Calculations**: Perform multiple calculations without restarting
- **User-Friendly Interface**: Simple command-line interface with helpful prompts

## Requirements

- Python 3.11 or higher
- No external dependencies for core functionality
- pytest (for running tests only)

## Installation

### From Source

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd umbrella
   ```

2. (Optional) Install in development mode:
   ```bash
   pip install -e .
   ```

3. (Optional) Install test dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Running the Calculator

You can run the calculator in several ways:

**Method 1: Direct module execution (recommended)**
```bash
python -m calculator.cli
```

**Method 2: If installed with pip**
```bash
calculator
```

### Example Session

```
$ python -m calculator.cli

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

> quit
Goodbye!
```

### Supported Operations

| Operator | Operation      | Example | Result |
|----------|----------------|---------|--------|
| `+`      | Addition       | `5 + 3` | `8`    |
| `-`      | Subtraction    | `10 - 4`| `6`    |
| `*`      | Multiplication | `7 * 6` | `42`   |
| `/`      | Division       | `15 / 3`| `5`    |

### Input Format

Enter expressions in the format: `<number> <operator> <number>`

- Numbers can be positive or negative
- Decimal numbers are supported
- Spaces around the operator are optional
- Examples: `5 + 3`, `10.5 * 2`, `-7 / 3`

### Exit Commands

You can exit the calculator in several ways:
- Type `quit` or `exit` (case-insensitive)
- Press `Ctrl+D` (Unix/Mac) or `Ctrl+Z` then Enter (Windows)
- Press `Ctrl+C`

## Development

### Project Structure

```
calculator/
├── __init__.py           # Package initialization
├── exceptions.py         # Custom exception classes
├── models.py            # Data models (Expression, CalculationResult, Operator)
├── operations.py        # Arithmetic operation functions
├── parser.py           # Input parsing and validation
├── calculator.py       # Main calculator engine
└── cli.py             # Command-line interface

tests/
├── test_operations.py    # Unit tests for arithmetic operations
├── test_parser.py        # Unit tests for input parsing
├── test_calculator.py    # Unit tests for calculator logic
└── test_integration.py   # End-to-end integration tests
```

### Running Tests

Run all tests:
```bash
pytest tests/
```

Run with coverage:
```bash
pytest tests/ --cov=calculator --cov-report=html
```

Run specific test file:
```bash
pytest tests/test_operations.py -v
```

### Code Quality

The codebase follows these principles:
- **Type hints**: All functions include type annotations
- **Docstrings**: All public functions and classes are documented
- **Separation of concerns**: Clear module boundaries
- **Error handling**: Comprehensive exception handling
- **Testing**: 70+ unit and integration tests

## Technical Details

### Precision

The calculator uses Python's `Decimal` type for high-precision arithmetic, avoiding floating-point errors common with standard float operations.

### Error Handling

All errors are caught and presented to the user with clear, actionable messages:
- **Division by zero**: "Error: Cannot divide by zero"
- **Invalid input**: "Error: Invalid input: please enter valid numbers"
- **Incomplete expression**: Appropriate error message for missing operands

The calculator never crashes and remains operational after errors.

### Architecture

The application follows a layered architecture:
1. **CLI Layer** (`cli.py`): User interface and I/O
2. **Calculator Layer** (`calculator.py`): Business logic coordination
3. **Parser Layer** (`parser.py`): Input validation and parsing
4. **Operations Layer** (`operations.py`): Core arithmetic functions
5. **Models Layer** (`models.py`): Data structures

## Limitations

The current version has these intentional limitations:
- Only basic arithmetic operations (+, -, *, /)
- Two-operand expressions only (no multi-step calculations like `5 + 3 * 2`)
- No parentheses support
- No advanced functions (sin, cos, sqrt, etc.)
- No calculation history persistence
- Command-line interface only (no GUI)

## License

This project is provided as-is for educational purposes.

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting changes:
```bash
pytest tests/
```

## Support

For issues or questions, please refer to the project documentation or submit an issue.
