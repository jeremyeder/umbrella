"""Data models for the calculator application"""

from dataclasses import dataclass
from decimal import Decimal
from enum import Enum
from typing import Optional
from calculator.exceptions import DivisionByZeroError


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
        """Validate expression constraints

        Raises:
            DivisionByZeroError: If attempting to divide by zero
        """
        if self.operator == Operator.DIVIDE and self.right_operand == 0:
            raise DivisionByZeroError("Cannot divide by zero")


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
        """Check if the calculation was successful"""
        return self.value is not None
