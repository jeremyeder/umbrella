"""Command-line interface for the calculator application"""

import sys
from decimal import Decimal
from calculator.calculator import Calculator


def format_result(value: Decimal) -> str:
    """Format Decimal result for display

    Removes trailing zeros and unnecessary decimal points for cleaner display.

    Args:
        value: Decimal value to format

    Returns:
        Formatted string representation

    Examples:
        Decimal('8.00') → "8"
        Decimal('2.5') → "2.5"
        Decimal('0.3333333333') → "0.3333333333"
    """
    # Convert to string and remove trailing zeros
    result_str = str(value)

    # If the number has a decimal point, remove trailing zeros
    if '.' in result_str:
        result_str = result_str.rstrip('0').rstrip('.')

    return result_str


def display_welcome():
    """Display welcome message with usage instructions"""
    print()
    print("Welcome to Calculator!")
    print("Enter expressions like: 5 + 3")
    print("Type 'quit' or 'exit' to leave")
    print("Press Ctrl+D (Unix) or Ctrl+Z (Windows) to exit")
    print()


def display_goodbye():
    """Display goodbye message"""
    print("Goodbye!")


def main():
    """Main entry point for the calculator REPL

    Runs an interactive Read-Eval-Print Loop that:
    1. Displays welcome message
    2. Accepts user input
    3. Processes calculations
    4. Displays results or errors
    5. Repeats until user exits
    6. Displays goodbye message
    """
    display_welcome()
    calculator = Calculator()

    try:
        while True:
            try:
                # Read user input
                user_input = input("> ").strip()

                # Skip empty input
                if not user_input:
                    continue

                # Check for exit commands
                if user_input.lower() in ('quit', 'exit'):
                    break

                # Process calculation
                result = calculator.calculate(user_input)

                # Display result or error
                if result.is_success:
                    print(f"= {format_result(result.value)}")
                else:
                    print(f"Error: {result.error}")

            except EOFError:
                # Handle Ctrl+D (Unix) or Ctrl+Z (Windows)
                print()  # Add newline after EOF
                break

    except KeyboardInterrupt:
        # Handle Ctrl+C
        print()  # Add newline after ^C

    finally:
        display_goodbye()


if __name__ == "__main__":
    main()
