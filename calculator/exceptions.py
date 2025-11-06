"""Custom exceptions for the calculator application"""


class CalculatorError(Exception):
    """Base exception for all calculator errors"""
    pass


class InvalidInputError(CalculatorError):
    """Raised when user input cannot be parsed or is invalid"""
    pass


class DivisionByZeroError(CalculatorError):
    """Raised when attempting to divide by zero"""
    pass


class InvalidOperatorError(CalculatorError):
    """Raised when an unsupported operator is encountered"""
    pass
