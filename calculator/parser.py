"""Input parsing and validation for mathematical expressions"""

import re
from decimal import Decimal, InvalidOperation
from calculator.models import Expression, Operator
from calculator.exceptions import InvalidInputError, InvalidOperatorError


def parse_expression(expression_str: str) -> Expression:
    """Parse a mathematical expression string into an Expression object

    Args:
        expression_str: String in format "<number> <operator> <number>"
                       Examples: "5 + 3", "10.5 * 2", "-7 / 3"

    Returns:
        Expression object with parsed operands and operator

    Raises:
        InvalidInputError: If input format is invalid or numbers cannot be parsed
        InvalidOperatorError: If operator is not supported
    """
    if not expression_str or not expression_str.strip():
        raise InvalidInputError("Expression cannot be empty")

    # Regex pattern to match: optional whitespace, number (with optional sign and decimal),
    # whitespace, operator, whitespace, number (with optional sign and decimal)
    pattern = r'^\s*(-?\d+\.?\d*)\s*([+\-*/])\s*(-?\d+\.?\d*)\s*$'
    match = re.match(pattern, expression_str)

    if not match:
        raise InvalidInputError("please enter valid numbers")

    left_str, operator_str, right_str = match.groups()

    # Parse operands as Decimal
    try:
        left_operand = Decimal(left_str)
    except (InvalidOperation, ValueError):
        raise InvalidInputError(f"Invalid left operand: '{left_str}'")

    try:
        right_operand = Decimal(right_str)
    except (InvalidOperation, ValueError):
        raise InvalidInputError(f"Invalid right operand: '{right_str}'")

    # Parse operator
    try:
        operator = Operator(operator_str)
    except ValueError:
        raise InvalidOperatorError(f"Unsupported operator: {operator_str}")

    return Expression(
        left_operand=left_operand,
        operator=operator,
        right_operand=right_operand
    )
