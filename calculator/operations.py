"""Arithmetic operation functions using Decimal for precision"""

from decimal import Decimal
from calculator.exceptions import DivisionByZeroError


def add(left: Decimal, right: Decimal) -> Decimal:
    """Add two numbers

    Args:
        left: First operand
        right: Second operand

    Returns:
        Sum of left and right
    """
    return left + right


def subtract(left: Decimal, right: Decimal) -> Decimal:
    """Subtract two numbers

    Args:
        left: First operand
        right: Second operand (subtracted from left)

    Returns:
        Difference of left and right
    """
    return left - right


def multiply(left: Decimal, right: Decimal) -> Decimal:
    """Multiply two numbers

    Args:
        left: First operand
        right: Second operand

    Returns:
        Product of left and right
    """
    return left * right


def divide(left: Decimal, right: Decimal) -> Decimal:
    """Divide two numbers

    Args:
        left: Numerator
        right: Denominator

    Returns:
        Quotient of left divided by right

    Raises:
        DivisionByZeroError: If right is zero
    """
    if right == 0:
        raise DivisionByZeroError("Cannot divide by zero")
    return left / right
